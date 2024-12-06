import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { User } from '../types/auth';

export async function createPlatformAdmin(email: string): Promise<User> {
  try {
    // Generate a temporary password
    const tempPassword = Math.random().toString(36).slice(-12);
    
    // Create the user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, tempPassword);

    // Create the user document in Firestore
    const userData: Omit<User, 'id'> = {
      email,
      name: 'Platform Admin',
      role: 'platform_admin',
      tenantId: 'platform', // Special identifier for platform-level users
    };

    await setDoc(doc(db, 'users', userCredential.user.uid), {
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Send password reset email to allow user to set their own password
    await auth.sendPasswordResetEmail(email);

    return {
      id: userCredential.user.uid,
      ...userData,
    };
  } catch (error: any) {
    console.error('Error creating platform admin:', error);
    throw new Error(error.message);
  }
}