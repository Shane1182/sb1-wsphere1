import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { User, UserRole } from '../types/auth';

const PLATFORM_ADMIN_EMAIL = 'shanejames1182@gmail.com';

export async function ensureUserExists(
  uid: string,
  email: string,
  role?: UserRole
): Promise<User> {
  const userRef = doc(db, 'users', uid);
  const userDoc = await getDoc(userRef);

  if (!userDoc.exists()) {
    // Determine if this is the platform admin
    const isPlatformAdmin = email.toLowerCase() === PLATFORM_ADMIN_EMAIL.toLowerCase();
    
    const userData: Omit<User, 'id'> = {
      email,
      name: isPlatformAdmin ? 'Platform Admin' : email.split('@')[0],
      role: isPlatformAdmin ? 'platform_admin' : (role || 'staff'),
      tenantId: isPlatformAdmin ? 'platform' : 'default',
    };

    console.log('Creating new user document:', { email, isPlatformAdmin });

    await setDoc(userRef, {
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return {
      id: uid,
      ...userData,
    };
  }

  const existingData = userDoc.data();
  
  // Update platform admin if needed
  if (email.toLowerCase() === PLATFORM_ADMIN_EMAIL.toLowerCase() && 
      existingData.role !== 'platform_admin') {
    const updatedData = {
      ...existingData,
      role: 'platform_admin' as UserRole,
      tenantId: 'platform',
      updatedAt: new Date(),
    };

    console.log('Updating existing user to platform admin:', { email });
    
    await setDoc(userRef, updatedData);
    
    return {
      id: uid,
      ...updatedData,
    };
  }

  return {
    id: uid,
    ...existingData,
  } as User;
}