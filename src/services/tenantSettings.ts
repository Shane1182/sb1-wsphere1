import { collection, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { TenantSettings } from '../types/tenant';

export async function getTenantSettings(tenantId: string): Promise<TenantSettings | null> {
  try {
    const docRef = doc(db, 'tenantSettings', tenantId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return null;
    }

    return {
      id: docSnap.id,
      ...docSnap.data(),
      createdAt: docSnap.data().createdAt.toDate(),
      updatedAt: docSnap.data().updatedAt.toDate(),
    } as TenantSettings;
  } catch (error) {
    console.error('Error fetching tenant settings:', error);
    throw error;
  }
}

export async function updateTenantSettings(
  tenantId: string,
  settings: Partial<Omit<TenantSettings, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>>
): Promise<void> {
  try {
    const docRef = doc(db, 'tenantSettings', tenantId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      await updateDoc(docRef, {
        ...settings,
        updatedAt: new Date(),
      });
    } else {
      await setDoc(docRef, {
        tenantId,
        ...settings,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  } catch (error) {
    console.error('Error updating tenant settings:', error);
    throw error;
  }
}