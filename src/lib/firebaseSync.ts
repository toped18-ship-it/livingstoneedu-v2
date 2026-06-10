import { db, auth, handleFirestoreError, OperationType } from './firebase';
import { doc, setDoc } from 'firebase/firestore';

export async function syncUserProfile(user: any) {
  if (!user || !user.email) return;
  const uid = auth.currentUser?.uid || `local_${user.email.replace(/[^a-zA-Z0-9]/g, '_')}`;
  const userRef = doc(db, 'users', uid);
  
  try {
    await setDoc(userRef, {
      id: uid,
      fullName: user.fullName,
      email: user.email,
      classLevel: user.classLevel || 'Primary 4',
      avatarSeed: user.avatarSeed || 'scholar',
      joinDate: user.joinDate || new Date().toISOString().split('T')[0],
      role: user.role || 'student',
      schoolName: user.schoolName || null,
      selectedSubjectIds: user.selectedSubjectIds || []
    }, { merge: true });
    
    console.log("Verified Profile synced to Firestore collection 'users' loaded successfully.");
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `users/${uid}`);
  }
}

export async function syncLessonProgress(userEmail: string, progress: any) {
  if (!progress || !userEmail) return;
  const progressId = `${progress.subjectId}_term${progress.termNum}_week${progress.weekNum}`;
  const normalizedEmail = userEmail.replace(/[^a-zA-Z0-9]/g, '_');
  const docId = `${normalizedEmail}_${progressId}`;
  const progressRef = doc(db, 'lessonProgress', docId);
  
  try {
    await setDoc(progressRef, {
      userId: auth.currentUser?.uid || `local_${normalizedEmail}`,
      classLevel: progress.classLevel || 'Primary 4',
      subjectId: progress.subjectId,
      termNum: progress.termNum || 1,
      weekNum: progress.weekNum || 1,
      completed: progress.completed || false,
      score: progress.score !== undefined ? progress.score : null,
      lastAccessed: new Date().toISOString()
    }, { merge: true });
    
    console.log("Lesson progress synced to Firestore 'lessonProgress' successfully.");
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `lessonProgress/${docId}`);
  }
}

export async function syncContactMessage(message: any) {
  if (!message) return;
  const docId = message.id || `msg_${Date.now()}`;
  const docRef = doc(db, 'contactMessages', docId);
  
  try {
    await setDoc(docRef, {
      id: docId,
      name: message.name || 'Anonymous',
      email: message.email || 'anonymous@livingstone.edu',
      subject: message.subject || 'National Curriculum Enquiry',
      message: message.message || '',
      timestamp: message.timestamp || new Date().toISOString(),
      replyStatus: message.replyStatus || 'Pending'
    });
    console.log("Contact ticket synced to Firestore collection 'contactMessages' successfully.");
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `contactMessages/${docId}`);
  }
}
