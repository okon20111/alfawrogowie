(() => {
  // Firebase Configuration
  const firebaseConfig = {
    apiKey: "AIzaSyA-lb3k-d38wcS3DXKHvY_YDNQ_sBXXnR8",
    authDomain: "alfawrogowie.firebaseapp.com",
    databaseURL: "https://alfawrogowie-default-rtdb.firebaseio.com",
    projectId: "alfawrogowie",
    storageBucket: "alfawrogowie.appspot.com", // Poprawiony storage bucket
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
  const rejectionCooldown = document.getElementById('rejection-cooldown');
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
  const chatDisabledReason = document.getElementById('chat-disabled-reason');
  const typingUsers = document.getElementById('typing-users');
  const scrollBottomBtn = document.getElementById('scroll-bottom');

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
  const activityLog = document.getElementById('activity-log');

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
  const deleteUserBtn = document.getElementById('delete-user-btn');
  const unblockBtn = document.getElementById('unblock-btn');
  const tempBlockForm = document.getElementById('temp-block-form');
  const confirmTempBlock = document.getElementById('confirm-temp-block');
  const saveUserSettings = document.getElementById('save-user-settings');

  // Settings Tab
  const globalChatEnabled = document.getElementById('global-chat-enabled');
  const autoApprove = document.getElementById('auto-approve');
  const enableTypingIndicators = document.getElementById('enable-typing-indicators');
  const rejectionCooldownSelect = document.getElementById('rejection-cooldown-select');

  // Stats Tab
  const statTotalUsers = document.getElementById('stat-total-users');
  const statTotalMessages = document.getElementById('stat-total-messages');
  const statTotalEncryptions = document.getElementById('stat-total-encryptions');
  const statOnlineNow = document.getElementById('stat-online-now');

  // Tools Tab
  const clearChatBtn = document.getElementById('clear-chat-btn');
  const exportUsersBtn = document.getElementById('export-users-btn');
  const broadcastMessage = document.getElementById('broadcast-message');
  const broadcastBtn = document.getElementById('broadcast-btn');
  const resetSettingsBtn = document.getElementById('reset-settings-btn');

  // Cipher elements
  const inputEl = document.getElementById('input');
  const outputEl = document.getElementById('output');
  const btnPaste = document.getElementById('btn-paste');
  const btnCopyOut = document.getElementById('btn-copy-out');
  const btnClear = document.getElementById('btn-clear');
  const btnSwap = document.getElementById('btn-swap');
  const btnEncode = document.getElementById('btn-encode');
  const btnDecode = document.getElementById('btn-decode');
  const inputCount = document.getElementById('input-count');
  const outputCount = document.getElementById('output-count');
  const inputLabel = document.getElementById('input-label');
  const outputLabel = document.getElementById('output-label');
  const typingIndicator = document.getElementById('typing-indicator');
  const copySuccess = document.getElementById('copy-success');
  const totalEncoded = document.getElementById('total-encoded');

  // State
  let currentUser = null;
  let currentUserData = null;
  let isAdmin = false;
  let cipherMode = 'encode';
  let userPresenceRef = null;
  let selectedMessageId = null;
  let selectedMessageText = null;
  let selectedUserId = null;
  let pendingRequests = {};
  let allUsers = {};
  let globalSettings = {
    chatEnabled: true,
    autoApprove: false,
    rejectionCooldown: 3600000, // 1 hour default
    enableTypingIndicators: true,
    theme: 'dark'
  };
  
  // Listeners cleanup
  let listeners = {
    settings: null,
    requests: null,
    users: null,
    messages: null,
    presence: null,
    userData: null,
    typing: null,
    stats: null
  };

  let typingTimer = null;
  let isTyping = false;
  let typingUsersMap = {};
  let encodedCount = 0;

  // Cipher Map (simplified - removed ambiguity)
  const cipherMap = {
    'a': '⧫', 'ą': '⚯', 'b': '⨀', 'c': '⧗', 'ć': '⧼',
    'd': '⊶', 'e': '⌇', 'ę': '⍟', 'f': '⏃', 'g': '⌖',
    'h': '⌬', 'i': '⍙', 'j': '⎔', 'k': '⧙', 'l': '⧉',
    'ł': '⧻', 'm': '⧴', 'n': '⌻', 'ń': '⏇', 'o': '⏀',
    'ó': '⏂', 'p': '⏉', 'q': '⍾', 'r': '⍛', 's': '⍭',
    'ś': '⌭', 't': '⌆', 'u': '⌑', 'v': '⌄', 'w': '⏊',
    'x': '⎊', 'y': '⍤', 'z': '⌯', 'ź': '⌰', 'ż': '⏁'
  };

  const reverseMap = {};
  Object.entries(cipherMap).forEach(([letter, symbol]) => {
    reverseMap[symbol] = letter;
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

  function calculateBlockExpiry(months = 0, days = 0, hours = 0, minutes = 0) {
    const now = Date.now();
    const duration = 
      (months * 30 * 24 * 60 * 60 * 1000) +
      (days * 24 * 60 * 60 * 1000) +
      (hours * 60 * 60 * 1000) +
      (minutes * 60 * 1000);
    return now + duration;
  }

  function formatRemainingTime(expiry) {
    const now = Date.now();
    const remaining = expiry - now;
    
    if (remaining <= 0) return 'Wygasła';
    
    const days = Math.floor(remaining / (24 * 60 * 60 * 1000));
    const hours = Math.floor((remaining % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
    const seconds = Math.floor((remaining % (60 * 1000)) / 1000);
    
    const parts = [];
    if (days > 0) parts.push(`${days} ${days === 1 ? 'dzień' : 'dni'}`);
    if (hours > 0) parts.push(`${hours} ${hours === 1 ? 'godzina' : 'godzin'}`);
    if (minutes > 0) parts.push(`${minutes} ${minutes === 1 ? 'minuta' : 'minut'}`);
    if (days === 0 && hours === 0 && seconds > 0) parts.push(`${seconds} ${seconds === 1 ? 'sekunda' : 'sekund'}`);
    
    return parts.length > 0 ? parts.join(', ') : 'Mniej niż minuta';
  }

  function formatCooldownTime(ms) {
    const hours = Math.floor(ms / (60 * 60 * 1000));
    const minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
    const seconds = Math.floor((ms % (60 * 1000)) / 1000);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  // Cleanup all listeners
  function cleanupListeners() {
    Object.keys(listeners).forEach(key => {
      if (listeners[key]) {
        listeners[key].off();
        listeners[key] = null;
      }
    });
  }

  // Check if user can retry after rejection
  async function checkRejectionCooldown(uid) {
    try {
      const requestSnapshot = await database.ref(`accessRequests/${uid}`).once('value');
      if (!requestSnapshot.exists()) return true;
      
      const request = requestSnapshot.val();
      if (request.status !== 'rejected') return true;
      
      // Check global cooldown setting
      if (globalSettings.rejectionCooldown === -1) {
        // Never allow retry
        return false;
      }
      
      if (globalSettings.rejectionCooldown === 0) {
        // Allow immediate retry
        return true;
      }
      
      // Check if cooldown has passed
      const rejectedAt = request.rejectedAt || 0;
      const cooldownExpiry = rejectedAt + globalSettings.rejectionCooldown;
      
      return Date.now() >= cooldownExpiry;
    } catch (error) {
      console.error('Error checking rejection cooldown:', error);
      return false;
    }
  }

  function showRejectionCooldown(request) {
    console.log('🚫 Showing rejection cooldown screen');
    googleAuthStep.style.display = 'none';
    pendingApproval.style.display = 'none';
    accountBlocked.style.display = 'none';
    rejectionCooldown.style.display = 'block';
    
    const cooldownMessage = document.getElementById('cooldown-message');
    const cooldownTimer = document.getElementById('cooldown-timer');
    const retryBtn = document.getElementById('retry-request-btn');
    
    if (globalSettings.rejectionCooldown === -1) {
      cooldownMessage.textContent = 'Nie możesz ponownie wysłać prośby o dostęp.';
      cooldownTimer.style.display = 'none';
      retryBtn.style.display = 'none';
    } else {
      const rejectedAt = request.rejectedAt || 0;
      const cooldownExpiry = rejectedAt + globalSettings.rejectionCooldown;
      
      const updateTimer = () => {
        const remaining = cooldownExpiry - Date.now();
        
        if (remaining <= 0) {
          cooldownMessage.textContent = 'Możesz teraz ponownie wysłać prośbę o dostęp.';
          cooldownTimer.style.display = 'none';
          retryBtn.style.display = 'inline-block';
          clearInterval(timerInterval);
        } else {
          cooldownMessage.textContent = 'Możesz ponownie wysłać prośbę za:';
          cooldownTimer.textContent = formatCooldownTime(remaining);
          cooldownTimer.style.display = 'block';
          retryBtn.style.display = 'none';
        }
      };
      
      updateTimer();
      const timerInterval = setInterval(updateTimer, 1000);
    }
  }

  // Retry request button
  document.getElementById('retry-request-btn')?.addEventListener('click', async () => {
    if (!currentUser) return;
    
    try {
      // Delete old rejection
      await database.ref(`accessRequests/${currentUser.uid}`).remove();
      
      // Create new request
      await database.ref(`accessRequests/${currentUser.uid}`).set({
        uid: currentUser.uid,
        email: currentUser.email,
        displayName: currentUser.displayName || currentUser.email.split('@')[0],
        photoURL: currentUser.photoURL || null,
        requestedAt: firebase.database.ServerValue.TIMESTAMP,
        status: 'pending'
      });
      
      showPendingScreen(currentUser);
      showToast('Prośba o dostęp została wysłana ponownie', 'info');
    } catch (error) {
      console.error('Error retrying request:', error);
      showToast('Błąd wysyłania prośby', 'error');
    }
  });

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
      
      // Load global settings first
      await loadGlobalSettings();
      
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
              const canRetry = await checkRejectionCooldown(user.uid);
              if (canRetry) {
                // Allow new request
                await database.ref(`accessRequests/${user.uid}`).remove();
                
                if (globalSettings.autoApprove) {
                  // Auto-approve new user
                  await createAutoApprovedUser(user);
                } else {
                  // Create new request
                  await database.ref(`accessRequests/${user.uid}`).set({
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName || user.email.split('@')[0],
                    photoURL: user.photoURL || null,
                    requestedAt: firebase.database.ServerValue.TIMESTAMP,
                    status: 'pending'
                  });
                  showPendingScreen(user);
                }
              } else {
                showRejectionCooldown(requestData);
              }
            } else if (requestData.status === 'approved') {
              await createUserFromRequest(user.uid, requestData);
              showApp(user);
            }
          } else {
            console.log('🆕 New user - checking auto-approve');
            
            if (globalSettings.autoApprove) {
              // Auto-approve new user
              await createAutoApprovedUser(user);
            } else {
              // Create access request
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
      }
    } catch (error) {
      console.error('❌ Error handling user login:', error);
      showAuthError('Błąd podczas logowania. Spróbuj ponownie.');
    }
  }

  async function createAutoApprovedUser(user) {
    const userData = {
      email: user.email,
      displayName: user.displayName || user.email.split('@')[0],
      photoURL: user.photoURL || null,
      createdAt: firebase.database.ServerValue.TIMESTAMP,
      lastLogin: firebase.database.ServerValue.TIMESTAMP,
      role: 'user',
      isAdmin: false,
      approved: true,
      chatEnabled: true,
      blocked: false,
      provider: 'google.com',
      autoApproved: true
    };
    
    await database.ref(`users/${user.uid}`).set(userData);
    currentUserData = userData;
    isAdmin = false;
    
    // Log activity
    await logActivity('user_auto_approved', {
      userId: user.uid,
      email: user.email
    });
    
    showApp(user);
    showToast('Witaj! Twoje konto zostało automatycznie zatwierdzone', 'success');
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
      const dropdownAvatar = document.querySelector('.dropdown-avatar');
      if (dropdownAvatar) {
        dropdownAvatar.style.background = 'linear-gradient(135deg, #ff5757, #ff8080)';
      }
      setupAdminPanel();
      console.log('👑 Logged as ADMINISTRATOR');
    } else {
      userMenuBtn.classList.remove('admin');
      userRoleSpan.classList.remove('admin');
      adminPanelBtn.style.display = 'none';
      console.log('👤 Logged as USER');
      
      // Start monitoring for blocks and deletion (only for non-admin users)
      startRealtimeMonitoring();
    }
    
    // Apply chat settings
    updateChatAvailability();
    
    authScreen.style.display = 'none';
    appScreen.style.display = 'block';
    
    setupPresence();
    startChatListeners();
    startGlobalSettingsListener();
    loadEncryptionStats();
    
    showToast(`Witaj ${user.displayName || user.email}!`, 'success');
  }

  function showPendingScreen(user) {
    console.log('⏳ Showing pending screen for:', user.email);
    googleAuthStep.style.display = 'none';
    pendingApproval.style.display = 'block';
    accountBlocked.style.display = 'none';
    rejectionCooldown.style.display = 'none';
    const pendingEmail = document.querySelector('.pending-email');
    if (pendingEmail) pendingEmail.textContent = user.email;
  }

  function showBlockedScreen(userData) {
    console.log('🚫 Showing blocked screen');
    googleAuthStep.style.display = 'none';
    pendingApproval.style.display = 'none';
    accountBlocked.style.display = 'block';
    rejectionCooldown.style.display = 'none';
    
    let blockReason = userData.blockReason || 'Konto zablokowane';
    if (userData.blockReason === 'security') {
      blockReason = 'Konto zablokowane ze względów bezpieczeństwa';
    }
    
    const blockReasonEl = document.getElementById('block-reason-text');
    if (blockReasonEl) blockReasonEl.textContent = blockReason;
    
    const blockExpiresEl = document.getElementById('block-expires');
    if (blockExpiresEl) {
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
  }

  // Real-time monitoring for user changes
  function startRealtimeMonitoring() {
    if (!currentUser || isAdmin) return;
    
    // Monitor user data changes
    if (listeners.userData) listeners.userData.off();
    
    listeners.userData = database.ref(`users/${currentUser.uid}`);
    listeners.userData.on('value', async (snapshot) => {
      if (!snapshot.exists() && currentUser) {
        // Account was deleted
        console.log('⚠️ Account deleted from database');
        
        // Force logout
        appScreen.style.display = 'none';
        authScreen.style.display = 'flex';
        googleAuthStep.style.display = 'block';
        
        showAuthError('Twoje konto zostało usunięte');
        
        // Clean up
        cleanupListeners();
        if (userPresenceRef) {
          await userPresenceRef.remove();
        }
        
        // Sign out from Firebase Auth
        await auth.signOut();
      } else if (snapshot.exists()) {
        const userData = snapshot.val();
        const wasBlocked = currentUserData?.blocked;
        currentUserData = userData;
        
        // Check if user got blocked
        if (userData.blocked && !wasBlocked) {
          console.log('🚫 User got blocked');
          
          // Force logout
          appScreen.style.display = 'none';
          authScreen.style.display = 'flex';
          
          // Show blocked screen
          showBlockedScreen(userData);
          
          // Clean up
          cleanupListeners();
          if (userPresenceRef) {
            await userPresenceRef.remove();
          }
          
          showToast('Twoje konto zostało zablokowane', 'error');
        }
        
        // Update chat availability if changed
        updateChatAvailability();
      }
    });
  }

  // Update chat availability based on settings
  function updateChatAvailability() {
    if (!currentUserData) return;
    
    const chatEnabled = globalSettings.chatEnabled && currentUserData.chatEnabled !== false;
    
    if (chatForm) chatForm.style.display = chatEnabled ? 'flex' : 'none';
    if (chatDisabled) chatDisabled.style.display = chatEnabled ? 'none' : 'flex';
    
    if (chatDisabledReason) {
      if (!globalSettings.chatEnabled) {
        chatDisabledReason.textContent = 'przez administratora globalnie';
      } else if (currentUserData.chatEnabled === false) {
        chatDisabledReason.textContent = 'dla Twojego konta';
      }
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
      
      // Update UI
      if (globalChatEnabled) globalChatEnabled.checked = globalSettings.chatEnabled;
      if (autoApprove) autoApprove.checked = globalSettings.autoApprove;
      if (enableTypingIndicators) enableTypingIndicators.checked = globalSettings.enableTypingIndicators;
      if (rejectionCooldownSelect) rejectionCooldownSelect.value = globalSettings.rejectionCooldown;
      
      // Apply theme
      document.body.className = `theme-${globalSettings.theme || 'dark'}`;
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  }

  // Listen to global settings changes in real-time
  function startGlobalSettingsListener() {
    if (listeners.settings) listeners.settings.off();
    
    listeners.settings = database.ref('system/settings');
    listeners.settings.on('value', (snapshot) => {
      if (snapshot.exists()) {
        const newSettings = snapshot.val();
        const oldChatEnabled = globalSettings.chatEnabled;
        
        globalSettings = { ...globalSettings, ...newSettings };
        
        // Update UI
        if (globalChatEnabled) globalChatEnabled.checked = globalSettings.chatEnabled;
        if (autoApprove) autoApprove.checked = globalSettings.autoApprove;
        if (enableTypingIndicators) enableTypingIndicators.checked = globalSettings.enableTypingIndicators;
        if (rejectionCooldownSelect) rejectionCooldownSelect.value = globalSettings.rejectionCooldown;
        
        // Apply theme
        document.body.className = `theme-${globalSettings.theme || 'dark'}`;
        
        // Update chat availability
        updateChatAvailability();
        
        // Show notification if chat was toggled
        if (oldChatEnabled !== globalSettings.chatEnabled && !isAdmin) {
          if (globalSettings.chatEnabled) {
            showToast('Czat został włączony przez administratora', 'success');
          } else {
            showToast('Czat został wyłączony przez administratora', 'warning');
          }
        }
      }
    });
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

  // Activity Logging
  async function logActivity(type, data) {
    try {
      await database.ref('system/activity').push({
        type,
        data,
        timestamp: firebase.database.ServerValue.TIMESTAMP,
        userId: currentUser?.uid,
        userEmail: currentUser?.email
      });
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  }

  // Load activity log
  async function loadActivityLog() {
    if (!isAdmin || !activityLog) return;
    
    try {
      const snapshot = await database.ref('system/activity')
        .orderByChild('timestamp')
        .limitToLast(20)
        .once('value');
      
      if (snapshot.exists()) {
        const activities = [];
        snapshot.forEach((child) => {
          activities.unshift(child.val());
        });
        
        activityLog.innerHTML = activities.map(activity => {
          const time = new Date(activity.timestamp).toLocaleTimeString('pl-PL');
          let message = '';
          
          switch(activity.type) {
            case 'user_approved':
              message = `✅ ${activity.data.email} został zatwierdzony`;
              break;
            case 'user_rejected':
              message = `❌ ${activity.data.email} został odrzucony`;
              break;
            case 'user_blocked':
              message = `🚫 ${activity.data.email} został zablokowany`;
              break;
            case 'user_unblocked':
              message = `✓ ${activity.data.email} został odblokowany`;
              break;
            case 'user_deleted':
              message = `🗑️ ${activity.data.email} został usunięty`;
              break;
            case 'user_auto_approved':
              message = `✅ ${activity.data.email} automatycznie zatwierdzony`;
              break;
            case 'chat_cleared':
              message = `🧹 Czat został wyczyszczony`;
              break;
            case 'broadcast_sent':
              message = `📢 Wysłano powiadomienie globalne`;
              break;
            default:
              message = activity.type;
          }
          
          return `
            <div class="activity-item">
              <span class="activity-time">${time}</span>
              <span class="activity-message">${message}</span>
            </div>
          `;
        }).join('');
      } else {
        activityLog.innerHTML = `
          <div class="empty-state">
            <span>📊</span>
            <p>Brak aktywności do wyświetlenia</p>
          </div>
        `;
      }
    } catch (error) {
      console.error('Error loading activity:', error);
    }
  }

  // Statistics
  async function loadStatistics() {
    if (!isAdmin) return;
    
    try {
      // Users count
      const usersSnapshot = await database.ref('users').once('value');
      const totalUsers = usersSnapshot.numChildren();
      if (statTotalUsers) statTotalUsers.textContent = totalUsers;
      
      // Messages count
      const messagesSnapshot = await database.ref('messages').once('value');
      const totalMessages = messagesSnapshot.numChildren();
      if (statTotalMessages) statTotalMessages.textContent = totalMessages;
      
      // Encryptions count
      const statsSnapshot = await database.ref('system/stats/totalEncryptions').once('value');
      const totalEncryptions = statsSnapshot.val() || 0;
      if (statTotalEncryptions) statTotalEncryptions.textContent = totalEncryptions;
      
      // Online users
      const presenceSnapshot = await database.ref('presence').once('value');
      const onlineUsers = presenceSnapshot.numChildren();
      if (statOnlineNow) statOnlineNow.textContent = onlineUsers;
    } catch (error) {
      console.error('Error loading statistics:', error);
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
    loadStatistics();
    loadActivityLog();
    
    // Monitor access requests
    if (listeners.requests) listeners.requests.off();
    listeners.requests = database.ref('accessRequests');
    listeners.requests.on('value', (snapshot) => {
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
    
    // Monitor users
    if (listeners.users) listeners.users.off();
    listeners.users = database.ref('users');
    listeners.users.on('value', (snapshot) => {
      allUsers = {};
      
      if (snapshot.exists()) {
        snapshot.forEach((child) => {
          allUsers[child.key] = child.val();
        });
      }
      
      // Count only non-admin approved users
      const regularUsers = Object.values(allUsers).filter(u => u.approved && !u.isAdmin);
      if (usersCount) usersCount.textContent = regularUsers.length;
      
      renderUsersList();
    });
    
    // Monitor statistics
    if (listeners.stats) listeners.stats.off();
    listeners.stats = database.ref('system/stats');
    listeners.stats.on('value', () => {
      loadStatistics();
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
    
    // Filter to show only approved non-admin users
    const usersArray = Object.entries(allUsers).filter(([uid, user]) => {
      if (!user.approved || user.isAdmin) return false;
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return user.email.toLowerCase().includes(term) ||
             (user.displayName && user.displayName.toLowerCase().includes(term));
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
          <div class="user-avatar-item">
            ${user.photoURL ? 
              `<img src="${user.photoURL}" alt="${user.displayName}" />` :
              `<span>${(user.displayName || user.email)[0].toUpperCase()}</span>`
            }
          </div>
          <div class="user-details">
            <h4>${escapeHtml(user.displayName)}
              ${user.blocked ? '<span class="badge-blocked">Zablokowany</span>' : ''}
              ${!user.chatEnabled ? '<span class="chat-disabled-badge">Czat wyłączony</span>' : ''}
              ${user.autoApproved ? '<span class="badge-auto">Auto</span>' : ''}
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
          <button class="btn-settings" data-uid="${uid}">
            <svg viewBox="0 0 24 24" width="16" height="16">
              <path fill="currentColor" d="M12 15.5A3.5 3.5 0 0 1 8.5 12A3.5 3.5 0 0 1 12 8.5a3.5 3.5 0 0 1 3.5 3.5a3.5 3.5 0 0 1-3.5 3.5m7.43-2.53c.04-.32.07-.64.07-.97c0-.33-.03-.66-.07-1l2.11-1.63c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.39-1.06-.73-1.69-.98l-.37-2.65A.506.506 0 0 0 14 2h-4c-.25 0-.46.18-.5.42l-.37 2.65c-.63.25-1.17.59-1.69.98l-2.49-1c-.22-.08-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64L4.57 11c-.04.34-.07.67-.07 1c0 .33.03.65.07.97l-2.11 1.66c-.19.15-.25.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1.01c.52.4 1.06.74 1.69.99l.37 2.65c.04.24.25.42.5.42h4c.25 0 .46-.18.5-.42l.37-2.65c.63-.26 1.17-.59 1.69-.99l2.49 1.01c.22.08.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.66Z"/>
            </svg>
            Ustawienia
          </button>
        </div>
      </div>
    `).join('');
    
    // Add badge-auto styles
    const style = document.createElement('style');
    style.textContent = `
      .badge-auto {
        padding: 2px 8px;
        background: rgba(34, 211, 238, 0.2);
        color: var(--accent-secondary);
        border-radius: 12px;
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        margin-left: 8px;
      }
    `;
    if (!document.querySelector('style[data-badge-auto]')) {
      style.setAttribute('data-badge-auto', 'true');
      document.head.appendChild(style);
    }
    
    // Add event listeners to settings buttons
    document.querySelectorAll('.btn-settings').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const uid = btn.dataset.uid;
        if (uid) openUserSettings(uid);
      });
    });
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
      
      await logActivity('user_approved', { userId: uid, email: request.email });
      
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
      
      const request = pendingRequests[uid];
      
      const updates = {};
      updates[`accessRequests/${uid}/status`] = 'rejected';
      updates[`accessRequests/${uid}/rejectedAt`] = firebase.database.ServerValue.TIMESTAMP;
      updates[`accessRequests/${uid}/rejectedBy`] = currentUser.uid;
      
      await database.ref().update(updates);
      
      await logActivity('user_rejected', { userId: uid, email: request?.email });
      
      showToast('Prośba została odrzucona', 'success');
    } catch (error) {
      console.error('Reject error:', error);
      showToast('Błąd odrzucania: ' + error.message, 'error');
    }
  };

  function openUserSettings(uid) {
    if (!isAdmin) return;
    
    selectedUserId = uid;
    const user = allUsers[uid];
    
    if (!user) {
      showToast('Nie znaleziono użytkownika', 'error');
      return;
    }
    
    // Update modal content
    if (settingsUserEmail) settingsUserEmail.textContent = user.email;
    if (settingsUserJoined) settingsUserJoined.textContent = `Dołączył: ${formatDate(user.createdAt)}`;
    if (settingsUserAvatar) settingsUserAvatar.textContent = (user.displayName || user.email)[0].toUpperCase();
    
    if (userChatEnabled) userChatEnabled.checked = user.chatEnabled !== false;
    
    // Show/hide buttons based on block status
    if (user.blocked) {
      if (tempBlockBtn) tempBlockBtn.style.display = 'none';
      if (permBlockBtn) permBlockBtn.style.display = 'none';
      if (securityBlockBtn) securityBlockBtn.style.display = 'none';
      if (deleteUserBtn) deleteUserBtn.style.display = 'none';
      if (unblockBtn) unblockBtn.style.display = 'inline-block';
      
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
      if (tempBlockBtn) tempBlockBtn.style.display = 'inline-block';
      if (permBlockBtn) permBlockBtn.style.display = 'inline-block';
      if (securityBlockBtn) securityBlockBtn.style.display = 'inline-block';
      if (deleteUserBtn) deleteUserBtn.style.display = 'inline-block';
      if (unblockBtn) unblockBtn.style.display = 'none';
      
      const blockInfo = document.getElementById('current-block-info');
      if (blockInfo) blockInfo.style.display = 'none';
    }
    
    if (tempBlockForm) tempBlockForm.style.display = 'none';
    
    // Show modal
    if (userSettingsModal) userSettingsModal.style.display = 'flex';
  }

  // Make openUserSettings available globally for onclick
  window.openUserSettings = openUserSettings;

  // Theme selector
  document.querySelectorAll('.theme-option').forEach(btn => {
    btn.addEventListener('click', async () => {
      const theme = btn.dataset.theme;
      globalSettings.theme = theme;
      document.body.className = `theme-${theme}`;
      
      document.querySelectorAll('.theme-option').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      if (isAdmin) {
        await saveGlobalSettings();
      }
    });
  });

  // Admin Tools
  clearChatBtn?.addEventListener('click', async () => {
    if (!isAdmin || !confirm('Czy na pewno wyczyścić WSZYSTKIE wiadomości? Tej operacji nie można cofnąć!')) return;
    
    try {
      await database.ref('messages').remove();
      await logActivity('chat_cleared', {});
      showToast('Czat został wyczyszczony', 'success');
    } catch (error) {
      console.error('Clear chat error:', error);
      showToast('Błąd czyszczenia czatu', 'error');
    }
  });

  exportUsersBtn?.addEventListener('click', () => {
    if (!isAdmin) return;
    
    const data = JSON.stringify(allUsers, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users_${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    showToast('Dane użytkowników wyeksportowane', 'success');
  });

  broadcastBtn?.addEventListener('click', async () => {
    if (!isAdmin || !broadcastMessage?.value.trim()) return;
    
    try {
      await database.ref('messages').push({
        text: broadcastMessage.value.trim(),
        author: 'System',
        userId: 'system',
        email: 'system@alfawrogowie.app',
        isAdmin: true,
        timestamp: firebase.database.ServerValue.TIMESTAMP,
        type: 'system'
      });
      
      await logActivity('broadcast_sent', { message: broadcastMessage.value });
      
      broadcastMessage.value = '';
      showToast('Powiadomienie wysłane', 'success');
    } catch (error) {
      console.error('Broadcast error:', error);
      showToast('Błąd wysyłania powiadomienia', 'error');
    }
  });

  resetSettingsBtn?.addEventListener('click', async () => {
    if (!isAdmin || !confirm('Czy na pewno przywrócić domyślne ustawienia?')) return;
    
    globalSettings = {
      chatEnabled: true,
      autoApprove: false,
      rejectionCooldown: 3600000,
      enableTypingIndicators: true,
      theme: 'dark'
    };
    
    await saveGlobalSettings();
    await loadGlobalSettings();
    showToast('Ustawienia przywrócone', 'success');
  });

  // User Settings Modal Handlers
  closeUserSettings?.addEventListener('click', () => {
    if (userSettingsModal) userSettingsModal.style.display = 'none';
    selectedUserId = null;
  });

  tempBlockBtn?.addEventListener('click', () => {
    if (tempBlockForm) tempBlockForm.style.display = 'block';
  });

  confirmTempBlock?.addEventListener('click', async () => {
    if (!selectedUserId) return;
    
    const months = parseInt(document.getElementById('block-months')?.value) || 0;
    const days = parseInt(document.getElementById('block-days')?.value) || 0;
    const hours = parseInt(document.getElementById('block-hours')?.value) || 0;
    const minutes = parseInt(document.getElementById('block-minutes')?.value) || 0;
    const reason = document.getElementById('block-reason-input')?.value || 'Naruszenie regulaminu';
    
    if (months === 0 && days === 0 && hours === 0 && minutes === 0) {
      showToast('Podaj czas blokady', 'warning');
      return;
    }
    
    const expiry = calculateBlockExpiry(months, days, hours, minutes);
    
    try {
      await database.ref(`users/${selectedUserId}`).update({
        blocked: true,
        blockExpiry: expiry,
        blockReason: reason,
        blockPermanent: false,
        blockedAt: firebase.database.ServerValue.TIMESTAMP,
        blockedBy: currentUser.uid
      });
      
      const user = allUsers[selectedUserId];
      await logActivity('user_blocked', { userId: selectedUserId, email: user?.email, reason, expiry });
      
      showToast('Użytkownik zablokowany tymczasowo', 'success');
      if (userSettingsModal) userSettingsModal.style.display = 'none';
      
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
      
      const user = allUsers[selectedUserId];
      await logActivity('user_blocked', { userId: selectedUserId, email: user?.email, permanent: true });
      
      showToast('Użytkownik zablokowany na stałe', 'success');
      if (userSettingsModal) userSettingsModal.style.display = 'none';
      
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
      
      const user = allUsers[selectedUserId];
      await logActivity('user_blocked', { userId: selectedUserId, email: user?.email, reason: 'security' });
      
      showToast('Użytkownik zablokowany ze względów bezpieczeństwa', 'success');
      if (userSettingsModal) userSettingsModal.style.display = 'none';
      
    } catch (error) {
      console.error('Security block error:', error);
      showToast('Błąd blokowania: ' + error.message, 'error');
    }
  });

  deleteUserBtn?.addEventListener('click', async () => {
    if (!selectedUserId) return;
    
    const user = allUsers[selectedUserId];
    if (!user) return;
    
    if (!confirm(`UWAGA! Czy na pewno chcesz USUNĄĆ konto użytkownika ${user.email}?\n\nTa operacja jest NIEODWRACALNA!`)) {
      return;
    }
    
    if (!confirm('Czy jesteś ABSOLUTNIE pewien? To usunie wszystkie dane użytkownika!')) {
      return;
    }
    
    try {
      console.log('🗑️ Deleting user:', user.email);
      
      // Delete user data
      await database.ref(`users/${selectedUserId}`).remove();
      
      // Delete presence
      try {
        await database.ref(`presence/${selectedUserId}`).remove();
      } catch (e) {
        console.log('No presence to delete');
      }
      
      // Delete access request
      try {
        await database.ref(`accessRequests/${selectedUserId}`).remove();
      } catch (e) {
        console.log('No access request to delete');
      }
      
      // Delete user messages
      const messagesSnapshot = await database.ref('messages').once('value');
      if (messagesSnapshot.exists()) {
        const promises = [];
        messagesSnapshot.forEach((child) => {
          const message = child.val();
          if (message.userId === selectedUserId) {
            promises.push(database.ref(`messages/${child.key}`).remove());
          }
        });
        
        if (promises.length > 0) {
          await Promise.all(promises);
        }
      }
      
      await logActivity('user_deleted', { userId: selectedUserId, email: user.email });
      
      showToast(`Konto użytkownika ${user.email} zostało usunięte`, 'success');
      if (userSettingsModal) userSettingsModal.style.display = 'none';
      
    } catch (error) {
      console.error('Delete user error:', error);
      showToast('Błąd usuwania konta: ' + error.message, 'error');
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
      
      const user = allUsers[selectedUserId];
      await logActivity('user_unblocked', { userId: selectedUserId, email: user?.email });
      
      showToast('Użytkownik odblokowany', 'success');
      if (userSettingsModal) userSettingsModal.style.display = 'none';
      
    } catch (error) {
      console.error('Unblock error:', error);
      showToast('Błąd odblokowywania: ' + error.message, 'error');
    }
  });

  saveUserSettings?.addEventListener('click', async () => {
    if (!selectedUserId) return;
    
    try {
      await database.ref(`users/${selectedUserId}`).update({
        chatEnabled: userChatEnabled?.checked
      });
      
      showToast('Ustawienia zapisane', 'success');
      if (userSettingsModal) userSettingsModal.style.display = 'none';
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
      const targetTab = document.getElementById(`${tabName}-tab`);
      if (targetTab) {
        targetTab.classList.add('active');
        
        // Load data when tab is opened
        if (tabName === 'stats') {
          loadStatistics();
          loadActivityLog();
        }
      }
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

  enableTypingIndicators?.addEventListener('change', async (e) => {
    globalSettings.enableTypingIndicators = e.target.checked;
    await saveGlobalSettings();
  });

  rejectionCooldownSelect?.addEventListener('change', async (e) => {
    globalSettings.rejectionCooldown = parseInt(e.target.value);
    await saveGlobalSettings();
  });

  // User Search
  usersSearchInput?.addEventListener('input', (e) => {
    renderUsersList(e.target.value);
  });

  // Admin Panel Open/Close
  adminPanelBtn?.addEventListener('click', () => {
    if (adminPanel) adminPanel.style.display = 'flex';
  });

  closeAdminPanel?.addEventListener('click', () => {
    if (adminPanel) adminPanel.style.display = 'none';
  });

  // Check Status Button
  document.getElementById('check-status-btn')?.addEventListener('click', async () => {
    if (!currentUser) return;
    
    try {
      await loadGlobalSettings();
      
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
            const canRetry = await checkRejectionCooldown(currentUser.uid);
            if (canRetry) {
              showToast('Możesz teraz ponownie wysłać prośbę o dostęp', 'info');
              showRejectionCooldown(requestData);
            } else {
              showRejectionCooldown(requestData);
            }
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
      
      if (!userSnapshot.exists()) {
        showAuthError('Twoje konto zostało usunięte');
        await auth.signOut();
        return;
      }
      
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

  // Typing indicators
  function setupTypingIndicators() {
    if (!globalSettings.enableTypingIndicators) return;
    
    messageInput?.addEventListener('input', () => {
      if (!currentUser) return;
      
      if (!isTyping) {
        isTyping = true;
        database.ref(`typing/${currentUser.uid}`).set({
          name: currentUser.displayName || currentUser.email.split('@')[0],
          timestamp: firebase.database.ServerValue.TIMESTAMP
        });
      }
      
      clearTimeout(typingTimer);
      typingTimer = setTimeout(() => {
        isTyping = false;
        database.ref(`typing/${currentUser.uid}`).remove();
      }, 1000);
    });
    
    // Listen to typing users
    if (listeners.typing) listeners.typing.off();
    listeners.typing = database.ref('typing');
    listeners.typing.on('value', (snapshot) => {
      typingUsersMap = {};
      
      if (snapshot.exists()) {
        snapshot.forEach((child) => {
          if (child.key !== currentUser.uid) {
            typingUsersMap[child.key] = child.val();
          }
        });
      }
      
      updateTypingIndicator();
    });
  }

  function updateTypingIndicator() {
    if (!typingUsers) return;
    
    const typingList = Object.values(typingUsersMap);
    
    if (typingList.length === 0) {
      typingUsers.style.display = 'none';
    } else {
      const names = typingList.map(u => u.name);
      const text = names.length === 1 
        ? `${names[0]} pisze...`
        : `${names.join(', ')} piszą...`;
      
      typingUsers.querySelector('.typing-text').textContent = text;
      typingUsers.style.display = 'block';
    }
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
      cleanupListeners();
      
      if (userPresenceRef) {
        await userPresenceRef.remove();
      }
      
      if (isTyping) {
        await database.ref(`typing/${currentUser.uid}`).remove();
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
    userDropdown?.classList.toggle('show');
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
      
      cleanupListeners();
      
      if (userPresenceRef) {
        userPresenceRef.remove();
        userPresenceRef = null;
      }
      
      if (googleAuthStep) googleAuthStep.style.display = 'block';
      if (pendingApproval) pendingApproval.style.display = 'none';
      if (accountBlocked) accountBlocked.style.display = 'none';
      if (rejectionCooldown) rejectionCooldown.style.display = 'none';
      
      authScreen.style.display = 'flex';
      appScreen.style.display = 'none';
    }
  });

  // Chat Functions
  function startChatListeners() {
    if (!messagesArea) return;
    
    messagesArea.innerHTML = `
      <div class="chat-welcome">
        <div class="welcome-animation">
          <span class="welcome-emoji">💬</span>
        </div>
        <h3>Witaj w czacie!</h3>
        <p>Rozpocznij rozmowę z innymi użytkownikami</p>
      </div>
    `;

    if (listeners.messages) listeners.messages.off();
    listeners.messages = database.ref('messages').limitToLast(50);
    
    listeners.messages.once('value', (snapshot) => {
      if (snapshot.exists()) {
        messagesArea.innerHTML = '';
        snapshot.forEach((childSnapshot) => {
          renderMessage(childSnapshot.val(), childSnapshot.key);
        });
        messagesArea.scrollTop = messagesArea.scrollHeight;
      }
    });

    listeners.messages.on('child_added', (snapshot) => {
      if (!document.querySelector(`[data-message-id="${snapshot.key}"]`)) {
        renderMessage(snapshot.val(), snapshot.key);
        
        // Auto-scroll if near bottom
        if (messagesArea.scrollHeight - messagesArea.scrollTop - messagesArea.clientHeight < 100) {
          messagesArea.scrollTop = messagesArea.scrollHeight;
        } else {
          // Show scroll to bottom button
          if (scrollBottomBtn) scrollBottomBtn.style.display = 'flex';
        }
      }
    });

    listeners.messages.on('child_removed', (snapshot) => {
      const messageEl = document.querySelector(`[data-message-id="${snapshot.key}"]`);
      if (messageEl) {
        messageEl.style.animation = 'messageSlide 0.3s ease reverse';
        setTimeout(() => messageEl.remove(), 300);
      }
    });

    if (listeners.presence) listeners.presence.off();
    listeners.presence = database.ref('presence');
    listeners.presence.on('value', (snapshot) => {
      const users = snapshot.val() || {};
      const onlineUsers = Object.values(users).filter(u => u.isOnline);
      if (onlineCount) onlineCount.textContent = `${onlineUsers.length} online`;
    });
    
    setupTypingIndicators();
  }

  // Scroll to bottom button
  scrollBottomBtn?.addEventListener('click', () => {
    if (messagesArea) {
      messagesArea.scrollTop = messagesArea.scrollHeight;
      scrollBottomBtn.style.display = 'none';
    }
  });

  // Hide scroll button when scrolling near bottom
  messagesArea?.addEventListener('scroll', () => {
    if (messagesArea.scrollHeight - messagesArea.scrollTop - messagesArea.clientHeight < 100) {
      if (scrollBottomBtn) scrollBottomBtn.style.display = 'none';
    }
  });

  function renderMessage(data, messageId) {
    if (!messagesArea) return;
    
    const welcome = messagesArea.querySelector('.chat-welcome');
    if (welcome) welcome.remove();

    if (document.querySelector(`[data-message-id="${messageId}"]`)) {
      return;
    }

    const messageDiv = document.createElement('div');
    messageDiv.className = 'message';
    messageDiv.dataset.messageId = messageId;
    
    if (data.userId === currentUser?.uid) {
      messageDiv.classList.add('own');
    }
    
    if (data.isAdmin) {
      messageDiv.classList.add('admin');
    }
    
    if (data.type === 'system') {
      messageDiv.classList.add('system');
    }
    
    const time = data.timestamp ? new Date(data.timestamp).toLocaleTimeString('pl-PL', {
      hour: '2-digit',
      minute: '2-digit'
    }) : '';
    
    if (data.type === 'system') {
      messageDiv.innerHTML = `
        <div class="message-content">${escapeHtml(data.text)}</div>
      `;
    } else {
      const authorClass = data.isAdmin ? 'admin' : '';
      const authorPrefix = data.isAdmin ? '👑 ' : '';
      
      messageDiv.innerHTML = `
        <div class="message-header">
          <span class="message-author ${authorClass}">${authorPrefix}${escapeHtml(data.author)}</span>
          <span class="message-time">${time}</span>
        </div>
        <div class="message-content" data-text="${escapeHtml(data.text)}">${escapeHtml(data.text)}</div>
      `;
    }
    
    const messageContent = messageDiv.querySelector('.message-content');
    messageContent?.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      showContextMenu(e, messageId, data.text, data.userId);
    });
    
    let pressTimer;
    messageContent?.addEventListener('touchstart', (e) => {
      pressTimer = setTimeout(() => {
        e.preventDefault();
        showContextMenu(e.touches[0], messageId, data.text, data.userId);
      }, 500);
    });
    
    messageContent?.addEventListener('touchend', () => {
      clearTimeout(pressTimer);
    });
    
    messagesArea.appendChild(messageDiv);
  }

  function showContextMenu(e, messageId, messageText, messageUserId) {
    selectedMessageId = messageId;
    selectedMessageText = messageText;
    
    if (contextMenu) {
      contextMenu.style.left = `${e.pageX}px`;
      contextMenu.style.top = `${e.pageY}px`;
      
      if (deleteMessageBtn) {
        if (isAdmin || messageUserId === currentUser?.uid) {
          deleteMessageBtn.style.display = 'flex';
        } else {
          deleteMessageBtn.style.display = 'none';
        }
      }
      
      contextMenu.classList.add('show');
    }
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
    contextMenu?.classList.remove('show');
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
    contextMenu?.classList.remove('show');
  });

  // Chat form
  chatForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!messageInput) return;
    
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
      
      // Clear typing indicator
      if (isTyping) {
        isTyping = false;
        await database.ref(`typing/${currentUser.uid}`).remove();
      }
    } catch (error) {
      showToast('Błąd wysyłania wiadomości', 'error');
      console.error('Send error:', error);
    }
  });

  // Enter to send
  messageInput?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      chatForm?.dispatchEvent(new Event('submit'));
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
      return reverseMap[ch] || ch;
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
    if (!inputEl || !outputEl) return;
    const inLen = Array.from(inputEl.value).length;
    const outLen = Array.from(outputEl.textContent).length;
    if (inputCount) inputCount.textContent = `${inLen} ${pluralize(inLen, 'znak', 'znaki', 'znaków')}`;
    if (outputCount) outputCount.textContent = `${outLen} ${pluralize(outLen, 'znak', 'znaki', 'znaków')}`;
  }

  async function loadEncryptionStats() {
    try {
      const snapshot = await database.ref('system/stats/totalEncryptions').once('value');
      encodedCount = snapshot.val() || 0;
      if (totalEncoded) totalEncoded.textContent = encodedCount;
    } catch (error) {
      console.error('Error loading encryption stats:', error);
    }
  }

  async function incrementEncryptionStats() {
    try {
      encodedCount++;
      if (totalEncoded) totalEncoded.textContent = encodedCount;
      await database.ref('system/stats/totalEncryptions').set(encodedCount);
    } catch (error) {
      console.error('Error updating encryption stats:', error);
    }
  }

  let transformTimeout;
  function transform() {
    if (!inputEl || !outputEl) return;
    
    // Show typing indicator
    if (typingIndicator && inputEl.value.length > 0) {
      typingIndicator.style.display = 'flex';
    }
    
    clearTimeout(transformTimeout);
    transformTimeout = setTimeout(() => {
      const text = inputEl.value || '';
      const result = cipherMode === 'encode' ? encode(text) : decode(text);
      
      // Update output with animation
      outputEl.style.opacity = '0';
      setTimeout(() => {
        outputEl.textContent = result;
        outputEl.style.opacity = '1';
      }, 150);
      
      updateCounts();
      
      // Hide typing indicator
      if (typingIndicator) {
        typingIndicator.style.display = 'none';
      }
      
      // Track encryption if encoding and has result
      if (cipherMode === 'encode' && result.length > 0 && text !== lastEncodedText) {
        lastEncodedText = text;
        incrementEncryptionStats();
      }
    }, 300);
  }

  let lastEncodedText = '';

  function setMode(mode) {
    cipherMode = mode;
    const isDecode = mode === 'decode';
    
    if (btnEncode) btnEncode.classList.toggle('active', !isDecode);
    if (btnDecode) btnDecode.classList.toggle('active', isDecode);
    
    if (inputLabel) inputLabel.textContent = isDecode ? 'Tekst do odszyfrowania' : 'Tekst do zaszyfrowania';
    if (outputLabel) outputLabel.textContent = isDecode ? 'Odszyfrowany tekst' : 'Zaszyfrowany tekst';
    
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

  btnEncode?.addEventListener('click', () => setMode('encode'));
  btnDecode?.addEventListener('click', () => setMode('decode'));

  btnPaste?.addEventListener('click', async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (inputEl) {
        inputEl.value = text;
        transform();
        inputEl.focus();
        showToast('Wklejono tekst', 'success');
      }
    } catch {
      showToast('Nie można wkleić - brak uprawnień', 'error');
    }
  });

  btnClear?.addEventListener('click', () => {
    if (inputEl) inputEl.value = '';
    if (outputEl) outputEl.textContent = '';
    updateCounts();
    if (inputEl) inputEl.focus();
    showToast('Wyczyszczono', 'success');
  });

  btnSwap?.addEventListener('click', () => {
    if (inputEl && outputEl) {
      inputEl.value = outputEl.textContent;
      setMode(cipherMode === 'encode' ? 'decode' : 'encode');
      inputEl.focus();
      showToast('Zamieniono kierunek', 'success');
    }
  });

  btnCopyOut?.addEventListener('click', async () => {
    const text = outputEl?.textContent;
    if (!text) {
      showToast('Brak wyniku do skopiowania', 'warning');
      return;
    }
    
    const ok = await copyToClipboard(text);
    if (ok) {
      // Show success animation
      if (copySuccess) {
        copySuccess.style.display = 'block';
        setTimeout(() => {
          copySuccess.style.display = 'none';
        }, 2000);
      }
      showToast('Skopiowano wynik', 'success');
    } else {
      showToast('Błąd kopiowania', 'error');
    }
  });

  // Initialize cipher
  setMode('encode');
  if (inputEl && outputEl) {
    transform();
    
    // Add smooth transitions
    outputEl.style.transition = 'opacity 0.3s ease';
  }

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
      // Allow Ctrl+Enter to submit chat
      if (e.ctrlKey && e.key === 'Enter' && e.target.id === 'message-input') {
        e.preventDefault();
        chatForm?.dispatchEvent(new Event('submit'));
      }
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
        case 'e':
          e.preventDefault();
          setMode('encode');
          break;
        case 'd':
          e.preventDefault();
          setMode('decode');
          break;
      }
    }
  });

  // Modal close on ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (adminPanel && adminPanel.style.display === 'flex') {
        adminPanel.style.display = 'none';
      }
      if (userSettingsModal && userSettingsModal.style.display === 'flex') {
        userSettingsModal.style.display = 'none';
      }
      if (contextMenu && contextMenu.classList.contains('show')) {
        contextMenu.classList.remove('show');
      }
    }
  });

  // Close modals on background click
  adminPanel?.addEventListener('click', (e) => {
    if (e.target === adminPanel) {
      adminPanel.style.display = 'none';
    }
  });

  userSettingsModal?.addEventListener('click', (e) => {
    if (e.target === userSettingsModal) {
      userSettingsModal.style.display = 'none';
    }
  });

  // Cleanup on unload
  window.addEventListener('beforeunload', () => {
    cleanupListeners();
    
    if (userPresenceRef) {
      userPresenceRef.remove();
    }
    
    if (isTyping && currentUser) {
      database.ref(`typing/${currentUser.uid}`).remove();
    }
  });

  // Performance monitoring
  let lastActivityTime = Date.now();
  document.addEventListener('mousemove', () => {
    lastActivityTime = Date.now();
  });

  document.addEventListener('keypress', () => {
    lastActivityTime = Date.now();
  });

  // Auto-logout after 30 minutes of inactivity
  setInterval(() => {
    if (currentUser && !isAdmin) {
      const inactiveTime = Date.now() - lastActivityTime;
      if (inactiveTime > 30 * 60 * 1000) { // 30 minutes
        showToast('Wylogowano z powodu braku aktywności', 'warning');
        auth.signOut();
      }
    }
  }, 60000); // Check every minute

  // Service worker registration (for future PWA support)
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch(err => {
        console.log('ServiceWorker registration failed:', err);
      });
    });
  }

  // Initialize app
  console.log('🚀 Alfawrogowie v3.0 - Enhanced Edition by Reapk');
  console.log('👑 First Google user becomes admin');
  console.log('🔐 Real-time settings & monitoring active');
  console.log('🛡️ Full account management with cooldowns');
  console.log('💬 Enhanced chat with typing indicators');
  console.log('🎨 Multiple themes available');
  console.log('📊 Statistics & activity tracking');
  console.log('⚡ Performance optimized');
  console.log('🔧 Powered by Reapk');
  console.log('📅 Build date: 2025-01-24');
  
  // Version check
  const APP_VERSION = '3.0.0';
  database.ref('system/version').once('value', (snapshot) => {
    const serverVersion = snapshot.val();
    if (serverVersion && serverVersion !== APP_VERSION) {
      console.log(`📦 New version available: ${serverVersion}`);
      showToast('Nowa wersja aplikacji jest dostępna. Odśwież stronę.', 'info');
    }
  });

  // Set app version
  if (isFirstUser()) {
    database.ref('system/version').set(APP_VERSION);
  }

  // Activity logging for cipher usage
  let cipherUsageCount = 0;
  setInterval(() => {
    if (cipherUsageCount > 0) {
      database.ref('system/stats/cipherUsage').push({
        userId: currentUser?.uid,
        count: cipherUsageCount,
        timestamp: firebase.database.ServerValue.TIMESTAMP
      });
      cipherUsageCount = 0;
    }
  }, 60000); // Log every minute

  inputEl?.addEventListener('input', () => {
    cipherUsageCount++;
  });

  // Add visual feedback for admin actions
  function addActionFeedback(element, type = 'success') {
    const originalBg = element.style.background;
    element.style.background = type === 'success' ? '#22c55e' : '#ef4444';
    element.style.transition = 'background 0.3s ease';
    
    setTimeout(() => {
      element.style.background = originalBg;
    }, 300);
  }

  // Easter egg for developers
  let konamiCode = [];
  const konamiPattern = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
  
  document.addEventListener('keydown', (e) => {
    konamiCode.push(e.key);
    konamiCode = konamiCode.slice(-10);
    
    if (konamiCode.join(',') === konamiPattern.join(',')) {
      showToast('🎮 Konami Code activated! Made with ❤️ by Reapk', 'success');
      document.body.style.animation = 'pulse 1s ease';
      setTimeout(() => {
        document.body.style.animation = '';
      }, 1000);
    }
  });

  // Final initialization complete
  console.log('✅ Application fully initialized');
})();