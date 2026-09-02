import { 
  loginUser, registerUser, logoutUser, listenAuth, 
  fetchProfile, updateProfileData, watchPosts, createPost, 
  watchComments, addComment, toggleLike, watchChats, 
  sendMessageDB, watchMessages, deleteAccountDB 
} from './firebase.js';

// المتغيرات العامة للنظام
let currentUser = null;
let currentProfile = null;
let activeTab = 'feed';
let activeChatId = null;
let commentListeners = {};
let messageListener = null;

// مساعدة السلاسل النصية
const esc = str => (str || '').replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// تهيئة التطبيق والتأكد من جلسة المستخدم
listenAuth(async user => {
  if (user) {
    currentUser = user;
    currentProfile = await fetchProfile(user.uid);
    document.getElementById('authScreen').classList.add('hidden');
    document.getElementById('mainApp').classList.remove('hidden');
    initApp();
  } else {
    currentUser = null;
    currentProfile = null;
    document.getElementById('authScreen').classList.remove('hidden');
    document.getElementById('mainApp').classList.add('hidden');
  }
});

function initApp() {
  loadFeed();
  loadProfileData();
  setupChatList();
}

// تبديل تبويب التسجيل/الدخول
window.switchAuthTab = tab => {
  document.getElementById('loginTabBtn').classList.toggle('active', tab === 'login');
  document.getElementById('registerTabBtn').classList.toggle('active', tab === 'register');
  document.getElementById('loginForm').classList.toggle('hidden', tab !== 'login');
  document.getElementById('registerForm').classList.toggle('hidden', tab !== 'register');
};

// تسجيل الدخول
window.handleLogin = async e => {
  e.preventDefault();
  const btn = document.getElementById('loginSubmitBtn');
  btn.disabled = true;
  try {
    const email = document.getElementById('loginEmail').value;
    const pass = document.getElementById('loginPassword').value;
    await loginUser(email, pass);
  } catch (err) {
    showAuthError(err.message);
  } finally {
    btn.disabled = false;
  }
};

// إنشاء حساب جديد
window.handleRegister = async e => {
  e.preventDefault();
  const btn = document.getElementById('regSubmitBtn');
  btn.disabled = true;
  try {
    const name = document.getElementById('regName').value;
    const username = document.getElementById('regUsername').value;
    const email = document.getElementById('regEmail').value;
    const pass = document.getElementById('regPassword').value;
    await registerUser(email, pass, name, username);
  } catch (err) {
    showAuthError(err.message);
  } finally {
    btn.disabled = false;
  }
};

function showAuthError(msg) {
  const errBox = document.getElementById('authError');
  errBox.textContent = msg;
  errBox.classList.remove('hidden');
}

// التنقل بين الأقسام
window.switchTab = tab => {
  activeTab = tab;
  document.querySelectorAll('.tab-page').forEach(el => el.classList.add('hidden'));
  document.querySelectorAll('.nav-btn').forEach(el => el.classList.remove('active'));
  
  const target = document.getElementById(`tab-${tab}`);
  if (target) target.classList.remove('hidden');
  
  if (tab === 'profile') loadProfileData();
};

// تحميل المنشورات الرئيسية
function loadFeed() {
  watchPosts(posts => {
    const feed = document.getElementById('postsFeed');
    feed.innerHTML = posts.map(p => renderPostCard(p)).join('');
  });
}

function renderPostCard(p) {
  const isLiked = p.likes && p.likes.includes(currentUser.uid);
  return `
    <div class="post-card" id="post-${p.id}">
      <div class="post-header">
        <div class="avatar"></div>
        <div>
          <strong>${esc(p.authorName)}</strong>
          <small class="muted">@${esc(p.authorUsername)}</small>
        </div>
      </div>
      <div class="post-content">${esc(p.content)}</div>
      ${p.mediaUrl ? `<img src="${p.mediaUrl}" class="post-media">` : ''}
      <div class="post-actions">
        <button onclick="handleLike('${p.id}')">${isLiked ? '❤️' : '🤍'} ${p.likes ? p.likes.length : 0}</button>
        <button onclick="toggleComments('${p.id}')">💬 تعليق</button>
      </div>
      <div id="commentsBox-${p.id}" class="comments-box hidden">
        <div id="commentsList-${p.id}" class="comments-list"></div>
        <div class="comment-input-row">
          <input type="text" id="commentInput-${p.id}" placeholder="اكتب تعليقاً...">
          <button onclick="submitComment('${p.id}')">إرسال</button>
        </div>
      </div>
    </div>
  `;
}

// إدارة التعليقات وإلغاء الاستماع لحفظ الأداء
window.toggleComments = id => {
  const box = document.getElementById(`commentsBox-${id}`);
  if (!box) return;
  
  box.classList.toggle('hidden');
  
  if (!box.classList.contains('hidden')) {
    if (!commentListeners[id]) {
      commentListeners[id] = watchComments(id, cs => {
        const l = document.getElementById(`commentsList-${id}`);
        if (l) l.innerHTML = cs.map(c => `<div class="comment"><strong>${esc(c.name)}:</strong> <span>${esc(c.text)}</span></div>`).join('');
      });
    }
  } else {
    if (commentListeners[id]) {
      commentListeners[id]();
      delete commentListeners[id];
    }
  }
};

window.submitComment = async id => {
  const input = document.getElementById(`commentInput-${id}`);
  if (!input.value.trim()) return;
  await addComment(id, currentUser.uid, currentProfile.name, input.value.trim());
  input.value = '';
};

window.handleLike = async id => {
  await toggleLike(id, currentUser.uid);
};

// إنشاء منشور جديد
window.openCreatePostModal = () => {
  document.getElementById('modalOverlay').classList.remove('hidden');
  document.getElementById('createPostModal').classList.remove('hidden');
};

window.closeModal = () => {
  document.getElementById('modalOverlay').classList.add('hidden');
  document.querySelectorAll('.modal-card').forEach(m => m.classList.add('hidden'));
};

window.publishPost = async () => {
  const content = document.getElementById('postContentInput').value;
  const btn = document.getElementById('publishPostBtn');
  if (!content.trim()) return;

  btn.disabled = true;
  try {
    await createPost(currentUser.uid, currentProfile.name, currentProfile.username, content);
    document.getElementById('postContentInput').value = '';
    closeModal();
  } finally {
    btn.disabled = false;
  }
};

// المراسلات والمحادثات
function setupChatList() {
  watchChats(currentUser.uid, chats => {
    const list = document.getElementById('chatsList');
    list.innerHTML = chats.map(c => `
      <div class="chat-item" onclick="openChat('${c.id}', '${esc(c.name)}')">
        <div class="avatar"></div>
        <div>
          <strong>${esc(c.name)}</strong>
          <small class="muted">${esc(c.lastMessage || '')}</small>
        </div>
      </div>
    `).join('');
  });
}

window.openChat = (chatId, name) => {
  activeChatId = chatId;
  document.getElementById('chatName').textContent = name;
  document.getElementById('chatPanel').classList.remove('hidden');
  
  if (messageListener) messageListener();
  messageListener = watchMessages(chatId, msgs => {
    const box = document.getElementById('messagesList');
    box.innerHTML = msgs.map(m => `
      <div class="message ${m.senderId === currentUser.uid ? 'outgoing' : 'incoming'}">
        ${esc(m.text)}
      </div>
    `).join('');
    box.scrollTop = box.scrollHeight;
  });
};

window.closeChat = () => {
  document.getElementById('chatPanel').classList.add('hidden');
  if (messageListener) {
    messageListener();
    messageListener = null;
  }
};

window.sendMessage = async () => {
  const input = document.getElementById('messageInput');
  const btn = document.getElementById('sendMessageBtn');
  const text = input.value.trim();
  if (!text || !activeChatId) return;

  btn.disabled = true;
  try {
    await sendMessageDB(activeChatId, currentUser.uid, text);
    input.value = '';
  } finally {
    btn.disabled = false;
  }
};

// الملف الشخصي
async function loadProfileData() {
  if (!currentProfile) return;
  document.getElementById('profileName').textContent = currentProfile.name || '';
  document.getElementById('profileHandle').textContent = `@${currentProfile.username || ''}`;
  document.getElementById('profileBio').textContent = currentProfile.bio || 'لا يوجد وصف حتى الآن.';
}

// الإعدادات والخروج
window.toggleTheme = () => {
  document.body.classList.toggle('theme-midnight');
  document.body.classList.toggle('theme-light');
};

window.logout = async () => {
  Object.keys(commentListeners).forEach(k => commentListeners[k]());
  commentListeners = {};
  if (messageListener) messageListener();
  
  await logoutUser();
};

window.deleteOwnAccount = async () => {
  if (confirm('هل أنت تأكد من رغبتك في حذف الحساب نهائياً؟ لا يمكن التراجع عن هذا الإجراء.')) {
    await deleteAccountDB(currentUser.uid);
    await logout();
  }
};