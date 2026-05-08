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
const rank = document.getElementById('rank');
const total_users = document.getElementById('total_users');

const navItems = {
  home: document.getElementById('nav-home'),
  rewards: document.getElementById('nav-rewards'),
  discover: document.getElementById('nav-discover'),
  me: document.getElementById('nav-me'),
};

document.addEventListener('DOMContentLoaded', () => {
  setupCustomDropdown('onboarding-age-wrapper', 'onboarding-age');
  setupCustomDropdown('update-age-wrapper', 'update-age');
  setupCustomDropdown('send-category-wrapper', 'send-category');
  setupCustomDropdown('bank-select-wrapper', 'bank-select');
});

function setupCustomDropdown(wrapperId, inputId) {
  const wrapper = document.getElementById(wrapperId);
  if (!wrapper) return;

  const trigger = wrapper.querySelector('.custom-select-trigger');
  const options = wrapper.querySelectorAll('.custom-option');
  const hiddenInput = document.getElementById(inputId);

  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    document.querySelectorAll('.custom-select-wrapper').forEach(w => {
      if (w !== wrapper) w.classList.remove('open');
    });
    wrapper.classList.toggle('open');
  });

  options.forEach(option => {
    option.addEventListener('click', function() {
      options.forEach(opt => opt.classList.remove('selected'));
      this.classList.add('selected');
      trigger.textContent = this.textContent;
      hiddenInput.value = this.getAttribute('data-value');
      wrapper.classList.remove('open');
    });
  });

  window.addEventListener('click', (e) => {
    if (!wrapper.contains(e.target)) {
      wrapper.classList.remove('open');
    }
  });
}

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
  { tier: 1, color: '#cd7f32', bg: 'rgba(205,127,50,0.18)' },  // Bronze
  { tier: 2, color: '#a8a9ad', bg: 'rgba(168,169,173,0.18)' },  // Silver
  { tier: 3, color: '#ffd700', bg: 'rgba(255,215,0,0.15)' },  // Gold
  { tier: 4, color: '#4f9eff', bg: 'rgba(79,158,255,0.18)' },  // Sapphire
  { tier: 5, color: '#ff4d6d', bg: 'rgba(255,77,109,0.18)' },  // Ruby
  { tier: 6, color: '#50c878', bg: 'rgba(80,200,120,0.18)' },  // Emerald
  { tier: 7, color: '#c084fc', bg: 'rgba(192,132,252,0.18)' },  // Purple Crystal
  { tier: 8, color: '#f472b6', bg: 'rgba(244,114,182,0.18)' },  // Pink Crystal
  { tier: 9, color: '#94a3b8', bg: 'rgba(148,163,184,0.18)' },  // Gray Obsidian
  { tier: 10, color: '#e0f7ff', bg: 'rgba(224,247,255,0.22)' },  // Diamond
];

const BADGE_ASSETS = {

  b1: {
    color: "assets/badges/b1.svg",
    black: "assets/badges/black/b1.svg"
  },

  b2: {
    color: "assets/badges/b2.svg",
    black: "assets/badges/black/b2.svg"
  },

  b3: {
    color: "assets/badges/b3.svg",
    black: "assets/badges/black/b3.svg"
  },

  b4: {
    color: "assets/badges/b4.svg",
    black: "assets/badges/black/b4.svg"
  },

  b5: {
    color: "assets/badges/b5.svg",
    black: "assets/badges/black/b5.svg"
  },

  b6: {
    color: "assets/badges/b6.svg",
    black: "assets/badges/black/b6.svg"
  },

  b7: {
    color: "assets/badges/b7.svg",
    black: "assets/badges/black/b7.svg"
  },

  b8: {
    color: "assets/badges/b8.svg",
    black: "assets/badges/black/b8.svg"
  },

  b9: {
    color: "assets/badges/b9.svg",
    black: "assets/badges/black/b9.svg"
  },

  b10: {
    color: "assets/badges/b10.svg",
    black: "assets/badges/black/b10.svg"
  }

};

function getHighestUnlockedBadge() {
  const unlocked = BADGES.filter(b => userProfile.badges.includes(b.id));
  return unlocked.length > 0 ? unlocked[unlocked.length - 1] : BADGES[0];
}

//Show 3 badges: current tier badge in center, previous and next tier badges on sides (if they exist)
function renderBadgePreview() {
  const container = document.getElementById("badge-preview-row");
  if (!container) return;

  container.innerHTML = "";

  const currentTier = getHighestUnlockedBadge().tierRequired;

  const prevBadge = BADGES.find(b => b.tierRequired === currentTier - 1);
  const currBadge = BADGES.find(b => b.tierRequired === currentTier);
  const nextBadge = BADGES.find(b => b.tierRequired === currentTier + 1);

  const preview = [prevBadge, currBadge, nextBadge].filter(Boolean);

  preview.forEach(badge => {

    const unlocked = userProfile.badges.includes(badge.id);

    const asset = BADGE_ASSETS[badge.id];
    if (!asset) return;
    const img = unlocked ? asset.color : asset.black;

    container.innerHTML += `
    <div class="rw-badge-item">
      <img src="${img}" class="rw-badge-icon">
      <span class="rw-badge-label">${badge.name}</span>
    </div>
  `;
  });
}

function renderBadgesPopup() {

  const overlay = document.getElementById('badges-popup-overlay');
  const grid = document.getElementById('badges-popup-grid');

  if (!overlay || !grid) return;

  grid.innerHTML = '';

  BADGES.forEach((badge, index) => {

    const unlocked = userProfile.badges.includes(badge.id);

    const img = unlocked
      ? BADGE_ASSETS[badge.id].color
      : BADGE_ASSETS[badge.id].black;

    const isLastSingle = index === BADGES.length - 1;

    grid.innerHTML += `
      <div class="popup-badge-item ${isLastSingle ? 'last-single' : ''}">
        
        <img src="${img}" alt="${badge.name}">
        
        <span>${badge.name}</span>

      </div>
    `;
  });

  overlay.style.display = 'flex';
}

//Show all badges in rewards page
function renderAllBadges() {
  const container = document.getElementById("all-badges");
  if (!container) return;

  let html = "";

  BADGES.forEach(badge => {

    const unlocked = calculateTier(userProfile.xp) >= badge.tierRequired;

    const img = unlocked
      ? BADGE_ASSETS[badge.id].color
      : BADGE_ASSETS[badge.id].black;

    html += `
      <div class="rw-badge-item">
        <img src="${img}" class="rw-badge-icon">
        <span class="rw-badge-label">${badge.name}</span>
      </div>
    `;
  });

  container.innerHTML = html;
}


function renderWeeklyTrend() {
  const chartContainer = document.querySelector('.mini-bar-chart');
  if (!chartContainer || !userProfile.weekly_history) return;

  chartContainer.innerHTML = '';

  const maxSpend = Math.max(...userProfile.weekly_history.map(d => d.total), 10);

  chartContainer.innerHTML = userProfile.weekly_history.map(day => {
    const heightPct = day.total > 0 ? Math.max(5, (day.total / maxSpend) * 100) : 0;
    return `
            <div class="bar" 
                 style="height: ${heightPct}%;" 
                 title="${day.displayDate}: RM ${day.total.toFixed(2)}">
            </div>
        `;
  }).join('');
}

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



//Add XP
async function addXP(amount, reason = "") {
  const oldTier = userProfile.tier;

  userProfile.xp = Math.max(0, userProfile.xp + amount);
  const newTier = calculateTier(userProfile.xp);
  userProfile.tier = newTier;
  renderAllBadges();
  renderBadgePreview();

  let unlockedBadges = [];

  if (newTier > oldTier) {
    for (let t = oldTier + 1; t <= newTier; t++) {
      const badge = BADGES.find(b => b.tierRequired === t);
      if (badge) {
        unlockedBadges.push(badge);
      }
    }
  }

  if (isDemo) {
    return { xpAdded: amount, newTier, unlockedBadges };
  }

  try {
    // 1. Update Progress (trigger on user_progress syncs profiles.xp automatically)
    await supabase.from('user_progress').upsert({
      user_id: userProfile.id,
      xp: userProfile.xp,
      tier: newTier
    });

    // 2. Insert new badges
    for (const badge of unlockedBadges) {
      await supabase
        .from('user_badges')
        .upsert(
          {
            user_id: userProfile.id,
            badge_id: badge.id
          },
          { onConflict: ['user_id', 'badge_id'] }
        );
    }

    // 3. Log activity
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

// Streak ranks
async function rankCalc() {
  if (isDemo || !userProfile.id) return;
  try {
    const { data, error } = await supabase.rpc('get_xp_rank');
    if (error || !data || !data.success) return;

    const { total, beaten } = data;
    const pct = total > 1 ? Math.round((beaten / (total - 1)) * 100) : 100;
    const position = total - beaten;

    const rankEl = document.getElementById('rank');
    if (rankEl) rankEl.innerText = pct;
    const posEl = document.getElementById('rank_position');
    if (posEl) posEl.innerText = position;
    const totalEl = document.getElementById('total_users');
    if (totalEl) totalEl.innerText = total;
  } catch (err) {
    console.warn('[Orion] rankCalc error:', err);
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
  etf: document.getElementById('modal-discover-etf'),
  goal: document.getElementById('modal-edit-goal'),
  financials: document.getElementById('modal-update-financials'),
  limit: document.getElementById('modal-spending-limit'),
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
  weekly_history: 0,
  category_budgets: { food: 0, transport: 0, grocery: 0, others: 0 },
  category_spent: { food: 0, transport: 0, grocery: 0, others: 0 }
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
        category_budgets: { food: 0, transport: 0, grocery: 0, others: 0 },
        category_spent: { food: 0, transport: 0, grocery: 0, others: 0 }
      });
      if (!isDemo) showLogin();
    }
  });
}

async function checkDailyLoginBonus() {
  if (isDemo || !userProfile.id) return;
  try {
    const { data, error } = await supabase.rpc('daily_login_checkin');
    if (error || !data || !data.success) return;

    userProfile.streak = data.streak;

    if (data.is_new) {
      const oldTier = userProfile.tier;
      userProfile.xp = data.xp;
      userProfile.tier = calculateTier(userProfile.xp);

      const newBadges = BADGES.filter(b => b.tierRequired > oldTier && b.tierRequired <= userProfile.tier);
      for (const badge of newBadges) {
        await supabase.from('user_badges').upsert(
          { user_id: userProfile.id, badge_id: badge.id },
          { onConflict: ['user_id', 'badge_id'] }
        );
        if (!userProfile.badges.includes(badge.id)) userProfile.badges.push(badge.id);
      }
      if (newBadges.length > 0) {
        await supabase.from('user_progress').update({ tier: userProfile.tier }).eq('user_id', userProfile.id);
      }

      renderAllBadges();
      renderBadgePreview();
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
      await syncUserData();
      await checkDailyLoginBonus();
      routeTo('home');
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
      userProfile.monthly_income = Number(profile.monthly_income) || 0;
      userProfile.age_range = profile.age_range || '';
      const savedLimit = Number(profile.daily_spending_limit);

      if (savedLimit > 0) {
        userProfile.daily_spending_limit = savedLimit;
      } else if (userProfile.monthly_income > 0) {
        userProfile.daily_spending_limit = Math.max(0, (userProfile.monthly_income - userProfile.savings_goal) / 30);
      }

      const finalLimit = userProfile.daily_spending_limit;
      userProfile.category_budgets = {
        food: finalLimit * 0.35,
        transport: finalLimit * 0.20,
        grocery: finalLimit * 0.25,
        others: finalLimit * 0.20
      };
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
      renderAllBadges();
      renderBadgePreview();
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
      .select('amount, type, description')
      .eq('user_id', userProfile.id)
      .gte('created_at', today.toISOString());

    userProfile.spent_today = todayTxs?.filter(tx => tx.type === 'send').reduce((sum, tx) => sum + Number(tx.amount), 0) || 0;
    userProfile.saved_today = todayTxs?.filter(tx => tx.type === 'save').reduce((sum, tx) => sum + Number(tx.amount), 0) || 0;

    let dailySpentTotal = 0;
    let categorySpentDaily = { food: 0, transport: 0, grocery: 0, others: 0 };

    if (todayTxs) {
      todayTxs.forEach(tx => {
        if (tx.type === 'send') {
          const amt = Number(tx.amount) || 0;
          dailySpentTotal += amt;

          // Extract category from [bracket] tags in description
          const rawDesc = tx.description || '';
          const match = rawDesc.match(/^\[(.*?)\]/);
          const cat = match ? match[1].toLowerCase() : 'others';

          if (cat === 'food') {
            categorySpentDaily.food += amt;
          } else if (cat === 'transport') {
            categorySpentDaily.transport += amt;
          } else if (cat === 'grocery') {
            categorySpentDaily.grocery += amt;
          } else {
            categorySpentDaily.others += amt;
          }
        }
      });
    }

    userProfile.spent_today = dailySpentTotal;
    userProfile.category_spent = categorySpentDaily;

    // --- Fetch Weekly Spending Data ---
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const localDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      last7Days.push({
        date: localDate,
        total: 0,
        displayDate: d.toLocaleDateString([], { weekday: 'short' })
      });
    }

    const startOf7Days = new Date();
    startOf7Days.setDate(startOf7Days.getDate() - 6);
    startOf7Days.setHours(0, 0, 0, 0);

    const { data: weeklyTxs } = await supabase
      .from('transactions')
      .select('amount, created_at, type')
      .eq('user_id', userProfile.id)
      .eq('type', 'send')
      .gte('created_at', startOf7Days.toISOString());

    if (weeklyTxs) {
      weeklyTxs.forEach(tx => {
        // Parse transaction time to Local Date object, then to YYYY-MM-DD
        const txObj = new Date(tx.created_at);
        const txLocalDate = `${txObj.getFullYear()}-${String(txObj.getMonth() + 1).padStart(2, '0')}-${String(txObj.getDate()).padStart(2, '0')}`;

        const dayObj = last7Days.find(d => d.date === txLocalDate);
        if (dayObj) {
          dayObj.total += Number(tx.amount);
        }
      });
    }
    userProfile.weekly_history = last7Days;

    // 5. Fetch Transactions for Activity Log
    const { data: transactions } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userProfile.id)
      .order('created_at', { ascending: false })
      .limit(10);

    userProfile.transactions = transactions || [];
    renderTransactions(userProfile.transactions);

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

function updateDailySpendingsUI() {
  const salary = userProfile.monthly_income || 0;
  const savingsGoal = userProfile.savings_goal || (salary * 0.2);

  // Calculate total monthly spending allowance, then divide by 30 days
  const monthlyAllowance = salary - savingsGoal;
  const globalDailyLimit = userProfile.daily_spending_limit || ((userProfile.monthly_income - userProfile.savings_goal) / 30);

  // Calculate Ring Progress based on daily limit
  const spentPercentage = globalDailyLimit > 0
    ? Math.min(100, (userProfile.spent_today / globalDailyLimit) * 100)
    : 0;

  updateText('detail-spent-pct', `${Math.round(spentPercentage)}%`);

  setRingProgress('detail-spending-ring-fill', 82, spentPercentage);
  stopWaveAnimation();
  initWaveAnimation('.spending-card');


  const dailyCatLimits = {
    food: globalDailyLimit * 0.35,
    transport: globalDailyLimit * 0.20,
    grocery: globalDailyLimit * 0.25,
    others: globalDailyLimit * 0.20
  };

  const ringRadii = {
    food: 82,
    transport: 66,
    grocery: 50,
    others: 34
  };

  const cats = ['food', 'transport', 'grocery', 'others'];
  cats.forEach(cat => {
    const limit = dailyCatLimits[cat] || 0;
    const spent = userProfile.category_spent[cat] || 0;

    updateText(`cat-${cat}-left`, spent.toFixed(2));
    updateText(`cat-${cat}-total`, limit.toFixed(2));

    const catPct = limit > 0 ? Math.min(100, (spent / limit) * 100) : 0;
    setRingProgress(`ring-fill-${cat}`, ringRadii[cat], catPct);
  });
}

// Financial Logic & Spending Ring
async function updateDashboard() {
  await syncUserData();
  updateBalanceUI();
  updateSpendingRing();
  updateSavingJar();
  updateRewardsUI();
  updateDailySpendingsUI();
  renderWeeklyTrend();
  initActivityTabs();
  renderBadgePreview();
  renderAllBadges();
  fetchNotice();
  rankCalc()
}

function updateRewardsUI() {
  // Sync Rewards Page Stats
  updateText('rw-streak-val', `${userProfile.streak} Days`);
  updateText('rw-total-xp', `${userProfile.xp} XP`);

  const currentBadge = getHighestUnlockedBadge();

  const asset = BADGE_ASSETS[currentBadge.id];
  const badgeImg = document.getElementById('rw-current-badge-img');

  if (badgeImg && asset) {
    badgeImg.src = asset.color;
  }
  updateText('rw-badge-name', currentBadge.name);

  // Sync Home Page Rewards Widget
  updateText('home-streak-val', `${userProfile.streak} Days`);
  updateText('home-total-xp', `${userProfile.xp} XP`);
  updateText('home-badge-name', currentBadge.name);
  const homeBadgeImg = document.getElementById('home-badge-img');
  if (homeBadgeImg && asset) {
    homeBadgeImg.src = asset.color;
  }
  renderBadgePreview();
}

function updateBalanceUI() {
  const balanceText = document.getElementById('balance-amount-text');
  if (balanceText) {
    balanceText.textContent = isBalanceHidden ? 'RM ****' : `RM ${userProfile.balance.toFixed(2)}`;
  }
}

function updateSpendingRing() {
  const monthlyBudget = userProfile.monthly_income - userProfile.savings_goal;
  const dailyLimit = userProfile.daily_spending_limit || ((userProfile.monthly_income - userProfile.savings_goal) / 30);
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

  updateText('jar-pct', `${Math.round(percentage)}%`);
  updateText('detail-jar-pct', `${Math.round(percentage)}%`);

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

  const bankWrapper = document.getElementById('bank-select-wrapper');
  if (bankWrapper) {
    bankWrapper.querySelector('.custom-select-trigger').textContent = 'Select Bank';
    bankWrapper.querySelectorAll('.custom-option').forEach(opt => opt.classList.remove('selected'));
  }
  document.getElementById('bank-select').value = '';

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

  const categoryWrapper = document.getElementById('send-category-wrapper');
if (categoryWrapper) {
  categoryWrapper.querySelector('.custom-select-trigger').textContent = 'Select Category';
  categoryWrapper.querySelectorAll('.custom-option').forEach(opt => opt.classList.remove('selected'));
}
document.getElementById('send-category').value = '';

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
    .update({ savings_goal: newGoal })
    .eq('id', userProfile.id);

  if (!error) {
    userProfile.savings_goal = newGoal;
    updateDashboard();
    alert('Goal updated successfully!');
  } else {
    console.error('Error updating goal:', error.message)
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
  } else {
    stopWaveAnimation();
    if (page === 'rewards') {
      pageRewards.style.display = 'block';
    } else if (page === 'discover') {
      pageDiscover.style.display = 'block';
      updateDashboard();
    } else if (page === 'me') {
      pageMe.style.display = 'block';
      updateProfile();
    }
  }
}

async function updateProfile() {
  const nameEl = document.querySelector('.profile-name');
  const emailEl = document.querySelector('.profile-email');

  if (nameEl) nameEl.textContent = userProfile.name;
  if (emailEl) emailEl.textContent = userProfile.email;

  const currentBadge = getHighestUnlockedBadge();
  const badgeImg = document.getElementById('profile-badge-img');
  const badgeName = document.getElementById('profile-badge-name');

  const asset = BADGE_ASSETS[currentBadge.id];
  if (badgeImg && asset) {
    badgeImg.src = asset.color;
  }
  if (badgeName) badgeName.textContent = currentBadge.name;

  const theme = BADGE_THEMES.find(t => t.tier === currentBadge.tierRequired) || BADGE_THEMES[0];
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

let _waveAnimId = null;

function stopWaveAnimation() {
  if (_waveAnimId !== null) {
    cancelAnimationFrame(_waveAnimId);
    _waveAnimId = null;
  }
}

function initWaveAnimation(selector) {
  if (_waveAnimId !== null) return;

  const container = document.querySelector(selector);
  if (!container) return;

  let canvas = container.querySelector('canvas');
  if (!canvas) {
    canvas = document.createElement('canvas');
    container.appendChild(canvas);
  }
  canvas.width = container.clientWidth;
  canvas.height = container.clientHeight;
  const ctx = canvas.getContext('2d');

  const monthlyBudget = userProfile.monthly_income - userProfile.savings_goal;
  const dailyLimit = monthlyBudget / 30;
  const remainingToday = dailyLimit - userProfile.spent_today;
  const spentPercentage = Math.min(100, (userProfile.spent_today / dailyLimit) * 100);
  if (spentPercentage > 100) {
    spentPercentage = 100;
  }
  else if (spentPercentage < 0) {
    spentPercentage = 0;
  }
  var verticalBaseline = canvas.height * (spentPercentage / 100);


  console.log("monthly income:" + userProfile.monthly_income);
  console.log("saving goals:" + userProfile.savings_goal);
  console.log("monthlyBudget:" + monthlyBudget);
  console.log("dailyLimit" + dailyLimit);
  console.log("spent_today" + userProfile.spent_today);

  console.log('remainingToday' + ((userProfile.spent_today / dailyLimit) * 100));
  console.log('canvas height:' + canvas.height);
  console.log('verticalBaseline' + verticalBaseline);
  let color = "#ffffff";


  if (spentPercentage >= 67 && spentPercentage <= 100) {
    color = '#ff9292'
  }
  else if (spentPercentage >= 33 && spentPercentage <= 66) {
    color = '#fdf111'
  }
  else {
    color = '#43f6ff'
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
    _waveAnimId = requestAnimationFrame(render);
  };

  /*Height of the wave*/
  /*const waveHeight=document.querySelector('.wave-canvas');
  waveHeight.style.setProperty('--height', spentPercentage);*/

  window.addEventListener('resize', resize);
  resize();
  _waveAnimId = requestAnimationFrame(render);
}

// Navigation Listeners
document.getElementById('nav-brand')?.addEventListener('click', () => routeTo('home'));
navItems.home?.addEventListener('click', () => routeTo('home'));
navItems.rewards?.addEventListener('click', () => routeTo('rewards'));
navItems.discover?.addEventListener('click', () => routeTo('discover'));
navItems.me?.addEventListener('click', () => routeTo('me'));

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

document.getElementById('btn-view-all-badges')
  ?.addEventListener('click', (e) => {
    e.preventDefault();
    renderBadgesPopup();
  });

document.getElementById('close-badges-popup')
  ?.addEventListener('click', () => {
    document.getElementById('badges-popup-overlay').style.display = 'none';
  });

document.getElementById('badges-popup-overlay')
  ?.addEventListener('click', (e) => {

    if (e.target.id === 'badges-popup-overlay') {
      document.getElementById('badges-popup-overlay').style.display = 'none';
    }
  });


document.getElementById('btn-add-money')?.addEventListener('click', () => openModal('add'));
document.getElementById('btn-send-money')?.addEventListener('click', () => openModal('send'));
document.getElementById('btn-scan-qr')?.addEventListener('click', () => openModal('qr'));
document.getElementById('btn-discover-etf')?.addEventListener('click', () => openModal('etf'));
document.getElementById('btn-discover-savings')?.addEventListener('click', () => routeTo('discover'));
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

document.getElementById('btn-open-goal-modal')?.addEventListener('click', () => {
  document.getElementById('input-savings-goal').value = userProfile.savings_goal;
  openModal('goal');
});

document.getElementById('edit-goal-form')?.addEventListener('submit', async (e) => {
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

  // Error handling for 0 or negative numbers
  if (isNaN(salaryVal) || salaryVal <= 0) {
    alert('Please enter a valid monthly salary greater than RM 0.');
    return;
  }

  // Financial Rule
  const savingsTarget = salaryVal * 0.20;
  const dailyLimit = Math.max(0, (salaryVal - savingsTarget) / 30);

  userProfile.monthly_income = salaryVal;
  userProfile.savings_goal = savingsTarget;
  userProfile.category_budgets = {
    food: dailyLimit * 0.35,
    transport: dailyLimit * 0.20,
    grocery: dailyLimit * 0.25,
    others: dailyLimit * 0.20
  };

  const spent = userProfile.spent_today || 0;
  userProfile.category_spent = {
    food: spent * 0.5,
    transport: spent * 0.3,
    grocery: 0,
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
    savings_goal: savingsTarget,
    daily_spending_limit: dailyLimit
  });

  if (error) {
    alert('Could not save your profile. Please try again.\n\nError: ' + error.message);
    return;
  }

  routeTo('home');
});

document.getElementById('btn-update-financials')?.addEventListener('click', () => {
  const currentAge = userProfile.age_range || '';
  
  // 1. Set the values for the hidden input and salary field
  const ageInput = document.getElementById('update-age');
  if (ageInput) ageInput.value = currentAge;
  
  const salaryInput = document.getElementById('update-salary');
  if (salaryInput) salaryInput.value = userProfile.monthly_income || '';

  // 2. Visually update the custom dropdown trigger text
  const wrapper = document.getElementById('update-age-wrapper');
  if (wrapper) {
    const trigger = wrapper.querySelector('.custom-select-trigger');
    const options = wrapper.querySelectorAll('.custom-option');
    
    // Find the option that matches the saved data
    const selectedOption = wrapper.querySelector(`.custom-option[data-value="${currentAge}"]`);
    
    if (currentAge && selectedOption) {
      trigger.textContent = selectedOption.textContent;
      options.forEach(opt => opt.classList.remove('selected'));
      selectedOption.classList.add('selected');
    } else {
      trigger.textContent = 'Select Age Range';
      options.forEach(opt => opt.classList.remove('selected'));
    }
  }

  openModal('financials');
});

document.getElementById('update-financials-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const ageVal = document.getElementById('update-age').value;
  const salaryVal = parseInt(document.getElementById('update-salary').value);
  if (isNaN(salaryVal) || salaryVal <= 0) {
    alert('Please enter a valid monthly salary greater than RM 0.');
    return;
  }
  const savingsTarget = salaryVal * 0.20;
  const newDefaultDailyLimit = Math.max(0, (salaryVal - savingsTarget) / 30);

  userProfile.age_range = ageVal;
  userProfile.monthly_income = salaryVal;
  userProfile.savings_goal = savingsTarget;
  userProfile.daily_spending_limit = newDefaultDailyLimit;
  userProfile.category_budgets = {
    food: newDefaultDailyLimit * 0.35,
    transport: newDefaultDailyLimit * 0.20,
    grocery: newDefaultDailyLimit * 0.25,
    others: newDefaultDailyLimit * 0.20
  };

  if (!isDemo && userProfile.id) {
    const { error } = await supabase.from('profiles').update({
      age_range: ageVal,
      monthly_income: salaryVal,
      savings_goal: savingsTarget,
      daily_spending_limit: newDefaultDailyLimit
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

document.querySelector('.list-row--clickable[id="btn-spending-limit-trigger"]')?.addEventListener('click', () => {
  const currentLimit = userProfile.daily_spending_limit || ((userProfile.monthly_income - userProfile.savings_goal) / 30);

  const inputEl = document.getElementById('input-daily-limit');
  if (inputEl) {
    inputEl.value = currentLimit > 0 ? currentLimit.toFixed(2) : "";
  }

  openModal('limit');
});

document.getElementById('spending-limit-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const newLimit = parseFloat(document.getElementById('input-daily-limit').value);

  if (isNaN(newLimit) || newLimit <= 0) {
    alert('Please enter a valid amount greater than zero.');
    return;
  }

  userProfile.daily_spending_limit = newLimit;

  userProfile.category_budgets = {
    food: newLimit * 0.35,
    transport: newLimit * 0.20,
    grocery: newLimit * 0.25,
    others: newLimit * 0.20
  };

  if (!isDemo && userProfile.id) {
    const { error } = await supabase
      .from('profiles')
      .update({ daily_spending_limit: newLimit })
      .eq('id', userProfile.id);

    if (error) {
      alert('Error updating limit: ' + error.message);
      return;
    }
  }

  updateDashboard();
  closeModal();
  alert('Daily spending limit updated to RM ' + newLimit.toFixed(2));
});

document.addEventListener('visibilitychange', () => {
  if (!document.hidden && userProfile.id && !isDemo) {
    updateDashboard();
  }
});

// ─── AI Chat ─────────────────────────────────────────────────────────────────

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || '';

async function fetchNotice() {
  if (!BACKEND_URL || !userProfile.id) return;

  const star = document.getElementById('notice-bar-star');
  if (star) star.classList.add('loading');

  const recentTx = (userProfile.transactions || []).slice(0, 5)
    .filter(t => ['send', 'save', 'withdraw', 'add'].includes(t.type))
    .map(t => {
      const desc = t.description ? ` (${t.description})` : '';
      return `${t.type} RM ${parseFloat(t.amount).toFixed(2)}${desc}`;
    })
    .join('; ');

  const cs = userProfile.category_spent || {};
  const categoryDetail = Object.entries(cs)
    .filter(([, v]) => v > 0)
    .map(([k, v]) => `${k} RM ${v.toFixed(2)}`)
    .join(', ');

  const parts = [];
  if (recentTx) parts.push(`Recent: ${recentTx}`);
  if (categoryDetail) parts.push(`Spent today by category: ${categoryDetail}`);
  if (userProfile.saved_today > 0) parts.push(`Saved today: RM ${userProfile.saved_today.toFixed(2)}`);
  if (userProfile.streak > 0) parts.push(`Saving streak: ${userProfile.streak} days`);
  const activity = parts.join('. ') || 'no recent activity';

  const totalSpentToday = Object.values(cs).reduce((a, b) => a + b, 0);

  try {
    const res = await fetch(`${BACKEND_URL}/notice`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recent_activity: activity,
        daily_limit: userProfile.daily_spending_limit || 0,
        total_spent_today: totalSpentToday,
        balance: userProfile.balance || 0,
        saving_balance: userProfile.saving_balance || 0,
        streak: userProfile.streak || 0,
        username: userProfile.name || userProfile.username || '',
      }),
    });
    if (!res.ok) {
      console.warn('[Orion AI] notice fetch failed:', res.status, await res.text());
      return;
    }
    const data = await res.json();
    if (data.notice) updateText('notice-bar-text', data.notice);
  } catch (err) {
    console.warn('[Orion AI] notice error:', err);
  } finally {
    if (star) star.classList.remove('loading');
  }
}

let _chatContext = '';

function buildChatContext() {
  const spent = Object.values(userProfile.category_spent || {}).reduce((a, b) => a + b, 0);
  return (
    `Balance: RM ${(userProfile.balance || 0).toFixed(2)}, ` +
    `Savings jar: RM ${(userProfile.saving_balance || 0).toFixed(2)}, ` +
    `Daily limit: RM ${(userProfile.daily_spending_limit || 0).toFixed(2)}, ` +
    `Spent today: RM ${spent.toFixed(2)}, ` +
    `Streak: ${userProfile.streak || 0} days, ` +
    `XP: ${userProfile.xp || 0}`
  );
}

const _chatHistory = [];

let _chatGreeted = false;

function openChat() {
  const overlay = document.getElementById('ai-chat-overlay');
  if (overlay) {
    overlay.style.display = 'flex';
    _chatContext = buildChatContext();
    if (!_chatGreeted) {
      appendChatMessage('ai', 'Owh Hello, you finally opened me liao! Ask me everything about your spending lah!');
      _chatGreeted = true;
    }
    document.getElementById('ai-chat-input')?.focus();
  }
}

function closeChat() {
  const overlay = document.getElementById('ai-chat-overlay');
  if (overlay) overlay.style.display = 'none';
}

function appendChatMessage(role, text) {
  const container = document.getElementById('ai-chat-messages');
  if (!container) return;
  const div = document.createElement('div');
  div.className = `ai-chat-bubble ${role}`;
  div.textContent = text;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}

async function sendChatMessage() {
  const input = document.getElementById('ai-chat-input');
  if (!input) return;
  const text = input.value.trim();
  if (!text) return;
  input.value = '';

  appendChatMessage('user', text);
  _chatHistory.push({ role: 'user', content: text });

  const sendBtn = document.getElementById('ai-chat-send');
  if (sendBtn) sendBtn.disabled = true;

  if (!BACKEND_URL) {
    appendChatMessage('ai', 'Aiyah, backend not connected lah. Add VITE_BACKEND_URL first!');
    if (sendBtn) sendBtn.disabled = false;
    return;
  }

  const container = document.getElementById('ai-chat-messages');
  const typingBubble = document.createElement('div');
  typingBubble.className = 'ai-chat-typing';
  typingBubble.innerHTML = '<span>✦</span>';
  if (container) {
    container.appendChild(typingBubble);
    container.scrollTop = container.scrollHeight;
  }

  try {
    const res = await fetch(`${BACKEND_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: _chatHistory, context: _chatContext }),
    });
    if (!res.ok) {
      const errText = await res.text();
      console.warn('[Orion AI] chat error:', res.status, errText);
      appendChatMessage('ai', 'Owh Halo, you finally opened me! Ask me anything about your spending lah!');
    } else {
      const data = await res.json();
      const reply = data.reply || 'Hmm, cannot think right now. Try again lah!';
      appendChatMessage('ai', reply);
      _chatHistory.push({ role: 'assistant', content: reply });
    }
  } catch (err) {
    console.warn('[Orion AI] chat fetch error:', err);
    appendChatMessage('ai', 'Cannot reach the server lah! Make sure backend is running.');
  } finally {
    typingBubble.remove();
    if (sendBtn) sendBtn.disabled = false;
  }
}

document.getElementById('notice-bar')?.addEventListener('click', openChat);
document.getElementById('ai-chat-close')?.addEventListener('click', closeChat);
document.getElementById('ai-chat-send')?.addEventListener('click', sendChatMessage);
document.getElementById('ai-chat-input')?.addEventListener('keydown', e => {
  if (e.key === 'Enter') sendChatMessage();
});
document.getElementById('ai-chat-overlay')?.addEventListener('click', e => {
  if (e.target === e.currentTarget) closeChat();
});

function initCustomSelects() {
  const proto = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value');

  document.querySelectorAll('select.auth-input').forEach(sel => {
    if (sel.dataset.customInit) return;
    sel.dataset.customInit = '1';

    const wrapper = document.createElement('div');
    wrapper.className = 'custom-select-wrapper';
    sel.parentNode.insertBefore(wrapper, sel);
    wrapper.appendChild(sel);
    sel.style.cssText = 'position:absolute;opacity:0;pointer-events:none;width:0;height:0;';

    const trigger = document.createElement('div');
    trigger.className = 'custom-select-trigger';
    trigger.setAttribute('tabindex', '0');
    wrapper.appendChild(trigger);

    const panel = document.createElement('div');
    panel.className = 'custom-select-options';
    panel.addEventListener('click', e => e.stopPropagation());
    wrapper.appendChild(panel);

    function syncDisplay() {
      const idx = sel.selectedIndex;
      const opt = idx >= 0 ? sel.options[idx] : null;
      const isPlaceholder = !opt || !opt.value;
      const text = isPlaceholder
        ? (sel.querySelector('option[disabled]')?.textContent.trim() || 'Select...')
        : opt.textContent.trim();
      trigger.innerHTML = `<span class="custom-select-value${isPlaceholder ? ' placeholder' : ''}">${text}</span><span class="custom-select-arrow"></span>`;
    }

    function buildOptionsList() {
      panel.innerHTML = '';
      Array.from(sel.options).forEach(opt => {
        if (opt.disabled) return;
        const item = document.createElement('div');
        item.className = 'custom-select-option' + (opt.value === sel.value ? ' selected' : '');
        item.textContent = opt.textContent.trim();
        item.addEventListener('click', () => {
          sel.value = opt.value;
          sel.dispatchEvent(new Event('change', { bubbles: true }));
          wrapper.classList.remove('open');
        });
        panel.appendChild(item);
      });
    }

    syncDisplay();
    buildOptionsList();

    trigger.addEventListener('click', e => {
      e.stopPropagation();
      const isOpen = wrapper.classList.contains('open');
      document.querySelectorAll('.custom-select-wrapper.open').forEach(w => w.classList.remove('open'));
      if (!isOpen) {
        buildOptionsList();
        wrapper.classList.add('open');
      }
    });

    trigger.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); trigger.click(); }
      if (e.key === 'Escape') wrapper.classList.remove('open');
    });

    Object.defineProperty(sel, 'value', {
      get() { return proto.get.call(this); },
      set(v) {
        proto.set.call(this, v);
        syncDisplay();
        buildOptionsList();
      },
      configurable: true
    });
  });

  document.addEventListener('click', () => {
    document.querySelectorAll('.custom-select-wrapper.open').forEach(w => w.classList.remove('open'));
  });
}

initCustomSelects();

const minDelay = new Promise(resolve => setTimeout(resolve, 1500));
Promise.all([renderApp(), minDelay]).then(() => {
  const screen = document.getElementById('loading-screen');
  screen.classList.add('fade-out');
  screen.addEventListener('transitionend', () => screen.remove(), { once: true });
});