import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../lib/firebase';
import { GovernanceDocument, GovernanceCategory } from '../types/governance';

export async function getCategories(): Promise<GovernanceCategory[]> {
  const querySnapshot = await getDocs(
    query(collection(db, 'governanceCategories'), orderBy('order'))
  );
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as GovernanceCategory));
}

export async function createCategory(category: Omit<GovernanceCategory, 'id'>): Promise<string> {
  const docRef = await addDoc(collection(db, 'governanceCategories'), category);
  return docRef.id;
}

export async function updateCategory(id: string, updates: Partial<GovernanceCategory>): Promise<void> {
  await updateDoc(doc(db, 'governanceCategories', id), updates);
}

export async function deleteCategory(id: string): Promise<void> {
  await deleteDoc(doc(db, 'governanceCategories', id));
}

export async function uploadGovernanceDocument(
  file: File,
  documentData: Omit<GovernanceDocument, 'id' | 'fileUrl' | 'uploadedAt' | 'lastUpdated' | 'fileSize'>
): Promise<string> {
  const storageRef = ref(storage, `governance/${file.name}`);
  await uploadBytes(storageRef, file);
  const downloadUrl = await getDownloadURL(storageRef);

  const docRef = await addDoc(collection(db, 'governanceDocuments'), {
    ...documentData,
    fileUrl: downloadUrl,
    uploadedAt: new Date(),
    lastUpdated: new Date(),
    fileSize: file.size,
  });

  return docRef.id;
}

export async function getGovernanceDocuments(): Promise<GovernanceDocument[]> {
  const [docsSnapshot, categoriesSnapshot] = await Promise.all([
    getDocs(collection(db, 'governanceDocuments')),
    getDocs(collection(db, 'governanceCategories'))
  ]);

  const categories = new Map(
    categoriesSnapshot.docs.map(doc => [doc.id, doc.data().name])
  );

  return docsSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    categoryName: categories.get(doc.data().category),
    uploadedAt: doc.data().uploadedAt.toDate(),
    lastUpdated: doc.data().lastUpdated.toDate(),
  } as GovernanceDocument));
}

export async function deleteGovernanceDocument(documentId: string, fileName: string): Promise<void> {
  await deleteDoc(doc(db, 'governanceDocuments', documentId));
  const storageRef = ref(storage, `governance/${fileName}`);
  await deleteObject(storageRef);
}

export async function updateGovernanceDocument(
  documentId: string,
  updates: Partial<GovernanceDocument>
): Promise<void> {
  await updateDoc(doc(db, 'governanceDocuments', documentId), {
    ...updates,
    lastUpdated: new Date(),
  });
}