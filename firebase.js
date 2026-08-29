import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile, deleteUser } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, addDoc, updateDoc, query, orderBy, onSnapshot, where, serverTimestamp, increment, deleteDoc, limit } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-storage.js";

const firebaseConfig={apiKey:"AIzaSyCozliS7NxC254xIj5BOnytKv850ryQb0A",authDomain:"krono-7c70a.firebaseapp.com",projectId:"krono-7c70a",storageBucket:"krono-7c70a.firebasestorage.app",messagingSenderId:"473411537548",appId:"1:473411537548:web:7950a847b319fa88cc09a9",measurementId:"G-R7XKPK26EN"};
const app=initializeApp(firebaseConfig),auth=getAuth(app),db=getFirestore(app),storage=getStorage(app);
export async function registerUser(name,username,email,password,phone,birth,gender){const r=await createUserWithEmailAndPassword(auth,email,password);await updateProfile(r.user,{displayName:name});await setDoc(doc(db,"users",r.user.uid),{uid:r.user.uid,name,username:username.replace(/^@/,""),email,phone:phone||"",birth,gender,bio:"عضو في Arlo",friendsCount:0,publicEmail:false,avatarUrl:"",coverUrl:"",createdAt:serverTimestamp()});return r.user}
export async function loginUser(email,password){return (await signInWithEmailAndPassword(auth,email,password)).user}
export async function logoutUser(){await signOut(auth)}
export function watchAuth(cb){return onAuthStateChanged(auth,cb)}
export async function getUserProfile(uid){const s=await getDoc(doc(db,"users",uid));return s.exists()?{id:s.id,...s.data()}:null}
export function watchUserProfile(uid,cb,onError){return onSnapshot(doc(db,"users",uid),s=>cb(s.exists()?{id:s.id,...s.data()}:null),onError)}
export async function deleteOwnAccount(){const user=auth.currentUser;if(!user)throw new Error("لا يوجد حساب مسجل الدخول.");await deleteDoc(doc(db,"users",user.uid));await deleteUser(user)}
export async function updateUserProfile(uid,data){await updateDoc(doc(db,"users",uid),data);if(data.name)await updateProfile(auth.currentUser,{displayName:data.name})}
export async function uploadProfileMedia(uid,file,type,onProgress=null){if(!file) return "";return uploadFile(file,`profiles/${uid}/${type}`,onProgress)}
export async function findUsers(term){const snap=await getDocs(query(collection(db,"users"),limit(40)));const t=term.toLowerCase().replace(/^@/,"");return snap.docs.map(d=>({id:d.id,...d.data()})).filter(u=>(u.name||"").toLowerCase().includes(t)||(u.username||"").toLowerCase().includes(t)).slice(0,12)}
export async function getUsers(){const snap=await getDocs(query(collection(db,"users"),limit(30)));return snap.docs.map(d=>({id:d.id,...d.data()})).slice(0,20)}
export function watchUsers(cb){const q=query(collection(db,"users"),limit(30));return onSnapshot(q,s=>cb(s.docs.map(d=>({id:d.id,...d.data()})).slice(0,20)))}
export async function createPost(user,text,mediaFile=null,onProgress=null,options={}){const mediaUrl=mediaFile?await uploadFile(mediaFile,`posts/${user.uid}`,onProgress):"";return addDoc(collection(db,"posts"),{uid:user.uid,name:user.displayName||"مستخدم Arlo",text,mediaUrl,mediaType:mediaFile?(mediaFile.type.startsWith("video")?"video":"image"):"text",musicUrl:options.musicUrl||"",style:options.style||{},likesCount:0,commentsCount:0,viewsCount:0,reactionCounts:{},createdAt:serverTimestamp()})}
export async function updatePostText(postId,uid,text){const r=doc(db,"posts",postId),s=await getDoc(r);if(!s.exists())throw new Error("المنشور غير موجود.");if(s.data().uid!==uid)throw new Error("لا تملك صلاحية تعديل هذا المنشور.");await updateDoc(r,{text,updatedAt:serverTimestamp()})}
export async function deletePost(postId,uid){const r=doc(db,"posts",postId),s=await getDoc(r);if(!s.exists())return;if(s.data().uid!==uid)throw new Error("لا تملك صلاحية حذف هذا المنشور.");await deleteDoc(r)}
export async function reportContent(type,targetId,uid,reason){await addDoc(collection(db,"reports"),{type,targetId,uid,reason:reason||"محتوى غير مناسب",createdAt:serverTimestamp()})}
export function watchPosts(cb,onError){const q=query(collection(db,"posts"),orderBy("createdAt","desc"),limit(30));return onSnapshot(q,s=>cb(s.docs.map(d=>({id:d.id,...d.data()}))),e=>{console.error("watchPosts failed:",e);onError?.(e)})}
export async function toggleReaction(type,targetId,uid,reaction){const id=`${type}_${targetId}_${uid}`,r=doc(db,"reactions",id),s=await getDoc(r);const target=doc(db,type==="post"?"posts":"stories",targetId);let old=null;if(s.exists())old=s.data().reaction||null;if(old===reaction){await deleteDoc(r);await updateDoc(target,{[`reactionCounts.${reaction}`]:increment(-1),likesCount:increment(-1)});return {reaction:null,changed:false}}if(old){await updateDoc(target,{[`reactionCounts.${old}`]:increment(-1),[`reactionCounts.${reaction}`]:increment(1)});await setDoc(r,{type,targetId,uid,reaction,updatedAt:serverTimestamp()});return {reaction,changed:true}}await setDoc(r,{type,targetId,uid,reaction,createdAt:serverTimestamp()});await updateDoc(target,{[`reactionCounts.${reaction}`]:increment(1),likesCount:increment(1)});return {reaction,changed:true}}
export async function getMyReaction(type,targetId,uid){const s=await getDoc(doc(db,"reactions",`${type}_${targetId}_${uid}`));return s.exists()?s.data().reaction:null}
export async function savePostView(postId,uid){const r=doc(db,"postViews",`${postId}_${uid}`),s=await getDoc(r);if(s.exists())return false;await setDoc(r,{postId,uid,createdAt:serverTimestamp()});await updateDoc(doc(db,"posts",postId),{viewsCount:increment(1)});return true}
export async function getPostInsights(postId){const [v,r]=await Promise.all([getDocs(query(collection(db,"postViews"),where("postId","==",postId))),getDocs(query(collection(db,"reactions"),where("type","==","post"),where("targetId","==",postId)))]);return {views:v.docs.map(d=>d.data()),reactions:r.docs.map(d=>d.data())}}
export async function addComment(postId,user,text){await addDoc(collection(db,"posts",postId,"comments"),{uid:user.uid,name:user.displayName||"مستخدم Arlo",text,createdAt:serverTimestamp()});await updateDoc(doc(db,"posts",postId),{commentsCount:increment(1)})}
export function watchComments(postId,cb){const q=query(collection(db,"posts",postId,"comments"),orderBy("createdAt","asc"));return onSnapshot(q,s=>cb(s.docs.map(d=>({id:d.id,...d.data()}))))}
export async function getFriendStatus(uid,targetUid){
  if(!uid||!targetUid||uid===targetUid)return "self";
  const direct=await getDoc(doc(db,"friendRequests",`${uid}_${targetUid}`));
  if(direct.exists()){
    const st=direct.data().status;
    if(st==="accepted")return "friends";
    if(st==="pending")return "sent";
  }
  const reverse=await getDoc(doc(db,"friendRequests",`${targetUid}_${uid}`));
  if(reverse.exists()){
    const st=reverse.data().status;
    if(st==="accepted")return "friends";
    if(st==="pending")return "received";
  }
  return "none";
}
export async function sendFriendRequest(from,toUid){
  if(from.uid===toUid)throw new Error("لا يمكنك إضافة نفسك.");
  const status=await getFriendStatus(from.uid,toUid);
  if(status==="friends")throw new Error("أنتم أصدقاء بالفعل.");
  if(status==="sent")throw new Error("تم إرسال طلب الصداقة بالفعل.");
  if(status==="received")throw new Error("هذا المستخدم أرسل لك طلب صداقة بالفعل.");
  const id=`${from.uid}_${toUid}`;
  await setDoc(doc(db,"friendRequests",id),{fromUid:from.uid,fromName:from.displayName||"مستخدم Arlo",toUid,status:"pending",createdAt:serverTimestamp()});
}
export async function getIncomingRequests(uid){const q=query(collection(db,"friendRequests"),where("toUid","==",uid),where("status","==","pending"));const s=await getDocs(q);return s.docs.map(d=>({id:d.id,...d.data()}))}
export function watchIncomingRequests(uid,cb){const q=query(collection(db,"friendRequests"),where("toUid","==",uid),where("status","==","pending"));return onSnapshot(q,s=>cb(s.docs.map(d=>({id:d.id,...d.data()}))))}
export async function respondFriendRequest(id,fromUid,toUid,accept){
  const r=doc(db,"friendRequests",id),s=await getDoc(r);
  if(!s.exists())return;
  const data=s.data();
  if(data.toUid!==toUid || data.fromUid!==fromUid)throw new Error("طلب الصداقة غير صالح.");
  if(data.status!=="pending")return;
  await updateDoc(r,{status:accept?"accepted":"rejected",respondedAt:serverTimestamp()});
  if(accept){
    await updateDoc(doc(db,"users",fromUid),{friendsCount:increment(1)});
    await updateDoc(doc(db,"users",toUid),{friendsCount:increment(1)});
  }
}
function safeFileId(){try{return crypto.randomUUID()}catch{return `${Date.now()}_${Math.random().toString(36).slice(2,11)}`}}
async function optimizeImage(file){if(!file||!file.type.startsWith("image/")||file.size<700*1024)return file;return new Promise(resolve=>{const img=new Image();const src=URL.createObjectURL(file);let done=false;const finish=v=>{if(done)return;done=true;URL.revokeObjectURL(src);resolve(v)};const timer=setTimeout(()=>finish(file),12000);img.onload=()=>{clearTimeout(timer);try{const max=1600,scale=Math.min(1,max/Math.max(img.width,img.height));const c=document.createElement("canvas");c.width=Math.max(1,Math.round(img.width*scale));c.height=Math.max(1,Math.round(img.height*scale));const ctx=c.getContext("2d");ctx.drawImage(img,0,0,c.width,c.height);c.toBlob(b=>finish(b?new File([b],file.name.replace(/\.[^.]+$/i,".webp"),{type:"image/webp"}):file),"image/webp",.80)}catch{finish(file)}};img.onerror=()=>{clearTimeout(timer);finish(file)};img.src=src})}
export async function uploadFile(file,path,onProgress=null){if(!file)throw new Error("لم يتم اختيار ملف.");if(file.size>60*1024*1024)throw new Error("الملف أكبر من 60MB. لتوفير الإنترنت اختر ملفًا أصغر.");const optimized=await optimizeImage(file);const r=ref(storage,`${path}/${safeFileId()}_${optimized.name}`);return new Promise((resolve,reject)=>{let lastProgress=-1;const task=uploadBytesResumable(r,optimized,{contentType:optimized.type||file.type||"application/octet-stream"});const timer=setTimeout(()=>{try{task.cancel()}catch{};reject(new Error("توقف رفع الملف. تحقق من الإنترنت وFirebase Storage Rules، وإذا ظهر ERR_BLOCKED_BY_CLIENT عطّل مانع الإعلانات/حماية التتبع للصفحة."))},120000);task.on("state_changed",snap=>{const pct=snap.totalBytes?Math.min(100,Math.round((snap.bytesTransferred/snap.totalBytes)*100)):0;if(pct!==lastProgress){lastProgress=pct;onProgress?.(pct)}},err=>{clearTimeout(timer);reject(err)},async()=>{clearTimeout(timer);try{onProgress?.(100);resolve(await getDownloadURL(task.snapshot.ref))}catch(e){reject(e)}})})}
export async function updateStoryText(storyId,uid,text){const r=doc(db,"stories",storyId),s=await getDoc(r);if(!s.exists())throw new Error("القصة غير موجودة.");if(s.data().uid!==uid)throw new Error("لا تملك صلاحية تعديل هذه القصة.");await updateDoc(r,{text:text||"",updatedAt:serverTimestamp()})}
export async function deleteStory(storyId,uid){const r=doc(db,"stories",storyId),s=await getDoc(r);if(!s.exists())return;if(s.data().uid!==uid)throw new Error("لا تملك صلاحية حذف هذه القصة.");await deleteDoc(r)}

export async function createStory(user,mediaFile,text,audioFile,onProgress=null){let mediaUrl="",audioUrl="";if(mediaFile)mediaUrl=await uploadFile(mediaFile,`stories/${user.uid}`,onProgress);if(audioFile)audioUrl=await uploadFile(audioFile,`storyAudio/${user.uid}`,onProgress);return addDoc(collection(db,"stories"),{uid:user.uid,name:user.displayName||"مستخدم Arlo",mediaUrl,mediaType:mediaFile?(mediaFile.type.startsWith("video")?"video":"image"):"text",text:text||"",audioUrl,expiresAt:Date.now()+86400000,likesCount:0,viewsCount:0,reactionCounts:{},createdAt:serverTimestamp()})}
export function watchStories(cb){const q=query(collection(db,"stories"),orderBy("createdAt","desc"),limit(30));return onSnapshot(q,s=>cb(s.docs.map(d=>({id:d.id,...d.data()})).filter(x=>x.expiresAt>Date.now()))) }
export async function saveStoryView(storyId,uid){const r=doc(db,"storyViews",`${storyId}_${uid}`),s=await getDoc(r);if(s.exists())return false;await setDoc(r,{storyId,uid,createdAt:serverTimestamp()});await updateDoc(doc(db,"stories",storyId),{viewsCount:increment(1)});return true}
export async function getStoryInsights(storyId){const [v,r]=await Promise.all([getDocs(query(collection(db,"storyViews"),where("storyId","==",storyId))),getDocs(query(collection(db,"reactions"),where("type","==","story"),where("targetId","==",storyId)))]);return {views:v.docs.map(d=>d.data()),reactions:r.docs.map(d=>d.data())}}
export async function sendMessage(fromUser,toUid,text,options={}){const id=[fromUser.uid,toUid].sort().join("_");await addDoc(collection(db,"chats",id,"messages"),{fromUid:fromUser.uid,toUid,text:text||"",audioUrl:options.audioUrl||"",mediaUrl:options.mediaUrl||"",mediaType:options.mediaType||"",fileName:options.fileName||"",createdAt:serverTimestamp()});await setDoc(doc(db,"chats",id),{members:[fromUser.uid,toUid],updatedAt:serverTimestamp()},{merge:true})}
export function watchMessages(uid,toUid,cb){
  const id=[uid,toUid].sort().join("_");
  const q=query(collection(db,"chats",id,"messages"),orderBy("createdAt","asc"),limit(100));
  return onSnapshot(q,s=>cb(s.docs.map(d=>({id:d.id,...d.data()}))));
}
export async function getChatPeople(uid){
  const users=await getUsers();
  return users.filter(u=>u.uid!==uid && u.id!==uid);
}
export {auth,db,storage}

// KRONO V2.0 social layer
export async function isFollowing(uid,targetUid){const s=await getDoc(doc(db,"follows",`${uid}_${targetUid}`));return s.exists()}
export async function toggleFollow(uid,targetUid){if(uid===targetUid)throw new Error("لا يمكنك متابعة نفسك.");const r=doc(db,"follows",`${uid}_${targetUid}`),s=await getDoc(r);if(s.exists()){await deleteDoc(r);return false}await setDoc(r,{uid,targetUid,createdAt:serverTimestamp()});return true}
export async function createChannel(user,name,description){return addDoc(collection(db,"channels"),{ownerUid:user.uid,ownerName:user.displayName||"مستخدم Arlo",name,description:description||"",subscribersCount:0,createdAt:serverTimestamp()})}
export async function getChannels(){const s=await getDocs(query(collection(db,"channels"),orderBy("createdAt","desc"),limit(20)));return s.docs.map(d=>({id:d.id,...d.data()}))}
export function watchChannels(cb){const q=query(collection(db,"channels"),orderBy("createdAt","desc"),limit(20));return onSnapshot(q,s=>cb(s.docs.map(d=>({id:d.id,...d.data()}))))}
export async function createCommunity(user,name,description){return addDoc(collection(db,"communities"),{ownerUid:user.uid,ownerName:user.displayName||"مستخدم Arlo",name,description:description||"",membersCount:1,createdAt:serverTimestamp()})}
export async function getCommunities(){const s=await getDocs(query(collection(db,"communities"),orderBy("createdAt","desc"),limit(20)));return s.docs.map(d=>({id:d.id,...d.data()}))}
export function watchCommunities(cb){const q=query(collection(db,"communities"),orderBy("createdAt","desc"),limit(20));return onSnapshot(q,s=>cb(s.docs.map(d=>({id:d.id,...d.data()}))))}
export async function joinCommunity(id,uid){await setDoc(doc(db,"communityMembers",`${id}_${uid}`),{communityId:id,uid,joinedAt:serverTimestamp()},{merge:true});await updateDoc(doc(db,"communities",id),{membersCount:increment(1)})}
