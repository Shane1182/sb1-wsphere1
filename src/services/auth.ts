import { 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
  AuthError,
  sendPasswordResetEmail as firebaseSendPasswordReset
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { User } from '../types/auth';
import { validateUserDocument } from '../utils/authValidation';
import { ensureUserExists } from './userSync';

export class AuthenticationError extends Error {
  constructor(message: string, public code?: string, public details?: any) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export async function signIn(email: string, password: string): Promise<User> {
  try {
    console.log('Attempting sign in for:', email);
    
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log('Firebase Auth successful, validating user document...');
    
    let { isValid, user, error } = await validateUserDocument(userCredential.user.uid);
    
    if (!isValid || !user) {
      console.log('User document not found, creating new user document...');
      try {
        user = await ensureUserExists(userCredential.user.uid, email);
        isValid = true;
        error = undefined;
      } catch (syncError) {
        console.error('Failed to create user document:', syncError);
        throw new AuthenticationError(
          'Failed to create user account. Please contact support.',
          'user-creation-failed',
          { error: syncError }
        );
      }
    }

    if (!isValid || !user) {
      console.error('User document validation failed:', error);
      throw new AuthenticationError(
        'Account exists but user data is invalid. Please contact support.',
        'invalid-user-data',
        { error }
      );
    }

    console.log('User successfully authenticated:', user.email);
    return user;
  } catch (error) {
    const authError = error as AuthError;
    console.error('Authentication error:', authError);

    switch (authError.code) {
      case 'auth/invalid-credential':
        throw new AuthenticationError(
          'Invalid email or password. Please check your credentials and try again.',
          authError.code
        );
      case 'auth/user-not-found':
        throw new AuthenticationError(
          'No account found with this email address.',
          authError.code
        );
      case 'auth/wrong-password':
        throw new AuthenticationError(
          'Incorrect password. Please try again.',
          authError.code
        );
      case 'auth/too-many-requests':
        throw new AuthenticationError(
          'Too many failed attempts. Please try again later or reset your password.',
          authError.code
        );
      case 'auth/user-disabled':
        throw new AuthenticationError(
          'This account has been disabled. Please contact support.',
          authError.code
        );
      default:
        throw new AuthenticationError(
          'An unexpected error occurred. Please try again.',
          authError.code,
          { originalError: authError }
        );
    }
  }
}

export async function signOut(): Promise<void> {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Sign out error:', error);
    throw new AuthenticationError('Failed to sign out. Please try again.');
  }
}

export async function getCurrentUser(): Promise<User | null> {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      unsubscribe();
      
      if (!firebaseUser) {
        resolve(null);
        return;
      }

      try {
        let { isValid, user, error } = await validateUserDocument(firebaseUser.uid);
        
        if (!isValid || !user) {
          console.log('Current user document not found, creating...');
          try {
            user = await ensureUserExists(firebaseUser.uid, firebaseUser.email!);
            isValid = true;
          } catch (syncError) {
            console.error('Failed to create user document:', syncError);
            resolve(null);
            return;
          }
        }

        if (!isValid || !user) {
          console.error('Current user document validation failed:', error);
          resolve(null);
          return;
        }

        resolve(user);
      } catch (error) {
        console.error('Error getting current user:', error);
        reject(new AuthenticationError('Failed to get user data'));
      }
    }, reject);
  });
}

export async function sendPasswordReset(email: string): Promise<void> {
  try {
    await firebaseSendPasswordReset(auth, email);
  } catch (error: any) {
    console.error('Error sending password reset:', error);
    switch (error.code) {
      case 'auth/user-not-found':
        throw new AuthenticationError(
          'No account found with this email address.',
          error.code
        );
      case 'auth/invalid-email':
        throw new AuthenticationError(
          'Please enter a valid email address.',
          error.code
        );
      default:
        throw new AuthenticationError(
          'Failed to send password reset email. Please try again.',
          error.code
        );
    }
  }
}