(() => {
  // Firebase Configuration
  const firebaseConfig = {
    apiKey: "AIzaSyA-lb3k-d38wcS3DXKHvY_YDNQ_sBXXnR8",
    authDomain: "alfawrogowie.firebaseapp.com",
    databaseURL: "https://alfawrogowie-default-rtdb.firebaseio.com",
    projectId: "alfawrogowie",
    storageBucket: "alfawrogowie.firebasestorage.app",
    messagingSenderId: "406592259974",
    appId: "1:406592259974:web:d78f924ccd243a4bf50e07"
  };

  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  const auth = firebase.auth();
  const database = firebase.database();

  // DOM Elements
  const authScreen = document.getElementById('auth-screen');
  const appScreen = document.getElementById('app');
  const googleAuthBtn = document.getElementById('google-auth-btn');
  const googleAuthStep = document.getElementById('google-auth-step');
  const pendingApproval = document.getElementById('pending-approval');
  const accountBlocked = document.getElementById('account-blocked');
  const authError = document.getElementById('auth-error');
  const logoutBtn = document.getElementById('logout-btn');
  const userMenuBtn = document.getElementById('user-menu-btn');
  const userDropdown = document.getElementById('user-dropdown');
  const userAvatarText = document.getElementById('user-avatar-text');
  const dropdownAvatarText = document.getElementById('dropdown-avatar-text');
  const userEmailSpan = document.getElementById('user-email');
  const userRoleSpan = document.getElementById('user-role');
  const messagesArea = document.getElementById('messages-area');
  const chatForm = document.getElementById('chat-form');
  const messageInput = document.getElementById('message-input');
  const onlineCount = document.getElementById('online-count');
  const toast = document.getElementById('toast');
  const contextMenu = document.getElementById('context-menu');
  const copyMessageBtn = document.getElementById('copy-message');
  const deleteMessageBtn = document.getElementById('delete-message');
  const chatPanel = document.getElementById('chat-panel');
  const chatDisabled = document.getElementById('chat-disabled');

  // Admin Panel Elements
  const adminPanelBtn = document.getElementById('admin-panel-btn');
  const adminPanel = document.getElementById('admin-panel');
  const closeAdminPanel = document.getElementById('close-admin-panel');
  const adminNotifications = document.getElementById('admin-notifications');
  const requestsCount = document.getElementById('requests-count');
  const usersCount = document.getElementById('users-count');
  const requestsList = document.getElementById('requests-list');
  const usersList = document.getElementById('users-list');
  const usersSearchInput = document.getElementById('users-search');

  // User Settings Modal
  const userSettingsModal = document.getElementById('user-settings-modal');
  const closeUserSettings = document.getElementById('close-user-settings');
  const settingsUserEmail = document.getElementById('settings-user-email');
  const settingsUserJoined = document.getElementById('settings-user-joined');
  const settingsUserAvatar = document.getElementById('settings-user-avatar');
  const userChatEnabled = document.getElementById('user-chat-enabled');
  const tempBlockBtn = document.getElementById('temp-block-btn');
  const permBlockBtn = document.getElementById('perm-block-btn');
  const securityBlockBtn = document.getElementById('security-block-btn');
  const unblockBtn = document.getElementById('unblock-btn');
  const tempBlockForm = document.getElementById('temp-block-form');
  const confirmTempBlock = document.getElementById('confirm-temp-block');
  const saveUserSettings = document.getElementById('save-user-settings');

  // Settings Tab
  const globalChatEnabled = document.getElementById('global-chat-enabled');
  const autoApprove = document.getElementById('auto-approve');

  // Cipher elements
  const inputEl = document.getElementById('input');
  const outputEl = document.getElementById('output');
  const btnCopyIn = document.getElementById('btn-copy-in');
  const btnCopyOut = document.getElementById('btn-copy-out');
  const btnClear = document.getElementById('btn-clear');
  const btnSwap = document.getElementById('btn-swap');
  const btnEncode = document.getElementById('btn-encode');
  const btnDecode = document.getElementById('btn-decode');
  const inputCount = document.getElementById('input-count');
  const outputCount = document.getElementById('output-count');
  const ambiguityWrap = document.getElementById('ambiguity-wrap');
  const ambiguitySelect = document.getElementById('ambiguity-select');

  // State
  let currentUser = null;
  let currentUserData = null;
  let isAdmin = false;
  let cipherMode = 'encode';
  let ambiguityPreference = 'ę';
  let userPresenceRef = null;
  let selectedMessageId = null;
  let selectedMessageText = null;
  let selectedUserId = null;
  let pendingRequests = {};
  let allUsers = {};
  let globalSettings = {
    chatEnabled: true,
    autoApprove: false
  };
  let blockCheckInterval = null;

  // Cipher Map
  const cipherMap = {
    'a': '⧫', 'ą': '⚯', 'b': '⨀', 'c': '⧗', 'ć': '⧼',
    'd': '⊶', 'e': '⌇', 'ę': '⍟', 'f': '⏃', 'g': '⌖',
    'h': '⌬', 'i': '⍙', 'j': '⎔', 'k': '⧙', 'l': '⧉',
    'ł': '⧻', 'm': '⧴', 'n': '⌻', 'ń': '⏇', 'o': '⏀',
    'ó': '⏂', 'p': '⏉', 'q': '⍾', 'r': '⍛', 's': '⍭',
    'ś': '⍟', 't': '⌆', 'u': '⌑', 'v': '⌄', 'w': '⏊',
    'x': '⎊', 'y': '⍤', 'z': '⌯', 'ź': '⌰', 'ż': '⏁'
  };

  const reverseMap = {};
  Object.entries(cipherMap).forEach(([letter, symbol]) => {
    if (!reverseMap[symbol]) reverseMap[symbol] = [];
    reverseMap[symbol].push(letter);
  });

  // Utility Functions
  function showToast(msg, type = 'info') {
    const toastMessage = toast.querySelector('.toast-message');
    toastMessage.textContent = msg;
    toast.className = `toast-notification show ${type}`;
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }

  function showAuthError(msg) {
    authError.textContent = msg;
    authError.classList.add('show');
    setTimeout(() => authError.classList.remove('show'), 5000);
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function formatDate(timestamp) {
    if (!timestamp) return '-';
    return new Date(timestamp).toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function calculateBlockExpiry(months = 0, days = 0, hours = 0, minutes = 0, seconds = 0) {
    const now = Date.now();
    const duration = 
      (months * 30 * 24 * 60 * 60 * 1000) +
      (days * 24 * 60 * 60 * 1000) +
      (hours * 60 * 60 * 1000) +
      (minutes * 60 * 1000) +
      (seconds * 1000);
    return now + duration;
  }

  function formatRemainingTime(expiry) {
    const now = Date.now();
    const remaining = expiry - now;
    
    if (remaining <= 0) return 'Wygasła';
    
    const days = Math.floor(remaining / (24 * 60 * 60 * 1000));
    const hours = Math.floor((remaining % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
    
    const parts = [];
    if (days > 0) parts.push(`${days} ${days === 1 ? 'dzień' : 'dni'}`);
    if (hours > 0) parts.push(`${hours} ${hours === 1 ? 'godzina' : 'godzin'}`);
    if (minutes > 0) parts.push(`${minutes} ${minutes === 1 ? 'minuta' : 'minut'}`);
    
    return parts.length > 0 ? parts.join(', ') : 'Mniej niż minuta';
  }

  // Real-time block monitoring
  function startBlockMonitoring() {
    if (!currentUser || isAdmin) return;
    
    // Clear existing interval
    if (blockCheckInterval) {
      clearInterval(blockCheckInterval);
    }
    
    // Check every 5 seconds for block status
    blockCheckInterval = setInterval(async () => {
      if (!currentUser) {
        clearInterval(blockCheckInterval);
        return;
      }
      
      try {
        const userSnapshot = await database.ref(`users/${currentUser.uid}`).once('value');
        const userData = userSnapshot.val();
        
        if (userData && userData.blocked) {
          // User got blocked - kick them out immediately
          clearInterval(blockCheckInterval);
          
          // Force logout
          appScreen.style.display = 'none';
          authScreen.style.display = 'flex';
          
          // Show blocked screen
          showBlockedScreen(userData);
          
          // Clean up
          if (userPresenceRef) {
            await userPresenceRef.remove();
          }
          
          showToast('Twoje konto zostało zablokowane', 'error');
        }
      } catch (error) {
        console.error('Block monitoring error:', error);
      }
    }, 5000); // Check every 5 seconds
  }

  // CHECK IF FIRST USER (ADMIN)
  async function isFirstUser() {
    try {
      const snapshot = await database.ref('system/administrator').once('value');
      return !snapshot.exists();
    } catch (error) {
      console.error('Error checking first user:', error);
      try {
        const usersSnapshot = await database.ref('users').once('value');
        return !usersSnapshot.exists() || usersSnapshot.numChildren() === 0;
      } catch (err) {
        console.error('Error checking users:', err);
        return false;
      }
    }
  }

  // ADMIN SYSTEM
  async function checkIfUserIsAdmin(userId) {
    try {
      const adminSnapshot = await database.ref('system/administrator').once('value');
      if (adminSnapshot.exists()) {
        const adminData = adminSnapshot.val();
        return adminData.uid === userId;
      }
      
      const userSnapshot = await database.ref(`users/${userId}/isAdmin`).once('value');
      return userSnapshot.val() === true;
    } catch (error) {
      console.error('Error checking admin:', error);
      return false;
    }
  }

  async function handleUserLogin(user) {
    try {
      console.log('📝 Processing user login:', user.email);
      
      const firstUser = await isFirstUser();
      
      if (firstUser) {
        console.log('🎉 First user detected - setting as admin');
        
        const adminData = {
          email: user.email,
          displayName: user.displayName || user.email.split('@')[0],
          photoURL: user.photoURL || null,
          createdAt: firebase.database.ServerValue.TIMESTAMP,
          lastLogin: firebase.database.ServerValue.TIMESTAMP,
          role: 'administrator',
          isAdmin: true,
          approved: true,
          chatEnabled: true,
          blocked: false,
          provider: 'google.com'
        };
        
        await database.ref(`users/${user.uid}`).set(adminData);
        await database.ref('system/administrator').set({
          uid: user.uid,
          email: user.email,
          setAt: firebase.database.ServerValue.TIMESTAMP,
          locked: true
        });
        
        isAdmin = true;
        currentUserData = adminData;
        
        showApp(user);
        
      } else {
        const userSnapshot = await database.ref(`users/${user.uid}`).once('value');
        
        if (userSnapshot.exists()) {
          console.log('✅ Existing user found:', user.email);
          currentUserData = userSnapshot.val();
          
          await database.ref(`users/${user.uid}/lastLogin`).set(firebase.database.ServerValue.TIMESTAMP);
          
          isAdmin = currentUserData.isAdmin === true || await checkIfUserIsAdmin(user.uid);
          
          if (currentUserData.blocked) {
            if (!currentUserData.blockPermanent && currentUserData.blockExpiry && Date.now() >= currentUserData.blockExpiry) {
              await database.ref(`users/${user.uid}`).update({
                blocked: false,
                blockExpiry: null,
                blockReason: null
              });
              currentUserData.blocked = false;
              showApp(user);
            } else {
              showBlockedScreen(currentUserData);
            }
          } else if (currentUserData.approved || isAdmin) {
            showApp(user);
          } else {
            showPendingScreen(user);
          }
          
        } else {
          const requestSnapshot = await database.ref(`accessRequests/${user.uid}`).once('value');
          
          if (requestSnapshot.exists()) {
            const requestData = requestSnapshot.val();
            console.log('📋 Existing request found:', requestData.status);
            
            if (requestData.status === 'pending') {
              showPendingScreen(user);
            } else if (requestData.status === 'rejected') {
              showAuthError('Twoja prośba o dostęp została odrzucona');
              await auth.signOut();
            } else if (requestData.status === 'approved') {
              await createUserFromRequest(user.uid, requestData);
              showApp(user);
            }
          } else {
            console.log('🆕 New user - creating access request');
            
            await database.ref(`accessRequests/${user.uid}`).set({
              uid: user.uid,
              email: user.email,
              displayName: user.displayName || user.email.split('@')[0],
              photoURL: user.photoURL || null,
              requestedAt: firebase.database.ServerValue.TIMESTAMP,
              status: 'pending'
            });
            
            showPendingScreen(user);
            showToast('Prośba o dostęp została wysłana do administratora', 'info');
          }
        }
      }
    } catch (error) {
      console.error('❌ Error handling user login:', error);
      showAuthError('Błąd podczas logowania. Spróbuj ponownie.');
    }
  }

  async function createUserFromRequest(uid, requestData) {
    const userData = {
      email: requestData.email,
      displayName: requestData.displayName,
      photoURL: requestData.photoURL,
      createdAt: firebase.database.ServerValue.TIMESTAMP,
      lastLogin: firebase.database.ServerValue.TIMESTAMP,
      role: 'user',
      isAdmin: false,
      approved: true,
      chatEnabled: true,
      blocked: false,
      provider: 'google.com'
    };
    
    await database.ref(`users/${uid}`).set(userData);
    currentUserData = userData;
  }

  function showApp(user) {
    console.log('✅ Showing app for:', user.email);
    
    const initial = (user.displayName || user.email)[0].toUpperCase();
    userAvatarText.textContent = isAdmin ? 'A' : initial;
    dropdownAvatarText.textContent = isAdmin ? 'A' : initial;
    userEmailSpan.textContent = user.email;
    userRoleSpan.textContent = isAdmin ? 'Administrator' : 'Użytkownik';
    
    if (isAdmin) {
      userMenuBtn.classList.add('admin');
      userRoleSpan.classList.add('admin');
      document.querySelector('.dropdown-avatar').style.background = 
        'linear-gradient(135deg, #ff5757, #ff8080)';
      setupAdminPanel();
      console.log('👑 Logged as ADMINISTRATOR');
    } else {
      userMenuBtn.classList.remove('admin');
      userRoleSpan.classList.remove('admin');
      adminPanelBtn.style.display = 'none';
      console.log('👤 Logged as USER');
      
      // Start monitoring for blocks (only for non-admin users)
      startBlockMonitoring();
    }
    
    if (currentUserData && (!globalSettings.chatEnabled || currentUserData.chatEnabled === false)) {
      chatForm.style.display = 'none';
      chatDisabled.style.display = 'flex';
    } else {
      chatForm.style.display = 'flex';
      chatDisabled.style.display = 'none';
    }
    
    authScreen.style.display = 'none';
    appScreen.style.display = 'block';
    
    setupPresence();
    startChatListeners();
    
    showToast(`Witaj ${user.displayName || user.email}!`, 'success');
  }

  function showPendingScreen(user) {
    console.log('⏳ Showing pending screen for:', user.email);
    googleAuthStep.style.display = 'none';
    pendingApproval.style.display = 'block';
    accountBlocked.style.display = 'none';
    document.querySelector('.pending-email').textContent = user.email;
  }

  function showBlockedScreen(userData) {
    console.log('🚫 Showing blocked screen');
    googleAuthStep.style.display = 'none';
    pendingApproval.style.display = 'none';
    accountBlocked.style.display = 'block';
    
    let blockReason = userData.blockReason || 'Konto zablokowane';
    if (userData.blockReason === 'security') {
      blockReason = 'Konto zablokowane ze względów bezpieczeństwa';
    }
    
    document.getElementById('block-reason-text').textContent = blockReason;
    
    const blockExpiresEl = document.getElementById('block-expires');
    if (!userData.blockPermanent && userData.blockExpiry) {
      if (Date.now() < userData.blockExpiry) {
        blockExpiresEl.textContent = `Blokada wygasa za: ${formatRemainingTime(userData.blockExpiry)}`;
        blockExpiresEl.style.display = 'block';
      } else {
        blockExpiresEl.style.display = 'none';
      }
    } else if (userData.blockPermanent) {
      blockExpiresEl.textContent = 'Blokada permanentna';
      blockExpiresEl.style.display = 'block';
    } else {
      blockExpiresEl.style.display = 'none';
    }
  }

  // Global Settings Management
  async function loadGlobalSettings() {
    try {
      const settingsRef = database.ref('system/settings');
      const snapshot = await settingsRef.once('value');
      
      if (snapshot.exists()) {
        globalSettings = { ...globalSettings, ...snapshot.val() };
      }
      
      if (globalChatEnabled) globalChatEnabled.checked = globalSettings.chatEnabled;
      if (autoApprove) autoApprove.checked = globalSettings.autoApprove;
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  }

  async function saveGlobalSettings() {
    try {
      await database.ref('system/settings').update(globalSettings);
      showToast('Ustawienia zapisane', 'success');
    } catch (error) {
      console.error('Error saving settings:', error);
      showToast('Błąd zapisu ustawień', 'error');
    }
  }

  // Admin Panel Functions
  function setupAdminPanel() {
    if (!isAdmin) {
      if (adminPanelBtn) adminPanelBtn.style.display = 'none';
      if (adminNotifications) adminNotifications.style.display = 'none';
      return;
    }
    
    console.log('🔧 Setting up admin panel');
    
    if (adminPanelBtn) adminPanelBtn.style.display = 'flex';
    if (adminNotifications) adminNotifications.style.display = 'block';
    
    loadGlobalSettings();
    
    const requestsRef = database.ref('accessRequests');
    requestsRef.on('value', (snapshot) => {
      pendingRequests = {};
      let pendingCount = 0;
      
      if (snapshot.exists()) {
        snapshot.forEach((child) => {
          const request = child.val();
          if (request.status === 'pending') {
            pendingRequests[child.key] = request;
            pendingCount++;
          }
        });
      }
      
      console.log(`📬 Pending requests: ${pendingCount}`);
      
      if (adminNotifications) {
        const badgeCount = adminNotifications.querySelector('.badge-count');
        if (badgeCount) badgeCount.textContent = pendingCount;
        adminNotifications.style.display = pendingCount > 0 ? 'block' : 'none';
      }
      
      if (requestsCount) requestsCount.textContent = pendingCount;
      
      renderAccessRequests();
      
      if (pendingCount > 0) {
        showToast(`Masz ${pendingCount} ${pendingCount === 1 ? 'nową prośbę' : 'nowe prośby'} o dostęp`, 'info');
      }
    });
    
    const usersRef = database.ref('users');
    usersRef.on('value', (snapshot) => {
      allUsers = {};
      
      if (snapshot.exists()) {
        snapshot.forEach((child) => {
          const userData = child.val();
          // Only show approved non-admin users in the list
          if (userData.approved && !userData.isAdmin) {
            allUsers[child.key] = userData;
          }
        });
      }
      
      if (usersCount) usersCount.textContent = Object.keys(allUsers).length;
      renderUsersList();
    });
  }

  function renderAccessRequests() {
    if (!requestsList) return;
    
    const pendingArray = Object.entries(pendingRequests);
    
    if (pendingArray.length === 0) {
      requestsList.innerHTML = `
        <div class="empty-state">
          <span>📭</span>
          <p>Brak nowych próśb o dostęp</p>
        </div>
      `;
      return;
    }
    
    requestsList.innerHTML = pendingArray.map(([uid, request]) => `
      <div class="request-item" data-uid="${uid}">
        <div class="request-info">
          <div class="request-avatar">
            ${request.photoURL ? 
              `<img src="${request.photoURL}" alt="${request.displayName}" />` :
              `<span>${(request.displayName || request.email)[0].toUpperCase()}</span>`
            }
          </div>
          <div class="request-details">
            <h4>${escapeHtml(request.displayName)}</h4>
            <p>${escapeHtml(request.email)}</p>
            <span class="request-time">Wysłano: ${formatDate(request.requestedAt)}</span>
          </div>
        </div>
        <div class="request-actions">
          <button class="btn-approve" onclick="approveRequest('${uid}')">
            <svg viewBox="0 0 24 24" width="16" height="16">
              <path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
            </svg>
            Zatwierdź
          </button>
          <button class="btn-reject" onclick="rejectRequest('${uid}')">
            <svg viewBox="0 0 24 24" width="16" height="16">
              <path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/>
            </svg>
            Odrzuć
          </button>
        </div>
      </div>
    `).join('');
  }

  function renderUsersList(searchTerm = '') {
    if (!usersList) return;
    
    const usersArray = Object.entries(allUsers).filter(([uid, user]) => {
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return user.email.toLowerCase().includes(term) ||
             user.displayName.toLowerCase().includes(term);
    });
    
    if (usersArray.length === 0) {
      usersList.innerHTML = `
        <div class="empty-state">
          <span>👥</span>
          <p>Brak użytkowników</p>
        </div>
      `;
      return;
    }
    
    usersList.innerHTML = usersArray.map(([uid, user]) => `
      <div class="user-item ${user.blocked ? 'blocked' : ''}" data-uid="${uid}">
        <div class="user-info">
          <div class="user-avatar">
            ${user.photoURL ? 
              `<img src="${user.photoURL}" alt="${user.displayName}" />` :
              `<span>${(user.displayName || user.email)[0].toUpperCase()}</span>`
            }
          </div>
          <div class="user-details">
            <h4>${escapeHtml(user.displayName)}
              ${user.blocked ? '<span class="blocked-badge">Zablokowany</span>' : ''}
              ${!user.chatEnabled ? '<span class="chat-disabled-badge">Czat wyłączony</span>' : ''}
            </h4>
            <p>${escapeHtml(user.email)}</p>
            <div class="user-meta">
              <span>Dołączył: ${formatDate(user.createdAt)}</span>
              <span>Ostatnie logowanie: ${formatDate(user.lastLogin)}</span>
              ${user.blocked && user.blockExpiry ? 
                `<span class="block-info">Blokada do: ${formatDate(user.blockExpiry)}</span>` : ''}
            </div>
          </div>
        </div>
        <div class="user-actions">
          <button class="btn-settings" onclick="openUserSettings('${uid}')">
            <svg viewBox="0 0 24 24" width="16" height="16">
              <path fill="currentColor" d="M12 15.5A3.5 3.5 0 0 1 8.5 12A3.5 3.5 0 0 1 12 8.5a3.5 3.5 0 0 1 3.5 3.5a3.5 3.5 0 0 1-3.5 3.5m7.43-2.53c.04-.32.07-.64.07-.97c0-.33-.03-.66-.07-1l2.11-1.63c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.39-1.06-.73-1.69-.98l-.37-2.65A.506.506 0 0 0 14 2h-4c-.25 0-.46.18-.5.42l-.37 2.65c-.63.25-1.17.59-1.69.98l-2.49-1c-.22-.08-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64L4.57 11c-.04.34-.07.67-.07 1c0 .33.03.65.07.97l-2.11 1.66c-.19.15-.25.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1.01c.52.4 1.06.74 1.69.99l.37 2.65c.04.24.25.42.5.42h4c.25 0 .46-.18.5-.42l.37-2.65c.63-.26 1.17-.59 1.69-.99l2.49 1.01c.22.08.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.66Z"/>
            </svg>
            Ustawienia
          </button>
        </div>
      </div>
    `).join('');
  }

  // Admin Actions - Global Functions for onclick
  window.approveRequest = async (uid) => {
    if (!isAdmin) {
      showToast('Brak uprawnień', 'error');
      return;
    }
    
    try {
      console.log('✅ Approving user:', uid);
      
      const request = pendingRequests[uid];
      if (!request) {
        showToast('Nie znaleziono prośby', 'error');
        return;
      }
      
      const userData = {
        email: request.email,
        displayName: request.displayName,
        photoURL: request.photoURL,
        createdAt: request.requestedAt || firebase.database.ServerValue.TIMESTAMP,
        lastLogin: firebase.database.ServerValue.TIMESTAMP,
        role: 'user',
        isAdmin: false,
        approved: true,
        chatEnabled: true,
        blocked: false,
        provider: 'google.com'
      };
      
      const updates = {};
      updates[`users/${uid}`] = userData;
      updates[`accessRequests/${uid}/status`] = 'approved';
      updates[`accessRequests/${uid}/approvedAt`] = firebase.database.ServerValue.TIMESTAMP;
      updates[`accessRequests/${uid}/approvedBy`] = currentUser.uid;
      
      await database.ref().update(updates);
      
      console.log('✅ User approved and created:', request.email);
      showToast(`Użytkownik ${request.displayName} został zatwierdzony`, 'success');
      
    } catch (error) {
      console.error('Approve error:', error);
      showToast('Błąd zatwierdzania: ' + error.message, 'error');
    }
  };

  window.rejectRequest = async (uid) => {
    if (!isAdmin) {
      showToast('Brak uprawnień', 'error');
      return;
    }
    
    if (!confirm('Czy na pewno odrzucić tę prośbę?')) return;
    
    try {
      console.log('❌ Rejecting user:', uid);
      
      const updates = {};
      updates[`accessRequests/${uid}/status`] = 'rejected';
      updates[`accessRequests/${uid}/rejectedAt`] = firebase.database.ServerValue.TIMESTAMP;
      updates[`accessRequests/${uid}/rejectedBy`] = currentUser.uid;
      
      await database.ref().update(updates);
      
      showToast('Prośba została odrzucona', 'success');
    } catch (error) {
      console.error('Reject error:', error);
      showToast('Błąd odrzucania: ' + error.message, 'error');
    }
  };

  window.openUserSettings = async (uid) => {
    if (!isAdmin) return;
    
    selectedUserId = uid;
    const user = allUsers[uid];
    
    if (!user) return;
    
    settingsUserEmail.textContent = user.email;
    settingsUserJoined.textContent = `Dołączył: ${formatDate(user.createdAt)}`;
    settingsUserAvatar.textContent = (user.displayName || user.email)[0].toUpperCase();
    
    userChatEnabled.checked = user.chatEnabled !== false;
    
    if (user.blocked) {
      tempBlockBtn.style.display = 'none';
      permBlockBtn.style.display = 'none';
      securityBlockBtn.style.display = 'none';
      unblockBtn.style.display = 'inline-block';
      
      // Show block info
      const blockInfo = document.getElementById('current-block-info');
      if (blockInfo) {
        if (user.blockPermanent) {
          blockInfo.textContent = 'Status: Zablokowany na stałe';
        } else if (user.blockExpiry) {
          blockInfo.textContent = `Status: Zablokowany do ${formatDate(user.blockExpiry)}`;
        } else {
          blockInfo.textContent = 'Status: Zablokowany';
        }
        blockInfo.style.display = 'block';
      }
    } else {
      tempBlockBtn.style.display = 'inline-block';
      permBlockBtn.style.display = 'inline-block';
      securityBlockBtn.style.display = 'inline-block';
      unblockBtn.style.display = 'none';
      
      const blockInfo = document.getElementById('current-block-info');
      if (blockInfo) blockInfo.style.display = 'none';
    }
    
    tempBlockForm.style.display = 'none';
    
    userSettingsModal.style.display = 'flex';
  };

  // User Settings Modal Handlers
  closeUserSettings?.addEventListener('click', () => {
    userSettingsModal.style.display = 'none';
    selectedUserId = null;
  });

  tempBlockBtn?.addEventListener('click', () => {
    tempBlockForm.style.display = 'block';
  });

  confirmTempBlock?.addEventListener('click', async () => {
    if (!selectedUserId) return;
    
    const months = parseInt(document.getElementById('block-months').value) || 0;
    const days = parseInt(document.getElementById('block-days').value) || 0;
    const hours = parseInt(document.getElementById('block-hours').value) || 0;
    const minutes = parseInt(document.getElementById('block-minutes').value) || 0;
    const seconds = parseInt(document.getElementById('block-seconds').value) || 0;
    const reason = document.getElementById('block-reason-input').value || 'Naruszenie regulaminu';
    
    if (months === 0 && days === 0 && hours === 0 && minutes === 0 && seconds === 0) {
      showToast('Podaj czas blokady', 'warning');
      return;
    }
    
    const expiry = calculateBlockExpiry(months, days, hours, minutes, seconds);
    
    try {
      await database.ref(`users/${selectedUserId}`).update({
        blocked: true,
        blockExpiry: expiry,
        blockReason: reason,
        blockPermanent: false,
        blockedAt: firebase.database.ServerValue.TIMESTAMP,
        blockedBy: currentUser.uid
      });
      
      showToast('Użytkownik zablokowany tymczasowo', 'success');
      userSettingsModal.style.display = 'none';
      
      // Force refresh user list
      const snapshot = await database.ref(`users/${selectedUserId}`).once('value');
      if (snapshot.exists()) {
        allUsers[selectedUserId] = snapshot.val();
        renderUsersList();
      }
    } catch (error) {
      console.error('Block error:', error);
      showToast('Błąd blokowania: ' + error.message, 'error');
    }
  });

  permBlockBtn?.addEventListener('click', async () => {
    if (!selectedUserId || !confirm('Czy na pewno zablokować użytkownika NA STAŁE? Tej operacji nie można cofnąć automatycznie.')) return;
    
    try {
      await database.ref(`users/${selectedUserId}`).update({
        blocked: true,
        blockPermanent: true,
        blockReason: 'Konto zablokowane na stałe',
        blockExpiry: null,
        blockedAt: firebase.database.ServerValue.TIMESTAMP,
        blockedBy: currentUser.uid
      });
      
      showToast('Użytkownik zablokowany na stałe', 'success');
      userSettingsModal.style.display = 'none';
      
      // Force refresh
      const snapshot = await database.ref(`users/${selectedUserId}`).once('value');
      if (snapshot.exists()) {
        allUsers[selectedUserId] = snapshot.val();
        renderUsersList();
      }
    } catch (error) {
      console.error('Block error:', error);
      showToast('Błąd blokowania: ' + error.message, 'error');
    }
  });

  securityBlockBtn?.addEventListener('click', async () => {
    if (!selectedUserId || !confirm('Zablokować użytkownika ze względów bezpieczeństwa?')) return;
    
    try {
      await database.ref(`users/${selectedUserId}`).update({
        blocked: true,
        blockPermanent: true,
        blockReason: 'security',
        blockExpiry: null,
        blockedAt: firebase.database.ServerValue.TIMESTAMP,
        blockedBy: currentUser.uid
      });
      
      showToast('Użytkownik zablokowany ze względów bezpieczeństwa', 'success');
      userSettingsModal.style.display = 'none';
      
      // Force refresh
      const snapshot = await database.ref(`users/${selectedUserId}`).once('value');
      if (snapshot.exists()) {
        allUsers[selectedUserId] = snapshot.val();
        renderUsersList();
      }
    } catch (error) {
      console.error('Security block error:', error);
      showToast('Błąd blokowania: ' + error.message, 'error');
    }
  });

  unblockBtn?.addEventListener('click', async () => {
    if (!selectedUserId || !confirm('Czy na pewno odblokować użytkownika?')) return;
    
    try {
      await database.ref(`users/${selectedUserId}`).update({
        blocked: false,
        blockExpiry: null,
        blockReason: null,
        blockPermanent: false,
        unblockedAt: firebase.database.ServerValue.TIMESTAMP,
        unblockedBy: currentUser.uid
      });
      
      showToast('Użytkownik odblokowany', 'success');
      userSettingsModal.style.display = 'none';
      
      // Force refresh
      const snapshot = await database.ref(`users/${selectedUserId}`).once('value');
      if (snapshot.exists()) {
        allUsers[selectedUserId] = snapshot.val();
        renderUsersList();
      }
    } catch (error) {
      console.error('Unblock error:', error);
      showToast('Błąd odblokowywania: ' + error.message, 'error');
    }
  });

  saveUserSettings?.addEventListener('click', async () => {
    if (!selectedUserId) return;
    
    try {
      await database.ref(`users/${selectedUserId}`).update({
        chatEnabled: userChatEnabled.checked
      });
      
      showToast('Ustawienia zapisane', 'success');
      userSettingsModal.style.display = 'none';
    } catch (error) {
      console.error('Save error:', error);
      showToast('Błąd zapisu: ' + error.message, 'error');
    }
  });

  // Admin Panel Tabs
  document.querySelectorAll('.admin-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const tabName = tab.dataset.tab;
      
      document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
      });
      document.getElementById(`${tabName}-tab`).classList.add('active');
    });
  });

  // Global Settings Handlers
  globalChatEnabled?.addEventListener('change', async (e) => {
    globalSettings.chatEnabled = e.target.checked;
    await saveGlobalSettings();
  });

  autoApprove?.addEventListener('change', async (e) => {
    globalSettings.autoApprove = e.target.checked;
    await saveGlobalSettings();
  });

  // User Search
  usersSearchInput?.addEventListener('input', (e) => {
    renderUsersList(e.target.value);
  });

  // Admin Panel Open/Close
  adminPanelBtn?.addEventListener('click', () => {
    adminPanel.style.display = 'flex';
  });

  closeAdminPanel?.addEventListener('click', () => {
    adminPanel.style.display = 'none';
  });

  // Check Status Button
  document.getElementById('check-status-btn')?.addEventListener('click', async () => {
    if (!currentUser) return;
    
    try {
      const userSnapshot = await database.ref(`users/${currentUser.uid}`).once('value');
      
      if (userSnapshot.exists()) {
        const userData = userSnapshot.val();
        currentUserData = userData;
        
        if (userData.blocked) {
          if (!userData.blockPermanent && userData.blockExpiry && Date.now() >= userData.blockExpiry) {
            await database.ref(`users/${currentUser.uid}`).update({
              blocked: false,
              blockExpiry: null,
              blockReason: null
            });
            
            isAdmin = await checkIfUserIsAdmin(currentUser.uid);
            showApp(currentUser);
            showToast('Twoje konto zostało odblokowane!', 'success');
          } else {
            showBlockedScreen(userData);
          }
        } else if (userData.approved) {
          isAdmin = await checkIfUserIsAdmin(currentUser.uid);
          showApp(currentUser);
          showToast('Twoje konto zostało zatwierdzone!', 'success');
        } else {
          showToast('Twoje konto nadal oczekuje na zatwierdzenie', 'warning');
        }
      } else {
        const requestSnapshot = await database.ref(`accessRequests/${currentUser.uid}`).once('value');
        
        if (requestSnapshot.exists()) {
          const requestData = requestSnapshot.val();
          
          if (requestData.status === 'approved') {
            await createUserFromRequest(currentUser.uid, requestData);
            isAdmin = false;
            showApp(currentUser);
            showToast('Twoje konto zostało zatwierdzone!', 'success');
          } else if (requestData.status === 'rejected') {
            showToast('Twoja prośba o dostęp została odrzucona', 'error');
          } else {
            showToast('Twoje konto nadal oczekuje na zatwierdzenie', 'warning');
          }
        } else {
          showToast('Twoje konto nadal oczekuje na zatwierdzenie', 'warning');
        }
      }
    } catch (error) {
      console.error('Check status error:', error);
      showToast('Błąd sprawdzania statusu', 'error');
    }
  });

  // Refresh Block Status
  document.getElementById('refresh-block-btn')?.addEventListener('click', async () => {
    if (!currentUser) return;
    
    try {
      const userSnapshot = await database.ref(`users/${currentUser.uid}`).once('value');
      
      if (userSnapshot.exists()) {
        const userData = userSnapshot.val();
        
        if (userData.blocked && !userData.blockPermanent && userData.blockExpiry) {
          if (Date.now() >= userData.blockExpiry) {
            await database.ref(`users/${currentUser.uid}`).update({
              blocked: false,
              blockExpiry: null,
              blockReason: null
            });
            
            currentUserData = { ...userData, blocked: false };
            isAdmin = await checkIfUserIsAdmin(currentUser.uid);
            showApp(currentUser);
            showToast('Twoje konto zostało odblokowane!', 'success');
            return;
          }
        }
        
        if (!userData.blocked) {
          currentUserData = userData;
          isAdmin = await checkIfUserIsAdmin(currentUser.uid);
          showApp(currentUser);
        } else {
          showBlockedScreen(userData);
          showToast('Twoje konto jest nadal zablokowane', 'error');
        }
      }
    } catch (error) {
      console.error('Refresh error:', error);
      showToast('Błąd odświeżania statusu', 'error');
    }
  });

  function setupPresence() {
    if (!currentUser) return;

    userPresenceRef = database.ref(`presence/${currentUser.uid}`);
    const connectedRef = database.ref('.info/connected');

    connectedRef.on('value', (snapshot) => {
      if (snapshot.val() === true) {
        const userStatusData = {
          uid: currentUser.uid,
          email: currentUser.email,
          displayName: currentUser.displayName || currentUser.email.split('@')[0],
          isOnline: true,
          isAdmin: isAdmin,
          lastSeen: firebase.database.ServerValue.TIMESTAMP
        };

        userPresenceRef.onDisconnect().remove();
        userPresenceRef.set(userStatusData);
      }
    });
  }

  // Auth Handlers
  googleAuthBtn?.addEventListener('click', async () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    try {
      googleAuthBtn.disabled = true;
      googleAuthBtn.textContent = 'Logowanie...';
      
      const result = await auth.signInWithPopup(provider);
      console.log('✅ Google auth successful:', result.user.email);
      
    } catch (error) {
      console.error('Login error:', error);
      
      if (error.code === 'auth/popup-closed-by-user') {
        showAuthError('Anulowano logowanie');
      } else if (error.code === 'auth/network-request-failed') {
        showAuthError('Błąd połączenia. Sprawdź internet.');
      } else {
        showAuthError('Błąd logowania: ' + error.message);
      }
    } finally {
      googleAuthBtn.disabled = false;
      googleAuthBtn.innerHTML = `
        <div class="google-icon-wrapper">
          <svg class="google-icon" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
        </div>
        <span class="google-btn-text">Kontynuuj z Google</span>
      `;
    }
  });

  logoutBtn?.addEventListener('click', async () => {
    try {
      if (blockCheckInterval) {
        clearInterval(blockCheckInterval);
      }
      if (userPresenceRef) {
        await userPresenceRef.remove();
      }
      await auth.signOut();
      showToast('Wylogowano pomyślnie');
    } catch (error) {
      console.error('Logout error:', error);
    }
  });

  // User menu
  userMenuBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    userDropdown.classList.toggle('show');
  });

  document.addEventListener('click', (e) => {
    if (userDropdown && !userDropdown.contains(e.target)) {
      userDropdown.classList.remove('show');
    }
    if (contextMenu && !contextMenu.contains(e.target)) {
      contextMenu.classList.remove('show');
    }
  });

  // Auth State Observer
  auth.onAuthStateChanged(async (user) => {
    if (user) {
      currentUser = user;
      console.log('👤 User authenticated:', user.email);
      
      await handleUserLogin(user);
      
    } else {
      currentUser = null;
      currentUserData = null;
      isAdmin = false;
      
      if (blockCheckInterval) {
        clearInterval(blockCheckInterval);
      }
      
      if (userPresenceRef) {
        userPresenceRef.remove();
        userPresenceRef = null;
      }
      
      if (googleAuthStep) googleAuthStep.style.display = 'block';
      if (pendingApproval) pendingApproval.style.display = 'none';
      if (accountBlocked) accountBlocked.style.display = 'none';
      
      authScreen.style.display = 'flex';
      appScreen.style.display = 'none';
    }
  });

  // Chat Functions  
  function startChatListeners() {
    messagesArea.innerHTML = `
      <div class="chat-welcome">
        <div class="welcome-animation">
          <span class="welcome-emoji">💬</span>
        </div>
        <h3>Witaj w czacie!</h3>
        <p>Rozpocznij rozmowę z innymi użytkownikami</p>
      </div>
    `;

    const messagesRef = database.ref('messages').limitToLast(50);
    
    messagesRef.once('value', (snapshot) => {
      if (snapshot.exists()) {
        messagesArea.innerHTML = '';
        snapshot.forEach((childSnapshot) => {
          renderMessage(childSnapshot.val(), childSnapshot.key);
        });
        messagesArea.scrollTop = messagesArea.scrollHeight;
      }
    });

    messagesRef.on('child_added', (snapshot) => {
      if (!document.querySelector(`[data-message-id="${snapshot.key}"]`)) {
        renderMessage(snapshot.val(), snapshot.key);
        messagesArea.scrollTop = messagesArea.scrollHeight;
      }
    });

    messagesRef.on('child_removed', (snapshot) => {
      const messageEl = document.querySelector(`[data-message-id="${snapshot.key}"]`);
      if (messageEl) {
        messageEl.style.animation = 'messageSlide 0.3s ease reverse';
        setTimeout(() => messageEl.remove(), 300);
      }
    });

    const presenceRef = database.ref('presence');
    presenceRef.on('value', (snapshot) => {
      const users = snapshot.val() || {};
      const onlineUsers = Object.values(users).filter(u => u.isOnline);
      onlineCount.textContent = `${onlineUsers.length} online`;
    });
  }

  function renderMessage(data, messageId) {
    const welcome = messagesArea.querySelector('.chat-welcome');
    if (welcome) welcome.remove();

    if (document.querySelector(`[data-message-id="${messageId}"]`)) {
      return;
    }

    const messageDiv = document.createElement('div');
    messageDiv.className = 'message';
    messageDiv.dataset.messageId = messageId;
    
    if (data.userId === currentUser.uid) {
      messageDiv.classList.add('own');
    }
    
    if (data.isAdmin) {
      messageDiv.classList.add('admin');
    }
    
    const time = data.timestamp ? new Date(data.timestamp).toLocaleTimeString('pl-PL', {
      hour: '2-digit',
      minute: '2-digit'
    }) : '';
    
    const authorClass = data.isAdmin ? 'admin' : '';
    const authorPrefix = data.isAdmin ? '👑 ' : '';
    
    messageDiv.innerHTML = `
      <div class="message-header">
        <span class="message-author ${authorClass}">${authorPrefix}${escapeHtml(data.author)}</span>
        <span class="message-time">${time}</span>
      </div>
      <div class="message-content" data-text="${escapeHtml(data.text)}">${escapeHtml(data.text)}</div>
    `;
    
    const messageContent = messageDiv.querySelector('.message-content');
    messageContent.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      showContextMenu(e, messageId, data.text, data.userId);
    });
    
    let pressTimer;
    messageContent.addEventListener('touchstart', (e) => {
      pressTimer = setTimeout(() => {
        e.preventDefault();
        showContextMenu(e.touches[0], messageId, data.text, data.userId);
      }, 500);
    });
    
    messageContent.addEventListener('touchend', () => {
      clearTimeout(pressTimer);
    });
    
    messagesArea.appendChild(messageDiv);
  }

  function showContextMenu(e, messageId, messageText, messageUserId) {
    selectedMessageId = messageId;
    selectedMessageText = messageText;
    
    contextMenu.style.left = `${e.pageX}px`;
    contextMenu.style.top = `${e.pageY}px`;
    
    if (isAdmin || messageUserId === currentUser.uid) {
      deleteMessageBtn.style.display = 'flex';
    } else {
      deleteMessageBtn.style.display = 'none';
    }
    
    contextMenu.classList.add('show');
  }

  // Context menu actions
  copyMessageBtn?.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(selectedMessageText);
      showToast('Skopiowano wiadomość', 'success');
    } catch {
      const ta = document.createElement('textarea');
      ta.value = selectedMessageText;
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand('copy');
        showToast('Skopiowano wiadomość', 'success');
      } catch {
        showToast('Nie udało się skopiować', 'error');
      }
      document.body.removeChild(ta);
    }
    contextMenu.classList.remove('show');
  });

  deleteMessageBtn?.addEventListener('click', async () => {
    if (!selectedMessageId) return;
    
    try {
      await database.ref(`messages/${selectedMessageId}`).remove();
      showToast('Usunięto wiadomość', 'success');
    } catch (error) {
      showToast('Błąd usuwania wiadomości', 'error');
      console.error('Delete error:', error);
    }
    contextMenu.classList.remove('show');
  });

  // Chat form
  chatForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const text = messageInput.value.trim();
    if (!text || text.length > 500) return;
    
    if (!globalSettings.chatEnabled || (currentUserData && currentUserData.chatEnabled === false)) {
      showToast('Czat jest wyłączony', 'warning');
      return;
    }
    
    try {
      await database.ref('messages').push({
        text: text,
        author: currentUser.displayName || currentUser.email.split('@')[0],
        userId: currentUser.uid,
        email: currentUser.email,
        isAdmin: isAdmin,
        timestamp: firebase.database.ServerValue.TIMESTAMP
      });
      
      messageInput.value = '';
      messageInput.focus();
    } catch (error) {
      showToast('Błąd wysyłania wiadomości', 'error');
      console.error('Send error:', error);
    }
  });

  // Enter to send
  messageInput?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      chatForm.dispatchEvent(new Event('submit'));
    }
  });

  // Cipher Functions
  function encode(text) {
    const chars = Array.from(text);
    return chars.map(ch => {
      const low = ch.toLowerCase();
      return cipherMap.hasOwnProperty(low) ? cipherMap[low] : ch;
    }).join('');
  }

  function decode(text) {
    const chars = Array.from(text);
    return chars.map(ch => {
      if (reverseMap[ch]) {
        const options = reverseMap[ch];
        if (options.length === 1) return options[0];
        if (options.includes(ambiguityPreference)) return ambiguityPreference;
        return options[0];
      }
      return ch;
    }).join('');
  }

  function pluralize(n, one, few, many) {
    const mod10 = n % 10;
    const mod100 = n % 100;
    if (n === 1) return one;
    if (mod10 >= 2 && mod10 <= 4 && !(mod100 >= 12 && mod100 <= 14)) return few;
    return many;
  }

  function updateCounts() {
    const inLen = Array.from(inputEl.value).length;
    const outLen = Array.from(outputEl.value).length;
    inputCount.textContent = `${inLen} ${pluralize(inLen, 'znak', 'znaki', 'znaków')}`;
    outputCount.textContent = `${outLen} ${pluralize(outLen, 'znak', 'znaki', 'znaków')}`;
  }

  function transform() {
    const text = inputEl.value || '';
    const result = cipherMode === 'encode' ? encode(text) : decode(text);
    outputEl.value = result;
    updateCounts();
  }

  function setMode(mode) {
    cipherMode = mode;
    const isDecode = mode === 'decode';
    btnEncode.classList.toggle('active', !isDecode);
    btnDecode.classList.toggle('active', isDecode);
    ambiguityWrap.style.display = isDecode ? 'flex' : 'none';
    transform();
  }

  async function copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand('copy');
        document.body.removeChild(ta);
        return true;
      } catch {
        document.body.removeChild(ta);
        return false;
      }
    }
  }

  // Cipher Event Handlers
  inputEl?.addEventListener('input', transform);
  
  ambiguitySelect?.addEventListener('change', (e) => {
    ambiguityPreference = e.target.value;
    localStorage.setItem('ambiguityPreference', ambiguityPreference);
    if (cipherMode === 'decode') transform();
  });

  btnEncode?.addEventListener('click', () => setMode('encode'));
  btnDecode?.addEventListener('click', () => setMode('decode'));

  btnClear?.addEventListener('click', () => {
    inputEl.value = '';
    transform();
    inputEl.focus();
    showToast('Wyczyszczono', 'success');
  });

  btnSwap?.addEventListener('click', () => {
    inputEl.value = outputEl.value;
    setMode(cipherMode === 'encode' ? 'decode' : 'encode');
    inputEl.focus();
    showToast('Zamieniono kierunek', 'success');
  });

  btnCopyIn?.addEventListener('click', async () => {
    if (!inputEl.value) {
      showToast('Brak tekstu do skopiowania', 'warning');
      return;
    }
    const ok = await copyToClipboard(inputEl.value);
    showToast(ok ? 'Skopiowano tekst wejściowy' : 'Błąd kopiowania', ok ? 'success' : 'error');
  });

  btnCopyOut?.addEventListener('click', async () => {
    if (!outputEl.value) {
      showToast('Brak wyniku do skopiowania', 'warning');
      return;
    }
    const ok = await copyToClipboard(outputEl.value);
    showToast(ok ? 'Skopiowano wynik' : 'Błąd kopiowania', ok ? 'success' : 'error');
  });

  // Initialize cipher
  const savedPref = localStorage.getItem('ambiguityPreference');
  if (savedPref) {
    ambiguityPreference = savedPref;
    if (ambiguitySelect) ambiguitySelect.value = savedPref;
  }
  
  setMode('encode');
  if (inputEl && outputEl) transform();

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
      return;
    }
    
    if (e.ctrlKey || e.metaKey) {
      switch(e.key) {
        case 'b':
          e.preventDefault();
          if (btnSwap) btnSwap.click();
          break;
        case 'k':
          e.preventDefault();
          if (inputEl) inputEl.focus();
          break;
        case 'l':
          e.preventDefault();
          if (messageInput) messageInput.focus();
          break;
      }
    }
  });

  // Cleanup on unload
  window.addEventListener('beforeunload', () => {
    if (blockCheckInterval) {
      clearInterval(blockCheckInterval);
    }
    if (userPresenceRef) {
      userPresenceRef.remove();
    }
  });

  console.log('🚀 Alfawrogowie v2.2 - Enhanced Security Edition');
  console.log('👑 First Google user becomes admin');
  console.log('🔐 Real-time block monitoring active');
  console.log('🛡️ Security features enabled');
  console.log('💬 Right-click messages for options');
})();