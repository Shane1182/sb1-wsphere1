import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBeeDgAd1ZXnSQAHNsvrZ30uDNde9IVZ50",
  authDomain: "induction-platform-bbrc.firebaseapp.com",
  projectId: "induction-platform-bbrc",
  storageBucket: "induction-platform-bbrc.firebasestorage.app",
  messagingSenderId: "441162522294",
  appId: "1:441162522294:web:80b73a48c3cf8076629017"
};

async function setupPlatformAdmin() {
  try {
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);

    // Create admin user
    const email = 'shanejames1182@gmail.com';
    const tempPassword = 'TempPass123!@#'; // Temporary password that meets Firebase requirements

    console.log('Creating platform admin account...');
    
    const userCredential = await createUserWithEmailAndPassword(auth, email, tempPassword);
    console.log('User created in Authentication');

    // Create admin document in Firestore
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      email,
      name: 'Platform Admin',
      role: 'platform_admin',
      tenantId: 'platform',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log('User document created in Firestore');

    // Send password reset email
    await sendPasswordResetEmail(auth, email);
    console.log('Password reset email sent');

    console.log('Platform admin setup completed successfully');
  } catch (error) {
    console.error('Error setting up platform admin:', error.message);
    throw error;
  }
}

setupPlatformAdmin();