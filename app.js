// MyMonitorXX - Core Application Logic, Authentication & RBAC

// Initial State Data
const DEFAULT_STATE = {
  currentUser: null, // null = show login screen
  activeRole: 'admin', // 'admin', 'hod', 'teacher'
  mobileFrame: false,
  teacherCheckedIn: false,

  // User Accounts Directory (Authentication & RBAC)
  users: [
    {
      id: 'usr-admin-1',
      name: 'System Administrator',
      email: 'canvaonly322@gmail.com',
      altEmail: 'canvaonly322@gmil.com',
      password: '123BALASELVARAJA123',
      role: 'admin',
      dept: 'Central Campus Administration'
    },
    {
      id: 'usr-hod-1',
      name: 'Dr. Ramesh Babu',
      email: 'hod.it@college.edu',
      password: 'hodpassword123',
      role: 'hod',
      dept: 'Information Technology'
    },
    {
      id: 'usr-teacher-1',
      name: 'Arun Kumar',
      email: 'arun@college.edu',
      password: 'teacherpass123',
      role: 'teacher',
      dept: 'Information Technology',
      subject: 'Python'
    }
  ],

  hodsList: [
    { id: 1, name: 'Dr. Ramesh Babu', email: 'hod.it@college.edu', dept: 'Information Technology', roomsManaged: 'Block C (6 Halls)', assignedFaculty: 14, status: 'Active' },
    { id: 2, name: 'Dr. Sunitha Verma', email: 'sunitha.hod@college.edu', dept: 'Computer Science', roomsManaged: 'Block B (8 Halls)', assignedFaculty: 18, status: 'Active' }
  ],

  hodStats: {
    totalClasses: 48,
    active: 32,
    scheduled: 9,
    vacant: 5,
    substitute: 2
  },

  liveMonitoring: [
    { id: 1, class: 'IT-A', subject: 'Python', teacher: 'Arun', room: 'C204', status: 'ACTIVE', time: '10:00 - 11:00', substituteTeacher: null },
    { id: 2, class: 'IT-B', subject: 'DBMS', teacher: 'Kumar', room: 'C205', status: 'SCHEDULED', time: '11:00 - 12:00', substituteTeacher: null },
    { id: 3, class: 'IT-C', subject: 'Maths', teacher: 'Priya', room: 'C206', status: 'VACANT', time: '10:00 - 11:00', substituteTeacher: null },
    { id: 4, class: 'IT-D', subject: 'Java', teacher: 'Suresh', room: 'C207', status: 'SUBSTITUTE', time: '10:00 - 11:00', substituteTeacher: 'Rajesh' },
    { id: 5, class: 'IT-A', subject: 'Computer Networks', teacher: 'Vikram', room: 'C208', status: 'ACTIVE', time: '10:00 - 11:00', substituteTeacher: null },
    { id: 6, class: 'IT-B', subject: 'Web Technologies', teacher: 'Sneha', room: 'Lab 2', status: 'SCHEDULED', time: '11:00 - 13:00', substituteTeacher: null },
    { id: 7, class: 'IT-C', subject: 'Operating Systems', teacher: 'Kavitha', room: 'C209', status: 'ACTIVE', time: '10:00 - 11:00', substituteTeacher: null },
    { id: 8, class: 'IT-D', subject: 'Data Structures', teacher: 'Manoj', room: 'C210', status: 'VACANT', time: '10:00 - 11:00', substituteTeacher: null }
  ],

  availableSubstitutes: [
    { id: 'sub-1', name: 'Dr. Rajesh', dept: 'Information Technology', freePeriods: 'Period 3 & 4 (10:00 - 12:00)', specialization: 'Maths & Algorithms' },
    { id: 'sub-2', name: 'Prof. Anitha', dept: 'Information Technology', freePeriods: 'Period 3 (10:00 - 11:00)', specialization: 'Data Structures' },
    { id: 'sub-3', name: 'Dr. Meenakshi', dept: 'Computer Science', freePeriods: 'Period 3 & 5 (10:00 - 11:00, 1:00 - 2:00)', specialization: 'Programming Languages' }
  ],

  teachersList: [
    { id: 1, name: 'Arun Kumar', email: 'arun@college.edu', subject: 'Python & AI', dept: 'IT', workload: '16 hrs/wk', status: 'Available' },
    { id: 2, name: 'Kumar Swamy', email: 'kumar@college.edu', subject: 'DBMS', dept: 'IT', workload: '18 hrs/wk', status: 'In Class' },
    { id: 3, name: 'Priya Sharma', email: 'priya@college.edu', subject: 'Applied Maths', dept: 'IT', workload: '14 hrs/wk', status: 'On Leave' },
    { id: 4, name: 'Suresh Raina', email: 'suresh@college.edu', subject: 'Java & OOP', dept: 'IT', workload: '16 hrs/wk', status: 'In Class' },
    { id: 5, name: 'Sneha Rao', email: 'sneha@college.edu', subject: 'Web Tech', dept: 'IT', workload: '15 hrs/wk', status: 'Available' },
    { id: 6, name: 'Vikram Singh', email: 'vikram@college.edu', subject: 'Networks', dept: 'IT', workload: '18 hrs/wk', status: 'In Class' }
  ],

  subjectsList: [
    { code: 'IT301', name: 'Python Programming', type: 'Theory + Lab', weeklyHours: 5, dept: 'IT' },
    { code: 'IT302', name: 'Database Management Systems', type: 'Theory', weeklyHours: 4, dept: 'IT' },
    { code: 'MA301', name: 'Discrete Mathematics', type: 'Theory', weeklyHours: 4, dept: 'All' },
    { code: 'IT303', name: 'Object Oriented Java', type: 'Theory + Lab', weeklyHours: 5, dept: 'IT' },
    { code: 'IT304', name: 'Computer Networks', type: 'Theory', weeklyHours: 4, dept: 'IT' }
  ],

  classroomsList: [
    { room: 'C204', type: 'Smart Lecture Hall', capacity: 65, block: 'Academic Block C' },
    { room: 'C205', type: 'Lecture Hall', capacity: 60, block: 'Academic Block C' },
    { room: 'C206', type: 'Lecture Hall', capacity: 60, block: 'Academic Block C' },
    { room: 'C207', type: 'Smart Lecture Hall', capacity: 70, block: 'Academic Block C' },
    { room: 'Lab 1', type: 'Cloud & Web Lab', capacity: 45, block: 'IT Lab Complex' },
    { room: 'Lab 2', type: 'AI & Data Science Lab', capacity: 50, block: 'IT Lab Complex' }
  ],

  timetableVersions: [
    { version: 'v3.2', status: 'ACTIVE', term: 'Odd Semester 2026-27', appliedAt: '10 Sep 2026', generatedBy: 'AI Scheduler v2' },
    { version: 'v3.1', status: 'ARCHIVED', term: 'Odd Semester 2026-27', appliedAt: '01 Sep 2026', generatedBy: 'Admin Manual' },
    { version: 'v3.0', status: 'DRAFT', term: 'Odd Semester 2026-27', appliedAt: '25 Aug 2026', generatedBy: 'AI Scheduler v2' }
  ],

  teacherTodayClasses: [
    { time: '09:00', subject: 'DBMS', class: 'IT-A', room: 'C205', status: 'Completed', note: 'Attendance recorded' },
    { time: '10:00', subject: 'Python', class: 'IT-B', room: 'C204', status: 'Active', note: 'Live Class Slot' },
    { time: '11:00', subject: 'Maths', class: 'IT-C', room: 'C206', status: 'Upcoming', note: 'Scheduled' },
    { time: '12:00', subject: 'Lab', class: 'IT-A', room: 'Lab 1', status: 'Upcoming', note: 'Practical Session' }
  ]
};

// Load saved state or default
let appState = JSON.parse(localStorage.getItem('mymoniter_state')) || DEFAULT_STATE;

// Ensure default users and admin credentials always exist
if (!appState.users || !appState.users.some(u => u.email === 'canvaonly322@gmail.com')) {
  appState.users = DEFAULT_STATE.users;
}
if (!appState.hodsList) {
  appState.hodsList = DEFAULT_STATE.hodsList;
}

function saveState() {
  localStorage.setItem('mymoniter_state', JSON.stringify(appState));
}

// Global Toast Notifications
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  const bg = type === 'success' ? 'bg-emerald-600 text-white' : (type === 'error' ? 'bg-rose-600 text-white' : 'bg-slate-800 text-white');
  toast.className = `${bg} px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 text-sm font-medium transition-all duration-300 transform translate-y-2 opacity-0 z-50`;
  toast.innerHTML = `
    <span class="text-lg">${type === 'success' ? '✓' : (type === 'error' ? '✕' : 'ℹ')}</span>
    <span>${message}</span>
  `;
  container.appendChild(toast);
  requestAnimationFrame(() => {
    toast.classList.remove('translate-y-2', 'opacity-0');
  });
  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-2');
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// =========================================================================
// AUTHENTICATION & LOGIN CONTROLLERS
// =========================================================================

function togglePasswordVisibility(inputId) {
  const input = document.getElementById(inputId);
  if (!input) return;
  input.type = input.type === 'password' ? 'text' : 'password';
}

function handleLogin(e) {
  if (e) e.preventDefault();
  const emailInput = document.getElementById('login-email').value.trim().toLowerCase();
  const passwordInput = document.getElementById('login-password').value.trim();

  if (!emailInput || !passwordInput) {
    showToast('Please enter both Gmail address and password.', 'error');
    return;
  }

  // Find user matching email or altEmail
  const user = appState.users.find(u => 
    u.email.toLowerCase() === emailInput || (u.altEmail && u.altEmail.toLowerCase() === emailInput)
  );

  if (!user) {
    showToast('Account not found with this email. Check credentials or ask your Admin/HOD.', 'error');
    return;
  }

  if (user.password !== passwordInput) {
    showToast('Incorrect password. Please verify and try again.', 'error');
    return;
  }

  // Authenticate user
  appState.currentUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    dept: user.dept || 'Campus',
    subject: user.subject || ''
  };
  appState.activeRole = user.role;
  saveState();

  updateAuthUI();
  setRole(user.role);
  showToast(`Welcome back, ${user.name}! Logged in as ${user.role.toUpperCase()}.`, 'success');
}

function quickLogin(role) {
  const emailInput = document.getElementById('login-email');
  const passInput = document.getElementById('login-password');

  if (role === 'admin') {
    emailInput.value = 'canvaonly322@gmail.com';
    passInput.value = '123BALASELVARAJA123';
  } else if (role === 'hod') {
    emailInput.value = 'hod.it@college.edu';
    passInput.value = 'hodpassword123';
  } else if (role === 'teacher') {
    emailInput.value = 'arun@college.edu';
    passInput.value = 'teacherpass123';
  }

  handleLogin();
}

function handleLogout() {
  appState.currentUser = null;
  saveState();
  updateAuthUI();
  showToast('You have signed out successfully.', 'info');
}

function updateAuthUI() {
  const loginSection = document.getElementById('section-login');
  const roleSwitcher = document.getElementById('header-role-switcher');
  const userProfileBar = document.getElementById('header-user-profile');
  const clockContainer = document.getElementById('header-clock');

  if (!appState.currentUser) {
    // Show login section, hide app dashboards
    if (loginSection) loginSection.classList.add('active');
    document.querySelectorAll('.role-section:not(#section-login)').forEach(sec => sec.classList.remove('active'));
    
    if (roleSwitcher) roleSwitcher.classList.add('hidden');
    if (userProfileBar) userProfileBar.classList.add('hidden');
    return;
  }

  // User is logged in
  if (loginSection) loginSection.classList.remove('active');
  if (userProfileBar) userProfileBar.classList.remove('hidden');

  // Populate User Profile in Header
  const userNameEl = document.getElementById('header-user-name');
  const userRoleEl = document.getElementById('header-user-role');
  const userEmailEl = document.getElementById('header-user-email');
  const userAvatarEl = document.getElementById('header-user-avatar');

  if (userNameEl) userNameEl.textContent = appState.currentUser.name;
  if (userRoleEl) userRoleEl.textContent = appState.currentUser.role.toUpperCase();
  if (userEmailEl) userEmailEl.textContent = appState.currentUser.email;
  if (userAvatarEl) userAvatarEl.textContent = appState.currentUser.name.charAt(0);

  // Role Switcher visibility:
  // Admin can view/switch between all 3 roles. HOD/Teachers can also navigate or view permitted panels.
  if (roleSwitcher) {
    roleSwitcher.classList.remove('hidden');
  }

  // Set active role view
  setRole(appState.activeRole || appState.currentUser.role);
}

// =========================================================================
// ROLE SWITCHER & NAVIGATION
// =========================================================================

function setRole(roleName) {
  if (!appState.currentUser) {
    updateAuthUI();
    return;
  }

  appState.activeRole = roleName;
  saveState();

  // Highlight active role button
  const buttons = document.querySelectorAll('.role-pill-btn');
  buttons.forEach(btn => {
    const isTarget = btn.getAttribute('data-role') === roleName;
    if (isTarget) {
      btn.className = 'role-pill-btn flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold shadow-sm bg-indigo-600 text-white transition-all';
    } else {
      btn.className = 'role-pill-btn flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all';
    }
  });

  // Switch role section
  document.querySelectorAll('.role-section').forEach(sec => {
    sec.classList.remove('active');
  });

  const activeSection = document.getElementById(`section-${roleName}`);
  if (activeSection) {
    activeSection.classList.add('active');
  }

  // Teacher mobile frame control toggle visibility
  const frameToggleBtn = document.getElementById('teacher-frame-toggle');
  if (frameToggleBtn) {
    frameToggleBtn.style.display = roleName === 'teacher' ? 'inline-flex' : 'none';
  }

  // Close any open drawers when changing role
  closeAdminDrawer();
  closeHodDrawer();
  closeTeacherDrawer();

  renderActiveViews();
}

// Sub-Tab Navigation for Admin (Supports Desktop Sidebar and Mobile Drawer)
function switchAdminTab(tabId) {
  document.querySelectorAll('.admin-tab-pane').forEach(el => el.classList.add('hidden'));
  document.querySelectorAll('.admin-sidebar-link, .admin-drawer-link').forEach(el => {
    el.classList.remove('bg-indigo-50', 'text-indigo-700', 'font-semibold');
    el.classList.add('text-slate-600', 'hover:bg-slate-50');
  });

  const targetPane = document.getElementById(`admin-tab-${tabId}`);
  if (targetPane) targetPane.classList.remove('hidden');

  document.querySelectorAll(`[data-admin-tab="${tabId}"]`).forEach(activeLink => {
    activeLink.classList.add('bg-indigo-50', 'text-indigo-700', 'font-semibold');
    activeLink.classList.remove('text-slate-600');
  });

  closeAdminDrawer();
}

// Drawer Controls for Administrator Panel Mobile View
function toggleAdminDrawer(force) {
  const drawer = document.getElementById('admin-mobile-drawer');
  if (!drawer) return;
  if (typeof force === 'boolean') {
    if (force) drawer.classList.remove('drawer-closed');
    else drawer.classList.add('drawer-closed');
  } else {
    drawer.classList.toggle('drawer-closed');
  }
}

function closeAdminDrawer() {
  toggleAdminDrawer(false);
}

// Sub-Tab Navigation for HOD (Supports Desktop Sidebar and Mobile Drawer)
function switchHodTab(tabId) {
  document.querySelectorAll('.hod-tab-pane').forEach(el => el.classList.add('hidden'));
  document.querySelectorAll('.hod-sidebar-link, .hod-drawer-link').forEach(el => {
    el.classList.remove('bg-indigo-50', 'text-indigo-700', 'font-semibold');
    el.classList.add('text-slate-600', 'hover:bg-slate-50');
  });

  const targetPane = document.getElementById(`hod-tab-${tabId}`);
  if (targetPane) targetPane.classList.remove('hidden');

  document.querySelectorAll(`[data-hod-tab="${tabId}"]`).forEach(activeLink => {
    activeLink.classList.add('bg-indigo-50', 'text-indigo-700', 'font-semibold');
    activeLink.classList.remove('text-slate-600');
  });

  closeHodDrawer();
}

// Drawer Controls for HOD IT Department Mobile View
function toggleHodDrawer(force) {
  const drawer = document.getElementById('hod-mobile-drawer');
  if (!drawer) return;
  if (typeof force === 'boolean') {
    if (force) drawer.classList.remove('drawer-closed');
    else drawer.classList.add('drawer-closed');
  } else {
    drawer.classList.toggle('drawer-closed');
  }
}

function closeHodDrawer() {
  toggleHodDrawer(false);
}

// Drawer Controls for Teacher Mobile View
function toggleTeacherDrawer(force) {
  const drawer = document.getElementById('teacher-mobile-drawer');
  if (!drawer) return;
  if (typeof force === 'boolean') {
    if (force) drawer.classList.remove('drawer-closed');
    else drawer.classList.add('drawer-closed');
  } else {
    drawer.classList.toggle('drawer-closed');
  }
}

function closeTeacherDrawer() {
  toggleTeacherDrawer(false);
}

// Sub-Tab Navigation for Teacher (Supports Desktop Sidebar, Mobile Drawer, and Tabs)
function switchTeacherTab(tabId) {
  document.querySelectorAll('.teacher-tab-pane').forEach(el => el.classList.add('hidden'));
  
  // Highlight active link across desktop sidebar, drawer, and bottom nav
  document.querySelectorAll('[data-teacher-tab]').forEach(el => {
    const isTarget = el.getAttribute('data-teacher-tab') === tabId;
    if (el.classList.contains('teacher-sidebar-link') || el.classList.contains('teacher-drawer-link')) {
      if (isTarget) {
        el.classList.add('bg-indigo-50', 'text-indigo-700', 'font-semibold');
        el.classList.remove('text-slate-600');
      } else {
        el.classList.remove('bg-indigo-50', 'text-indigo-700', 'font-semibold');
        el.classList.add('text-slate-600');
      }
    } else {
      if (isTarget) {
        el.classList.add('text-indigo-600', 'font-bold');
        el.classList.remove('text-slate-500');
      } else {
        el.classList.remove('text-indigo-600', 'font-bold');
        el.classList.add('text-slate-500');
      }
    }
  });

  const targetPane = document.getElementById(`teacher-tab-${tabId}`);
  if (targetPane) targetPane.classList.remove('hidden');

  closeTeacherDrawer();
}

// =========================================================================
// HIERARCHICAL USER CREATION (ADMIN ADDS HOD, HOD ADDS TEACHERS)
// =========================================================================

// 1. Admin adds an HOD with Gmail & Password
function handleAddHod(e) {
  e.preventDefault();
  const name = document.getElementById('new-hod-name').value.trim();
  const dept = document.getElementById('new-hod-dept').value.trim();
  const email = document.getElementById('new-hod-email').value.trim().toLowerCase();
  const password = document.getElementById('new-hod-password').value.trim();
  const rooms = document.getElementById('new-hod-rooms').value.trim() || 'Assigned Block';

  if (!name || !email || !password) {
    showToast('Name, Gmail, and Password are required.', 'error');
    return;
  }

  // Check if user already exists
  if (appState.users.some(u => u.email.toLowerCase() === email)) {
    showToast('A user with this Gmail already exists.', 'error');
    return;
  }

  // Add HOD account to users
  appState.users.push({
    id: 'usr-hod-' + Date.now(),
    name,
    email,
    password,
    role: 'hod',
    dept
  });

  // Add to HOD list
  appState.hodsList.push({
    id: Date.now(),
    name,
    email,
    dept,
    roomsManaged: rooms,
    assignedFaculty: 10,
    status: 'Active'
  });

  saveState();
  renderAdminTables();
  closeModal('modal-add-hod');
  showToast(`HOD account for ${name} created! Password set. HOD can now log in with ${email}.`, 'success');
  e.target.reset();
}

// 2. HOD adds a Teacher with Gmail & Password
function handleHodAddTeacher(e) {
  e.preventDefault();
  const name = document.getElementById('hod-teacher-name').value.trim();
  const email = document.getElementById('hod-teacher-email').value.trim().toLowerCase();
  const subject = document.getElementById('hod-teacher-subject').value.trim();
  const dept = document.getElementById('hod-teacher-dept').value.trim() || 'IT';
  const password = document.getElementById('hod-teacher-password').value.trim();
  const workload = document.getElementById('hod-teacher-workload').value.trim() || '16 hrs/wk';

  if (!name || !email || !password || !subject) {
    showToast('Name, Subject, Gmail, and Password are required.', 'error');
    return;
  }

  if (appState.users.some(u => u.email.toLowerCase() === email)) {
    showToast('A user with this Gmail already exists.', 'error');
    return;
  }

  // Add Teacher account to users
  appState.users.push({
    id: 'usr-teacher-' + Date.now(),
    name,
    email,
    password,
    role: 'teacher',
    dept,
    subject
  });

  // Add to teachers list
  appState.teachersList.push({
    id: Date.now(),
    name,
    email,
    subject,
    dept,
    workload,
    status: 'Available'
  });

  saveState();
  renderAdminTables();
  renderHodTeachers();
  closeModal('modal-hod-add-teacher');
  showToast(`Teacher account for ${name} created! Teacher can now log in with ${email}.`, 'success');
  e.target.reset();
}

// =========================================================================
// HOD DASHBOARD & LIVE MONITORING
// =========================================================================

function renderHodDashboard() {
  document.getElementById('hod-stat-total').textContent = appState.hodStats.totalClasses;
  document.getElementById('hod-stat-active').textContent = appState.hodStats.active;
  document.getElementById('hod-stat-scheduled').textContent = appState.hodStats.scheduled;
  document.getElementById('hod-stat-vacant').textContent = appState.hodStats.vacant;
  document.getElementById('hod-stat-substitute').textContent = appState.hodStats.substitute;

  // Render Live Monitoring Table
  const tbody = document.getElementById('live-monitoring-tbody');
  if (!tbody) return;

  tbody.innerHTML = '';
  appState.liveMonitoring.forEach(row => {
    const tr = document.createElement('tr');
    tr.className = 'border-b border-slate-100 hover:bg-slate-50/80 transition-colors text-sm';

    let statusBadge = '';
    if (row.status === 'ACTIVE') {
      statusBadge = `
        <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
          <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse-dot"></span>
          ACTIVE
        </span>`;
    } else if (row.status === 'SCHEDULED') {
      statusBadge = `
        <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
          <span class="w-2 h-2 rounded-full bg-slate-400"></span>
          SCHEDULED
        </span>`;
    } else if (row.status === 'VACANT') {
      statusBadge = `
        <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-300 animate-pulse">
          <span class="w-2 h-2 rounded-full bg-rose-500"></span>
          VACANT
        </span>`;
    } else if (row.status === 'SUBSTITUTE') {
      statusBadge = `
        <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-300">
          <span class="w-2 h-2 rounded-full bg-amber-500"></span>
          SUBSTITUTE
        </span>`;
    }

    let actionBtn = '';
    if (row.status === 'VACANT') {
      actionBtn = `
        <button onclick="openSubstituteModal(${row.id})" class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-sm transition">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/></svg>
          Assign Substitute
        </button>`;
    } else if (row.status === 'SUBSTITUTE') {
      actionBtn = `
        <span class="text-xs text-amber-800 font-medium bg-amber-50 px-2 py-1 rounded border border-amber-200">
          Sub: <strong class="font-semibold">${row.substituteTeacher}</strong>
        </span>`;
    } else {
      actionBtn = `
        <button onclick="showToast('Class details for ${row.class} - ${row.subject}', 'info')" class="text-xs text-slate-500 hover:text-indigo-600 font-medium underline">
          View Room
        </button>`;
    }

    tr.innerHTML = `
      <td class="py-3.5 px-4 font-bold text-slate-900">${row.class}</td>
      <td class="py-3.5 px-4 font-medium text-slate-800">${row.subject}</td>
      <td class="py-3.5 px-4 text-slate-700">
        <div class="flex items-center gap-2">
          <span class="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">${row.teacher.charAt(0)}</span>
          <span>${row.teacher}</span>
        </div>
      </td>
      <td class="py-3.5 px-4 font-mono text-xs font-semibold text-slate-600">${row.room}</td>
      <td class="py-3.5 px-4">${statusBadge}</td>
      <td class="py-3.5 px-4 text-right">${actionBtn}</td>
    `;
    tbody.appendChild(tr);
  });
}

// Substitute Management Modal
let activeVacantClassId = null;

function openSubstituteModal(classId) {
  activeVacantClassId = classId;
  const targetClass = appState.liveMonitoring.find(c => c.id === classId);
  if (!targetClass) return;

  document.getElementById('sub-modal-class-name').textContent = `${targetClass.class} - ${targetClass.subject}`;
  document.getElementById('sub-modal-teacher-name').textContent = `${targetClass.teacher} (Absent / On Leave)`;
  document.getElementById('sub-modal-room').textContent = targetClass.room;
  document.getElementById('sub-modal-time').textContent = targetClass.time;

  const listContainer = document.getElementById('substitute-candidates-list');
  listContainer.innerHTML = '';

  appState.availableSubstitutes.forEach(sub => {
    const div = document.createElement('div');
    div.className = 'border border-slate-200 rounded-xl p-3.5 hover:border-indigo-400 hover:bg-indigo-50/40 transition flex items-center justify-between cursor-pointer';
    div.innerHTML = `
      <div>
        <div class="flex items-center gap-2">
          <h4 class="font-bold text-slate-900 text-sm">${sub.name}</h4>
          <span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">FREE NOW</span>
        </div>
        <p class="text-xs text-slate-500 mt-0.5">${sub.specialization} • ${sub.freePeriods}</p>
      </div>
      <button onclick="confirmSubstituteAssignment('${sub.name}')" class="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition shadow-sm">
        Select
      </button>
    `;
    listContainer.appendChild(div);
  });

  const modal = document.getElementById('substitute-modal');
  modal.classList.remove('hidden');
}

function closeSubstituteModal() {
  const modal = document.getElementById('substitute-modal');
  modal.classList.add('hidden');
  activeVacantClassId = null;
}

function confirmSubstituteAssignment(teacherName) {
  if (!activeVacantClassId) return;
  const row = appState.liveMonitoring.find(c => c.id === activeVacantClassId);
  if (row) {
    row.status = 'SUBSTITUTE';
    row.substituteTeacher = teacherName;

    // Adjust counters
    if (appState.hodStats.vacant > 0) appState.hodStats.vacant -= 1;
    appState.hodStats.substitute += 1;

    saveState();
    closeSubstituteModal();
    renderHodDashboard();
    showToast(`Assigned ${teacherName} as substitute for ${row.class} (${row.subject})!`, 'success');
  }
}

// =========================================================================
// TEACHER DASHBOARD & CHECK-IN
// =========================================================================

function handleTeacherCheckIn() {
  appState.teacherCheckedIn = !appState.teacherCheckedIn;

  // Sync with HOD monitoring
  const arunClass = appState.liveMonitoring.find(c => c.teacher === 'Arun' && c.class === 'IT-A');
  if (arunClass) {
    if (appState.teacherCheckedIn) {
      arunClass.status = 'ACTIVE';
      appState.hodStats.active = Math.min(appState.hodStats.totalClasses, appState.hodStats.active + 1);
    }
  }

  saveState();
  renderTeacherDashboard();
  renderHodDashboard();

  if (appState.teacherCheckedIn) {
    showToast('Checked in successfully! Room C204 status is now ACTIVE.', 'success');
  } else {
    showToast('Checked out of Room C204.', 'info');
  }
}

function renderTeacherDashboard() {
  const checkInBtn = document.getElementById('teacher-checkin-action-btn');
  const nextClassBadge = document.getElementById('teacher-next-class-badge');
  const checkinTimeText = document.getElementById('teacher-checkin-time');

  if (checkInBtn && nextClassBadge && checkinTimeText) {
    if (appState.teacherCheckedIn) {
      checkInBtn.className = 'w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-lg shadow-emerald-200 transition-all flex items-center justify-center gap-2 transform active:scale-95';
      checkInBtn.innerHTML = `
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
        <span>CHECKED IN • IN PROGRESS</span>
      `;
      nextClassBadge.className = 'px-3 py-1 rounded-full text-xs font-bold bg-emerald-500 text-white flex items-center gap-1.5';
      nextClassBadge.innerHTML = '<span class="w-2 h-2 rounded-full bg-white animate-pulse-dot"></span> LIVE CLASS';
      checkinTimeText.textContent = 'Geo-verified at C204 • Attendance mode open';
    } else {
      checkInBtn.className = 'w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2 transform active:scale-95';
      checkInBtn.innerHTML = `
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 004 11a7.96 7.96 0 004.28 7.05"/></svg>
        <span>CHECK IN NOW</span>
      `;
      nextClassBadge.className = 'px-3 py-1 rounded-full text-xs font-bold bg-indigo-500 text-white flex items-center gap-1.5';
      nextClassBadge.innerHTML = 'UPCOMING (10:00 AM)';
      checkinTimeText.textContent = 'Tap to check-in when entering Room C204';
    }
  }

  // Render teacher daily timeline
  const timelineList = document.getElementById('teacher-timeline-list');
  if (timelineList) {
    timelineList.innerHTML = '';
    appState.teacherTodayClasses.forEach((item, idx) => {
      let pill = '';
      if (item.status === 'Completed') {
        pill = '<span class="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">✓ Completed</span>';
      } else if (item.status === 'Active') {
        pill = appState.teacherCheckedIn
          ? '<span class="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300 animate-pulse">🟢 Active</span>'
          : '<span class="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800 border border-amber-300">⚪ Pending Check-In</span>';
      } else {
        pill = '<span class="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-500">Upcoming</span>';
      }

      const div = document.createElement('div');
      div.className = 'flex items-start gap-3 p-3 bg-white rounded-xl border border-slate-100 hover:shadow-sm transition';
      div.innerHTML = `
        <div class="text-xs font-mono font-bold text-slate-400 pt-0.5 w-14">${item.time.split(' - ')[0]}</div>
        <div class="flex-1">
          <div class="flex items-center justify-between">
            <h4 class="font-bold text-slate-800 text-sm">${item.subject}</h4>
            ${pill}
          </div>
          <p class="text-xs text-slate-500 mt-0.5">${item.class} • ${item.room} • ${item.note}</p>
        </div>
      `;
      timelineList.appendChild(div);
    });
  }
}

// =========================================================================
// ADMIN TIMETABLE GENERATOR & MANAGEMENT
// =========================================================================

function runTimetableGeneration() {
  const btn = document.getElementById('btn-run-generator');
  const progressContainer = document.getElementById('gen-progress-container');
  const progressBar = document.getElementById('gen-progress-bar');
  const progressText = document.getElementById('gen-progress-text');
  const resultsPreview = document.getElementById('gen-results-preview');

  btn.disabled = true;
  btn.classList.add('opacity-50');
  progressContainer.classList.remove('hidden');
  resultsPreview.classList.add('hidden');

  let progress = 0;
  const stages = [
    'Parsing 38 Teachers & workload limits...',
    'Evaluating 24 Subjects and Lab room constraints...',
    'Checking room capacity and collision matrices...',
    'Running genetic optimization & conflict resolver...',
    'Timetable optimized! 0 conflicts found.'
  ];

  const interval = setInterval(() => {
    progress += 20;
    progressBar.style.width = `${progress}%`;
    const stageIdx = Math.min(stages.length - 1, Math.floor(progress / 20));
    progressText.textContent = stages[stageIdx];

    if (progress >= 100) {
      clearInterval(interval);
      btn.disabled = false;
      btn.classList.remove('opacity-50');
      resultsPreview.classList.remove('hidden');
      showToast('Timetable Draft v3.3 Generated with 100% constraint satisfaction!', 'success');
    }
  }, 400);
}

function applyGeneratedTimetable() {
  const newVersion = {
    version: 'v3.3',
    status: 'ACTIVE',
    term: 'Odd Semester 2026-27',
    appliedAt: 'Just Now',
    generatedBy: 'AI Constraint Engine v2'
  };
  appState.timetableVersions.forEach(v => {
    if (v.status === 'ACTIVE') v.status = 'ARCHIVED';
  });
  appState.timetableVersions.unshift(newVersion);
  saveState();
  renderAdminTables();
  showToast('Timetable v3.3 applied campus-wide! HODs and Teachers notified.', 'success');
}

// Render Admin Tables (HODs, Teachers, Versions)
function renderAdminTables() {
  // HODs Table
  const hodTable = document.getElementById('admin-hods-tbody');
  if (hodTable) {
    hodTable.innerHTML = '';
    appState.hodsList.forEach(h => {
      const tr = document.createElement('tr');
      tr.className = 'border-b border-slate-100 hover:bg-slate-50/80 text-sm';
      tr.innerHTML = `
        <td class="py-3 px-4 font-bold text-slate-800">${h.name}</td>
        <td class="py-3 px-4 font-mono text-xs text-indigo-600 font-semibold">${h.email}</td>
        <td class="py-3 px-4 text-slate-700 font-medium">${h.dept}</td>
        <td class="py-3 px-4 text-slate-500">${h.roomsManaged}</td>
        <td class="py-3 px-4">
          <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
            ${h.status}
          </span>
        </td>
      `;
      hodTable.appendChild(tr);
    });
  }

  // Teachers Table
  const tTable = document.getElementById('admin-teachers-tbody');
  if (tTable) {
    tTable.innerHTML = '';
    appState.teachersList.forEach(t => {
      const tr = document.createElement('tr');
      tr.className = 'border-b border-slate-100 hover:bg-slate-50/80 text-sm';
      tr.innerHTML = `
        <td class="py-3 px-4 font-bold text-slate-800">${t.name}</td>
        <td class="py-3 px-4 text-slate-600 font-mono text-xs">${t.email}</td>
        <td class="py-3 px-4 text-slate-800 font-medium">${t.subject}</td>
        <td class="py-3 px-4 text-slate-600">${t.dept}</td>
        <td class="py-3 px-4 text-slate-600">${t.workload}</td>
        <td class="py-3 px-4">
          <span class="px-2 py-0.5 rounded-full text-xs font-semibold ${t.status === 'Available' ? 'bg-emerald-100 text-emerald-800' : (t.status === 'In Class' ? 'bg-indigo-100 text-indigo-800' : 'bg-rose-100 text-rose-800')}">
            ${t.status}
          </span>
        </td>
      `;
      tTable.appendChild(tr);
    });
  }

  // Timetable Versions Table
  const vTable = document.getElementById('admin-versions-tbody');
  if (vTable) {
    vTable.innerHTML = '';
    appState.timetableVersions.forEach(v => {
      const tr = document.createElement('tr');
      tr.className = 'border-b border-slate-100 hover:bg-slate-50/80 text-sm';
      tr.innerHTML = `
        <td class="py-3 px-4 font-bold text-indigo-700">${v.version}</td>
        <td class="py-3 px-4 font-medium text-slate-800">${v.term}</td>
        <td class="py-3 px-4 text-slate-500">${v.appliedAt}</td>
        <td class="py-3 px-4 text-slate-600 text-xs font-mono">${v.generatedBy}</td>
        <td class="py-3 px-4">
          <span class="px-2.5 py-0.5 rounded-full text-xs font-bold ${v.status === 'ACTIVE' ? 'bg-emerald-500 text-white' : (v.status === 'DRAFT' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600')}">
            ${v.status}
          </span>
        </td>
      `;
      vTable.appendChild(tr);
    });
  }
}

function renderHodTeachers() {
  const container = document.getElementById('hod-teachers-cards-container');
  if (!container) return;
  container.innerHTML = '';
  appState.teachersList.forEach(t => {
    const card = document.createElement('div');
    card.className = 'p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center text-xs';
    card.innerHTML = `
      <div>
        <span class="font-bold text-slate-800 text-sm">${t.name}</span>
        <p class="text-slate-500">${t.subject} • <span class="font-mono text-indigo-600">${t.email}</span></p>
      </div>
      <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${t.status === 'Available' ? 'bg-emerald-100 text-emerald-800' : 'bg-indigo-100 text-indigo-800'}">
        ${t.status}
      </span>
    `;
    container.appendChild(card);
  });
}

// Modal handling
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove('hidden');
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.add('hidden');
}

// Live Clock updates
function startClock() {
  function update() {
    const clockEl = document.getElementById('live-clock');
    const teacherClockEl = document.getElementById('teacher-live-clock');
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const dateStr = now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

    if (clockEl) clockEl.textContent = `${dateStr} • ${timeStr}`;
    if (teacherClockEl) teacherClockEl.textContent = timeStr;
  }
  update();
  setInterval(update, 1000);
}

// Render active views
function renderActiveViews() {
  renderHodDashboard();
  renderTeacherDashboard();
  renderAdminTables();
  renderHodTeachers();
}

// Reset data to defaults
function resetAllData() {
  if (confirm('Reset application data to default administrator state?')) {
    localStorage.removeItem('mymoniter_state');
    appState = JSON.parse(JSON.stringify(DEFAULT_STATE));
    saveState();
    updateAuthUI();
    renderActiveViews();
    showToast('Reset data to default state.', 'info');
  }
}

// Initialization on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  startClock();
  updateAuthUI();

  // Event listener for login form
  const loginForm = document.getElementById('form-login');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }

  // Event listener for Add HOD form
  const hodForm = document.getElementById('form-add-hod');
  if (hodForm) {
    hodForm.addEventListener('submit', handleAddHod);
  }

  // Event listener for HOD Add Teacher form
  const hodTeacherForm = document.getElementById('form-hod-add-teacher');
  if (hodTeacherForm) {
    hodTeacherForm.addEventListener('submit', handleHodAddTeacher);
  }
});
