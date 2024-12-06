import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { User } from '../types/auth';

const PLATFORM_ADMIN_EMAIL = 'shanejames1182@gmail.com';

export async function validateUserDocument(uid: string): Promise<{
  isValid: boolean;
  user?: User;
  error?: string;
}> {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    
    if (!userDoc.exists()) {
      return {
        isValid: false,
        error: 'User document not found in Firestore'
      };
    }

    const userData = userDoc.data();
    
    // Validate required fields
    const requiredFields = ['email', 'name', 'role', 'tenantId'];
    const missingFields = requiredFields.filter(field => !userData[field]);
    
    if (missingFields.length > 0) {
      return {
        isValid: false,
        error: `Missing required fields: ${missingFields.join(', ')}`
      };
    }

    // Ensure platform admin has correct role and tenant
    if (userData.email.toLowerCase() === PLATFORM_ADMIN_EMAIL.toLowerCase()) {
      if (userData.role !== 'platform_admin' || userData.tenantId !== 'platform') {
        return {
          isValid: false,
          error: 'Invalid platform admin configuration'
        };
      }
    }

    return {
      isValid: true,
      user: {
        id: userDoc.id,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        tenantId: userData.tenantId,
        avatar: userData.avatar
      }
    };
  } catch (error) {
    console.error('Error validating user document:', error);
    return {
      isValid: false,
      error: 'Failed to validate user document'
    };
  }
}