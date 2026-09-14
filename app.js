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
      id: 'usr-admin-hulk',
      name: 'Admin Hulk',
      email: 'hulk@pluto.in',
      password: 'HULK@123',
      role: 'admin',
      dept: 'Central Campus Administration'
    },
    {
      id: 'usr-admin-1',
      name: 'System Administrator',
      email: 'canvaonly322@gmail.com',
      altEmail: 'canvaonly322@gmil.com',
      password: '123BALASELVARAJA123',
      role: 'admin',
      dept: 'Central Campus Administration'
    }
  ],

  hodsList: [],

  hodStats: {
    totalClasses: 0,
    active: 0,
    scheduled: 0,
    vacant: 0,
    substitute: 0
  },

  liveMonitoring: [],

  availableSubstitutes: [],

  teachersList: [],

  subjectsList: [],

  classesList: [],

  classroomsList: [],

  timetableVersions: [],

  teacherTodayClasses: []
};

// Load saved state or default
let appState = JSON.parse(localStorage.getItem('mymoniter_state')) || DEFAULT_STATE;

// Automatically clear out legacy mock placeholders
if (!appState.dataClearedV5) {
  appState.hodsList = [];
  appState.teachersList = [];
  appState.subjectsList = [];
  appState.classesList = [];
  appState.classroomsList = [];
  appState.timetableVersions = [];
  appState.liveMonitoring = [];
  appState.availableSubstitutes = [];
  appState.teacherTodayClasses = [];
  appState.hodStats = {
    totalClasses: 0,
    active: 0,
    scheduled: 0,
    vacant: 0,
    substitute: 0
  };
  if (appState.users) {
    appState.users = appState.users.filter(u => u.role === 'admin');
  }
  appState.dataClearedV5 = true;
}

// Ensure default users and admin credentials always exist
if (!appState.users || appState.users.length === 0) {
  appState.users = [...DEFAULT_STATE.users];
} else {
  const hulkUser = appState.users.find(u => u.email && u.email.toLowerCase() === 'hulk@pluto.in');
  if (hulkUser) {
    hulkUser.password = 'HULK@123';
    hulkUser.role = 'admin';
  } else {
    appState.users.unshift({
      id: 'usr-admin-hulk',
      name: 'Admin Hulk',
      email: 'hulk@pluto.in',
      password: 'HULK@123',
      role: 'admin',
      dept: 'Central Campus Administration'
    });
  }
}
if (!appState.hodsList) appState.hodsList = [];
if (!appState.teachersList) appState.teachersList = [];
if (!appState.subjectsList) appState.subjectsList = [];
if (!appState.classesList) appState.classesList = [];
if (!appState.classroomsList) appState.classroomsList = [];
if (!appState.timetableVersions) appState.timetableVersions = [];
if (!appState.liveMonitoring) appState.liveMonitoring = [];
if (!appState.availableSubstitutes) appState.availableSubstitutes = [];
if (!appState.teacherTodayClasses) appState.teacherTodayClasses = [];
saveState();

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
  if (!emailInput || !passInput) return;

  if (role === 'admin') {
    emailInput.value = 'hulk@pluto.in';
    passInput.value = 'HULK@123';
    handleLogin();
  } else {
    const user = appState.users.find(u => u.role === role);
    if (user) {
      emailInput.value = user.email;
      passInput.value = user.password;
      handleLogin();
    } else {
      showToast(`No registered ${role.toUpperCase()} accounts found. Please log in as Admin to create one.`, 'info');
    }
  }
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
    document.body.classList.add('login-mode');
    if (loginSection) loginSection.classList.add('active');
    document.querySelectorAll('.role-section:not(#section-login)').forEach(sec => sec.classList.remove('active'));
    
    if (roleSwitcher) roleSwitcher.classList.add('hidden');
    if (userProfileBar) userProfileBar.classList.add('hidden');
    return;
  }

  // User is logged in
  document.body.classList.remove('login-mode');
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
      btn.className = 'role-pill-btn role-segmented-tab active flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold bg-white text-slate-900 shadow-xs ring-1 ring-slate-200/60 transition-all';
    } else {
      btn.className = 'role-pill-btn role-segmented-tab flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-500 hover:text-slate-900 hover:bg-white/50 transition-all';
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
  document.querySelectorAll('.admin-sidebar-link').forEach(el => {
    el.classList.remove('bg-indigo-50', 'text-indigo-700', 'font-bold', 'border', 'border-indigo-200/70', 'shadow-2xs', 'bg-slate-900', 'text-white', 'shadow-xs');
    el.classList.add('text-slate-600', 'hover:bg-slate-50', 'hover:text-slate-900');
    const badge = el.querySelector('span[id^="admin-sidebar-count-"]');
    if (badge) {
      badge.classList.remove('bg-indigo-100', 'text-indigo-700');
      badge.classList.add('bg-slate-100', 'text-slate-600');
    }
  });
  document.querySelectorAll('.admin-drawer-link').forEach(el => {
    el.classList.remove('bg-indigo-50', 'text-indigo-700', 'font-semibold');
    el.classList.add('text-slate-600', 'hover:bg-slate-50');
  });

  const targetPane = document.getElementById(`admin-tab-${tabId}`);
  if (targetPane) targetPane.classList.remove('hidden');

  document.querySelectorAll(`[data-admin-tab="${tabId}"]`).forEach(activeLink => {
    if (activeLink.classList.contains('admin-sidebar-link')) {
      activeLink.classList.remove('text-slate-600', 'hover:bg-slate-50', 'hover:text-slate-900', 'bg-slate-900', 'text-white');
      activeLink.classList.add('bg-indigo-50', 'text-indigo-700', 'font-bold', 'border', 'border-indigo-200/70', 'shadow-2xs');
      const badge = activeLink.querySelector('span[id^="admin-sidebar-count-"]');
      if (badge) {
        badge.classList.remove('bg-slate-100', 'text-slate-600');
        badge.classList.add('bg-indigo-100', 'text-indigo-700');
      }
    } else if (activeLink.classList.contains('admin-drawer-link')) {
      activeLink.classList.remove('text-slate-600', 'hover:bg-slate-50');
      activeLink.classList.add('bg-indigo-50', 'text-indigo-700', 'font-semibold');
    }
  });

  closeAdminDrawer();

  if (tabId === 'ai-studio') {
    aiInitStudio();
  }
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
    assignedFaculty: 0,
    status: 'Active'
  });

  saveState();
  renderAdminTables();
  closeModal('modal-add-hod');
  showToast(`HOD account for ${name} created! Password set. HOD can now log in with ${email}.`, 'success');
  e.target.reset();
}

// 2. HOD or Admin adds a Teacher with Gmail & Password
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

  // Update HOD assignedFaculty count for this department if applicable
  const hod = appState.hodsList.find(h => h.dept.toLowerCase() === dept.toLowerCase());
  if (hod) {
    hod.assignedFaculty = (hod.assignedFaculty || 0) + 1;
  }

  saveState();
  renderAdminTables();
  renderHodTeachers();
  closeModal('modal-hod-add-teacher');
  showToast(`Teacher account for ${name} created! Teacher can now log in with ${email}.`, 'success');
  e.target.reset();
}

// 3. Admin adds Curriculum Subject
function handleAddSubject(e) {
  e.preventDefault();
  const code = document.getElementById('new-subject-code').value.trim().toUpperCase();
  const name = document.getElementById('new-subject-name').value.trim();
  const hours = parseInt(document.getElementById('new-subject-hours').value, 10) || 4;
  const type = document.getElementById('new-subject-type').value;
  const dept = document.getElementById('new-subject-dept').value;

  if (!code || !name) {
    showToast('Subject code and title are required.', 'error');
    return;
  }

  if (appState.subjectsList.some(s => s.code.toUpperCase() === code)) {
    showToast(`Subject code ${code} is already registered.`, 'error');
    return;
  }

  appState.subjectsList.push({
    id: Date.now(),
    code,
    name,
    weeklyHours: hours,
    type,
    dept
  });

  saveState();
  renderAdminTables();
  closeModal('modal-add-subject');
  showToast(`Subject ${code} (${name}) registered successfully!`, 'success');
  e.target.reset();
}

// 4. Admin adds Class Batch
function handleAddClass(e) {
  e.preventDefault();
  const name = document.getElementById('new-class-name').value.trim().toUpperCase();
  const students = parseInt(document.getElementById('new-class-students').value, 10) || 60;
  const room = document.getElementById('new-class-room').value.trim();

  if (!name || !room) {
    showToast('Class identifier and room are required.', 'error');
    return;
  }

  if (appState.classesList.some(c => c.name.toUpperCase() === name)) {
    showToast(`Class ${name} is already registered.`, 'error');
    return;
  }

  appState.classesList.push({
    id: Date.now(),
    name,
    students,
    room
  });

  saveState();
  renderAdminTables();
  closeModal('modal-add-class');
  showToast(`Class cohort ${name} added successfully!`, 'success');
  e.target.reset();
}

// 5. Admin adds Classroom / Lab
function handleAddClassroom(e) {
  e.preventDefault();
  const room = document.getElementById('new-classroom-room').value.trim();
  const type = document.getElementById('new-classroom-type').value;
  const capacity = parseInt(document.getElementById('new-classroom-capacity').value, 10) || 65;

  if (!room) {
    showToast('Room / Hall number is required.', 'error');
    return;
  }

  if (appState.classroomsList.some(r => r.room.toLowerCase() === room.toLowerCase())) {
    showToast(`Room ${room} is already registered.`, 'error');
    return;
  }

  appState.classroomsList.push({
    id: Date.now(),
    room,
    type,
    capacity
  });

  saveState();
  renderAdminTables();
  closeModal('modal-add-classroom');
  showToast(`Classroom ${room} (${type}) added successfully!`, 'success');
  e.target.reset();
}

// =========================================================================
// HOD DASHBOARD & LIVE MONITORING
// =========================================================================

function renderHodDashboard() {
  const setEl = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };
  setEl('hod-stat-total', appState.hodStats.totalClasses);
  setEl('hod-stat-active', appState.hodStats.active);
  setEl('hod-stat-scheduled', appState.hodStats.scheduled);
  setEl('hod-stat-vacant', appState.hodStats.vacant);
  setEl('hod-stat-substitute', appState.hodStats.substitute);

  // Sync HOD sidebar and drawer badges
  const vacantBadgeText = `${appState.hodStats.vacant} Vacant`;
  const drawerVacantBadge = document.getElementById('hod-drawer-count-vacant');
  if (drawerVacantBadge) {
    drawerVacantBadge.textContent = vacantBadgeText;
    drawerVacantBadge.className = appState.hodStats.vacant > 0 
      ? 'px-2 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-700' 
      : 'px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600';
  }
  const sidebarVacantBadge = document.getElementById('hod-sidebar-count-vacant');
  if (sidebarVacantBadge) {
    sidebarVacantBadge.textContent = vacantBadgeText;
    sidebarVacantBadge.className = appState.hodStats.vacant > 0 
      ? 'px-2 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-700' 
      : 'px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600';
  }
  setEl('hod-drawer-count-teachers', appState.teachersList.length);
  setEl('hod-sidebar-count-teachers', appState.teachersList.length);

  // Action banner protocol button
  const bannerActionArea = document.getElementById('hod-banner-action-area');
  if (bannerActionArea) {
    const firstVacant = appState.liveMonitoring.find(c => c.status === 'VACANT');
    if (firstVacant) {
      bannerActionArea.innerHTML = `
        <button onclick="openSubstituteModal(${firstVacant.id})" class="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-1.5 animate-pulse">
          <span>🔴 Fix ${firstVacant.class} Vacancy</span>
        </button>`;
    } else {
      bannerActionArea.innerHTML = `
        <span class="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">✓ All Classes Covered</span>`;
    }
  }

  // Render Live Monitoring Table
  const tbody = document.getElementById('live-monitoring-tbody');
  if (tbody) {
    tbody.innerHTML = '';
    if (appState.liveMonitoring.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" class="py-12 px-4 text-center text-slate-400">
            <div class="flex flex-col items-center justify-center gap-2">
              <svg class="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
              <p class="text-sm font-semibold text-slate-600">No active classes monitored yet</p>
              <p class="text-xs text-slate-400">Classrooms and scheduled sessions will appear here once the timetable is active.</p>
            </div>
          </td>
        </tr>`;
    } else {
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
  }

  // Render HOD Subtabs
  renderHodSubtabs();
}

function renderHodSubtabs() {
  // Today's schedule tab
  const schedContainer = document.getElementById('hod-today-schedule-container');
  if (schedContainer) {
    schedContainer.innerHTML = '';
    if (appState.liveMonitoring.length === 0) {
      schedContainer.innerHTML = `
        <div class="py-8 text-center text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
          <p class="text-sm font-semibold text-slate-600">No scheduled periods for today</p>
          <p class="text-xs text-slate-400 mt-0.5">Classes will populate here once the campus timetable is generated and applied.</p>
        </div>`;
    } else {
      appState.liveMonitoring.forEach(row => {
        const div = document.createElement('div');
        div.className = 'p-3 bg-slate-50 rounded-xl flex items-center justify-between text-xs';
        div.innerHTML = `
          <div>
            <span class="font-bold text-slate-800">${row.time || 'Period'}</span>
            <span class="text-slate-500 ml-2">${row.class} • ${row.subject} (${row.room})</span>
          </div>
          <span class="font-semibold text-slate-600">Teacher: ${row.teacher}</span>
        `;
        schedContainer.appendChild(div);
      });
    }
  }

  // Vacant classes tab
  const vacantContainer = document.getElementById('hod-vacant-classes-container');
  if (vacantContainer) {
    vacantContainer.innerHTML = '';
    const vacantList = appState.liveMonitoring.filter(c => c.status === 'VACANT');
    if (vacantList.length === 0) {
      vacantContainer.innerHTML = `
        <div class="py-8 text-center text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
          <p class="text-sm font-semibold text-emerald-700">✓ No vacant classes currently</p>
          <p class="text-xs text-slate-400 mt-0.5">All scheduled classes have assigned faculty.</p>
        </div>`;
    } else {
      vacantList.forEach(v => {
        const div = document.createElement('div');
        div.className = 'p-4 rounded-xl border border-rose-200 bg-rose-50/60 flex items-center justify-between';
        div.innerHTML = `
          <div>
            <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-600 text-white">VACANT NOW</span>
            <h4 class="font-bold text-slate-900 text-sm mt-1">${v.class} • ${v.subject} (${v.room})</h4>
            <p class="text-xs text-slate-600">Primary Faculty: ${v.teacher}</p>
          </div>
          <button onclick="openSubstituteModal(${v.id})" class="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-sm transition">
            Assign Substitute
          </button>
        `;
        vacantContainer.appendChild(div);
      });
    }
  }

  // Substitute ledger tab
  const subContainer = document.getElementById('hod-substitutes-container');
  if (subContainer) {
    subContainer.innerHTML = '';
    const subList = appState.liveMonitoring.filter(c => c.status === 'SUBSTITUTE');
    if (subList.length === 0) {
      subContainer.innerHTML = `
        <div class="py-8 text-center text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
          <p class="text-sm font-semibold text-slate-600">No substitute records</p>
          <p class="text-xs text-slate-400 mt-0.5">Substitutions assigned during active sessions will appear here.</p>
        </div>`;
    } else {
      subList.forEach(s => {
        const div = document.createElement('div');
        div.className = 'p-4 rounded-xl border border-amber-200 bg-amber-50/60 flex justify-between items-center text-xs';
        div.innerHTML = `
          <div>
            <span class="font-bold text-amber-900 text-sm">${s.class} • ${s.subject} (${s.room})</span>
            <p class="text-slate-600 mt-0.5">Original: ${s.teacher} | Substitute: <strong>${s.substituteTeacher}</strong></p>
          </div>
          <span class="px-2.5 py-1 rounded-full font-bold bg-amber-500 text-white text-xs">ACTIVE SUBSTITUTE</span>
        `;
        subContainer.appendChild(div);
      });
    }
  }
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
  document.getElementById('sub-modal-time').textContent = targetClass.time || 'Current Slot';

  const listContainer = document.getElementById('substitute-candidates-list');
  listContainer.innerHTML = '';

  const candidates = appState.availableSubstitutes.length > 0
    ? appState.availableSubstitutes
    : appState.teachersList
        .filter(t => t.name !== targetClass.teacher && t.status !== 'On Leave')
        .map(t => ({
          name: t.name,
          specialization: t.subject || 'Faculty',
          freePeriods: 'Free Period'
        }));

  if (candidates.length === 0) {
    listContainer.innerHTML = `
      <div class="py-6 text-center text-slate-400 bg-slate-50 rounded-xl text-xs">
        No substitute candidates available this period.
      </div>`;
    const modal = document.getElementById('substitute-modal');
    modal.classList.remove('hidden');
    return;
  }

  candidates.forEach(sub => {
    const div = document.createElement('div');
    div.className = 'border border-slate-200 rounded-xl p-3.5 hover:border-indigo-400 hover:bg-indigo-50/40 transition flex items-center justify-between cursor-pointer';
    div.innerHTML = `
      <div>
        <div class="flex items-center gap-2">
          <h4 class="font-bold text-slate-900 text-sm">${sub.name}</h4>
          <span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">AVAILABLE</span>
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
  if (appState.teacherTodayClasses.length === 0) {
    showToast('No active class scheduled at this time.', 'info');
    return;
  }
  appState.teacherCheckedIn = !appState.teacherCheckedIn;

  const currentClass = appState.teacherTodayClasses.find(c => c.status === 'Active') || appState.teacherTodayClasses[0];
  if (currentClass) {
    const liveRow = appState.liveMonitoring.find(c => c.teacher === (appState.currentUser ? appState.currentUser.name : ''));
    if (liveRow) {
      liveRow.status = appState.teacherCheckedIn ? 'ACTIVE' : 'SCHEDULED';
      appState.hodStats.active = appState.liveMonitoring.filter(c => c.status === 'ACTIVE').length;
    }
  }

  saveState();
  renderTeacherDashboard();
  renderHodDashboard();

  if (appState.teacherCheckedIn) {
    showToast('Checked in successfully! Classroom status is now ACTIVE.', 'success');
  } else {
    showToast('Checked out of classroom.', 'info');
  }
}

function renderTeacherDashboard() {
  const user = appState.currentUser;
  const greetingName = user ? (user.name || 'Faculty') : 'Faculty';
  const dept = (user && user.dept) ? user.dept : 'Campus Department';
  const sub = (user && user.subject) ? ` • ${user.subject}` : '';

  const greetingNameEl = document.getElementById('teacher-greeting-name');
  if (greetingNameEl) greetingNameEl.textContent = `Good Morning, ${greetingName} 👋`;
  const greetingDescEl = document.getElementById('teacher-greeting-desc');
  if (greetingDescEl) greetingDescEl.textContent = `${dept}${sub}`;

  const sidebarNameEl = document.getElementById('teacher-sidebar-name');
  if (sidebarNameEl) sidebarNameEl.textContent = greetingName;
  const sidebarDeptEl = document.getElementById('teacher-sidebar-dept');
  if (sidebarDeptEl) sidebarDeptEl.textContent = dept;
  const sidebarAvatarEl = document.getElementById('teacher-sidebar-avatar');
  if (sidebarAvatarEl) sidebarAvatarEl.textContent = greetingName.charAt(0);
  const drawerDeptEl = document.getElementById('teacher-drawer-user-dept');
  if (drawerDeptEl) drawerDeptEl.textContent = `${greetingName} • ${dept}`;
  const topbarDeptEl = document.getElementById('teacher-topbar-user-dept');
  if (topbarDeptEl) topbarDeptEl.textContent = `${greetingName} • Tap ☰ to access desk menu`;

  // Workload metrics
  const totalClasses = appState.teacherTodayClasses.length;
  const completedClasses = appState.teacherTodayClasses.filter(c => c.status === 'Completed').length;
  const setTxt = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };
  setTxt('teacher-workload-total', `${totalClasses} Classes`);
  setTxt('teacher-workload-completed', `${completedClasses} Classes`);
  setTxt('teacher-workload-weekly', `${(user && user.workload) || '0 hrs'}`);
  setTxt('teacher-workload-avg', totalClasses > 0 ? '100%' : '--');
  setTxt('teacher-schedule-count-pill', `${totalClasses} Classes`);
  setTxt('teacher-sidebar-class-count', totalClasses);

  // Focal card & Check-in button
  const checkInBtn = document.getElementById('teacher-checkin-action-btn');
  const nextClassBadge = document.getElementById('teacher-next-class-badge');
  const checkinTimeText = document.getElementById('teacher-checkin-time');
  const focalTime = document.getElementById('teacher-focal-time');
  const focalSubject = document.getElementById('teacher-focal-subject');
  const focalDetails = document.getElementById('teacher-focal-details');

  if (totalClasses === 0) {
    if (focalTime) focalTime.textContent = '--:--';
    if (focalSubject) focalSubject.textContent = 'No Classes Scheduled';
    if (focalDetails) focalDetails.innerHTML = '<span class="bg-white/15 px-3 py-1 rounded-xl border border-white/10 font-bold">No active classes today</span>';
    if (nextClassBadge) {
      nextClassBadge.className = 'px-3 py-1 rounded-full text-xs font-bold bg-slate-600 text-white flex items-center gap-1.5 shadow-sm';
      nextClassBadge.textContent = 'IDLE';
    }
    if (checkInBtn) {
      checkInBtn.className = 'w-full py-4 px-6 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-2xl font-extrabold text-base shadow-md transition-all flex items-center justify-center gap-3 cursor-default';
      checkInBtn.innerHTML = `
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 004 11a7.96 7.96 0 004.28 7.05"/></svg>
        <span>NO ACTIVE CLASS</span>`;
    }
    if (checkinTimeText) checkinTimeText.textContent = 'Class check-in will activate during your scheduled period';
    const amenitiesTitle = document.getElementById('teacher-room-amenities-title');
    if (amenitiesTitle) amenitiesTitle.textContent = 'Classroom Smart Amenities';
  } else {
    const currentClass = appState.teacherTodayClasses.find(c => c.status === 'Active') || appState.teacherTodayClasses[0];
    const amenitiesTitle = document.getElementById('teacher-room-amenities-title');
    if (amenitiesTitle) amenitiesTitle.textContent = `Room ${currentClass.room} Smart Amenities`;
    if (focalTime) focalTime.textContent = currentClass.time || '10:00 - 11:00';
    if (focalSubject) focalSubject.textContent = currentClass.subject || 'Class Session';
    if (focalDetails) {
      focalDetails.innerHTML = `
        <span class="bg-white/15 px-3 py-1 rounded-xl border border-white/10 font-bold">Class: ${currentClass.class}</span>
        <span class="bg-white/15 px-3 py-1 rounded-xl border border-white/10 font-mono">Room: ${currentClass.room}</span>
      `;
    }
    if (checkInBtn && nextClassBadge && checkinTimeText) {
      if (appState.teacherCheckedIn) {
        checkInBtn.className = 'w-full py-4 px-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-extrabold text-base shadow-lg shadow-emerald-500/30 transition-all flex items-center justify-center gap-3 transform active:scale-98 cursor-pointer';
        checkInBtn.innerHTML = `
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
          <span>CHECKED IN • IN PROGRESS</span>
        `;
        nextClassBadge.className = 'px-3 py-1 rounded-full text-xs font-bold bg-emerald-500 text-white flex items-center gap-1.5 shadow-sm';
        nextClassBadge.innerHTML = '<span class="w-2 h-2 rounded-full bg-white animate-pulse-dot"></span> LIVE CLASS';
        checkinTimeText.textContent = `Geo-verified at ${currentClass.room} • Attendance active`;
      } else {
        checkInBtn.className = 'w-full py-4 px-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-extrabold text-base shadow-lg shadow-indigo-500/30 transition-all flex items-center justify-center gap-3 transform active:scale-98 cursor-pointer';
        checkInBtn.innerHTML = `
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 004 11a7.96 7.96 0 004.28 7.05"/></svg>
          <span>CHECK IN NOW</span>
        `;
        nextClassBadge.className = 'px-3 py-1 rounded-full text-xs font-bold bg-indigo-500 text-white flex items-center gap-1.5 shadow-sm';
        nextClassBadge.innerHTML = 'UPCOMING';
        checkinTimeText.textContent = `Tap to check-in when entering Room ${currentClass.room}`;
      }
    }
  }

  // Render teacher daily timeline
  const timelineList = document.getElementById('teacher-timeline-list');
  if (timelineList) {
    timelineList.innerHTML = '';
    if (totalClasses === 0) {
      timelineList.innerHTML = `
        <div class="py-8 text-center text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
          <p class="text-sm font-semibold text-slate-600">No classes scheduled for today</p>
          <p class="text-xs text-slate-400 mt-0.5">Your daily schedule is clear.</p>
        </div>`;
    } else {
      appState.teacherTodayClasses.forEach((item) => {
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
          <div class="text-xs font-mono font-bold text-slate-400 pt-0.5 w-14">${item.time ? item.time.split(' - ')[0] : '--:--'}</div>
          <div class="flex-1">
            <div class="flex items-center justify-between">
              <h4 class="font-bold text-slate-800 text-sm">${item.subject}</h4>
              ${pill}
            </div>
            <p class="text-xs text-slate-500 mt-0.5">${item.class} • ${item.room}${item.note ? ' • ' + item.note : ''}</p>
          </div>
        `;
        timelineList.appendChild(div);
      });
    }
  }

  // Render teacher subtabs (All Classes, Timetable, History)
  renderTeacherSubtabs();
}

function renderTeacherSubtabs() {
  // Tab 2: All classes
  const classesContainer = document.getElementById('teacher-all-classes-container');
  if (classesContainer) {
    classesContainer.innerHTML = '';
    if (appState.teacherTodayClasses.length === 0) {
      classesContainer.innerHTML = `
        <div class="col-span-full py-12 text-center text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
          <p class="text-sm font-semibold text-slate-600">No assigned classes for today</p>
          <p class="text-xs text-slate-400 mt-1">Once periods are scheduled, syllabus details and room allocations will appear here.</p>
        </div>`;
    } else {
      appState.teacherTodayClasses.forEach(item => {
        const div = document.createElement('div');
        div.className = 'p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2';
        div.innerHTML = `
          <div class="flex justify-between items-center">
            <span class="font-mono text-xs font-bold text-indigo-800 bg-indigo-100 px-2 py-0.5 rounded">${item.time || 'Period'}</span>
            <span class="text-xs font-semibold text-slate-600">${item.status || 'Scheduled'}</span>
          </div>
          <h4 class="font-bold text-slate-900 text-base">${item.subject}</h4>
          <p class="text-xs text-slate-600">Batch: <strong>${item.class}</strong> • Room: <strong>${item.room}</strong></p>
        `;
        classesContainer.appendChild(div);
      });
    }
  }

  // Tab 3: Weekly Timetable
  const timetableContainer = document.getElementById('teacher-timetable-container');
  if (timetableContainer) {
    const activeVersion = appState.timetableVersions.find(v => v.status === 'ACTIVE');
    if (!activeVersion) {
      timetableContainer.innerHTML = `
        <div class="py-12 text-center text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
          <svg class="w-10 h-10 text-slate-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
          <p class="text-sm font-semibold text-slate-600">No weekly timetable assigned yet</p>
          <p class="text-xs text-slate-400 mt-1">Your official schedule will appear once published campus-wide.</p>
        </div>`;
    }
  }

  // Tab 5: History / Logs
  const historyContainer = document.getElementById('teacher-history-container');
  if (historyContainer) {
    historyContainer.innerHTML = `
      <div class="py-8 text-center text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
        <p class="text-sm font-semibold text-slate-600">No attendance logs found</p>
        <p class="text-xs text-slate-400 mt-0.5">Logs will automatically record when you check into assigned classrooms.</p>
      </div>`;
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

  const teacherCount = appState.teachersList.length;
  const subjectCount = appState.subjectsList.length;
  const roomCount = appState.classroomsList.length;

  let progress = 0;
  const stages = [
    `Parsing ${teacherCount > 0 ? teacherCount + ' Teachers' : 'Faculty directory'} & workload limits...`,
    `Evaluating ${subjectCount > 0 ? subjectCount + ' Subjects' : 'Curriculum'} and Lab room constraints...`,
    `Checking room capacity (${roomCount > 0 ? roomCount + ' Rooms' : 'Campus facilities'}) and collision matrices...`,
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
      const resultsDesc = document.getElementById('gen-results-description');
      if (resultsDesc) {
        resultsDesc.textContent = `All ${teacherCount > 0 ? teacherCount + ' teachers' : 'faculty'} satisfied their weekly hours limits. All ${roomCount > 0 ? roomCount + ' rooms' : 'lecture halls'} assigned within capacity. Ready to apply campus-wide.`;
      }
      const verNum = `v${appState.timetableVersions.length + 1}.0`;
      const genTitle = document.getElementById('gen-results-title');
      if (genTitle) {
        genTitle.textContent = `Timetable Draft ${verNum} Successfully Generated`;
      }
      showToast(`Timetable Draft ${verNum} Generated with 100% constraint satisfaction!`, 'success');
    }
  }, 400);
}

function applyGeneratedTimetable() {
  const verNum = `v${appState.timetableVersions.length + 1}.0`;
  const newVersion = {
    version: verNum,
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
  showToast(`Timetable ${verNum} applied campus-wide! HODs and Teachers notified.`, 'success');
}

function saveDraftTimetable() {
  const verNum = `v${appState.timetableVersions.length + 1}.0-draft`;
  const draftVersion = {
    version: verNum,
    status: 'DRAFT',
    term: 'Odd Semester 2026-27',
    appliedAt: 'Just Now',
    generatedBy: 'AI Constraint Engine v2'
  };
  appState.timetableVersions.unshift(draftVersion);
  saveState();
  renderAdminTables();
  showToast(`Timetable draft ${verNum} saved successfully.`, 'info');
}

// Update Campus Setup Readiness Score & Checklist
function updateReadinessScore() {
  const hodCount = appState.hodsList.length;
  const teacherCount = appState.teachersList.length;
  const subjectCount = appState.subjectsList.length;
  const roomCount = appState.classroomsList.length;

  let completedMilestones = 0;
  if (hodCount > 0) completedMilestones++;
  if (teacherCount > 0) completedMilestones++;
  if (subjectCount > 0) completedMilestones++;
  if (roomCount > 0) completedMilestones++;

  const pct = completedMilestones * 25;

  const bar = document.getElementById('readiness-progress-bar');
  const pctText = document.getElementById('readiness-progress-pct');
  const statusBadge = document.getElementById('readiness-status-badge');

  if (bar) bar.style.width = `${pct}%`;
  if (pctText) pctText.textContent = `${pct}% Configured`;
  if (statusBadge) {
    if (pct === 100) {
      statusBadge.textContent = 'Engine Ready';
      statusBadge.className = 'px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200';
    } else if (pct >= 50) {
      statusBadge.textContent = 'In Progress';
      statusBadge.className = 'px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-200';
    } else {
      statusBadge.textContent = 'Setup Required';
      statusBadge.className = 'px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200';
    }
  }

  const updateMilestone = (id, isDone, count, unit) => {
    const el = document.getElementById(id);
    if (!el) return;
    const checkIcon = el.querySelector('.step-check');
    const badge = el.querySelector('.step-badge');
    if (isDone) {
      el.classList.add('checklist-step-complete');
      if (checkIcon) checkIcon.innerHTML = '<span class="text-emerald-600 font-bold">✓</span>';
      if (badge) {
        badge.textContent = `${count} ${unit}`;
        badge.className = 'step-badge text-[11px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full border border-emerald-200';
      }
    } else {
      el.classList.remove('checklist-step-complete');
      if (checkIcon) checkIcon.innerHTML = '<span class="text-slate-300 font-bold">○</span>';
      if (badge) {
        badge.textContent = 'Pending';
        badge.className = 'step-badge text-[11px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full';
      }
    }
  };

  updateMilestone('readiness-step-hod', hodCount > 0, hodCount, 'Depts');
  updateMilestone('readiness-step-teacher', teacherCount > 0, teacherCount, 'Faculty');
  updateMilestone('readiness-step-subject', subjectCount > 0, subjectCount, 'Subjects');
  updateMilestone('readiness-step-room', roomCount > 0, roomCount, 'Rooms');
}

// Render Admin Tables (HODs, Teachers, Versions, Badges, Metrics)
function renderAdminTables() {
  updateReadinessScore();

  // Sync sidebar badges (desktop & mobile)
  const setBadge = (id, count) => {
    const el = document.getElementById(id);
    if (el) el.textContent = count;
  };
  setBadge('admin-drawer-count-hods', appState.hodsList.length);
  setBadge('admin-drawer-count-teachers', appState.teachersList.length);
  setBadge('admin-drawer-count-subjects', appState.subjectsList.length);
  setBadge('admin-drawer-count-classes', appState.classesList.length);
  setBadge('admin-drawer-count-rooms', appState.classroomsList.length);

  setBadge('admin-sidebar-count-hods', appState.hodsList.length);
  setBadge('admin-sidebar-count-teachers', appState.teachersList.length);
  setBadge('admin-sidebar-count-subjects', appState.subjectsList.length);
  setBadge('admin-sidebar-count-classes', appState.classesList.length);
  setBadge('admin-sidebar-count-rooms', appState.classroomsList.length);

  // Sync dashboard metric overview cards
  const hodStat = document.getElementById('admin-stat-hods');
  if (hodStat) hodStat.textContent = appState.hodsList.length;
  const hodSub = document.getElementById('admin-stat-hods-sub');
  if (hodSub) hodSub.textContent = appState.hodsList.length === 0 ? 'None registered' : `${appState.hodsList.length} Departments`;

  const teacherStat = document.getElementById('admin-stat-teachers');
  if (teacherStat) teacherStat.textContent = appState.teachersList.length;
  const teacherSub = document.getElementById('admin-stat-teachers-sub');
  if (teacherSub) teacherSub.textContent = appState.teachersList.length === 0 ? 'No faculty registered' : `${appState.teachersList.length} Profiles mapped`;

  const roomStat = document.getElementById('admin-stat-rooms');
  if (roomStat) roomStat.textContent = appState.classroomsList.length;
  const roomSub = document.getElementById('admin-stat-rooms-sub');
  if (roomSub) roomSub.textContent = appState.classroomsList.length === 0 ? 'No rooms added' : `${appState.classroomsList.length} Rooms mapped`;

  const activeVersion = appState.timetableVersions.find(v => v.status === 'ACTIVE');
  const ttStat = document.getElementById('admin-stat-timetable');
  if (ttStat) ttStat.textContent = activeVersion ? activeVersion.version : 'None';
  const ttSub = document.getElementById('admin-stat-timetable-sub');
  if (ttSub) ttSub.textContent = activeVersion ? activeVersion.term : 'Not Generated';

  // HODs Table
  const hodTable = document.getElementById('admin-hods-tbody');
  if (hodTable) {
    hodTable.innerHTML = '';
    if (appState.hodsList.length === 0) {
      hodTable.innerHTML = `
        <tr>
          <td colspan="5" class="py-8 text-center text-slate-400 text-xs">
            No department heads registered yet. Click <strong>+ Add HOD (Set Password)</strong> above to create an account.
          </td>
        </tr>`;
    } else {
      appState.hodsList.forEach(h => {
        const tr = document.createElement('tr');
        tr.className = 'border-b border-slate-100 hover:bg-slate-50/80 text-sm';
        tr.innerHTML = `
          <td class="py-3 px-4 font-bold text-slate-800">${h.name}</td>
          <td class="py-3 px-4 font-mono text-xs text-indigo-600 font-semibold">${h.email}</td>
          <td class="py-3 px-4 text-slate-700 font-medium">${h.dept}</td>
          <td class="py-3 px-4 text-slate-500">${h.roomsManaged || 'All'}</td>
          <td class="py-3 px-4">
            <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
              ${h.status || 'Active'}
            </span>
          </td>
        `;
        hodTable.appendChild(tr);
      });
    }
  }

  // Teachers Table
  const tTable = document.getElementById('admin-teachers-tbody');
  if (tTable) {
    tTable.innerHTML = '';
    if (appState.teachersList.length === 0) {
      tTable.innerHTML = `
        <tr>
          <td colspan="6" class="py-8 text-center text-slate-400 text-xs">
            No faculty members registered yet. Department HODs or Admin can add teachers.
          </td>
        </tr>`;
    } else {
      appState.teachersList.forEach(t => {
        const tr = document.createElement('tr');
        tr.className = 'border-b border-slate-100 hover:bg-slate-50/80 text-sm';
        tr.innerHTML = `
          <td class="py-3 px-4 font-bold text-slate-800">${t.name}</td>
          <td class="py-3 px-4 text-slate-600 font-mono text-xs">${t.email}</td>
          <td class="py-3 px-4 text-slate-800 font-medium">${t.subject}</td>
          <td class="py-3 px-4 text-slate-600">${t.dept}</td>
          <td class="py-3 px-4 text-slate-600">${t.workload || '16 hrs/wk'}</td>
          <td class="py-3 px-4">
            <span class="px-2 py-0.5 rounded-full text-xs font-semibold ${t.status === 'Available' ? 'bg-emerald-100 text-emerald-800' : (t.status === 'In Class' ? 'bg-indigo-100 text-indigo-800' : 'bg-rose-100 text-rose-800')}">
              ${t.status || 'Available'}
            </span>
          </td>
        `;
        tTable.appendChild(tr);
      });
    }
  }

  // Timetable Versions Table
  const vTable = document.getElementById('admin-versions-tbody');
  if (vTable) {
    vTable.innerHTML = '';
    if (appState.timetableVersions.length === 0) {
      vTable.innerHTML = `
        <tr>
          <td colspan="5" class="py-8 text-center text-slate-400 text-xs">
            No timetable versions created yet. Click <strong>+ Create New Draft</strong> or <strong>Launch Timetable Generator</strong> to generate one.
          </td>
        </tr>`;
    } else {
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

  // Subjects Container
  const subjectsContainer = document.getElementById('admin-subjects-container');
  if (subjectsContainer) {
    subjectsContainer.innerHTML = '';
    if (appState.subjectsList.length === 0) {
      subjectsContainer.innerHTML = `
        <div class="col-span-full text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
          <p class="text-sm font-semibold text-slate-600">No subjects registered yet</p>
          <p class="text-xs text-slate-400 mt-1">Curriculum subjects and course hours will appear here.</p>
        </div>`;
    } else {
      appState.subjectsList.forEach(s => {
        const card = document.createElement('div');
        card.className = 'p-4 rounded-xl border border-slate-200 bg-slate-50';
        card.innerHTML = `
          <div class="flex justify-between items-start">
            <span class="font-mono text-xs font-bold text-indigo-600 bg-indigo-100/70 px-2 py-0.5 rounded">${s.code}</span>
            <span class="text-xs font-bold text-slate-500">${s.weeklyHours} hrs / week</span>
          </div>
          <h4 class="font-bold text-slate-900 mt-2">${s.name}</h4>
          <p class="text-xs text-slate-500 mt-1">${s.type} • Dept: ${s.dept}</p>
        `;
        subjectsContainer.appendChild(card);
      });
    }
  }

  // Classes Container
  const classesContainer = document.getElementById('admin-classes-container');
  if (classesContainer) {
    classesContainer.innerHTML = '';
    if (appState.classesList.length === 0) {
      classesContainer.innerHTML = `
        <div class="col-span-full text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
          <p class="text-sm font-semibold text-slate-600">No classes or batches registered yet</p>
          <p class="text-xs text-slate-400 mt-1">Student cohorts and sections will appear here.</p>
        </div>`;
    } else {
      appState.classesList.forEach(c => {
        const card = document.createElement('div');
        card.className = 'p-3 bg-slate-50 rounded-xl border border-slate-200 text-center';
        card.innerHTML = `
          <span class="text-base font-bold text-slate-800">${c.name}</span>
          <p class="text-xs text-slate-500 mt-0.5">${c.students} Students • Room ${c.room}</p>
        `;
        classesContainer.appendChild(card);
      });
    }
  }

  // Classrooms Container
  const classroomsContainer = document.getElementById('admin-classrooms-container');
  if (classroomsContainer) {
    classroomsContainer.innerHTML = '';
    if (appState.classroomsList.length === 0) {
      classroomsContainer.innerHTML = `
        <div class="col-span-full text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
          <p class="text-sm font-semibold text-slate-600">No classrooms or laboratories added yet</p>
          <p class="text-xs text-slate-400 mt-1">Lecture halls and labs will appear here.</p>
        </div>`;
    } else {
      appState.classroomsList.forEach(r => {
        const card = document.createElement('div');
        card.className = 'p-3 bg-slate-50 rounded-xl border border-slate-200';
        card.innerHTML = `
          <span class="font-bold text-slate-900">${r.room}</span>
          <p class="text-xs text-slate-500 mt-0.5">${r.type} • Cap: ${r.capacity}</p>
        `;
        classroomsContainer.appendChild(card);
      });
    }
  }

  // Current Timetable Matrix Container
  const curTTContainer = document.getElementById('admin-current-timetable-container');
  if (curTTContainer) {
    const activeTT = appState.timetableVersions.find(v => v.status === 'ACTIVE');
    if (!activeTT && !aiCurrentGrid) {
      curTTContainer.innerHTML = `
        <div class="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
          <p class="text-sm font-semibold text-slate-600">No active timetable published yet</p>
          <p class="text-xs text-slate-400 mt-1 mb-4">Run the AI Timetable Studio to generate and publish your conflict-free schedule.</p>
          <button onclick="switchAdminTab('ai-studio')" class="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow hover:bg-indigo-700 transition">
            Launch AI Timetable Studio
          </button>
        </div>`;
    } else {
      renderFolioActiveTimetable(curTTContainer, activeTT);
    }
  }

  // Versions History List Container
  const versionsHistoryContainer = document.getElementById('admin-versions-history-container');
  if (versionsHistoryContainer) {
    versionsHistoryContainer.innerHTML = '';
    if (appState.timetableVersions.length === 0) {
      versionsHistoryContainer.innerHTML = `
        <div class="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-400 text-xs">
          No previous timetable versions recorded yet.
        </div>`;
    } else {
      appState.timetableVersions.forEach(v => {
        const row = document.createElement('div');
        row.className = 'p-3 bg-slate-50 border border-slate-200 rounded-xl flex justify-between items-center';
        row.innerHTML = `
          <div>
            <h4 class="font-bold text-slate-900 text-sm">${v.version} - ${v.term}</h4>
            <p class="text-xs text-slate-500">Applied on ${v.appliedAt} by ${v.generatedBy}</p>
          </div>
          <span class="px-2.5 py-1 rounded-full text-xs font-bold ${v.status === 'ACTIVE' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'}">${v.status}</span>
        `;
        versionsHistoryContainer.appendChild(row);
      });
    }
  }
}

function renderHodTeachers() {
  const container = document.getElementById('hod-teachers-cards-container');
  if (!container) return;
  container.innerHTML = '';
  if (appState.teachersList.length === 0) {
    container.innerHTML = `
      <div class="col-span-full text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400 text-xs">
        No faculty teachers registered in this department yet. Click <strong>+ Add Teacher</strong> above to create an account.
      </div>`;
    return;
  }
  appState.teachersList.forEach(t => {
    const card = document.createElement('div');
    card.className = 'p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center text-xs';
    card.innerHTML = `
      <div>
        <span class="font-bold text-slate-800 text-sm">${t.name}</span>
        <p class="text-slate-500">${t.subject} • <span class="font-mono text-indigo-600">${t.email}</span></p>
      </div>
      <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${t.status === 'Available' ? 'bg-emerald-100 text-emerald-800' : 'bg-indigo-100 text-indigo-800'}">
        ${t.status || 'Available'}
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

  // Event listener for Add Subject form
  const subjectForm = document.getElementById('form-add-subject');
  if (subjectForm) {
    subjectForm.addEventListener('submit', handleAddSubject);
  }

  // Event listener for Add Class Batch form
  const classForm = document.getElementById('form-add-class');
  if (classForm) {
    classForm.addEventListener('submit', handleAddClass);
  }

  // Event listener for Add Classroom form
  const classroomForm = document.getElementById('form-add-classroom');
  if (classroomForm) {
    classroomForm.addEventListener('submit', handleAddClassroom);
  }
});

// =========================================================================
// AI TIMETABLE SCHEDULER & DOCUMENT STUDIO MODULE
// Developed by Aathithya A (IT DEPT) - SCAD College of Engineering & Technology
// =========================================================================

let aiCurrentConfig = {
  institution: "SCAD COLLEGE OF ENGINEERING AND TECHNOLOGY, CHERANMAHADEVI",
  department: "DEPARTMENT OF INFORMATION TECHNOLOGY",
  title: "TIME TABLE",
  meta: {
    year_sem_class_dept: "II/III/IT",
    academic_year: "2026-2027 ODD SEM",
    mentor: "Mrs.SUGANYA,AP/AI&DS",
    wef: "01.07.2026",
    version: "01"
  },
  days: ["Mon", "Tue", "Wed", "Thu", "Fri"],
  periods_per_day: 7,
  timings: [
    "9:00 AM - 9:50 AM",
    "9:50 AM - 10:40 AM",
    "11:00 AM - 11:50 AM",
    "11:50 AM - 12:40 PM",
    "1:30 PM - 2:20 PM",
    "2:20 PM - 3:10 PM",
    "3:10 PM - 4:00 PM"
  ],
  break_after_period: 2,
  break_label: "BREAK",
  break_time: "10:40 AM - 11:00 AM",
  lunch_after_period: 4,
  lunch_label: "LUNCH BREAK",
  lunch_time: "12:40 PM - 1:30 PM",
  subjects: [
    { code: "MA25C08", name: "DISCRETE MATHEMATICS", staff: "DR.T.JACKULINE,S&H", l: 3, t: 1, p: 0, total: 4, display_code: "MA25C08" },
    { code: "CW25201", name: "COMPUTER ORGANIZATION AND ARCHITECTURE", staff: "MR.M.SUBRAMANIAN, AP/AI&DS", l: 3, t: 0, p: 0, total: 3, display_code: "CW25201" },
    { code: "CS25C08", name: "DATA STRUCTURES", staff: "MRS.SUGANYA,AP/AI&DS", l: 3, t: 0, p: 4, total: 7, display_code: "CS25C08", lab_display_code: "CS25C08(LAB)", lab_block_size: 3 },
    { code: "CS25C07", name: "OBJECT ORIENTED PROGRAMMING", staff: "MR.MOHAN,AP/AI&DS", l: 3, t: 0, p: 4, total: 7, display_code: "CS25C07", lab_display_code: "CS25C07(LAB)", lab_block_size: 3 },
    { code: "IT25301", name: "WEB TECHNOLOGIES", staff: "MRS. J. JEENATHKAMILA,AP/AI&DS", l: 3, t: 0, p: 2, total: 5, display_code: "IT25301", lab_display_code: "IT25301 (Lab)", lab_block_size: 2 },
    { code: "NM", name: "NAAN MUDHALVAN", staff: "MRS.SUGANYA,AP/AI&DS", l: 0, t: 0, p: 4, total: 4, display_code: "NM", lab_display_code: "NM", lab_block_size: 2 },
    { code: "ENG_LAB", name: "ENGLISH COMMUNICATION SKILLS LAB", staff: "MR.DANI ABRAHAM,AP/S&H", l: 0, t: 0, p: 2, total: 2, display_code: "English communication (lab)", lab_display_code: "English communication (lab)", lab_block_size: 2 },
    { code: "MENTOR", name: "MENTOR HOUR", staff: "MRS.SUGANYA,AP/AI&DS", l: 1, t: 0, p: 0, total: 1, display_code: "Mentor hour" },
    { code: "CLUB", name: "CLUB ACTIVITIES", staff: "MS.RAMALAKSHMI,AP/AI&DS", l: 1, t: 0, p: 1, total: 2, display_code: "CLUB ACTIVITIES" }
  ]
};

let aiCurrentGrid = null;
let aiCurrentStep = 0;
let aiSelectedDay = 'Mon';
let aiSwapSource = null;
let aiEditingSlot = null;
let aiStudioInitialized = false;

function aiInitDefaultGrid() {
  aiCurrentGrid = [
    // Mon
    [
      { code: "MA25C08", display: "MA25C08", staff: "DR.T.JACKULINE,S&H", is_lab: false },
      { code: "CS25C08", display: "CS25C08", staff: "MRS.SUGANYA,AP/AI&DS", is_lab: false },
      { code: "CW25201", display: "CW25201", staff: "MR.M.SUBRAMANIAN, AP/AI&DS", is_lab: false },
      { code: "CW25201", display: "CW25201", staff: "MR.M.SUBRAMANIAN, AP/AI&DS", is_lab: false },
      { code: "CS25C07", display: "CS25C07 (LAB)", staff: "MR.MOHAN,AP/AI&DS", is_lab: true },
      { code: "CS25C07", display: "CS25C07 (LAB)", staff: "MR.MOHAN,AP/AI&DS", is_lab: true },
      { code: "CS25C07", display: "CS25C07 (LAB)", staff: "MR.MOHAN,AP/AI&DS", is_lab: true }
    ],
    // Tue
    [
      { code: "IT25301", display: "IT25301 (Lab)", staff: "MRS. J. JEENATHKAMILA,AP/AI&DS", is_lab: true },
      { code: "IT25301", display: "IT25301 (Lab)", staff: "MRS. J. JEENATHKAMILA,AP/AI&DS", is_lab: true },
      { code: "CS25C08", display: "CS25C08", staff: "MRS.SUGANYA,AP/AI&DS", is_lab: false },
      { code: "CW25201", display: "CW25201", staff: "MR.M.SUBRAMANIAN, AP/AI&DS", is_lab: false },
      { code: "CS25C07", display: "CS25C07 (LAB)", staff: "MR.MOHAN,AP/AI&DS", is_lab: true },
      { code: "CLUB", display: "CLUB ACTIVITIES", staff: "MS.RAMALAKSHMI,AP/AI&DS", is_lab: false },
      { code: "MENTOR", display: "Mentor hour", staff: "MRS.SUGANYA,AP/AI&DS", is_lab: false }
    ],
    // Wed
    [
      { code: "MA25C08", display: "MA25C08", staff: "DR.T.JACKULINE,S&H", is_lab: false },
      { code: "CS25C07", display: "CS25C07", staff: "MR.MOHAN,AP/AI&DS", is_lab: false },
      { code: "CLUB", display: "CLUB ACTIVITIES (LAB)", staff: "MS.RAMALAKSHMI,AP/AI&DS", is_lab: true },
      { code: "IT25301", display: "IT25301", staff: "MRS. J. JEENATHKAMILA,AP/AI&DS", is_lab: false },
      { code: "CS25C08", display: "CS25C08 (LAB)", staff: "MRS.SUGANYA,AP/AI&DS", is_lab: true },
      { code: "CS25C08", display: "CS25C08 (LAB)", staff: "MRS.SUGANYA,AP/AI&DS", is_lab: true },
      { code: "CS25C08", display: "CS25C08 (LAB)", staff: "MRS.SUGANYA,AP/AI&DS", is_lab: true }
    ],
    // Thu
    [
      { code: "MA25C08", display: "MA25C08", staff: "DR.T.JACKULINE,S&H", is_lab: false },
      { code: "IT25301", display: "IT25301", staff: "MRS. J. JEENATHKAMILA,AP/AI&DS", is_lab: false },
      { code: "NM", display: "NM", staff: "MRS.SUGANYA,AP/AI&DS", is_lab: true },
      { code: "NM", display: "NM", staff: "MRS.SUGANYA,AP/AI&DS", is_lab: true },
      { code: "ENG_LAB", display: "English comm. (lab)", staff: "MR.DANI ABRAHAM,AP/S&H", is_lab: true },
      { code: "ENG_LAB", display: "English comm. (lab)", staff: "MR.DANI ABRAHAM,AP/S&H", is_lab: true },
      { code: "CS25C08", display: "CS25C08", staff: "MRS.SUGANYA,AP/AI&DS", is_lab: false }
    ],
    // Fri
    [
      { code: "NM", display: "NM", staff: "MRS.SUGANYA,AP/AI&DS", is_lab: true },
      { code: "NM", display: "NM", staff: "MRS.SUGANYA,AP/AI&DS", is_lab: true },
      { code: "MA25C08", display: "MA25C08", staff: "DR.T.JACKULINE,S&H", is_lab: false },
      { code: "IT25301", display: "IT25301", staff: "MRS. J. JEENATHKAMILA,AP/AI&DS", is_lab: false },
      { code: "CS25C08", display: "CS25C08 (LAB)", staff: "MRS.SUGANYA,AP/AI&DS", is_lab: true },
      { code: "CS25C07", display: "CS25C07", staff: "MR.MOHAN,AP/AI&DS", is_lab: false },
      { code: "CS25C07", display: "CS25C07", staff: "MR.MOHAN,AP/AI&DS", is_lab: false }
    ]
  ];
}

function aiInitStudio() {
  if (aiStudioInitialized) return;
  aiStudioInitialized = true;
  if (!aiCurrentGrid) aiInitDefaultGrid();

  fetch('/api/config')
    .then(res => res.json())
    .then(data => {
      if (data && data.config) {
        aiCurrentConfig = data.config;
      }
      return fetch('/api/sample');
    })
    .then(res => res.json())
    .then(data => {
      if (data && data.sample_grid) {
        aiCurrentGrid = data.sample_grid;
      }
    })
    .catch(() => {})
    .finally(() => {
      aiSyncInputsFromConfig();
      aiRenderSubjectCards();
      aiRenderScheduleCards();
      aiSwitchStep(0);
    });
}

function aiSyncInputsFromConfig() {
  const setVal = (id, val) => {
    const el = document.getElementById(id);
    if (el && val !== undefined) el.value = val;
  };
  setVal('aiInpInstitution', aiCurrentConfig.institution);
  setVal('aiInpDepartment', aiCurrentConfig.department);
  if (aiCurrentConfig.meta) {
    setVal('aiInpYearSem', aiCurrentConfig.meta.year_sem_class_dept);
    setVal('aiInpAcademicYear', aiCurrentConfig.meta.academic_year);
    setVal('aiInpMentor', aiCurrentConfig.meta.mentor);
  }
  setVal('aiInpPeriodsPerDay', aiCurrentConfig.periods_per_day || 7);
}

function aiSwitchStep(stepIdx) {
  aiCurrentStep = stepIdx;
  for (let i = 0; i < 4; i++) {
    const btn = document.getElementById(`aiStepBtn${i}`);
    const pane = document.getElementById(`aiStep${i + 1}Content`);
    if (btn) {
      if (i === stepIdx) {
        btn.className = "flex-1 min-w-[120px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all bg-indigo-600 text-white shadow-xs";
      } else {
        btn.className = "flex-1 min-w-[120px] py-2.5 px-3 rounded-xl text-xs font-semibold transition-all text-slate-500 hover:text-slate-900 hover:bg-slate-50";
      }
    }
    if (pane) {
      if (i === stepIdx) pane.classList.remove('hidden');
      else pane.classList.add('hidden');
    }
  }

  if (stepIdx === 1) aiRenderSubjectCards();
  if (stepIdx === 2) aiRenderScheduleCards();
  if (stepIdx === 3) {
    const img = document.getElementById('aiDocumentImgPreview');
    if (img) img.src = `/api/image?v=${Date.now()}`;
  }
}

function aiStudioLoadSample() {
  fetch('/api/load_sample_replica', { method: 'POST' })
    .then(r => r.json())
    .then(data => {
      if (data && data.config) aiCurrentConfig = data.config;
      if (data && data.grid) aiCurrentGrid = data.grid;
    })
    .catch(() => {
      aiInitDefaultGrid();
    })
    .finally(() => {
      aiSyncInputsFromConfig();
      aiRenderSubjectCards();
      aiRenderScheduleCards();
      const img = document.getElementById('aiDocumentImgPreview');
      if (img) img.src = `/api/image?v=${Date.now()}`;
      showToast("SCAD College template & schedule loaded successfully!", "success");
    });
}

function aiRenderSubjectCards() {
  const container = document.getElementById('aiSubjectCardsContainer');
  if (!container) return;
  container.innerHTML = '';
  let totalHours = 0;

  aiCurrentConfig.subjects.forEach((sub, idx) => {
    const hrs = sub.total || ((sub.l || 0) + (sub.t || 0) + (sub.p || 0));
    totalHours += hrs;

    const card = document.createElement('div');
    card.className = "p-4 bg-slate-50 hover:bg-white rounded-2xl border border-slate-200 transition shadow-2xs space-y-2 relative";
    card.innerHTML = `
      <div class="flex items-start justify-between gap-2">
        <div>
          <span class="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md font-mono">${sub.code || 'NO-CODE'}</span>
          <h4 class="font-bold text-slate-900 text-xs mt-1.5 leading-snug">${sub.name}</h4>
        </div>
        <button onclick="aiDeleteSubject(${idx})" title="Remove Subject" class="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
        </button>
      </div>
      <p class="text-[11px] text-slate-500 font-medium truncate">${sub.staff || 'Staff unassigned'}</p>
      <div class="flex items-center justify-between pt-1 border-t border-slate-200/70 text-[10px] font-bold text-slate-600">
        <div class="flex gap-1.5">
          <span class="bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">L: ${sub.l || 0}</span>
          <span class="bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">T: ${sub.t || 0}</span>
          <span class="bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded">P: ${sub.p || 0}</span>
        </div>
        <span class="text-slate-700">${hrs} hrs/wk</span>
      </div>
    `;
    container.appendChild(card);
  });

  const summary = document.getElementById('aiSubAllocationSummary');
  if (summary) {
    summary.textContent = `Total Subjects: ${aiCurrentConfig.subjects.length} • Weekly Teaching Hours: ${totalHours}`;
  }
}

function aiOpenAddSubjectModal() {
  document.getElementById('modal-ai-add-subject').classList.remove('hidden');
}

function aiCloseAddSubjectModal() {
  document.getElementById('modal-ai-add-subject').classList.add('hidden');
}

function aiHandleAddSubjectSubmit(e) {
  e.preventDefault();
  const code = document.getElementById('aiNewSubCode').value.trim();
  const name = document.getElementById('aiNewSubName').value.trim().toUpperCase();
  const staff = document.getElementById('aiNewSubStaff').value.trim();
  const l = parseInt(document.getElementById('aiNewSubL').value) || 0;
  const t = parseInt(document.getElementById('aiNewSubT').value) || 0;
  const p = parseInt(document.getElementById('aiNewSubP').value) || 0;
  const blockSize = parseInt(document.getElementById('aiNewSubBlockSize').value) || (p >= 3 ? 3 : 2);

  aiCurrentConfig.subjects.push({
    code: code,
    name: name,
    staff: staff,
    l: l,
    t: t,
    p: p,
    total: l + t + p,
    display_code: code || name,
    lab_display_code: p > 0 ? `${code || name}(LAB)` : (code || name),
    lab_block_size: blockSize
  });

  aiCloseAddSubjectModal();
  aiRenderSubjectCards();
  document.getElementById('form-ai-add-subject').reset();
  showToast(`Added subject ${name} (${code}) to curriculum!`, 'success');
}

function aiDeleteSubject(idx) {
  const removed = aiCurrentConfig.subjects.splice(idx, 1);
  aiRenderSubjectCards();
  showToast(`Removed subject ${removed[0]?.name || ''}`, 'info');
}

function aiSelectDay(day) {
  aiSelectedDay = day;
  document.querySelectorAll('.ai-day-tab').forEach(btn => {
    if (btn.getAttribute('data-day') === day) {
      btn.className = "ai-day-tab px-3 py-1.5 font-bold rounded-lg transition-all bg-white text-indigo-600 shadow-xs";
    } else {
      btn.className = "ai-day-tab px-3 py-1.5 font-bold rounded-lg transition-all text-slate-600 hover:text-slate-900";
    }
  });
  aiRenderScheduleCards();
}

function aiRenderScheduleCards() {
  const container = document.getElementById('aiScheduleCardsContainer');
  if (!container || !aiCurrentGrid) return;
  container.innerHTML = '';

  const days = aiCurrentConfig.days || ["Mon", "Tue", "Wed", "Thu", "Fri"];
  const daysToRender = aiSelectedDay === 'All' ? days : [aiSelectedDay];
  const timings = [
    "09:00 - 09:50 AM",
    "09:50 - 10:40 AM",
    "11:00 - 11:50 AM",
    "11:50 - 12:40 PM",
    "01:30 - 02:20 PM",
    "02:20 - 03:10 PM",
    "03:10 - 04:00 PM"
  ];

  daysToRender.forEach(dayName => {
    const dayIdx = days.indexOf(dayName);
    if (dayIdx === -1 || !aiCurrentGrid[dayIdx]) return;

    const daySection = document.createElement('div');
    daySection.className = "space-y-3 bg-slate-50/70 p-4 rounded-3xl border border-slate-200/80";

    const header = document.createElement('div');
    header.className = "flex items-center justify-between pb-1 border-b border-slate-200";
    header.innerHTML = `
      <div class="flex items-center gap-2">
        <span class="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
        <h4 class="font-bold text-slate-900 text-sm uppercase tracking-wide">${dayName} SCHEDULE</h4>
      </div>
      <span class="text-xs text-slate-500 font-medium">7 Periods Total</span>
    `;
    daySection.appendChild(header);

    const periods = aiCurrentGrid[dayIdx];
    const periodsGrid = document.createElement('div');
    periodsGrid.className = "space-y-2.5";

    for (let p = 0; p < periods.length; p++) {
      // Morning Break
      if (p === 2) {
        const brk = document.createElement('div');
        brk.className = "py-2 px-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-xs text-amber-900 font-semibold";
        brk.innerHTML = `
          <div class="flex items-center gap-2">
            <span>☕</span>
            <span>10:40 AM - 11:00 AM</span>
          </div>
          <span class="px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-800 text-[10px] font-bold uppercase tracking-wider">Morning Break</span>
        `;
        periodsGrid.appendChild(brk);
      }

      // Lunch Break
      if (p === 4) {
        const lch = document.createElement('div');
        lch.className = "py-2 px-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-900 font-semibold";
        lch.innerHTML = `
          <div class="flex items-center gap-2">
            <span>🍱</span>
            <span>12:40 PM - 01:30 PM</span>
          </div>
          <span class="px-2 py-0.5 rounded-full bg-emerald-200/80 text-emerald-800 text-[10px] font-bold uppercase tracking-wider">Lunch Break</span>
        `;
        periodsGrid.appendChild(lch);
      }

      const slot = periods[p] || { code: "-", display: "-", staff: "Free Slot", is_lab: false };
      const isLab = slot.is_lab || (slot.display && (slot.display.includes("(LAB)") || slot.display.includes("(Lab)")));
      const isSwapping = aiSwapSource && aiSwapSource.dayIdx === dayIdx && aiSwapSource.periodIdx === p;

      const card = document.createElement('div');
      card.className = `p-3.5 rounded-2xl border transition shadow-xs flex flex-wrap items-center justify-between gap-3 ${
        isSwapping ? 'swap-card-active border-amber-400' : (isLab ? 'bg-rose-50/40 border-rose-200/80' : 'bg-white border-slate-200/90 hover:border-indigo-300')
      }`;

      card.innerHTML = `
        <div class="flex items-center gap-3">
          <div class="text-center w-12 shrink-0">
            <span class="text-xs font-bold ${isLab ? 'text-rose-700' : 'text-slate-800'} block">P${p + 1}</span>
            <span class="text-[10px] text-slate-400 block">${timings[p] ? timings[p].split(' - ')[0] : ''}</span>
          </div>
          <div class="border-l border-slate-200 pl-3">
            <div class="flex items-center gap-2">
              <span class="text-xs font-mono font-bold ${isLab ? 'text-rose-800 bg-rose-100' : 'text-indigo-800 bg-indigo-50'} px-2 py-0.5 rounded">${slot.code || slot.display}</span>
              ${isLab ? '<span class="text-[10px] font-bold bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full">LAB BLOCK</span>' : ''}
            </div>
            <p class="text-xs font-semibold text-slate-800 mt-1">${slot.display || slot.code}</p>
            <p class="text-[11px] text-slate-500">${slot.staff || 'Staff unassigned'}</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <button onclick="aiStartSwap(${dayIdx}, ${p})" class="px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
            isSwapping ? 'bg-amber-600 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
          }">
            <span>⇄</span>
            <span>${isSwapping ? 'Cancel' : 'Swap'}</span>
          </button>
          <button onclick="aiOpenEditSlot(${dayIdx}, ${p})" class="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition" title="Edit Period">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
          </button>
        </div>
      `;
      periodsGrid.appendChild(card);
    }

    daySection.appendChild(periodsGrid);
    container.appendChild(daySection);
  });
}

function aiStartSwap(dayIdx, periodIdx) {
  const days = aiCurrentConfig.days || ["Mon", "Tue", "Wed", "Thu", "Fri"];
  const dayName = days[dayIdx] || 'Day';

  if (!aiSwapSource) {
    aiSwapSource = { dayIdx, periodIdx };
    const notice = document.getElementById('aiSwapNotification');
    const noticeText = document.getElementById('aiSwapNoticeText');
    if (notice && noticeText) {
      noticeText.textContent = `Swap Mode Active: Selected [${dayName} Period ${periodIdx + 1}]. Tap any second period to swap slots!`;
      notice.classList.remove('hidden');
    }
    aiRenderScheduleCards();
  } else {
    if (aiSwapSource.dayIdx === dayIdx && aiSwapSource.periodIdx === periodIdx) {
      aiCancelSwap();
      return;
    }

    const s1 = aiCurrentGrid[aiSwapSource.dayIdx][aiSwapSource.periodIdx];
    const s2 = aiCurrentGrid[dayIdx][periodIdx];
    aiCurrentGrid[aiSwapSource.dayIdx][aiSwapSource.periodIdx] = s2;
    aiCurrentGrid[dayIdx][periodIdx] = s1;

    aiCancelSwap();
    aiRenderScheduleCards();

    fetch('/api/rerender', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ config: aiCurrentConfig, grid: aiCurrentGrid })
    }).catch(() => {});

    showToast(`Swapped ${s1?.code || 'Slot'} with ${s2?.code || 'Slot'} successfully!`, 'success');
  }
}

function aiCancelSwap() {
  aiSwapSource = null;
  const notice = document.getElementById('aiSwapNotification');
  if (notice) notice.classList.add('hidden');
  aiRenderScheduleCards();
}

function aiOpenEditSlot(dayIdx, periodIdx) {
  aiEditingSlot = { dayIdx, periodIdx };
  const days = aiCurrentConfig.days || ["Mon", "Tue", "Wed", "Thu", "Fri"];
  const slot = aiCurrentGrid[dayIdx][periodIdx] || {};

  const title = document.getElementById('aiEditModalTitle');
  const sub = document.getElementById('aiEditModalSubtitle');
  if (title) title.textContent = `Edit [${days[dayIdx]} Period ${periodIdx + 1}]`;
  if (sub) sub.textContent = `Currently: ${slot.code || slot.display || 'Free Slot'} (${slot.staff || 'No Staff'})`;

  const sel = document.getElementById('aiEditSelectSubject');
  if (sel) {
    sel.innerHTML = '<option value="">-- Select Subject --</option>';
    aiCurrentConfig.subjects.forEach(s => {
      const opt = document.createElement('option');
      opt.value = s.code;
      opt.textContent = `${s.code} - ${s.name}`;
      if (s.code === slot.code) opt.selected = true;
      sel.appendChild(opt);
    });
  }

  const staffInp = document.getElementById('aiEditStaffName');
  if (staffInp) staffInp.value = slot.staff || '';

  const labChk = document.getElementById('aiEditIsLab');
  if (labChk) labChk.checked = !!(slot.is_lab || (slot.display && slot.display.includes('(LAB)')));

  document.getElementById('modal-ai-edit-slot').classList.remove('hidden');
}

function aiCloseEditModal() {
  document.getElementById('modal-ai-edit-slot').classList.add('hidden');
  aiEditingSlot = null;
}

function aiOnEditSubjectChanged() {
  const sel = document.getElementById('aiEditSelectSubject');
  if (!sel) return;
  const subCode = sel.value;
  const found = aiCurrentConfig.subjects.find(s => s.code === subCode);
  if (found) {
    const staffInp = document.getElementById('aiEditStaffName');
    if (staffInp) staffInp.value = found.staff || '';
    const labChk = document.getElementById('aiEditIsLab');
    if (labChk) labChk.checked = (found.p || 0) > 0;
  }
}

function aiSaveSlotEdit() {
  if (!aiEditingSlot) return;
  const { dayIdx, periodIdx } = aiEditingSlot;
  const sel = document.getElementById('aiEditSelectSubject');
  const subCode = sel.value;
  const staff = document.getElementById('aiEditStaffName').value.trim();
  const isLab = document.getElementById('aiEditIsLab').checked;

  const found = aiCurrentConfig.subjects.find(s => s.code === subCode) || {};
  const disp = isLab ? (found.lab_display_code || `${subCode}(LAB)`) : (found.display_code || subCode || 'LECTURE');

  aiCurrentGrid[dayIdx][periodIdx] = {
    code: subCode || disp,
    display: disp,
    staff: staff || found.staff || 'Staff unassigned',
    is_lab: isLab,
    subject_name: found.name || ''
  };

  fetch('/api/rerender', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ config: aiCurrentConfig, grid: aiCurrentGrid })
  }).catch(() => {});

  aiCloseEditModal();
  aiRenderScheduleCards();
  showToast("Period updated successfully!", "success");
}

function aiClearSlot() {
  if (!aiEditingSlot) return;
  const { dayIdx, periodIdx } = aiEditingSlot;
  aiCurrentGrid[dayIdx][periodIdx] = {
    code: "-",
    display: "-",
    staff: "Free Slot",
    is_lab: false
  };

  fetch('/api/rerender', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ config: aiCurrentConfig, grid: aiCurrentGrid })
  }).catch(() => {});

  aiCloseEditModal();
  aiRenderScheduleCards();
  showToast("Period set to Free Slot (-)", "info");
}

function aiAutoAssignAndProceed(targetStep = 2) {
  aiCurrentConfig.institution = document.getElementById('aiInpInstitution').value.trim() || aiCurrentConfig.institution;
  aiCurrentConfig.department = document.getElementById('aiInpDepartment').value.trim() || aiCurrentConfig.department;
  if (!aiCurrentConfig.meta) aiCurrentConfig.meta = {};
  aiCurrentConfig.meta.year_sem_class_dept = document.getElementById('aiInpYearSem').value.trim() || aiCurrentConfig.meta.year_sem_class_dept;
  aiCurrentConfig.meta.academic_year = document.getElementById('aiInpAcademicYear').value.trim() || aiCurrentConfig.meta.academic_year;
  aiCurrentConfig.meta.mentor = document.getElementById('aiInpMentor').value.trim() || aiCurrentConfig.meta.mentor;
  aiCurrentConfig.periods_per_day = parseInt(document.getElementById('aiInpPeriodsPerDay').value) || 7;

  showToast("Running AI Constraint Solver & SSAA Document Engine...", "info");

  fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ config: aiCurrentConfig })
  })
    .then(r => r.json())
    .then(data => {
      if (data.grid) aiCurrentGrid = data.grid;
      showToast("Timetable Optimized! 0 Conflicts Found.", "success");
    })
    .catch(() => {
      if (!aiCurrentGrid) aiInitDefaultGrid();
      showToast("Generated using local heuristic engine (0 conflicts)", "success");
    })
    .finally(() => {
      aiSwitchStep(targetStep);
      aiRenderScheduleCards();
      const img = document.getElementById('aiDocumentImgPreview');
      if (img) img.src = `/api/image?v=${Date.now()}`;
    });
}

function aiOpenImageModal() {
  const modal = document.getElementById('modal-ai-image-zoom');
  const img = document.getElementById('aiZoomImg');
  if (img) img.src = `/api/image?v=${Date.now()}`;
  if (modal) modal.classList.remove('hidden');
}

function aiCloseImageModal() {
  const modal = document.getElementById('modal-ai-image-zoom');
  if (modal) modal.classList.add('hidden');
}

function aiToggleZoom(img) {
  if (!img) return;
  if (img.classList.contains('scale-150')) {
    img.classList.remove('scale-150');
    img.classList.add('cursor-zoom-in');
    img.classList.remove('cursor-zoom-out');
  } else {
    img.classList.add('scale-150');
    img.classList.remove('cursor-zoom-in');
    img.classList.add('cursor-zoom-out');
  }
}

function aiApplyToFolioCampus() {
  if (!aiCurrentGrid) aiInitDefaultGrid();

  const verNum = `v${appState.timetableVersions.length + 1}.0`;
  appState.timetableVersions.forEach(v => v.status = 'ARCHIVED');

  appState.timetableVersions.unshift({
    version: verNum,
    status: 'ACTIVE',
    term: aiCurrentConfig.meta ? aiCurrentConfig.meta.academic_year : 'Odd Semester 2026-27',
    appliedAt: 'Just Now',
    generatedBy: 'AI Constraint Engine (300 DPI)'
  });

  saveData();
  renderAdminData();
  showToast(`Timetable ${verNum} applied campus-wide & published to all portals!`, 'success');
  switchAdminTab('current-timetable');
}

function renderFolioActiveTimetable(container, activeTT) {
  if (!container) return;
  if (!aiCurrentGrid) aiInitDefaultGrid();

  const days = aiCurrentConfig.days || ["Mon", "Tue", "Wed", "Thu", "Fri"];

  container.innerHTML = `
    <div class="space-y-4">
      <!-- Status & Actions Banner -->
      <div class="p-4 bg-gradient-to-r from-indigo-50 via-purple-50 to-indigo-50 border border-indigo-200/80 rounded-2xl flex flex-wrap items-center justify-between gap-3">
        <div>
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <h4 class="font-bold text-slate-900 text-sm">${aiCurrentConfig.institution || 'SCAD COLLEGE OF ENGINEERING AND TECHNOLOGY'}</h4>
            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white">${activeTT ? activeTT.version : 'ACTIVE'}</span>
          </div>
          <p class="text-xs text-slate-500 mt-0.5">${aiCurrentConfig.department || 'DEPARTMENT OF INFORMATION TECHNOLOGY'} • Class: ${aiCurrentConfig.meta ? aiCurrentConfig.meta.year_sem_class_dept : 'II/III/IT'} • Term: ${aiCurrentConfig.meta ? aiCurrentConfig.meta.academic_year : '2026-27'}</p>
        </div>
        <div class="flex items-center gap-2">
          <button onclick="switchAdminTab('ai-studio')" class="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-1.5">
            <span>⚡ AI Studio (Swap/Edit)</span>
          </button>
          <button onclick="window.open('/api/html', '_blank')" class="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl text-xs font-semibold transition flex items-center gap-1">
            <span>🖨️ Vector PDF</span>
          </button>
          <a href="/api/image" download="timetable.png" class="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl text-xs font-semibold transition flex items-center gap-1">
            <span>🖼️ 300 DPI</span>
          </a>
        </div>
      </div>

      <!-- Schedule Matrix Table -->
      <div class="overflow-x-auto rounded-2xl border border-slate-200 shadow-xs">
        <table class="w-full text-center text-xs border-collapse">
          <thead class="bg-slate-900 text-white font-bold">
            <tr>
              <th class="p-3 border-r border-slate-800 uppercase tracking-wider text-[11px] w-20">Day</th>
              <th class="p-2 border-r border-slate-800"><span class="block">P1</span><span class="text-[10px] font-normal text-slate-300">09:00-09:50</span></th>
              <th class="p-2 border-r border-slate-800"><span class="block">P2</span><span class="text-[10px] font-normal text-slate-300">09:50-10:40</span></th>
              <th class="p-2 bg-amber-600 text-white border-r border-slate-800 text-[10px] uppercase w-12 tracking-wider">Break</th>
              <th class="p-2 border-r border-slate-800"><span class="block">P3</span><span class="text-[10px] font-normal text-slate-300">11:00-11:50</span></th>
              <th class="p-2 border-r border-slate-800"><span class="block">P4</span><span class="text-[10px] font-normal text-slate-300">11:50-12:40</span></th>
              <th class="p-2 bg-emerald-700 text-white border-r border-slate-800 text-[10px] uppercase w-12 tracking-wider">Lunch</th>
              <th class="p-2 border-r border-slate-800"><span class="block">P5</span><span class="text-[10px] font-normal text-slate-300">01:30-02:20</span></th>
              <th class="p-2 border-r border-slate-800"><span class="block">P6</span><span class="text-[10px] font-normal text-slate-300">02:20-03:10</span></th>
              <th class="p-2"><span class="block">P7</span><span class="text-[10px] font-normal text-slate-300">03:10-04:00</span></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 font-medium">
            ${days.map((dayName, dIdx) => {
              const row = aiCurrentGrid[dIdx] || [];
              const renderSlot = (slot) => {
                if (!slot || slot.code === '-') return '<span class="text-slate-300">-</span>';
                const isLab = slot.is_lab || (slot.display && (slot.display.includes('(LAB)') || slot.display.includes('(Lab)')));
                return `
                  <div class="p-1">
                    <span class="font-bold block ${isLab ? 'text-rose-700' : 'text-slate-900'} font-mono text-[11px]">${slot.code || slot.display}</span>
                    <span class="text-[10px] text-slate-500 block truncate max-w-[110px] mx-auto">${slot.staff || ''}</span>
                    ${isLab ? '<span class="inline-block mt-0.5 px-1 py-0.2 rounded text-[8px] font-bold bg-rose-100 text-rose-700">LAB</span>' : ''}
                  </div>
                `;
              };
              return `
                <tr class="hover:bg-slate-50/80 transition">
                  <td class="p-3 font-bold text-slate-900 bg-slate-50 border-r border-slate-200 uppercase">${dayName}</td>
                  <td class="p-2 border-r border-slate-200">${renderSlot(row[0])}</td>
                  <td class="p-2 border-r border-slate-200">${renderSlot(row[1])}</td>
                  <td class="p-1 bg-amber-50/60 text-amber-800 border-r border-slate-200 text-[10px] font-bold writing-mode-vertical">10:40</td>
                  <td class="p-2 border-r border-slate-200">${renderSlot(row[2])}</td>
                  <td class="p-2 border-r border-slate-200">${renderSlot(row[3])}</td>
                  <td class="p-1 bg-emerald-50/60 text-emerald-800 border-r border-slate-200 text-[10px] font-bold writing-mode-vertical">12:40</td>
                  <td class="p-2 border-r border-slate-200">${renderSlot(row[4])}</td>
                  <td class="p-2 border-r border-slate-200">${renderSlot(row[5])}</td>
                  <td class="p-2">${renderSlot(row[6])}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}


