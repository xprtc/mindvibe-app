import {
  collection,
  doc,
  addDoc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  type Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Exam, Subject, TimelineEvent, UploadedFile } from '../types';
import { DEFAULT_SUBJECTS } from '../types';

// ═══════════════════════════════════════════════════════
//  SUBJECTS
// ═══════════════════════════════════════════════════════

export async function getSubjects(uid: string): Promise<Subject[]> {
  const q = query(
    collection(db, 'users', uid, 'subjects'),
    orderBy('order', 'asc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Subject));
}

export async function addSubject(uid: string, subject: Omit<Subject, 'id'>): Promise<Subject> {
  const ref = await addDoc(collection(db, 'users', uid, 'subjects'), {
    ...subject,
    createdAt: serverTimestamp(),
  });
  return { id: ref.id, ...subject };
}

export async function updateSubject(uid: string, subjectId: string, data: Partial<Subject>): Promise<void> {
  await updateDoc(doc(db, 'users', uid, 'subjects', subjectId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteSubject(uid: string, subjectId: string): Promise<void> {
  await deleteDoc(doc(db, 'users', uid, 'subjects', subjectId));
}

/** Seed default subjects for new user */
export async function seedDefaultSubjects(uid: string): Promise<Subject[]> {
  const existing = await getSubjects(uid);
  if (existing.length > 0) return existing;
  const subjects: Subject[] = [];
  for (const s of DEFAULT_SUBJECTS) {
    const created = await addSubject(uid, s);
    subjects.push(created);
  }
  return subjects;
}

// ═══════════════════════════════════════════════════════
//  TIMELINE EVENTS
// ═══════════════════════════════════════════════════════

export async function getTimelineEvents(uid: string, subjectId: string): Promise<TimelineEvent[]> {
  const q = query(
    collection(db, 'users', uid, 'subjects', subjectId, 'timeline'),
    orderBy('date', 'asc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as TimelineEvent));
}

export async function getTimelineEventsBySemester(
  uid: string,
  subjectId: string,
  semesterId: string
): Promise<TimelineEvent[]> {
  const q = query(
    collection(db, 'users', uid, 'subjects', subjectId, 'timeline'),
    where('semesterId', '==', semesterId),
    orderBy('date', 'asc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as TimelineEvent));
}

export async function addTimelineEvent(
  uid: string,
  subjectId: string,
  event: Omit<TimelineEvent, 'id'>
): Promise<TimelineEvent> {
  const ref = await addDoc(
    collection(db, 'users', uid, 'subjects', subjectId, 'timeline'),
    { ...event, createdAt: serverTimestamp() }
  );
  return { id: ref.id, ...event };
}

export async function updateTimelineEvent(
  uid: string,
  subjectId: string,
  eventId: string,
  data: Partial<TimelineEvent>
): Promise<void> {
  await updateDoc(
    doc(db, 'users', uid, 'subjects', subjectId, 'timeline', eventId),
    { ...data, updatedAt: serverTimestamp() }
  );
}

export async function deleteTimelineEvent(
  uid: string,
  subjectId: string,
  eventId: string
): Promise<void> {
  await deleteDoc(
    doc(db, 'users', uid, 'subjects', subjectId, 'timeline', eventId)
  );
}

/** Get ALL timeline events across ALL subjects (for dashboard) */
export async function getAllTimelineEvents(uid: string): Promise<TimelineEvent[]> {
  const subjects = await getSubjects(uid);
  const all: TimelineEvent[] = [];
  for (const s of subjects) {
    const events = await getTimelineEvents(uid, s.id);
    all.push(...events);
  }
  return all.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

// ═══════════════════════════════════════════════════════
//  FILE METADATA (actual files stored in Firebase Storage)
// ═══════════════════════════════════════════════════════

export async function saveFileMetadata(uid: string, file: UploadedFile): Promise<void> {
  await setDoc(doc(db, 'users', uid, 'files', file.id), file);
}

export async function getFileMetadata(uid: string, fileId: string): Promise<UploadedFile | null> {
  const snap = await getDoc(doc(db, 'users', uid, 'files', fileId));
  if (snap.exists()) return snap.data() as UploadedFile;
  return null;
}

export async function getFilesByIds(uid: string, fileIds: string[]): Promise<UploadedFile[]> {
  if (!fileIds.length) return [];
  const files: UploadedFile[] = [];
  for (const id of fileIds) {
    const f = await getFileMetadata(uid, id);
    if (f) files.push(f);
  }
  return files;
}

// ═══════════════════════════════════════════════════════
//  GRADE CALCULATIONS
// ═══════════════════════════════════════════════════════

/** Calculate average grade for a subject from timeline exam events */
export function calculateSubjectAverage(events: TimelineEvent[]): number {
  const grades = events
    .filter((e) => e.type === 'exam' && e.exam?.grade)
    .map((e) => e.exam!.grade!);
  if (grades.length === 0) return 0;
  return Math.round((grades.reduce((a, b) => a + b, 0) / grades.length) * 10) / 10;
}

/** Calculate average for a specific semester */
export function calculateSemesterAverage(events: TimelineEvent[], semesterId: string): number {
  const grades = events
    .filter((e) => e.semesterId === semesterId && e.type === 'exam' && e.exam?.grade)
    .map((e) => e.exam!.grade!);
  if (grades.length === 0) return 0;
  return Math.round((grades.reduce((a, b) => a + b, 0) / grades.length) * 10) / 10;
}

// ═══════════════════════════════════════════════════════
//  EXAMS (legacy — kept for backward compatibility)
// ═══════════════════════════════════════════════════════

export async function getExams(uid: string): Promise<Exam[]> {
  const q = query(
    collection(db, 'users', uid, 'exams'),
    orderBy('date', 'asc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Exam));
}

export async function addExam(uid: string, exam: Omit<Exam, 'id'>): Promise<Exam> {
  const ref = await addDoc(collection(db, 'users', uid, 'exams'), {
    ...exam,
    createdAt: serverTimestamp(),
  });
  return { id: ref.id, ...exam };
}

export async function updateExam(uid: string, examId: string, data: Partial<Exam>): Promise<void> {
  await updateDoc(doc(db, 'users', uid, 'exams', examId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteExam(uid: string, examId: string): Promise<void> {
  await deleteDoc(doc(db, 'users', uid, 'exams', examId));
}

// ═══════════════════════════════════════════════════════
//  CHAT THREADS
// ═══════════════════════════════════════════════════════

export interface ChatThread {
  id: string;
  title: string;
  updatedAt: number;
}

export interface ChatMsg {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  action?: {
    type: 'create_exam';
    data: Partial<Exam>;
    status: 'pending' | 'done';
  };
}

export async function getChatThreads(uid: string): Promise<ChatThread[]> {
  const q = query(
    collection(db, 'users', uid, 'chatThreads'),
    orderBy('updatedAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as ChatThread));
}

export async function saveChatThread(uid: string, thread: ChatThread): Promise<void> {
  await setDoc(doc(db, 'users', uid, 'chatThreads', thread.id), {
    title: thread.title,
    updatedAt: thread.updatedAt,
  });
}

export async function deleteChatThread(uid: string, threadId: string): Promise<void> {
  await deleteDoc(doc(db, 'users', uid, 'chatThreads', threadId));
}

export async function getChatMessages(uid: string, threadId: string): Promise<ChatMsg[]> {
  const q = query(
    collection(db, 'users', uid, 'chatThreads', threadId, 'messages'),
    orderBy('timestamp', 'asc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as ChatMsg));
}

export async function saveChatMessage(uid: string, threadId: string, msg: ChatMsg): Promise<void> {
  await setDoc(
    doc(db, 'users', uid, 'chatThreads', threadId, 'messages', msg.id),
    {
      role: msg.role,
      text: msg.text,
      timestamp: msg.timestamp,
      ...(msg.action ? { action: msg.action } : {}),
    }
  );
}

// ═══════════════════════════════════════════════════════
//  USER SETTINGS
// ═══════════════════════════════════════════════════════

export interface UserSettings {
  darkMode: boolean;
  notifications: boolean;
  focusSubjects: string[];
}

const defaultSettings: UserSettings = {
  darkMode: false,
  notifications: true,
  focusSubjects: [],
};

export async function getUserSettings(uid: string): Promise<UserSettings> {
  const snap = await getDoc(doc(db, 'users', uid, 'settings', 'preferences'));
  if (snap.exists()) return snap.data() as UserSettings;
  return defaultSettings;
}

export async function saveUserSettings(uid: string, settings: Partial<UserSettings>): Promise<void> {
  await setDoc(doc(db, 'users', uid, 'settings', 'preferences'), settings, { merge: true });
}

// ═══════════════════════════════════════════════════════
//  KNOWLEDGE ITEMS
// ═══════════════════════════════════════════════════════

export interface KnowledgeItem {
  id: string;
  term: string;
  definition: string;
  subject: string;
  tags: string[];
  source?: string;
  createdAt?: any;
}

export async function getKnowledge(uid: string): Promise<KnowledgeItem[]> {
  const q = query(collection(db, 'users', uid, 'knowledge'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as KnowledgeItem));
}

export async function addKnowledge(uid: string, item: Omit<KnowledgeItem, 'id'>): Promise<string> {
  const ref = await addDoc(collection(db, 'users', uid, 'knowledge'), {
    ...item,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

// ═══════════════════════════════════════════════════════
//  PROGRESS / ACHIEVEMENTS
// ═══════════════════════════════════════════════════════

export interface Achievement {
  id: string;
  type: string;
  unlockedAt: number;
}

export async function getAchievements(uid: string): Promise<Achievement[]> {
  const snap = await getDocs(collection(db, 'users', uid, 'achievements'));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Achievement));
}

export async function unlockAchievement(uid: string, achievement: Omit<Achievement, 'id'>): Promise<void> {
  await addDoc(collection(db, 'users', uid, 'achievements'), achievement);
}

// ═══════════════════════════════════════════════════════
//  USER STATS
// ═══════════════════════════════════════════════════════

export interface UserStats {
  xp: number;
  level: number;
  streak: number;
  lastActiveDate: string;
  totalStudyMinutes: number;
}

const defaultStats: UserStats = {
  xp: 0,
  level: 1,
  streak: 0,
  lastActiveDate: '',
  totalStudyMinutes: 0,
};

export async function getUserStats(uid: string): Promise<UserStats> {
  const snap = await getDoc(doc(db, 'users', uid, 'stats', 'progress'));
  if (snap.exists()) return snap.data() as UserStats;
  return defaultStats;
}

export async function updateUserStats(uid: string, stats: Partial<UserStats>): Promise<void> {
  await setDoc(doc(db, 'users', uid, 'stats', 'progress'), stats, { merge: true });
}

export async function addXP(uid: string, amount: number): Promise<UserStats> {
  const current = await getUserStats(uid);
  const newXP = current.xp + amount;
  const newLevel = Math.floor(newXP / 1000) + 1;
  const updated = { ...current, xp: newXP, level: newLevel };
  await updateUserStats(uid, updated);
  return updated;
}
