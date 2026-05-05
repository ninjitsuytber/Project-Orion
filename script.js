import { supabase } from './supabase.js';

const API_URL = 'http://localhost:3000/api';

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

let isDemo = false;

async function renderApp() {
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    routeTo('home');
  } else if (!isDemo) {
    showLogin();
  }

  supabase.auth.onAuthStateChange(async (_event, session) => {
    if (!session && !isDemo) {
      showLogin();
    }
  });
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

window.routeTo = (page) => {
  routeTo(page);
};

// Financial Logic & Spending Ring
function updateDashboard() {
  updateSpendingRing();
  updateSavingJar();
  initActivityTabs();
}

function initActivityTabs() {
  const tabs = document.querySelectorAll('.activity-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.getAttribute('data-tab');
      
      // Update Tab UI
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      // Update Content UI
      document.querySelectorAll('.activity-content').forEach(content => {
        content.classList.remove('active');
      });
      document.getElementById(`tab-${target}`).classList.add('active');
    });
  });
}

function updateSpendingRing() {
  // Demo Data based on user example: RM 1000 income, RM 300 savings
  const monthlyIncome = 1000;
  const savingsGoal = 300;
  const spentToday = 15.00; // Example spending RM 15 today

  const monthlyBudget = monthlyIncome - savingsGoal;
  const dailyLimit = monthlyBudget / 30;
  const remainingToday = Math.max(0, dailyLimit - spentToday);
  const spentPercentage = Math.min(100, (spentToday / dailyLimit) * 100);

  // Update Main Dashboard UI
  updateText('daily-limit-text', `Limit: RM ${dailyLimit.toFixed(2)}`);
  updateText('spent-today-text', `RM ${spentToday.toFixed(2)}`);
  updateText('remaining-today-text', `RM ${remainingToday.toFixed(2)}`);
  updateText('spent-pct', `${Math.round(spentPercentage)}%`);

  // Update Detail Page UI
  updateText('detail-spent-pct', `${Math.round(spentPercentage)}%`);

  // Update Rings
  setRingProgress('spending-ring-fill', 54, spentPercentage);
  setRingProgress('detail-spending-ring-fill', 82, spentPercentage);
}

function updateSavingJar() {
  const targetGoal = 300;
  const savedAmount = 45.00; 
  const percentage = (savedAmount / targetGoal) * 100;
  
  let stage = 1;
  if (percentage === 0) stage = 1;
  else if (percentage > 0 && percentage < 100) {
    stage = Math.floor(percentage / 16.6) + 2;
    if (stage > 7) stage = 7;
  } else if (percentage >= 100 && percentage < 125) stage = 8;
  else if (percentage >= 125 && percentage < 150) stage = 9;
  else if (percentage >= 150) stage = 10;

  const jarSrc = `assets/jar/${stage}.svg`;

  // Update Main Dashboard
  const jarImg = document.getElementById('saving-jar-img');
  if (jarImg) jarImg.src = jarSrc;
  updateText('jar-pct', `${Math.round(percentage)}%`);
  updateText('jar-saved-amount', `RM ${savedAmount.toFixed(2)}`);

  // Update Detail Page
  const detailJarImg = document.getElementById('detail-saving-jar-img');
  if (detailJarImg) detailJarImg.src = jarSrc;
  updateText('detail-jar-pct', `${Math.round(percentage)}%`);
  updateText('detail-jar-saved-amount', `RM ${savedAmount.toFixed(2)}`);
  
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
  } else if (page === 'me') {
    pageMe.style.display = 'block';
    updateProfile();
  }
}

async function updateProfile() {
  const { data: { session } } = await supabase.auth.getSession();
  const nameEl = document.querySelector('.profile-name');
  const emailEl = document.querySelector('.profile-email');
  
  if (session) {
    if (nameEl) nameEl.textContent = session.user.user_metadata.name || 'User';
    if (emailEl) emailEl.textContent = session.user.email;
  } else if (isDemo) {
    if (nameEl) nameEl.textContent = 'Demo User';
    if (emailEl) emailEl.textContent = 'demo@projectorion.test';
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

// Navigation Listeners
document.getElementById('nav-brand')?.addEventListener('click', () => routeTo('home'));
navItems.home?.addEventListener('click', () => routeTo('home'));
navItems.rewards?.addEventListener('click', () => routeTo('rewards'));
navItems.discover?.addEventListener('click', () => routeTo('discover'));
navItems.me?.addEventListener('click', () => routeTo('me'));

document.getElementById('go-discover-from-home')?.addEventListener('click', () => routeTo('discover'));
document.getElementById('discover-widget')?.addEventListener('click', () => routeTo('discover'));
document.getElementById('rewards-widget')?.addEventListener('click', () => routeTo('rewards'));

// Demo Login
document.getElementById('btn-demo-login')?.addEventListener('click', () => {
  isDemo = true;
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

window.logout = async () => {
  isDemo = false;
  await supabase.auth.signOut();
  showLogin();
};

renderApp();
