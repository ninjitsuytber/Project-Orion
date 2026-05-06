import { supabase } from './supabase.js';

// DOM Elements
const loginView = document.getElementById('login-view');
const registerView = document.getElementById('register-view');
const mainView = document.getElementById('main-view');

const pageHome = document.getElementById('page-home');
const pageRewards = document.getElementById('page-rewards');
const pageDiscover = document.getElementById('page-discover');
const pageMe = document.getElementById('page-me');

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
  { id: "b1", name: "No Money No Talk", tierRequired: 1, img: "assets/badges/b1.png" },
  { id: "b2", name: "Coin Sniffer", tierRequired: 2, img: "assets/badges/b2.png" },
  { id: "b3", name: "One Ringgit Millionaire", tierRequired: 3, img: "assets/badges/b3.png" },
  { id: "b4", name: "Sikit-Sikit Jadi Bukit", tierRequired: 4, img: "assets/badges/b4.png" },
  { id: "b5", name: "Wallet Protector", tierRequired: 5, img: "assets/badges/b5.png" },
  { id: "b6", name: "Bajet Survivalist", tierRequired: 6, img: "assets/badges/b6.png" },
  { id: "b7", name: "Cha Ching Apprentice", tierRequired: 7, img: "assets/badges/b7.png" },
  { id: "b8", name: "Tabung Boss", tierRequired: 8, img: "assets/badges/b8.png" },
  { id: "b9", name: "Lowkey Kaya", tierRequired: 9, img: "assets/badges/b9.png" },
  { id: "b10", name: "Sultan Simpanan", tierRequired: 10, img: "assets/badges/b10.png" }
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

  //Add xp and find new tier
  userProfile.xp += amount;
  const newTier = calculateTier(userProfile.xp);
  userProfile.tier = newTier;

  //Badge update
  let unlockedBadges = [];

  if (newTier > oldTier) {
    for (let t = oldTier + 1; t <= newTier; t++) {
      const badge = BADGES.find(b => Number(b.tierRequired) === Number(t));

      if (badge && !userProfile.badges.includes(badge.id)) {
        userProfile.badges.push(badge.id);
        unlockedBadges.push(badge);
      }
    }
  }

  //Demo
  if (isDemo) {
    return { xpAdded: amount, newTier, unlockedBadges };
  }

  //Supabase Sync
  try {
    const { data } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userProfile.id)
      .maybeSingle();

    const xp = (data?.xp || 0) + amount;
    const dbOldTier = data?.tier || 1;
    const dbNewTier = calculateTier(xp);

    await supabase.from('user_progress').upsert({
      user_id: userProfile.id,
      xp,
      tier: dbNewTier
    });

    // Insert new badges into DB 
    if (dbNewTier > dbOldTier) {
      for (const badge of unlockedBadges) {
        await supabase.from('user_badges').insert({
          user_id: userProfile.id,
          badge_id: badge.id
        });
      }
    }

  } catch (err) {
    console.error("addXP sync error:", err);
  }

  // Save XP, tier
  await supabase.from('user_progress').upsert({
    user_id: userProfile.id,
    xp: userProfile.xp,
    tier: newTier
  });

  userProfile.xp = userProfile.xp;
  userProfile.tier = newTier;

  // Badge unlock
  if (newTier > oldTier) {
    for (let t = oldTier + 1; t <= newTier; t++) {
      const badge = BADGES.find(b => b.tierRequired === t);

      if (badge) {
        await supabase.from('user_badges').insert({
          user_id: userProfile.id,
          badge_id: badge.id
        });

        if (!unlockedBadges.find(ub => ub.id === badge.id)) {
          unlockedBadges.push(badge);
        }
      }
    }
  }

  return { xpAdded: amount, newTier, unlockedBadges };
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
  badges: [],
  monthly_income: 1000,
  savings_goal: 300,
};

async function renderApp() {
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    userProfile.id = session.user.id;
    userProfile.email = session.user.email;
    userProfile.name = session.user.user_metadata.name || 'User';
    routeTo('home');
  } else if (!isDemo) {
    showLogin();
  }

  supabase.auth.onAuthStateChange(async (_event, session) => {
    if (session) {
      userProfile.id = session.user.id;
      userProfile.email = session.user.email;
      userProfile.name = session.user.user_metadata.name || 'User';
      routeTo('home');
    } else if (!isDemo) {
      showLogin();
    }
  });
}

// Data Syncing
async function syncUserData() {
  if (isDemo) return;
  if (!userProfile.id) return;

  try {
    // 1. Fetch Profile (Balance)
    let { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userProfile.id)
      .single();

    if (profile) {
      userProfile.balance = Number(profile.balance) || 0;
      userProfile.saving_balance = Number(profile.saving_balance) || 0;
      userProfile.streak = Number(profile.streak) || 0;
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

    // 2. Fetch Today's Spendings & Savings
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const { data: todayTxs } = await supabase
      .from('transactions')
      .select('amount, type')
      .eq('user_id', userProfile.id)
      .gte('created_at', today.toISOString());

    userProfile.spent_today = todayTxs?.filter(tx => tx.type === 'send').reduce((sum, tx) => sum + Number(tx.amount), 0) || 0;
    userProfile.saved_today = todayTxs?.filter(tx => tx.type === 'save').reduce((sum, tx) => sum + Number(tx.amount), 0) || 0;

    // 3. Fetch Transactions for Activity Log
    const { data: transactions } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userProfile.id)
      .order('created_at', { ascending: false })
      .limit(10);

    renderTransactions(transactions || []);

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
    const isPositive = tx.type === 'add' || tx.type === 'receive';
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

// Financial Logic & Spending Ring
async function updateDashboard() {
  await syncUserData();
  updateBalanceUI();
  updateSpendingRing();
  updateSavingJar();
  updateRewardsUI();
  initActivityTabs();
}

function updateRewardsUI() {
  const streakEl = document.querySelector('.rw-stat-value');
  if (streakEl && !isDemo) {
    streakEl.textContent = `${userProfile.streak} Days`;
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
    updateDashboard();
    closeModal();
    return;
  }

  const { error: profileError } = await supabase
    .from('profiles')
    .update({ balance: userProfile.balance + amount })
    .eq('id', userProfile.id);

  if (!profileError) {
    await supabase.from('transactions').insert([{
      user_id: userProfile.id,
      type: 'add',
      amount: amount,
      description: `Reload via ${bank}`
    }]);
    updateDashboard();
    closeModal();
  }
}

async function sendMoney(email, amount) {
  if (isNaN(amount) || amount <= 0) {
    showError('send-money-error', 'Please enter a valid amount greater than zero');
    return;
  }
  if (amount > userProfile.balance) {
    showError('send-money-error', 'Insufficient balance');
    return;
  }

  if (isDemo) {
    userProfile.balance -= amount;
    updateDashboard();
    closeModal();
    return;
  }

  // 1. Find recipient
  const { data: recipient, error: findError } = await supabase
    .from('profiles')
    .select('id, balance')
    .eq('email', email)
    .single();

  if (!recipient) {
    showError('send-money-error', 'User not found');
    return;
  }

  // 2. Perform Transfer
  await supabase.from('profiles').update({ balance: userProfile.balance - amount }).eq('id', userProfile.id);
  await supabase.from('profiles').update({ balance: recipient.balance + amount }).eq('id', recipient.id);

  // 3. Log Transactions
  await supabase.from('transactions').insert([
    { user_id: userProfile.id, type: 'send', amount, description: `Sent to ${email}` },
    { user_id: recipient.id, type: 'receive', amount, description: `Received from ${userProfile.email}` }
  ]);

  updateDashboard();
  closeModal();
}

async function saveMoney(amount) {
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
    updateDashboard();
    closeModal();
    return;
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      balance: userProfile.balance - amount,
      saving_balance: userProfile.saving_balance + amount
    })
    .eq('id', userProfile.id);

  if (!error) {
    await supabase.from('transactions').insert([{
      user_id: userProfile.id,
      type: 'save',
      amount,
      description: 'Saved to Money Jar'
    }]);
    // Log App Activity (XP)
    await supabase.from('app_activities').insert([{
      user_id: userProfile.id,
      activity_name: 'Saving Goal Progress',
      xp_earned: 50
    }]);

    updateDashboard();
    closeModal();
  }
}

function withdrawMoney(amount) {
  if (isNaN(amount) || amount <= 0) {
    showError('withdraw-money-error', 'Please enter a valid amount greater than zero');
    return;
  }
  if (amount > userProfile.saving_balance) {
    showError('withdraw-money-error', 'Insufficient jar balance');
    return;
  }

  const errorEl = document.getElementById('withdraw-money-error');
  if (errorEl) errorEl.style.display = 'none';

  pendingWithdrawAmount = amount;
  document.getElementById('confirm-withdraw-text').textContent = `Are you sure you want to withdraw RM ${amount.toFixed(2)} from your jar?`;

  openModal('confirmWithdraw');
}

// const confirmWithdraw = confirm(`Are you sure you want to withdraw RM ${amount.toFixed(2)} from your jar?`);
// if (!confirmWithdraw) return;

async function processWithdraw() {
  const amount = pendingWithdrawAmount;
  if (amount <= 0) return;

  // Streak logic: If withdraw amount >= total saved today, streak is lost
  let newStreak = userProfile.streak;
  if (userProfile.saved_today > 0 && amount >= userProfile.saved_today) {
    newStreak = 0;
    alert('Withdrawal amount exceeds today\'s savings. Your streak has been reset.');
  }

  if (isDemo) {
    userProfile.balance += amount;
    userProfile.saving_balance -= amount;
    userProfile.streak = newStreak;
    updateDashboard();
    closeModal();
    return;
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      balance: userProfile.balance + amount,
      saving_balance: userProfile.saving_balance - amount,
      streak: newStreak
    })
    .eq('id', userProfile.id);

  if (!error) {
    await supabase.from('transactions').insert([{
      user_id: userProfile.id,
      type: 'withdraw',
      amount,
      description: 'Withdrawn from Money Jar'
    }]);

    updateDashboard();
    closeModal();
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
  routeTo('home');
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
    const { error } = await supabase.auth.signUp({
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
      showLogin();
    }
  } catch (err) {
    if (errorEl) {
      errorEl.textContent = 'An unexpected error occurred. Please try again.';
      errorEl.style.display = 'block';
    }
  }
});

// Logout Listener
document.getElementById('btn-logout')?.addEventListener('click', async () => {
  isDemo = false;
  await supabase.auth.signOut();
  showLogin();
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
  sendMoney(email, amount);
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
document.getElementById('btn-withdraw-detail')?.addEventListener('click', () => openModal('withdraw'));
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

renderApp();