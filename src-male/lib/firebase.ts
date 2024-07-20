import { FirebaseApp, getApps, initializeApp } from "firebase/app";
import { Auth, getAuth } from "firebase/auth";
import { Firestore, addDoc, collection, getDocs, getFirestore, limit, orderBy, query } from "firebase/firestore";
import { Message } from "../../src/features/messages/messages";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

if (typeof window !== 'undefined') {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }
  auth = getAuth(app);
  db = getFirestore(app);
}

interface ChatLog {
  userId: string;
  messages: Message[];
  timestamp: number;
  startDate: string;
}

const saveChatLog = async (userId: string, messages: Message[], startDate: string) => {
  try {
    const chatLog: ChatLog = {
      userId,
      messages,
      timestamp: Date.now(),
      startDate,
    };
    await addDoc(collection(db, "chatLogs"), chatLog);
    console.log("チャットログが保存されました");
  } catch (error) {
    console.error("チャットログの保存に失敗しました", error);
  }
};

const getChatLogs = async (userId: string, limitCount: number = 50): Promise<Message[]> => {
  const q = query(
    collection(db, "chatLogs"),
    orderBy("timestamp", "desc"),
    limit(limitCount)
  );

  const querySnapshot = await getDocs(q);
  const chatLogs: Message[] = [];
  querySnapshot.forEach((doc) => {
    const data = doc.data() as ChatLog;
    chatLogs.push(...data.messages);
  });

  return chatLogs.reverse();
};

export { auth, db, getChatLogs, saveChatLog };

