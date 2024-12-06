import { collection, addDoc, getDocs, deleteDoc, doc, query, where } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../lib/firebase';
import { RequiredReading } from '../types/reading';

export async function addRequiredReading(
  file: File,
  readingData: Omit<RequiredReading, 'id' | 'documentUrl' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const storageRef = ref(storage, `required-reading/${file.name}`);
  await uploadBytes(storageRef, file);
  const downloadUrl = await getDownloadURL(storageRef);

  const docRef = await addDoc(collection(db, 'requiredReading'), {
    ...readingData,
    documentUrl: downloadUrl,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  return docRef.id;
}

export async function getRequiredReadingByRole(role: 'staff' | 'ned'): Promise<RequiredReading[]> {
  const q = query(
    collection(db, 'requiredReading'),
    where('assignedRoles', 'array-contains', role)
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt.toDate(),
    updatedAt: doc.data().updatedAt.toDate(),
    dueDate: doc.data().dueDate?.toDate(),
  } as RequiredReading));
}

export async function getAllRequiredReading(): Promise<RequiredReading[]> {
  const querySnapshot = await getDocs(collection(db, 'requiredReading'));
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt.toDate(),
    updatedAt: doc.data().updatedAt.toDate(),
    dueDate: doc.data().dueDate?.toDate(),
  } as RequiredReading));
}

export async function deleteRequiredReading(readingId: string, fileName: string): Promise<void> {
  await deleteDoc(doc(db, 'requiredReading', readingId));
  const storageRef = ref(storage, `required-reading/${fileName}`);
  await deleteObject(storageRef);
}