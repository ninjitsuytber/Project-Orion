-- =============================================================================
-- Project Orion — Complete Database Schema
-- Run this in: Supabase Dashboard > SQL Editor > New Query
-- Safe to re-run: uses IF NOT EXISTS, OR REPLACE, DROP IF EXISTS
-- =============================================================================


-- =============================================================================
-- TABLES
-- =============================================================================

-- 1. Profiles (one row per auth user; created by trigger on sign-up)
CREATE TABLE IF NOT EXISTS public.profiles (
    id              UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name            TEXT,
    email           TEXT,
    balance         NUMERIC     NOT NULL DEFAULT 0 CHECK (balance >= 0),
    saving_balance  NUMERIC     NOT NULL DEFAULT 0 CHECK (saving_balance >= 0),
    streak          INTEGER     NOT NULL DEFAULT 0,
    xp              INTEGER     NOT NULL DEFAULT 0,
    age_range       TEXT,                         -- NULL until onboarding completes
    monthly_income         NUMERIC     NOT NULL DEFAULT 0,
    savings_goal           NUMERIC     NOT NULL DEFAULT 0,
    daily_spending_limit   NUMERIC     NOT NULL DEFAULT 0,
    created_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add xp column to existing profiles table if it wasn't created with it
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS xp INTEGER NOT NULL DEFAULT 0;

-- Add daily_spending_limit column if it wasn't created with it
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS daily_spending_limit NUMERIC NOT NULL DEFAULT 0;

-- 2. Transactions
--    type 'spend' is reserved for future direct-spend flows (filtered in UI)
CREATE TABLE IF NOT EXISTS public.transactions (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type        TEXT        NOT NULL CHECK (type IN ('add', 'send', 'receive', 'save', 'withdraw', 'spend')),
    amount      NUMERIC     NOT NULL CHECK (amount > 0),
    description TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- If the transactions table already existed without 'spend', update the constraint:
DO $$
BEGIN
    ALTER TABLE public.transactions DROP CONSTRAINT IF EXISTS transactions_type_check;
    ALTER TABLE public.transactions
        ADD CONSTRAINT transactions_type_check
        CHECK (type IN ('add', 'send', 'receive', 'save', 'withdraw', 'spend'));
EXCEPTION WHEN others THEN
    NULL; -- constraint already correct
END;
$$;

-- 3. User Progress (XP & tier)
CREATE TABLE IF NOT EXISTS public.user_progress (
    user_id     UUID        PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    xp          INTEGER     NOT NULL DEFAULT 0,
    tier        INTEGER     NOT NULL DEFAULT 1,
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. User Badges
CREATE TABLE IF NOT EXISTS public.user_badges (
    user_id     UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    badge_id    TEXT        NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, badge_id)
);

-- 5. App Activities (XP-earning in-app events)
CREATE TABLE IF NOT EXISTS public.app_activities (
    id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    activity_name TEXT        NOT NULL,
    xp_earned     INTEGER     NOT NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- =============================================================================
-- INDEXES
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_transactions_user_id   ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_date  ON public.transactions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_app_activities_user_id  ON public.app_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_app_activities_user_date ON public.app_activities(user_id, created_at DESC);


-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE public.profiles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_activities   ENABLE ROW LEVEL SECURITY;


-- =============================================================================
-- POLICIES  (drop first so re-running is safe)
-- =============================================================================

-- profiles
DROP POLICY IF EXISTS "Users can view own profile"   ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can view own profile"   ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- transactions
DROP POLICY IF EXISTS "Users can view own transactions"   ON public.transactions;
DROP POLICY IF EXISTS "Users can insert own transactions" ON public.transactions;

CREATE POLICY "Users can view own transactions"   ON public.transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own transactions" ON public.transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- user_progress
DROP POLICY IF EXISTS "Users can view own progress"   ON public.user_progress;
DROP POLICY IF EXISTS "Users can insert own progress" ON public.user_progress;
DROP POLICY IF EXISTS "Users can update own progress" ON public.user_progress;

CREATE POLICY "Users can view own progress"   ON public.user_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own progress" ON public.user_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own progress" ON public.user_progress FOR UPDATE USING (auth.uid() = user_id);

-- user_badges
DROP POLICY IF EXISTS "Users can view own badges"   ON public.user_badges;
DROP POLICY IF EXISTS "Users can insert own badges" ON public.user_badges;

CREATE POLICY "Users can view own badges"   ON public.user_badges FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own badges" ON public.user_badges FOR INSERT WITH CHECK (auth.uid() = user_id);

-- app_activities
DROP POLICY IF EXISTS "Users can view own activities"   ON public.app_activities;
DROP POLICY IF EXISTS "Users can insert own activities" ON public.app_activities;

CREATE POLICY "Users can view own activities"   ON public.app_activities FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own activities" ON public.app_activities FOR INSERT WITH CHECK (auth.uid() = user_id);


-- =============================================================================
-- RPC FUNCTIONS
-- Drop existing versions first — PostgreSQL forbids renaming parameters via
-- CREATE OR REPLACE if the old function used different parameter names.
-- =============================================================================

-- Drop trigger first (it depends on handle_new_user, so must go before the function drop)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.get_xp_rank();
DROP FUNCTION IF EXISTS public.add_money(NUMERIC, TEXT);
DROP FUNCTION IF EXISTS public.transfer_money(TEXT, NUMERIC, TEXT);
DROP FUNCTION IF EXISTS public.manage_savings(NUMERIC, TEXT);

-- get_xp_rank: returns current user's rank and total user count (bypasses RLS)
CREATE OR REPLACE FUNCTION public.get_xp_rank()
RETURNS JSON LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_user_id UUID    := auth.uid();
    v_user_xp INTEGER;
    v_total   INTEGER;
    v_beaten  INTEGER;
BEGIN
    IF v_user_id IS NULL THEN
        RETURN json_build_object('success', false, 'message', 'Not authenticated');
    END IF;

    SELECT xp INTO v_user_xp FROM public.profiles WHERE id = v_user_id;
    SELECT COUNT(*) INTO v_total FROM public.profiles;
    SELECT COUNT(*) INTO v_beaten FROM public.profiles WHERE xp < v_user_xp;

    RETURN json_build_object('success', true, 'total', v_total, 'beaten', v_beaten);
END;
$$;

-- add_money: atomically credit balance + log transaction
CREATE OR REPLACE FUNCTION public.add_money(amount NUMERIC, bank_name TEXT)
RETURNS JSON LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_user_id UUID := auth.uid();
BEGIN
    IF v_user_id IS NULL THEN
        RETURN json_build_object('success', false, 'message', 'Not authenticated');
    END IF;
    IF amount <= 0 THEN
        RETURN json_build_object('success', false, 'message', 'Amount must be greater than zero');
    END IF;

    UPDATE public.profiles
    SET balance = balance + amount
    WHERE id = v_user_id;

    INSERT INTO public.transactions (user_id, type, amount, description)
    VALUES (v_user_id, 'add', amount, 'Reload via ' || bank_name);

    RETURN json_build_object('success', true, 'message', 'Reload successful');
END;
$$;

-- transfer_money: atomically debit sender + credit recipient + log both sides
CREATE OR REPLACE FUNCTION public.transfer_money(target_email TEXT, amount NUMERIC, category TEXT DEFAULT 'others')
RETURNS JSON LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_sender_id      UUID    := auth.uid();
    v_recipient_id   UUID;
    v_sender_balance NUMERIC;
    v_sender_email   TEXT;
BEGIN
    IF v_sender_id IS NULL THEN
        RETURN json_build_object('success', false, 'message', 'Not authenticated');
    END IF;
    IF amount <= 0 THEN
        RETURN json_build_object('success', false, 'message', 'Amount must be greater than zero');
    END IF;

    SELECT email, balance INTO v_sender_email, v_sender_balance
    FROM public.profiles WHERE id = v_sender_id;

    IF v_sender_balance < amount THEN
        RETURN json_build_object('success', false, 'message', 'Insufficient balance');
    END IF;

    SELECT id INTO v_recipient_id FROM public.profiles WHERE email = target_email;
    IF v_recipient_id IS NULL THEN
        RETURN json_build_object('success', false, 'message', 'Recipient not found');
    END IF;
    IF v_sender_id = v_recipient_id THEN
        RETURN json_build_object('success', false, 'message', 'Cannot transfer to yourself');
    END IF;

    UPDATE public.profiles SET balance = balance - amount WHERE id = v_sender_id;
    UPDATE public.profiles SET balance = balance + amount WHERE id = v_recipient_id;

    INSERT INTO public.transactions (user_id, type, amount, description)
    VALUES (v_sender_id, 'send', amount, '[' || category || '] Sent to ' || target_email);

    INSERT INTO public.transactions (user_id, type, amount, description)
    VALUES (v_recipient_id, 'receive', amount, 'Received from ' || v_sender_email);

    RETURN json_build_object('success', true, 'message', 'Transfer successful');
END;
$$;

-- manage_savings: atomically move funds between balance and saving jar + maintain streak
CREATE OR REPLACE FUNCTION public.manage_savings(amount NUMERIC, direction TEXT)
RETURNS JSON LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_user_id        UUID    := auth.uid();
    v_balance        NUMERIC;
    v_saving         NUMERIC;
    v_last_save_date DATE;
    v_saved_today    NUMERIC;
BEGIN
    IF v_user_id IS NULL THEN
        RETURN json_build_object('success', false, 'message', 'Not authenticated');
    END IF;
    IF amount <= 0 THEN
        RETURN json_build_object('success', false, 'message', 'Amount must be greater than zero');
    END IF;

    SELECT balance, saving_balance INTO v_balance, v_saving
    FROM public.profiles WHERE id = v_user_id;

    IF direction = 'save' THEN
        IF v_balance < amount THEN
            RETURN json_build_object('success', false, 'message', 'Insufficient balance');
        END IF;

        -- Snapshot last save date BEFORE inserting the new transaction
        SELECT MAX(created_at)::DATE INTO v_last_save_date
        FROM public.transactions
        WHERE user_id = v_user_id AND type = 'save';

        UPDATE public.profiles
        SET balance = balance - amount, saving_balance = saving_balance + amount
        WHERE id = v_user_id;

        INSERT INTO public.transactions (user_id, type, amount, description)
        VALUES (v_user_id, 'spend', amount, 'Deducted from Account Balance');

        INSERT INTO public.transactions (user_id, type, amount, description)
        VALUES (v_user_id, 'save', amount, 'Saved to Money Jar');

        -- Streak logic:
        --   Never saved before, or missed a day → reset to 1
        --   Saved yesterday                     → extend streak
        --   Already saved today                 → no change
        IF v_last_save_date IS NULL OR v_last_save_date < CURRENT_DATE - INTERVAL '1 day' THEN
            UPDATE public.profiles SET streak = 1 WHERE id = v_user_id;
        ELSIF v_last_save_date = CURRENT_DATE - INTERVAL '1 day' THEN
            UPDATE public.profiles SET streak = streak + 1 WHERE id = v_user_id;
        END IF;

    ELSIF direction = 'withdraw' THEN
        IF v_saving < amount THEN
            RETURN json_build_object('success', false, 'message', 'Insufficient jar balance');
        END IF;

        -- How much has the user saved today?
        SELECT COALESCE(SUM(t.amount), 0) INTO v_saved_today
        FROM public.transactions t
        WHERE t.user_id = v_user_id
          AND t.type = 'save'
          AND t.created_at::DATE = CURRENT_DATE;

        UPDATE public.profiles
        SET balance = balance + amount, saving_balance = saving_balance - amount
        WHERE id = v_user_id;

        INSERT INTO public.transactions (user_id, type, amount, description)
        VALUES (v_user_id, 'withdraw', amount, 'Withdrawn from Money Jar');

        INSERT INTO public.transactions (user_id, type, amount, description)
        VALUES (v_user_id, 'add', amount, 'Added to Account Balance');

        -- Withdrawing all (or more than) today's savings breaks the streak
        IF v_saved_today > 0 AND amount >= v_saved_today THEN
            UPDATE public.profiles SET streak = 0 WHERE id = v_user_id;
        END IF;

    ELSE
        RETURN json_build_object('success', false, 'message', 'Invalid direction. Use ''save'' or ''withdraw''');
    END IF;

    RETURN json_build_object('success', true, 'message', 'Savings updated');
END;
$$;


-- =============================================================================
-- TRIGGER: bootstrap new user on sign-up
-- Creates profile skeleton + initial progress + starter badge.
-- age_range is left NULL so the JS routing correctly shows the onboarding form.
-- =============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    INSERT INTO public.profiles (id, name, email, balance, saving_balance, streak, age_range, monthly_income, savings_goal)
    VALUES (
        NEW.id,
        NEW.raw_user_meta_data->>'name',
        NEW.email,
        0, 0, 0,
        NULL,   -- age_range NULL = onboarding not yet completed
        0, 0
    )
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.user_progress (user_id, xp, tier)
    VALUES (NEW.id, 0, 1)
    ON CONFLICT (user_id) DO NOTHING;

    -- Grant starter badge
    INSERT INTO public.user_badges (user_id, badge_id)
    VALUES (NEW.id, 'b1')
    ON CONFLICT (user_id, badge_id) DO NOTHING;

    RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
