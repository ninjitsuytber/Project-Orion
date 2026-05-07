import { supabase } from './supabase.js';

// DOM Elements
const onboardingView = document.getElementById('onboarding-view');

const loginView = document.getElementById('login-view');
const registerView = document.getElementById('register-view');
const mainView = document.getElementById('main-view');

const pageHome = document.getElementById('page-home');
const pageRewards = document.getElementById('page-rewards');
const pageDiscover = document.getElementById('page-discover');
const pageMe = document.getElementById('page-me');
const spend = document.querySelector('.list-row list-row--clickable');

const navItems = {
  home: document.getElementById('nav-home'),
  rewards: document.getElementById('nav-rewards'),
  discover: document.getElementById('nav-discover'),
  me: document.getElementById('nav-me'),
};

//Tiers
const TIERS = [
  { tier: 1, name: "No Money No Talk", xpRequired: 0 },
  { tier: 2, name: "Coin Sniffer", xpRequired: 100 },
  { tier: 3, name: "One Ringgit Millionaire", xpRequired: 250 },
  { tier: 4, name: "Sikit-Sikit Jadi Bukit", xpRequired: 500 },
  { tier: 5, name: "Wallet Protector", xpRequired: 800 },
  { tier: 6, name: "Bajet Survivalist", xpRequired: 1200 },
  { tier: 7, name: "Cha Ching Apprentice", xpRequired: 1700 },
  { tier: 8, name: "Tabung Boss", xpRequired: 2300 },
  { tier: 9, name: "Lowkey Kaya", xpRequired: 3000 },
  { tier: 10, name: "Sultan Simpanan", xpRequired: 4000 }
];

//Badges
const BADGES = [
  { id: "b1", name: "No Money No Talk", tierRequired: 1, img: "assets/badges/b1.svg" },
  { id: "b2", name: "Coin Sniffer", tierRequired: 2, img: "assets/badges/b2.svg" },
  { id: "b3", name: "One Ringgit Millionaire", tierRequired: 3, img: "assets/badges/b3.svg" },
  { id: "b4", name: "Sikit-Sikit Jadi Bukit", tierRequired: 4, img: "assets/badges/b4.svg" },
  { id: "b5", name: "Wallet Protector", tierRequired: 5, img: "assets/badges/b5.svg" },
  { id: "b6", name: "Bajet Survivalist", tierRequired: 6, img: "assets/badges/b6.svg" },
  { id: "b7", name: "Cha Ching Apprentice", tierRequired: 7, img: "assets/badges/b7.svg" },
  { id: "b8", name: "Tabung Boss", tierRequired: 8, img: "assets/badges/b8.svg" },
  { id: "b9", name: "Lowkey Kaya", tierRequired: 9, img: "assets/badges/b9.svg" },
  { id: "b10", name: "Sultan Simpanan", tierRequired: 10, img: "assets/badges/b10.svg" }
];

const BADGE_THEMES = [
  { tier: 1,  color: '#cd7f32', bg: 'rgba(205,127,50,0.18)'  },  // Bronze
  { tier: 2,  color: '#a8a9ad', bg: 'rgba(168,169,173,0.18)' },  // Silver
  { tier: 3,  color: '#ffd700', bg: 'rgba(255,215,0,0.15)'   },  // Gold
  { tier: 4,  color: '#4f9eff', bg: 'rgba(79,158,255,0.18)'  },  // Sapphire
  { tier: 5,  color: '#ff4d6d', bg: 'rgba(255,77,109,0.18)'  },  // Ruby
  { tier: 6,  color: '#50c878', bg: 'rgba(80,200,120,0.18)'  },  // Emerald
  { tier: 7,  color: '#c084fc', bg: 'rgba(192,132,252,0.18)' },  // Purple Crystal
  { tier: 8,  color: '#f472b6', bg: 'rgba(244,114,182,0.18)' },  // Pink Crystal
  { tier: 9,  color: '#94a3b8', bg: 'rgba(148,163,184,0.18)' },  // Gray Obsidian
  { tier: 10, color: '#e0f7ff', bg: 'rgba(224,247,255,0.22)' },  // Diamond
];

//Tier Update
function calculateTier(xp) {
  let tier = 1;

  for (let i = TIERS.length - 1; i >= 0; i--) {
    if (xp >= TIERS[i].xpRequired) {
      tier = TIERS[i].tier;
      break;
    }
  }

  return tier;
}

//Badge Unlock
function unlockBadge(tier) {
  const badge = BADGES.find(b => Number(b.tierRequired) === Number(tier));

  if (!badge) return null;

  if (!userProfile.badges.includes(badge.id)) {
    userProfile.badges.push(badge.id);
    console.log("Congratulations! Badge Unlocked:", badge.name);
    return badge;
  }

  return null;
}

//Add XP
async function addXP(amount, reason = "") {
  const oldTier = userProfile.tier;
  userProfile.xp = Math.max(0, userProfile.xp + amount);
  const newTier = calculateTier(userProfile.xp);
  userProfile.tier = newTier;

  let unlockedBadges = [];
  if (newTier > oldTier) {
    for (let t = oldTier + 1; t <= newTier; t++) {
      const badge = BADGES.find(b => b.tierRequired === t);
      if (badge && !userProfile.badges.includes(badge.id)) {
        userProfile.badges.push(badge.id);
        unlockedBadges.push(badge);
      }
    }
  }

  if (isDemo) {
    return { xpAdded: amount, newTier, unlockedBadges };
  }

  try {
    // 1. Update Progress
    await supabase.from('user_progress').upsert({
      user_id: userProfile.id,
      xp: userProfile.xp,
      tier: newTier
    });

    // Mirror XP on the profiles row for easy querying
    await supabase.from('profiles').update({ xp: userProfile.xp }).eq('id', userProfile.id);

    // 2. Insert new badges into DB
    for (const badge of unlockedBadges) {
      await supabase.from('user_badges').insert({
        user_id: userProfile.id,
        badge_id: badge.id
      });
    }

    // 3. Log Activity
    await supabase.from('app_activities').insert([{
      user_id: userProfile.id,
      activity_name: reason,
      xp_earned: amount
    }]);

  } catch (err) {
    console.error("addXP sync error:", err);
  }

  return { xpAdded: amount, newTier, unlockedBadges };
}

async function logActivity(activityName) {
  if (isDemo || !userProfile.id) return;
  try {
    await supabase.from('app_activities').insert([{
      user_id: userProfile.id,
      activity_name: activityName,
      xp_earned: 0
    }]);
  } catch (err) {
    console.error('logActivity error:', err);
  }
}

// Modals
const modalContainer = document.getElementById('modal-container');
const modals = {
  add: document.getElementById('modal-add-money'),
  send: document.getElementById('modal-send-money'),
  save: document.getElementById('modal-save-money'),
  withdraw: document.getElementById('modal-withdraw-money'),
  confirmWithdraw: document.getElementById('modal-confirm-withdraw'),
  qr: document.getElementById('modal-scan-qr'),
  goal: document.getElementById('modal-edit-goal'),
  financials: document.getElementById('modal-update-financials'),
};

// App State
let pendingWithdrawAmount = 0;
let isDemo = false;
let isBalanceHidden = false;
let userProfile = {
  id: null,
  name: 'User',
  email: '',
  balance: 0,
  saving_balance: 0,
  spent_today: 0,
  saved_today: 0,
  streak: 0,
  xp: 0,
  tier: 1,
  badges: ['b1'],
  age_range: '',
  monthly_income: 1000,
  savings_goal: 1,
  category_budgets: { housing: 0, food: 0, transport: 0, others: 0 },
  category_spent: { housing: 0, food: 0, transport: 0, others: 0 }
};

async function renderApp() {
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    userProfile.id = session.user.id;
    userProfile.email = session.user.email;
    userProfile.name = session.user.user_metadata.name || 'User';
    await checkOnboardingAndRoute();
  } else if (!isDemo) {
    showLogin();
  }

  supabase.auth.onAuthStateChange(async (_event, session) => {
    if (session) {
      userProfile.id = session.user.id;
      userProfile.email = session.user.email;
      userProfile.name = session.user.user_metadata.name || 'User';
      if (_event === 'SIGNED_IN' || _event === 'INITIAL_SESSION') {
        await checkOnboardingAndRoute();
      }
    } else {
      Object.assign(userProfile, {
        id: null, name: 'User', email: '', balance: 0, saving_balance: 0,
        spent_today: 0, saved_today: 0, streak: 0, xp: 0, tier: 1,
        badges: ['b1'], age_range: '', monthly_income: 1000, savings_goal: 1,
        category_budgets: { housing: 0, food: 0, transport: 0, others: 0 },
        category_spent: { housing: 0, food: 0, transport: 0, others: 0 }
      });
      if (!isDemo) showLogin();
    }
  });
}

async function checkDailyLoginBonus() {
  if (isDemo || !userProfile.id) return;
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const { data } = await supabase
      .from('app_activities')
      .select('id')
      .eq('user_id', userProfile.id)
      .eq('activity_name', 'Daily Login')
      .gte('created_at', today.toISOString())
      .limit(1);

    if (!data || data.length === 0) {
      await addXP(10, 'Daily Login');
    }
  } catch (err) {
    console.error('Daily login bonus error:', err);
  }
}

async function checkOnboardingAndRoute() {
  if (isDemo) return;

  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, age_range')
      .eq('id', userProfile.id)
      .maybeSingle();

    // age_range is NULL/empty until the onboarding form is submitted
    if (profile && profile.age_range) {
      routeTo('home');
      await checkDailyLoginBonus();
    } else {
      showOnboarding();
    }
  } catch (err) {
    console.error("Routing error:", err);
    showOnboarding();
  }
}

// Data Syncing
async function syncUserData() {
  if (isDemo) return;
  if (!userProfile.id) return;

  try {
    // 1. Fetch Profile (Balance, Streak)
    let { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userProfile.id)
      .single();

    if (profile) {
      userProfile.balance = Number(profile.balance) || 0;
      userProfile.saving_balance = Number(profile.saving_balance) || 0;
      userProfile.streak = Number(profile.streak) || 0;
      userProfile.savings_goal = Number(profile.savings_goal) || 300;
      userProfile.monthly_income = Number(profile.monthly_income) || 0; // NEW
      userProfile.age_range = profile.age_range || '';
      if (userProfile.monthly_income > 0) {
        userProfile.category_budgets = {
          housing: userProfile.monthly_income * 0.30,
          food: userProfile.monthly_income * 0.20,
          transport: userProfile.monthly_income * 0.15,
          others: userProfile.monthly_income * 0.15
        };
      }
    } else {
      // Create profile if doesn't exist
      const { data: newProfile } = await supabase
        .from('profiles')
        .insert([{ id: userProfile.id, name: userProfile.name, email: userProfile.email, balance: 0, saving_balance: 0, streak: 0 }])
        .select()
        .single();
      if (newProfile) {
        userProfile.balance = 0;
        userProfile.saving_balance = 0;
        userProfile.streak = 0;
      }
    }

    // 2. Fetch Progress (XP, Tier)
    const { data: progress } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userProfile.id)
      .maybeSingle();

    if (progress) {
      userProfile.xp = Number(progress.xp) || 0;
      userProfile.tier = calculateTier(userProfile.xp);
    } else {
      // Initialize progress if not found
      await supabase.from('user_progress').insert([{ user_id: userProfile.id, xp: 0, tier: 1 }]);
      userProfile.xp = 0;
      userProfile.tier = 1;
    }

    // 3. Fetch Badges
    const { data: badges } = await supabase
      .from('user_badges')
      .select('badge_id')
      .eq('user_id', userProfile.id);
    
    userProfile.badges = badges?.map(b => b.badge_id) || ['b1'];
    if (!userProfile.badges.includes('b1')) {
      userProfile.badges.unshift('b1');
    }

    // 4. Fetch Today's Spendings & Savings
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const { data: todayTxs } = await supabase
      .from('transactions')
      .select('amount, type')
      .eq('user_id', userProfile.id)
      .gte('created_at', today.toISOString());

    userProfile.spent_today = todayTxs?.filter(tx => tx.type === 'send').reduce((sum, tx) => sum + Number(tx.amount), 0) || 0;
    userProfile.saved_today = todayTxs?.filter(tx => tx.type === 'save').reduce((sum, tx) => sum + Number(tx.amount), 0) || 0;

    // 5. Fetch Transactions for Activity Log
    const { data: transactions } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userProfile.id)
      .order('created_at', { ascending: false })
      .limit(10);

    renderTransactions(transactions || []);

    // 6. Fetch App Activities
    const { data: activities } = await supabase
      .from('app_activities')
      .select('*')
      .eq('user_id', userProfile.id)
      .order('created_at', { ascending: false })
      .limit(10);

    renderAppActivities(activities || []);

  } catch (err) {
    console.error('Error syncing data:', err);
  }
}

function renderTransactions(transactions) {
  const list = document.querySelector('#tab-transactions .transactions-list');
  if (!list) return;

  if (transactions.length === 0) {
    list.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 1rem;">No recent transactions</p>';
    return;
  }

  list.innerHTML = transactions.map(tx => {
    const isPositive = tx.type === 'add' || tx.type === 'receive' || tx.type === 'save';
    const amountPrefix = isPositive ? '+' : '-';
    const amountClass = isPositive ? 'positive' : 'negative';
    const date = new Date(tx.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

    return `
      <div class="tx-item">
        <div class="tx-left">
          <div class="tx-icon">
            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 1v22m5-18H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
          </div>
          <div class="tx-info">
            <h4>${tx.description || tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}</h4>
            <p>${date}</p>
          </div>
        </div>
        <span class="tx-amount ${amountClass}">${amountPrefix}RM ${Number(tx.amount).toFixed(2)}</span>
      </div>
    `;
  }).join('');
}

function renderAppActivities(activities) {
  const list = document.querySelector('#tab-app-activities .transactions-list');
  if (!list) return;

  if (activities.length === 0) {
    list.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 1rem;">No recent app activity</p>';
    return;
  }

  list.innerHTML = activities.map(activity => {
    const date = new Date(activity.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    const xp = activity.xp_earned;
    const xpClass = xp > 0 ? 'positive' : xp < 0 ? 'negative' : '';
    const xpLabel = xp === 0 ? '—' : xp > 0 ? `+${xp} XP` : `${xp} XP`;
    return `
      <div class="tx-item">
        <div class="tx-left">
          <div class="tx-icon">
            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
          </div>
          <div class="tx-info">
            <h4>${activity.activity_name}</h4>
            <p>${date}</p>
          </div>
        </div>
        <span class="tx-amount ${xpClass}">${xpLabel}</span>
      </div>
    `;
  }).join('');
}

function updateCategoriesUI() {
  if (!userProfile.category_budgets) return;

  const cats = ['food', 'transport', 'housing', 'others'];
  cats.forEach(cat => {
    const budget = userProfile.category_budgets[cat] || 0;
    const spent = userProfile.category_spent[cat] || 0;
    const left = Math.max(0, budget - spent);

    updateText(`cat-${cat}-left`, left.toFixed(2));
    updateText(`cat-${cat}-total`, budget.toFixed(2));
  });
}

// Financial Logic & Spending Ring
async function updateDashboard() {
  await syncUserData();
  updateBalanceUI();
  updateSpendingRing();
  updateSavingJar();
  updateRewardsUI();
  updateCategoriesUI();
  initActivityTabs();
}

function updateRewardsUI() {
  // Sync Rewards Page Stats
  updateText('rw-streak-val', `${userProfile.streak} Days`);
  updateText('rw-total-xp', `${userProfile.xp} XP`);
  
  const currentBadge = BADGES.find(b => b.tierRequired === userProfile.tier) || BADGES[0];
  const badgeImg = document.getElementById('rw-current-badge-img');
  if (badgeImg) badgeImg.src = currentBadge.img;
  updateText('rw-badge-name', currentBadge.name);

  // Sync Home Page Rewards Widget
  const homeGiftBoxes = document.getElementById('home-gift-boxes');
  if (homeGiftBoxes) {
    const boxes = homeGiftBoxes.querySelectorAll('.gift-box');
    boxes.forEach((box, index) => {
      const label = box.querySelector('.gift-label');
      if (index === 0) {
        label.textContent = `${userProfile.streak} Day Streak`;
      } else if (index === 1) {
        label.textContent = currentBadge.name;
      } else if (index === 2) {
        label.textContent = `${userProfile.xp} Total XP`;
      }
    });
  }
}

function updateBalanceUI() {
  const balanceText = document.getElementById('balance-amount-text');
  if (balanceText) {
    balanceText.textContent = isBalanceHidden ? 'RM ****' : `RM ${userProfile.balance.toFixed(2)}`;
  }
}

function updateSpendingRing() {
  const monthlyBudget = userProfile.monthly_income - userProfile.savings_goal;
  const dailyLimit = monthlyBudget / 30;
  const remainingToday = Math.max(0, dailyLimit - userProfile.spent_today);
  const spentPercentage = Math.min(100, (userProfile.spent_today / dailyLimit) * 100);

  updateText('daily-limit-text', `Limit: RM ${dailyLimit.toFixed(2)}`);
  updateText('spent-today-text', `RM ${userProfile.spent_today.toFixed(2)}`);
  updateText('remaining-today-text', `RM ${remainingToday.toFixed(2)}`);
  updateText('spent-pct', `${Math.round(spentPercentage)}%`);
  updateText('detail-spent-pct', `${Math.round(spentPercentage)}%`);

  setRingProgress('spending-ring-fill', 54, spentPercentage);
  setRingProgress('detail-spending-ring-fill', 82, spentPercentage);
}

function updateSavingJar() {
  const percentage = (userProfile.saving_balance / userProfile.savings_goal) * 100;

  let stage = 1;
  if (percentage >= 110) {
    stage = 9;
  } else if (percentage >= 100) {
    stage = 8;
  } else if (percentage > 0) {
    stage = Math.floor(percentage / 16.67) + 2;
    if (stage > 7) stage = 7;
  }

  const jarSrc = `assets/jar/${stage}.svg`;

  const targetLabel = document.querySelector('.jar-target');
  if (targetLabel) targetLabel.textContent = `Goal: RM ${userProfile.savings_goal}`;

  const targetLarge = document.querySelector('.jar-target-large');
  if (targetLarge) targetLarge.textContent = `Goal: RM ${userProfile.savings_goal}`;

  updateText('jar-pct',`${Math.round(percentage)}%`);
  updateText('detail-jar-pct',`${Math.round(percentage)}%`);

  const jarImg = document.getElementById('saving-jar-img');
  if (jarImg) jarImg.src = jarSrc;
  updateText('jar-pct', `${Math.round(percentage)}%`);
  updateText('jar-saved-amount', `RM ${userProfile.saving_balance.toFixed(2)}`);

  const detailJarImg = document.getElementById('detail-saving-jar-img');
  if (detailJarImg) detailJarImg.src = jarSrc;
  updateText('detail-jar-pct', `${Math.round(percentage)}%`);
  updateText('detail-jar-saved-amount', `RM ${userProfile.saving_balance.toFixed(2)}`);

  const milestoneFill = document.getElementById('detail-milestone-fill');
  if (milestoneFill) milestoneFill.style.width = `${Math.min(100, percentage)}%`;
}

// Helpers
function updateText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

function setRingProgress(id, radius, percentage) {
  const ring = document.getElementById(id);
  if (ring) {
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;
    ring.style.strokeDasharray = `${circumference} ${circumference}`;
    ring.style.strokeDashoffset = offset;
  }
}

function hideAllViews() {
  loginView.style.display = 'none';
  registerView.style.display = 'none';
  mainView.style.display = 'none';
  if (onboardingView) onboardingView.style.display = 'none';
}

function showOnboarding() {
  hideAllViews();
  onboardingView.style.display = 'flex';
}

function hideAllPages() {
  pageHome.style.display = 'none';
  pageRewards.style.display = 'none';
  pageDiscover.style.display = 'none';
  pageMe.style.display = 'none';
}

function updateNav(activeId) {
  Object.values(navItems).forEach(el => el?.classList.remove('active'));
  if (navItems[activeId]) {
    navItems[activeId].classList.add('active');
  }
}

// Modal Handlers
function openModal(type) {
  modalContainer.style.display = 'flex';
  Object.values(modals).forEach(m => m.style.display = 'none');

  document.querySelectorAll('.error-msg').forEach((el) => {
    el.style.display = 'none';
    el.textContent = '';
  });

  if (modals[type]) modals[type].style.display = 'block';
}

function closeModal() {
  modalContainer.style.display = 'none';
}

// Financial Actions
async function addMoney(amount, bank) {
  if (isNaN(amount) || amount <= 0) {
    alert('Please enter a valid amount greater than zero.');
    return;
  }
  if (isDemo) {
    userProfile.balance += amount;
    await addXP(10, "First Reload");
    updateDashboard();
    closeModal();
    return;
  }

  const { data, error } = await supabase.rpc('add_money', {
    amount: amount,
    bank_name: bank
  });

  if (!error && data?.success) {
    await addXP(20, "Account Reloaded");
    updateDashboard();
    closeModal();
    alert('RM ' + amount.toFixed(2) + ' added successfully!');
  } else {
    alert('Error adding money: ' + (error?.message || data?.message || 'Unknown error'));
  }
}

async function sendMoney(email, amount, category) {
  const errorEl = document.getElementById('send-money-error');
  if (errorEl) errorEl.style.display = 'none';

  if (!email || !email.includes('@')) {
    showError('send-money-error', 'Please enter a valid recipient email');
    return;
  }

  if (isNaN(amount) || amount <= 0) {
    showError('send-money-error', 'Please enter a valid amount greater than zero');
    return;
  }

  if (!category) {
    showError('send-money-error', 'Please select a transfer category');
    return;
  }

  if (email.trim().toLowerCase() === userProfile.email.trim().toLowerCase()) {
    showError('send-money-error', 'You cannot send money to yourself');
    return;
  }

  if (amount > userProfile.balance) {
    showError('send-money-error', `Insufficient balance (Available: RM ${userProfile.balance.toFixed(2)})`);
    return;
  }

  if (isDemo) {
    userProfile.balance -= amount;
    await addXP(15, "Money Sent (Demo)");
    await updateDashboard();
    closeModal();
    return;
  }

  const btn = document.querySelector('#send-money-form button[type="submit"]');
  if (btn) btn.disabled = true;

  try {
    const { data, error } = await supabase.rpc('transfer_money', {
      target_email: email.trim().toLowerCase(),
      amount: amount,
      category: category
    });

    if (error) {
      console.error('transfer_money RPC error:', error);
      showError('send-money-error', error.message || 'Transfer failed. Please try again.');
      return;
    }

    // Handle case where Supabase returns JSON as a string
    const result = typeof data === 'string' ? JSON.parse(data) : data;

    if (!result || !result.success) {
      showError('send-money-error', result?.message || 'Transfer failed. Please try again.');
      return;
    }

    await addXP(30, "Successful Transfer");
    await updateDashboard();

    document.getElementById('send-email').value = '';
    document.getElementById('send-amount').value = '';
    document.getElementById('send-category').value = '';

    closeModal();
    alert('RM ' + amount.toFixed(2) + ' sent to ' + email);
  } catch (err) {
    console.error('sendMoney unexpected error:', err);
    showError('send-money-error', 'An unexpected error occurred. Please try again.');
  } finally {
    if (btn) btn.disabled = false;
  }
}

async function saveMoney(amount) {
  const errorEl = document.getElementById('save-money-error');
  if (errorEl) errorEl.style.display = 'none';

  if (isNaN(amount) || amount <= 0) {
    showError('save-money-error', 'Please enter a valid amount greater than zero');
    return;
  }

  if (amount > userProfile.balance) {
    showError('save-money-error', 'Insufficient balance');
    return;
  }

  if (isDemo) {
    userProfile.balance -= amount;
    userProfile.saving_balance += amount;
    userProfile.saved_today += amount;
    userProfile.streak = Math.max(1, userProfile.streak);
    await addXP(50, "Saving Goal Progress (Demo)");
    await updateDashboard();
    closeModal();
    return;
  }

  const submitBtn = document.querySelector('#save-money-form [type="submit"]');
  if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Saving...'; }

  try {
    const { data, error } = await supabase.rpc('manage_savings', {
      amount: amount,
      direction: 'save'
    });

    if (!error && data?.success) {
      await addXP(50, "Saving Reward");
      await updateDashboard();
      closeModal();
      const saveInput = document.getElementById('save-amount');
      if (saveInput) saveInput.value = '';
      alert('RM ' + amount.toFixed(2) + ' saved to your jar!');
    } else {
      showError('save-money-error', error?.message || data?.message || 'Error saving money');
    }
  } finally {
    if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Save Money'; }
  }
}

function withdrawMoney(amount) {
  const errorEl = document.getElementById('withdraw-money-error');
  if (errorEl) { errorEl.style.display = 'none'; errorEl.textContent = ''; }

  if (isNaN(amount) || amount <= 0) {
    showError('withdraw-money-error', 'Please enter a valid amount greater than zero');
    return;
  }
  if (amount > userProfile.saving_balance) {
    showError('withdraw-money-error', `Insufficient jar balance. Available: RM ${userProfile.saving_balance.toFixed(2)}`);
    return;
  }

  pendingWithdrawAmount = amount;
  document.getElementById('confirm-withdraw-text').textContent = `Are you sure you want to withdraw RM ${amount.toFixed(2)} from your jar?`;

  openModal('confirmWithdraw');
}

async function processWithdraw() {
  const amount = pendingWithdrawAmount;
  if (amount <= 0) return;

  const streakWillReset = userProfile.saved_today > 0 && amount >= userProfile.saved_today;

  if (isDemo) {
    userProfile.balance += amount;
    userProfile.saving_balance -= amount;
    if (streakWillReset) userProfile.streak = 0;
    await updateDashboard();
    closeModal();
    if (streakWillReset) alert('Your streak has been reset because you withdrew all of today\'s savings.');
    return;
  }

  const confirmBtn = document.getElementById('btn-confirm-withdraw-yes');
  if (confirmBtn) confirmBtn.disabled = true;

  try {
    const { data, error } = await supabase.rpc('manage_savings', {
      amount: amount,
      direction: 'withdraw'
    });

    if (!error && data?.success) {
      pendingWithdrawAmount = 0;
      const withdrawInput = document.getElementById('withdraw-amount');
      if (withdrawInput) withdrawInput.value = '';
      await addXP(-50, "Withdrawal Penalty");
      await updateDashboard();
      closeModal();
      if (streakWillReset) alert('Your streak has been reset because you withdrew all of today\'s savings.\n\n-50 XP penalty applied.');
      else alert('RM ' + amount.toFixed(2) + ' withdrawn from your jar.\n\n-50 XP penalty applied.');
    } else {
      alert('Error withdrawing: ' + (error?.message || data?.message || 'Unknown error'));
    }
  } finally {
    if (confirmBtn) confirmBtn.disabled = false;
  }
}

async function updateSavingGoal(newGoal) {
  if (isDemo) {
    userProfile.savings_goal = newGoal;
    updateDashboard();
    return;
  }

  const { error } = await supabase
    .from('profiles')
    .update({savings_goal: newGoal})
    .eq('id', userProfile.id);
  
  if (!error) {
    userProfile.savings_goal = newGoal;
    updateDashboard();
    alert('Goal updated successfully!');
  } else {
    console.error('Error updating goal:',error.message)
  }
}

function showError(id, msg) {
  const el = document.getElementById(id);
  if (el) {
    el.textContent = msg;
    el.style.display = 'block';
  }
}

function routeTo(page) {
  hideAllViews();
  mainView.style.display = 'block';
  hideAllPages();
  updateNav(page);

  if (page === 'home') {
    pageHome.style.display = 'block';
    updateDashboard();
    window.dispatchEvent(new Event('resize'));
  } else if (page === 'rewards') {
    pageRewards.style.display = 'block';
  } else if (page === 'discover') {
    pageDiscover.style.display = 'block';
    updateDashboard();
  } else if (page === 'me') {
    pageMe.style.display = 'block';
    updateProfile();
  }
}

async function updateProfile() {
  const nameEl = document.querySelector('.profile-name');
  const emailEl = document.querySelector('.profile-email');

  if (nameEl) nameEl.textContent = userProfile.name;
  if (emailEl) emailEl.textContent = userProfile.email;

  const currentBadge = BADGES.find(b => b.tierRequired === userProfile.tier) || BADGES[0];
  const badgeImg = document.getElementById('profile-badge-img');
  const badgeName = document.getElementById('profile-badge-name');

  if (badgeImg) badgeImg.src = currentBadge.img;
  if (badgeName) badgeName.textContent = currentBadge.name;

  const theme = BADGE_THEMES.find(t => t.tier === userProfile.tier) || BADGE_THEMES[0];
  const container = document.getElementById('profile-badge-container');
  if (container) {
    container.style.background = theme.bg;
    container.style.color = theme.color;
    container.style.border = `1px solid ${theme.color}40`;
  }
}

function showLogin() {
  hideAllViews();
  loginView.style.display = 'flex';
}

function showRegister() {
  hideAllViews();
  registerView.style.display = 'flex';
}

function initActivityTabs() {
  const tabs = document.querySelectorAll('.activity-tab');


  tabs.forEach(tab => {
    const newTab = tab.cloneNode(true);
    tab.parentNode.replaceChild(newTab, tab);

    newTab.addEventListener('click', () => {
      const target = newTab.getAttribute('data-tab');
      document.querySelectorAll('.activity-tab').forEach(t => t.classList.remove('active'));
      newTab.classList.add('active');
      document.querySelectorAll('.activity-content').forEach(c => c.classList.remove('active'));
      document.getElementById(`tab-${target}`).classList.add('active');
    });
  });
}

function initWaveAnimation(selector) {
    const container = document.querySelector(selector);
    if (!container) return;

    let canvas = container.querySelector('canvas');
    if (!canvas) {
        canvas = document.createElement('canvas');
        container.appendChild(canvas);
    }

    const ctx = canvas.getContext('2d');

    const monthlyBudget = userProfile.monthly_income - userProfile.savings_goal;
    const dailyLimit = monthlyBudget / 30;
    const remainingToday = Math.max(0, dailyLimit - userProfile.spent_today);
    const spentPercentage = Math.min(100, (userProfile.spent_today / dailyLimit) * 100);
    const verticalBaseline = canvas.height * (1-(spentPercentage/100)); 
    let color="#ffffff";


    if (spentPercentage>=67 && spentPercentage<=100){
      color='#43f6ff'
    }
    else if (spentPercentage>=33 && spentPercentage<=66){
      color='#fdf111'
    }
    else{
      color='#ff9292'
    };

    const params = {
        AMPLITUDE_WAVES: 5,
        AMPLITUDE_MIDDLE: 5,
        AMPLITUDE_SIDES: 15,
        OFFSET_SPEED: 100,
        SPEED: 10,
        OFFSET_WAVES: 60,
        NUMBER_WAVES: 3,
        COLOR: color,
        NUMBER_CURVES: 4,
        OFFSET_CURVE: true
    };


    const wavesOpacities = [0.3, 0.2, 0.1]; 
    let speedInc = 0;
    let gradient;

    const hexToRgb = (hex) => {
        let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    };

    const resize = () => {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
        
        let rgb = hexToRgb(params.COLOR);
        gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0)`);
        gradient.addColorStop(1, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)`);
    };

    const render = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);




        for (let j = params.NUMBER_WAVES - 1; j >= 0; j--) {
            let offset = speedInc + j * Math.PI * params.OFFSET_WAVES;

            ctx.fillStyle = (j === 0) ? gradient : params.COLOR;
            ctx.globalAlpha = wavesOpacities[j];

            let leftRange = verticalBaseline;
            let rightRange = verticalBaseline;
            
            let leftCurveRange = verticalBaseline - (Math.sin((offset / params.OFFSET_SPEED) + 1.5) * params.AMPLITUDE_WAVES);
            let rightCurveRange = verticalBaseline - (Math.cos((offset / params.OFFSET_SPEED) + 0.5) * params.AMPLITUDE_WAVES);
            let endCurveRange = verticalBaseline + (Math.sin((offset / (params.OFFSET_SPEED * 1.5))) * params.AMPLITUDE_MIDDLE);

            let reverseLeftCurveRange = endCurveRange - rightCurveRange + endCurveRange;
            let reverseRightCurveRange = endCurveRange - leftCurveRange + endCurveRange;

            if (!params.OFFSET_CURVE) {
                leftCurveRange = rightCurveRange;
                reverseRightCurveRange = reverseLeftCurveRange;
            }

            ctx.beginPath();
            ctx.moveTo(0, leftRange);

            ctx.bezierCurveTo(
                canvas.width / (params.NUMBER_CURVES * 3), leftCurveRange, 
                canvas.width / (params.NUMBER_CURVES * 3 / 2), rightCurveRange, 
                canvas.width / params.NUMBER_CURVES, endCurveRange
            );

            for (let i = 1; i < params.NUMBER_CURVES; i++) {
                const finalRightCurveRange = i % 2 !== 0 ? rightCurveRange : reverseRightCurveRange;
                const finalLeftCurveRange = i % 2 !== 0 ? leftCurveRange : reverseLeftCurveRange;

                const secondPtX = canvas.width * (i / params.NUMBER_CURVES) + canvas.width / (params.NUMBER_CURVES * 3);
                const secondPtY = endCurveRange - finalRightCurveRange + endCurveRange;
                const thirdPtX = canvas.width * (i / params.NUMBER_CURVES) + canvas.width * (2 / (params.NUMBER_CURVES * 3));
                const thirdPtY = endCurveRange - finalLeftCurveRange + endCurveRange;
                const lastPtX = canvas.width * ((i + 1) / params.NUMBER_CURVES);
                const lastPtY = i === params.NUMBER_CURVES - 1 ? rightRange : endCurveRange;
                
                ctx.bezierCurveTo(secondPtX, secondPtY, thirdPtX, thirdPtY, lastPtX, lastPtY);
            }

            ctx.lineTo(canvas.width, canvas.height);
            ctx.lineTo(0, canvas.height);
            ctx.lineTo(0, rightRange);
            ctx.closePath();
            ctx.fill();
        }

        speedInc += params.SPEED;
        requestAnimationFrame(render);
    };

    /*Height of the wave*/
    /*const waveHeight=document.querySelector('.wave-canvas');
    waveHeight.style.setProperty('--height', spentPercentage);*/

    window.addEventListener('resize', resize);
    resize();
    render();
}

initWaveAnimation('.spending-card');
// Navigation Listeners
document.getElementById('nav-brand')?.addEventListener('click', () => routeTo('home'));
navItems.home?.addEventListener('click', () => routeTo('home'));
navItems.rewards?.addEventListener('click', () => routeTo('rewards'));
navItems.discover?.addEventListener('click', () => routeTo('discover'));
navItems.me?.addEventListener('click', () => routeTo('me'));

document.getElementById('discover-widget')?.addEventListener('click', () => routeTo('discover'));
document.getElementById('rewards-widget')?.addEventListener('click', () => routeTo('rewards'));

// Demo Login
document.getElementById('btn-demo-login')?.addEventListener('click', () => {
  isDemo = true;
  userProfile.name = 'Demo User';
  userProfile.email = 'demo@projectorion.test';
  userProfile.balance = 1000;
  userProfile.saving_balance = 0;
  showOnboarding();
});

// Auth Switch Listeners
document.getElementById('go-register')?.addEventListener('click', showRegister);
document.getElementById('go-login')?.addEventListener('click', showLogin);

// Login Form
document.getElementById('login-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  const errorEl = document.getElementById('login-error');
  if (errorEl) errorEl.style.display = 'none';

  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      if (errorEl) {
        errorEl.textContent = error.message;
        errorEl.style.display = 'block';
      }
    } else if (data.session) {
      routeTo('home');
    }
  } catch (err) {
    if (errorEl) {
      errorEl.textContent = 'An unexpected error occurred. Please try again.';
      errorEl.style.display = 'block';
    }
  }
});

// Register Form
document.getElementById('register-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('register-name').value;
  const email = document.getElementById('register-email').value;
  const password = document.getElementById('register-password').value;
  const errorEl = document.getElementById('register-error');
  if (errorEl) errorEl.style.display = 'none';

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } }
    });

    if (error) {
      if (errorEl) {
        errorEl.textContent = error.message;
        errorEl.style.display = 'block';
      }
    } else {
      // Set userProfile.id immediately from signUp response so the onboarding
      // upsert has a valid user_id before onAuthStateChange fires asynchronously.
      if (data?.user) {
        userProfile.id = data.user.id;
        userProfile.email = data.user.email;
        userProfile.name = data.user.user_metadata?.name || name;
      }
      showOnboarding();
    }
  } catch (err) {
    if (errorEl) {
      errorEl.textContent = 'An unexpected error occurred. Please try again.';
      errorEl.style.display = 'block';
    }
  }
});

/*function setSpendingLimits(){

}

btn.addEventListerner("click", setSpendingLimits);*/
// Logout Listener
document.getElementById('btn-logout')?.addEventListener('click', async () => {
  isDemo = false;
  await supabase.auth.signOut();
  // onAuthStateChange SIGNED_OUT resets userProfile and calls showLogin()
});

// Financial Listeners
document.getElementById('add-money-form')?.addEventListener('submit', (e) => {
  e.preventDefault();
  const amount = parseFloat(document.getElementById('add-amount').value);
  const bank = document.getElementById('bank-select').value;
  addMoney(amount, bank);
});

document.getElementById('send-money-form')?.addEventListener('submit', (e) => {
  e.preventDefault();
  const email = document.getElementById('send-email').value;
  const amount = parseFloat(document.getElementById('send-amount').value);
  const category = document.getElementById('send-category').value;
  sendMoney(email, amount, category);
});

document.getElementById('save-money-form')?.addEventListener('submit', (e) => {
  e.preventDefault();
  const amount = parseFloat(document.getElementById('save-amount').value);
  saveMoney(amount);
});

document.getElementById('withdraw-money-form')?.addEventListener('submit', (e) => {
  e.preventDefault();
  const amount = parseFloat(document.getElementById('withdraw-amount').value);
  withdrawMoney(amount);
});

document.getElementById('btn-add-money')?.addEventListener('click', () => openModal('add'));
document.getElementById('btn-send-money')?.addEventListener('click', () => openModal('send'));
document.getElementById('btn-scan-qr')?.addEventListener('click', () => openModal('qr'));
document.getElementById('btn-save-in-detail')?.addEventListener('click', () => openModal('save'));
document.getElementById('btn-withdraw-detail')?.addEventListener('click', () => {
  const balanceEl = document.getElementById('withdraw-jar-balance');
  if (balanceEl) balanceEl.textContent = `Available: RM ${userProfile.saving_balance.toFixed(2)}`;
  const input = document.getElementById('withdraw-amount');
  if (input) {
    input.value = '';
    input.max = userProfile.saving_balance;
  }
  openModal('withdraw');
});
document.getElementById('btn-confirm-withdraw-yes')?.addEventListener('click', processWithdraw);

document.querySelectorAll('.close-modal').forEach(btn => {
  btn.addEventListener('click', closeModal);
});

document.getElementById('spending-card-nav')?.addEventListener('click', () => routeTo('discover'));
document.getElementById('saving-card-nav')?.addEventListener('click', () => {
  routeTo('discover');
  const percentage = (userProfile.saving_balance / userProfile.savings_goal) * 100;
  if (percentage < 100) {
    setTimeout(() => openModal('save'), 300);
  }
});

document.getElementById('balance-toggle-btn')?.addEventListener('click', () => {
  isBalanceHidden = !isBalanceHidden;
  updateBalanceUI();
});

document.getElementById('btn-open-goal-modal')?.addEventListener('click',() => {
  document.getElementById('input-savings-goal').value = userProfile.savings_goal;
  openModal('goal');
});

document.getElementById('edit-goal-form')?.addEventListener('submit', async(e) => {
  e.preventDefault();
  const newGoal = parseFloat(document.getElementById('input-savings-goal').value);

  if (newGoal > 0) {
    await updateSavingGoal(newGoal);
    closeModal();
  } else {
    alert('Please enter a valid goal amount.');
  }
});

document.getElementById('onboarding-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const ageVal = document.getElementById('onboarding-age').value;
  const salaryVal = parseInt(document.getElementById('onboarding-salary').value);

  // Financial Rule
  const savingsTarget = salaryVal * 0.20;
  
  userProfile.monthly_income = salaryVal;
  userProfile.savings_goal = savingsTarget;
  userProfile.category_budgets = {
    housing: salaryVal * 0.30,
    food: salaryVal * 0.20,
    transport: salaryVal * 0.15,
    others: salaryVal * 0.15
  };

  // Assign mock spent values based on today's total spent for UI demonstration
  const spent = userProfile.spent_today || 0;
  userProfile.category_spent = {
    housing: 0,
    food: spent * 0.5,
    transport: spent * 0.3,
    others: spent * 0.2
  };

  if (isDemo) {
    routeTo('home');
    return;
  }

  if (!userProfile.id) {
    alert('Session expired. Please log in again.');
    showLogin();
    return;
  }

  const { error } = await supabase.from('profiles').upsert({
    id: userProfile.id,
    name: userProfile.name,
    email: userProfile.email,
    balance: 0,
    saving_balance: 0,
    streak: 0,
    age_range: ageVal,
    monthly_income: salaryVal,
    savings_goal: savingsTarget
  });

  if (error) {
    alert('Could not save your profile. Please try again.\n\nError: ' + error.message);
    return;
  }

  routeTo('home');
});

document.getElementById('btn-update-financials')?.addEventListener('click', () => {
  document.getElementById('update-age').value = userProfile.age_range || '';
  document.getElementById('update-salary').value = userProfile.monthly_income || '';
  openModal('financials');
});

document.getElementById('update-financials-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const ageVal = document.getElementById('update-age').value;
  const salaryVal = parseInt(document.getElementById('update-salary').value);
  const savingsTarget = salaryVal * 0.20;

  userProfile.age_range = ageVal;
  userProfile.monthly_income = salaryVal;
  userProfile.savings_goal = savingsTarget;
  userProfile.category_budgets = {
    housing: salaryVal * 0.30,
    food: salaryVal * 0.20,
    transport: salaryVal * 0.15,
    others: salaryVal * 0.15
  };

  if (!isDemo && userProfile.id) {
    const { error } = await supabase.from('profiles').update({
      age_range: ageVal,
      monthly_income: salaryVal,
      savings_goal: savingsTarget
    }).eq('id', userProfile.id);

    if (error) {
      alert('Error updating profile: ' + error.message);
      return;
    }
  }

  updateDashboard();
  closeModal();
  alert('Your financial profile has been updated!');
});

renderApp();