import { 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail,
  deleteUser,
  getAuth,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  signInWithEmailAndPassword
} from 'firebase/auth';
import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  query, 
  where,
  deleteDoc,
  updateDoc,
  getDoc
} from 'firebase/firestore';
import { db, auth, collections } from '../lib/firebase';
import { User, UserRole } from '../types/auth';

export interface CreateUserData {
  email: string;
  name: string;
  role: UserRole;
  tenantId: string;
  password?: string;
}

export class UserOperationError extends Error {
  constructor(message: string, public code: string, public requiresReauth: boolean = false) {
    super(message);
    this.name = 'UserOperationError';
  }
}

export async function createUser(userData: CreateUserData): Promise<User> {
  try {
    // Create Firebase auth user with provided or temporary password
    const userCredential = userData.password
      ? await createUserWithEmailAndPassword(auth, userData.email, userData.password)
      : await createUserWithEmailAndPassword(
          auth, 
          userData.email, 
          Math.random().toString(36) + Math.random().toString(36)
        );

    // Create user document in Firestore
    const userDoc = {
      email: userData.email,
      name: userData.name,
      role: userData.role,
      tenantId: userData.tenantId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await setDoc(doc(db, collections.users, userCredential.user.uid), userDoc);

    // Send password reset email if no password was provided
    if (!userData.password) {
      await sendPasswordResetEmail(auth, userData.email);
    }

    return {
      id: userCredential.user.uid,
      ...userDoc,
    };
  } catch (error: any) {
    console.error('Error creating user:', error);
    throw new Error(error.message);
  }
}

export async function getTenantUsers(tenantId: string): Promise<User[]> {
  try {
    const q = query(
      collection(db, collections.users),
      where('tenantId', '==', tenantId)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as User));
  } catch (error) {
    console.error('Error fetching tenant users:', error);
    throw error;
  }
}

export async function updateUser(
  userId: string,
  updates: Partial<Omit<User, 'id'>>
): Promise<void> {
  try {
    const userRef = doc(db, collections.users, userId);
    await updateDoc(userRef, {
      ...updates,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
}

export async function deleteUserAccount(userId: string, currentUserCredentials?: { email: string; password: string }): Promise<void> {
  try {
    // Get user document first
    const userDoc = await getDoc(doc(db, collections.users, userId));
    if (!userDoc.exists()) {
      throw new Error('User not found');
    }

    // Delete from Firestore first
    await deleteDoc(doc(db, collections.users, userId));
    
    // Then attempt to delete from Firebase Auth
    try {
      // If credentials are provided, try to reauthenticate
      if (currentUserCredentials) {
        const currentUser = auth.currentUser;
        if (currentUser) {
          const credential = EmailAuthProvider.credential(
            currentUserCredentials.email,
            currentUserCredentials.password
          );
          await reauthenticateWithCredential(currentUser, credential);
        }
      }

      // Now try to delete the user
      const userAuth = auth.currentUser;
      if (userAuth) {
        await deleteUser(userAuth);
      }
    } catch (error: any) {
      // If deletion fails due to authentication, restore the Firestore document
      if (error.code === 'auth/requires-recent-login') {
        await setDoc(doc(db, collections.users, userId), userDoc.data());
        throw new UserOperationError(
          'Please re-authenticate to delete this account',
          error.code,
          true
        );
      }
      throw error;
    }
  } catch (error: any) {
    console.error('Error deleting user:', error);
    if (error instanceof UserOperationError) {
      throw error;
    }
    throw new UserOperationError(
      error.message || 'Failed to delete user',
      error.code || 'unknown'
    );
  }
}

export async function resetUserPassword(email: string): Promise<void> {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error('Error resetting password:', error);
    throw error;
  }
}

export async function setUserPassword(userId: string, newPassword: string): Promise<void> {
  try {
    const user = auth.currentUser;
    if (user) {
      await updatePassword(user, newPassword);
    } else {
      throw new Error('No authenticated user found');
    }
  } catch (error) {
    console.error('Error setting password:', error);
    throw error;
  }
}

export async function inviteTenantAdmin(
  email: string,
  name: string,
  tenantId: string,
  password?: string
): Promise<User> {
  return createUser({
    email,
    name,
    role: 'tenant_admin',
    tenantId,
    password,
  });
}

export async function reauthenticateUser(email: string, password: string): Promise<void> {
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error: any) {
    throw new UserOperationError(
      'Failed to re-authenticate. Please check your credentials.',
      error.code
    );
  }
}