import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
  getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, 
  signOut, onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { 
  getFirestore, doc, setDoc, getDoc, collection, addDoc, 
  query, where, orderBy, onSnapshot, updateDoc, arrayUnion, arrayRemove, deleteDoc 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// إعدادات مشروع Firebase الخاص بك
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// مصادقة الحسابات
export const loginUser = (email, password) => signInWithEmailAndPassword(auth, email, password);

export const registerUser = async (email, password, name, username) => {
  const res = await createUserWithEmailAndPassword(auth, email, password);
  await setDoc(doc(db, "users", res.user.uid), {
    uid: res.user.uid,
    name,
    username,
    email,
    bio: "",
    createdAt: new Date().toISOString()
  });
  return res.user;
};

export const logoutUser = () => signOut(auth);
export const listenAuth = (callback) => onAuthStateChanged(auth, callback);

// بيانات الحساب
export const fetchProfile = async (uid) => {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? snap.data() : null;
};

export const updateProfileData = (uid, data) => updateDoc(doc(db, "users", uid), data);

// المنشورات
export const createPost = (uid, authorName, authorUsername, content, mediaUrl = null) => {
  return addDoc(collection(db, "posts"), {
    uid,
    authorName,
    authorUsername,
    content,
    mediaUrl,
    likes: [],
    createdAt: new Date().toISOString()
  });
};

export const watchPosts = (callback) => {
  const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
  return onSnapshot(q, snap => {
    const posts = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(posts);
  });
};

export const toggleLike = async (postId, uid) => {
  const ref = doc(db, "posts", postId);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    const likes = snap.data().likes || [];
    if (likes.includes(uid)) {
      await updateDoc(ref, { likes: arrayRemove(uid) });
    } else {
      await updateDoc(ref, { likes: arrayUnion(uid) });
    }
  }
};

// التعليقات
export const addComment = (postId, uid, name, text) => {
  return addDoc(collection(db, `posts/${postId}/comments`), {
    uid,
    name,
    text,
    createdAt: new Date().toISOString()
  });
};

export const watchComments = (postId, callback) => {
  const q = query(collection(db, `posts/${postId}/comments`), orderBy("createdAt", "asc"));
  return onSnapshot(q, snap => {
    const comments = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(comments);
  });
};

// المحادثات والرسائل
export const watchChats = (uid, callback) => {
  const q = query(collection(db, "chats"), where("participants", "array-contains", uid));
  return onSnapshot(q, snap => {
    const chats = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(chats);
  });
};

export const watchMessages = (chatId, callback) => {
  const q = query(collection(db, `chats/${chatId}/messages`), orderBy("createdAt", "asc"));
  return onSnapshot(q, snap => {
    const msgs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(msgs);
  });
};

export const sendMessageDB = async (chatId, senderId, text) => {
  await addDoc(collection(db, `chats/${chatId}/messages`), {
    senderId,
    text,
    createdAt: new Date().toISOString()
  });
  await updateDoc(doc(db, "chats", chatId), {
    lastMessage: text,
    updatedAt: new Date().toISOString()
  });
};

// الحذف الحقيقي للحساب
export const deleteAccountDB = async (uid) => {
  await deleteDoc(doc(db, "users", uid));
};