import { collection, doc, setDoc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../lib/firebase';
import { BrandingSettings } from '../types/branding';

const BRANDING_DOC_ID = 'platform-branding';

export async function uploadLogo(file: File): Promise<string> {
  const storageRef = ref(storage, `branding/logo-${Date.now()}`);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}

export async function updateBranding(settings: Partial<BrandingSettings>): Promise<void> {
  const docRef = doc(db, 'branding', BRANDING_DOC_ID);
  await setDoc(docRef, {
    ...settings,
    updatedAt: new Date(),
  }, { merge: true });
}

export async function getBranding(): Promise<BrandingSettings | null> {
  const docRef = doc(db, 'branding', BRANDING_DOC_ID);
  const docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) {
    return null;
  }

  return {
    ...docSnap.data(),
    updatedAt: docSnap.data().updatedAt.toDate(),
  } as BrandingSettings;
}