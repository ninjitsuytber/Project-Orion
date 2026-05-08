# Project Orion

<img width="632" height="395" alt="image" src="https://github.com/user-attachments/assets/913806a9-2e94-4cf3-b2f4-18107e4d3e2d" />

**AI-powered financial literacy platform designed to guide Malaysian youth toward long-term financial wellbeing.**

---

## Android App Installation

Project Orion is now available as a native Android application! Download and install the APK directly on your Android device.


[![Download APK](https://img.shields.io/badge/Download-Orion.apk-3DDC84?style=for-the-badge&logo=android&logoColor=white)](https://drive.google.com/file/d/1MkOXimnvQmjjsPV5VAaw87xUXl5yev3e/view?usp=sharing)


> We support direct Android App Installation — no Play Store required. Enable **Install from Unknown Sources** in your Android settings, then open the downloaded APK to install.

---

## Table of Contents

- [Android App Installation](#android-app-installation)
- [The Problem](#the-problem)
- [Our Solution](#our-solution)
- [Core Features](#core-features)
- [Tech Stack](#tech-stack)
- [System Architecture](#system-architecture)
- [Database Schema](#database-schema)
- [User Journey](#user-journey)
- [Gamification Engine](#gamification-engine)
- [AI System](#ai-system)
- [Data Flow: Key Transactions](#data-flow-key-transactions)
- [Project Structure](#project-structure)
- [Local Development](#local-development)
- [Authors](#authors)

---

## The Problem

Financial illiteracy among Malaysian teenagers and young adults is a quiet but persistent crisis. Studies consistently show that the majority of young Malaysians enter adulthood without the skills to budget, save, or plan for the future. The consequences compound quickly: impulsive spending, debt accumulation, zero savings culture, and a complete lack of investment awareness.

Traditional financial education is reactive — taught in school curricula that are dry, abstract, and disconnected from daily life. Banking apps, meanwhile, are designed for people who already understand money. They present raw numbers with no interpretation, no guidance, and no reward for good behaviour. For a 17-year-old seeing their first salary, these tools offer no signal at all about whether they are heading in the right direction.

Project Orion was built specifically to close this gap.

---

## Our Solution

Project Orion combines a simulated financial wallet with a gamified learning and behaviour system, all coached in real time by an AI assistant that speaks the way Malaysian young people actually communicate.

The core thesis is that financial discipline is a habit, and habits are formed through immediate feedback loops and progressive rewards. Every responsible financial action a user takes — logging in daily, moving money into savings, staying within a spending budget, completing a full week of saving — earns them experience points, advances their tier, and unlocks new badges. The platform makes the invisible visible: instead of abstract lectures about compound interest, users watch their savings jar fill up, their streak counter climb, and their rank against peers rise.

The AI assistant Orion adopts the persona of a Malaysian Asian parent: direct, slightly naggy, warm, and deeply invested in the user's financial future. It responds to the user's actual financial snapshot — current balance, savings progress, daily spending against their budget — and delivers personalised advice in natural Malaysian English. This grounds financial guidance in the user's real context rather than generic advice.

The result is a platform where young people are not lectured at but actively participate in building financial discipline, and are rewarded for doing so.

---

## Core Features

### Financial Wallet

- Account balance management with top-up via Malaysian bank simulation (Maybank, CIMB, Public Bank, RHB, and others)
- Peer-to-peer money transfers by email address with spending category tagging
- Savings jar: a ring-fenced sub-account that tracks saving progress toward a personal goal
- Withdrawal from savings jar with an XP penalty to discourage impulsive drawdowns
- Real-time daily spending ring showing percentage of daily budget consumed, with category breakdown across Food, Transport, Grocery, and Others

### Gamification System

- Ten progression tiers from "No Money No Talk" to "Sultan Simpanan", each requiring cumulative XP
- XP awarded for daily login, account reload, successful money transfer, saving into the jar, and achieving milestones
- Saving streak: consecutive days of saving tracked at the database level and automatically incremented
- Login streak: consecutive daily logins tracked atomically via a PostgreSQL stored function
- Global XP leaderboard showing the user's percentile rank against all platform users
- Badge collection popup displaying all earned and locked badges
- XP penalty applied on savings withdrawal to reinforce commitment

### AI Assistant — Orion

- Conversational chat interface accessible from every screen via a persistent notice bar
- Full financial snapshot injected into every AI session: balance, savings, daily limit, streak, and XP
- Malaysian Asian Parent persona: encourages, nags, and celebrates using natural Malaysian expressions
- Powered by Google Gemini with a cascading model fallback chain ensuring availability
- Personalised daily notice bar message generated from the user's live data on each login

### Financial Analytics

- Multi-ring SVG spending visualisation with concentric circles per spending category
- Animated savings jar that fills based on progress toward the user's defined goal
- Weekly spending trend bar chart
- Milestone progress bar for savings goal
- Detailed breakdown of spending remaining per category

### Discover Module

- ETF Basics educational module introducing exchange-traded fund concepts
- Trending ETF table with market data reference (EWM, SPY, QQQ, GLD, SOXX, and others)
- Savings Goals tutorial content

### User Onboarding

- Age range collection for personalised budget modelling
- Monthly salary input used to compute a recommended daily spending limit automatically
- Savings goal configuration and customisation
- Demo mode for exploring the full platform without creating an account

### Progressive Web App

- Installable on iOS and Android home screens via Web App Manifest
- Full-screen standalone display mode
- Custom splash screen, theme colour, and app icons
- Mobile-first responsive layout

---

## Tech Stack

### Frontend

| Layer | Technology |
|---|---|
| Markup | HTML5 |
| Styling | CSS3 (custom properties, CSS animations, SVG) |
| Logic | Vanilla JavaScript (ES2022, ES Modules) |
| Build Tool | Vite 5 |
| Database Client | @supabase/supabase-js v2 |
| Fonts | Google Fonts — Inter |
| PWA | Web App Manifest + Apple Web App meta tags |

### Backend (AI Service)

| Layer | Technology |
|---|---|
| Language | Python 3.12 |
| Framework | FastAPI 0.115 |
| Server | Uvicorn (ASGI) |
| HTTP Client | httpx (async) |
| Validation | Pydantic v2 |
| AI Model | Google Gemini (gemini-2.5-flash primary, cascading fallback) |
| Containerisation | Docker |

### Database and Auth

| Layer | Technology |
|---|---|
| Database | PostgreSQL (via Supabase) |
| Auth | Supabase Auth (email/password) |
| BaaS | Supabase (REST API, Realtime, RLS) |
| Business Logic | PostgreSQL stored functions (PL/pgSQL) |
| Security | Row Level Security policies on all tables |

---

## System Architecture

```mermaid
graph TD
    subgraph Client["Client — Browser / PWA"]
        UI[HTML + CSS + Vanilla JS]
        SW[Service Worker / Manifest]
    end

    subgraph Supabase["Supabase BaaS"]
        AUTH[Supabase Auth]
        DB[(PostgreSQL)]
        RLS[Row Level Security]
        RPC[Stored Functions / RPC]
        TRIGGER[Database Triggers]
    end

    subgraph AI["AI Backend — Docker / FastAPI"]
        API[FastAPI Server]
        GEMINI[Google Gemini API]
    end

    UI -->|Auth: sign up / login| AUTH
    AUTH -->|JWT session| UI
    UI -->|Data reads and writes via SDK| RLS
    RLS --> DB
    UI -->|RPC calls: add_money, transfer_money, manage_savings, daily_login_checkin, get_xp_rank| RPC
    RPC --> DB
    DB --> TRIGGER
    TRIGGER -->|sync_xp_to_profile| DB
    UI -->|POST /chat, POST /notice| API
    API -->|Gemini completions| GEMINI
    GEMINI -->|AI response| API
    API -->|JSON| UI
```

---

## Database Schema

```mermaid
erDiagram
    PROFILES {
        uuid id PK
        text name
        text email
        numeric balance
        numeric saving_balance
        integer streak
        integer xp
        text age_range
        numeric monthly_income
        numeric savings_goal
        numeric daily_spending_limit
        timestamptz created_at
    }

    TRANSACTIONS {
        uuid id PK
        uuid user_id FK
        text type
        numeric amount
        text description
        timestamptz created_at
    }

    USER_PROGRESS {
        uuid user_id PK
        integer xp
        integer tier
        timestamptz updated_at
    }

    USER_BADGES {
        uuid user_id FK
        text badge_id
        timestamptz created_at
    }

    APP_ACTIVITIES {
        uuid id PK
        uuid user_id FK
        text activity_name
        integer xp_earned
        timestamptz created_at
    }

    PROFILES ||--o{ TRANSACTIONS : "has"
    PROFILES ||--|| USER_PROGRESS : "has"
    PROFILES ||--o{ USER_BADGES : "earns"
    PROFILES ||--o{ APP_ACTIVITIES : "logs"
```

### Database Triggers and Stored Functions

```mermaid
graph LR
    subgraph Triggers
        T1["on_auth_user_created\nAFTER INSERT on auth.users"]
        T2["sync_xp_to_profile\nAFTER INSERT or UPDATE xp\non user_progress"]
    end

    subgraph Functions
        F1["handle_new_user\nBootstrap profile + progress + badge"]
        F2["sync_xp_to_profile\nMirror xp to profiles table"]
        F3["daily_login_checkin\nAtomic streak + XP + activity log"]
        F4["add_money\nCredit balance + log transaction"]
        F5["transfer_money\nDebit sender + credit recipient"]
        F6["manage_savings\nMove funds + saving streak logic"]
        F7["get_xp_rank\nPercentile rank vs all users"]
    end

    T1 --> F1
    T2 --> F2
```

---

## User Journey

```mermaid
flowchart TD
    START([User opens app]) --> LOADING[Loading screen\n1.5s minimum delay]
    LOADING --> SESSION{Active session?}

    SESSION -- No --> LOGIN[Login screen]
    LOGIN --> REGISTER[Register screen]
    REGISTER --> VERIFY[Supabase email auth]
    VERIFY --> ONBOARD

    SESSION -- Yes --> ONBOARD_CHECK{Onboarding\ncomplete?}
    ONBOARD_CHECK -- No --> ONBOARD[Onboarding form\nAge range + salary]
    ONBOARD_CHECK -- Yes --> SYNC

    ONBOARD --> SUBMIT[Save profile to DB]
    SUBMIT --> SYNC

    SYNC[syncUserData\nLoad balance, XP,\nstreak, badges] --> CHECKIN[daily_login_checkin RPC\nStreak increment + XP award]
    CHECKIN --> HOME[Home dashboard]

    HOME --> ACTION{User action}
    ACTION --> ADD[Add Money\n+XP on reload]
    ACTION --> SEND[Send Money\n+XP on transfer]
    ACTION --> SAVE[Save to Jar\n+XP + saving streak]
    ACTION --> REWARDS[Rewards page\nBadges, rank, missions]
    ACTION --> DISCOVER[Savings and Spendings\nAnalytics + ETF]
    ACTION --> PROFILE[Me page\nProfile + settings]
    ACTION --> CHAT[Orion AI chat]

    ADD --> SYNC2[syncUserData refresh]
    SEND --> SYNC2
    SAVE --> SYNC2
    SYNC2 --> HOME
```

---

## Gamification Engine

### XP Award Table

| Action | XP Awarded | XP Penalty |
|---|---|---|
| Daily Login | +10 | — |
| First Account Reload | +10 | — |
| Account Reloaded | +20 | — |
| Money Sent (Demo) | +15 | — |
| Successful Transfer | +30 | — |
| Saving Goal Progress (Demo) | +50 | — |
| Saving Reward | +50 | — |
| Withdrawal (jar drawdown) | — | -50 |

### Tier Progression

```mermaid
graph LR
    T1["Tier 1\nNo Money No Talk\n0 XP"] --> T2["Tier 2\nCoin Sniffer\n100 XP"]
    T2 --> T3["Tier 3\nOne Ringgit Millionaire\n250 XP"]
    T3 --> T4["Tier 4\nSikit-Sikit Jadi Bukit\n500 XP"]
    T4 --> T5["Tier 5\nWallet Protector\n800 XP"]
    T5 --> T6["Tier 6\nBajet Survivalist\n1,200 XP"]
    T6 --> T7["Tier 7\nCha Ching Apprentice\n1,700 XP"]
    T7 --> T8["Tier 8\nTabung Boss\n2,300 XP"]
    T8 --> T9["Tier 9\nLowkey Kaya\n3,000 XP"]
    T9 --> T10["Tier 10\nSultan Simpanan\n4,000 XP"]
```

### Streak System

```mermaid
flowchart TD
    LOGIN([User logs in]) --> CHECK_TODAY{Daily Login activity\nexists today?}
    CHECK_TODAY -- Yes --> RETURN[Return current streak\nNo change]
    CHECK_TODAY -- No --> CHECK_YESTERDAY{Daily Login activity\nexists yesterday?}
    CHECK_YESTERDAY -- Yes --> INCREMENT[streak = streak + 1]
    CHECK_YESTERDAY -- No --> RESET[streak = 1]
    INCREMENT --> AWARD[Award +10 XP\nLog app_activity]
    RESET --> AWARD

    SAVE([User saves money]) --> SAVE_CHECK{Saved yesterday?}
    SAVE_CHECK -- Yes --> SAVE_INC[saving streak = streak + 1]
    SAVE_CHECK -- No --> SAVE_RESET[saving streak = 1]
    SAVE_INC --> SAVE_LOG[Log save transaction]
    SAVE_RESET --> SAVE_LOG

    WITHDRAW([User withdraws]) --> W_CHECK{Withdrawing all\nof today's savings?}
    W_CHECK -- Yes --> W_RESET[saving streak = 0\n-50 XP penalty]
    W_CHECK -- No --> W_OK[Withdraw proceeds\nStreak unchanged]
```

### XP Sync Architecture

```mermaid
flowchart LR
    JS[JavaScript addXP] -->|upsert xp| UP[(user_progress.xp)]
    UP -->|AFTER UPDATE trigger| TR[sync_xp_to_profile]
    TR -->|UPDATE profiles SET xp| PR[(profiles.xp)]
    RPC[daily_login_checkin RPC] -->|UPDATE user_progress SET xp + 10| UP
    RANK[get_xp_rank RPC] -->|SELECT xp FROM profiles| PR
```

---

## AI System

### Architecture

```mermaid
sequenceDiagram
    participant U as User
    participant FE as Frontend JS
    participant BE as FastAPI Backend
    participant GM as Google Gemini

    U->>FE: Opens app / clicks notice bar
    FE->>FE: Build financial snapshot
    FE->>BE: POST /notice with balance, streak, spending, username
    BE->>GM: System prompt + user snapshot
    GM-->>BE: Personalised one-line nudge
    BE-->>FE: notice response
    FE-->>U: Display in notice bar

    U->>FE: Sends chat message
    FE->>FE: Append to chat history
    FE->>BE: POST /chat with messages and context
    BE->>GM: System prompt with Asian Parent persona + history
    GM-->>BE: Conversational reply
    BE-->>FE: reply response
    FE-->>U: Display in chat window
```

### Gemini Model Fallback Chain

The backend attempts each model in sequence until one succeeds:

```
gemini-3.1-flash-lite-preview
        |
gemini-2.5-flash
        |
gemini-2.0-flash
        |
gemini-2.5-flash-lite
        |
gemini-2.0-flash-lite
```

---

## Data Flow: Key Transactions

### Add Money

```mermaid
sequenceDiagram
    participant FE as Frontend
    participant RPC as add_money RPC
    participant DB as PostgreSQL

    FE->>RPC: add_money(amount, bank_name)
    RPC->>DB: UPDATE profiles SET balance = balance + amount
    RPC->>DB: INSERT transactions type add
    RPC-->>FE: success
    FE->>FE: addXP(20, Account Reloaded)
    FE->>DB: upsert user_progress xp
    DB->>DB: sync_xp_to_profile trigger fires
    DB->>DB: UPDATE profiles SET xp
```

### Save to Jar

```mermaid
sequenceDiagram
    participant FE as Frontend
    participant RPC as manage_savings RPC
    participant DB as PostgreSQL

    FE->>RPC: manage_savings(amount, save)
    RPC->>DB: Snapshot last save date from transactions
    RPC->>DB: UPDATE profiles balance minus amount, saving_balance plus amount
    RPC->>DB: INSERT transactions type spend
    RPC->>DB: INSERT transactions type save
    RPC->>DB: UPDATE profiles SET streak increment or reset to 1
    RPC-->>FE: success
    FE->>FE: addXP(50, Saving Reward)
    FE->>DB: upsert user_progress xp
    DB->>DB: sync_xp_to_profile trigger fires
```

---

## Project Structure

```
project-orion/
|
|-- index.html              # Single-page application shell
|-- script.js               # All frontend logic (auth, wallet, gamification, AI, UI)
|-- style.css               # Full design system (dark purple theme, animations)
|-- supabase.js             # Supabase client initialisation
|-- vite.config.js          # Vite build configuration
|-- manifest.json           # PWA web app manifest
|-- favicon.svg             # App icon (SVG)
|-- logo.png                # App logo (PNG, used as PWA icon)
|-- database_schema.sql     # Full PostgreSQL schema, RLS policies, stored functions
|-- package.json            # Frontend dependencies and build scripts
|
|-- assets/
|   |-- badges/             # Colour badge SVGs (b1.svg through b10.svg)
|   |   |-- black/          # Greyscale locked badge variants
|   |-- jar/                # Savings jar fill-level SVGs (1.svg through 9.svg)
|
|-- backend/
    |-- main.py             # FastAPI application: /chat and /notice endpoints
    |-- requirements.txt    # Python dependencies
    |-- Dockerfile          # Container definition (python:3.12-slim)
    |-- .env.example        # Environment variable template
    |-- .env                # Local secrets (not committed)
```

---

## Local Development

### Prerequisites

- Node.js 18 or later
- Python 3.12
- A Supabase project (free tier is sufficient)
- A Google AI Studio API key

### Frontend Setup

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Add your Supabase URL and anon key to .env

# Start development server
npm run dev
```

### Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate
# Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Add your GOOGLE_API_KEY to .env

# Start server
uvicorn main:app --reload --port 8080
```

### Database Setup

1. Open your Supabase project dashboard
2. Navigate to SQL Editor and create a new query
3. Paste and run the full contents of `database_schema_example.sql`

The script is idempotent and safe to re-run. It creates all tables, indexes, RLS policies, stored functions, and triggers.

### Running with Docker (Backend)

```bash
cd backend
docker build -t orion-backend .
docker run -p 8080:8080 --env-file .env orion-backend
```

---

## Star History

<a href="https://www.star-history.com/?repos=ninjitsuytber%2FProject-Orion&type=date&legend=top-left">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/chart?repos=ninjitsuytber/Project-Orion&type=date&theme=dark&legend=top-left" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/chart?repos=ninjitsuytber/Project-Orion&type=date&legend=top-left" />
   <img alt="Star History Chart" src="https://api.star-history.com/chart?repos=ninjitsuytber/Project-Orion&type=date&legend=top-left" />
 </picture>
</a>

## Authors

| Rank | Author | Contribution |
|---|---|---|
| 1 | [Stephen Sii](https://github.com/ninjitsuytber) | Full Stack — frontend architecture, backend integration, gamification engine, XP and streak system, wallet transaction flows, AI service integration, PWA setup, database design, deployment |
| 2 | [Lee Yun Sheng](https://github.com/leeyunsheng06) | Frontend — UI components and visual refinement, AI assistant integration, spending ring visualisation, notice bar, chat interface |
| 3 | [Chang Cheng Jun](https://github.com/chengjunchang0721) | Frontend — UI refinement, badge system design, quality assurance testing, bug verification across flows |
| 4 | [Kelvin Ng](https://github.com/ngk891796-png) | Frontend — UI components, visual refinement, performance and pressure testing |
| 5 | [Johnathan Ooi](https://github.com/Johnathan0817) | Database — schema construction, stored functions, RLS policies, backend configuration |
