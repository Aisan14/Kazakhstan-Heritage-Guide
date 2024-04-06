import { initializeApp } from '@firebase/app';
import { getAuth } from '@firebase/auth';
import { getFirestore, collection, getDocs, addDoc } from '@firebase/firestore';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCR7c1v79tmfFd_MRtSOLeLegC-SHhCb1I",
  authDomain: "qwerty-8b6ca.firebaseapp.com",
  databaseURL: "https://qwerty-8b6ca-default-rtdb.firebaseio.com",
  projectId: "qwerty-8b6ca",
  storageBucket: "qwerty-8b6ca.appspot.com",
  messagingSenderId: "953673085271",
  appId: "1:953673085271:web:66b3c9e4cebcbaac2b0e12"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Функция для проверки существования коллекции и создания ее, если она не существует
export const checkAndCreateCollection = async (collectionName) => {
  try {
    const collectionRef = collection(db, collectionName);
    const snapshot = await getDocs(collectionRef);
    if (snapshot.empty) {
      console.log(`Collection '${collectionName}' does not exist, creating...`);
      await addDoc(collectionRef, {}); // Добавляем пустой документ, чтобы создать коллекцию
      console.log(`Collection '${collectionName}' created successfully.`);
    } else {
      console.log(`Collection '${collectionName}' already exists.`);
    }
  } catch (error) {
    console.error(`Error checking/creating collection '${collectionName}':`, error);
  }
};

export { auth, db };