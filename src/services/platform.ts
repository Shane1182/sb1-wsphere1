import { collection, getDocs, doc, setDoc, deleteDoc, query, where, addDoc, updateDoc, Timestamp, writeBatch } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { BillingPlan } from '../types/billing';
import { PlatformMessage } from '../types/platform';

const MESSAGES_COLLECTION = 'platformMessages';
const PLATFORM_PLANS_COLLECTION = 'platform_plans';

export async function getPlatformPlans(): Promise<BillingPlan[]> {
  const querySnapshot = await getDocs(collection(db, PLATFORM_PLANS_COLLECTION));
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as BillingPlan));
}

export async function updatePlatformPlan(plan: BillingPlan): Promise<void> {
  await setDoc(doc(db, PLATFORM_PLANS_COLLECTION, plan.id), plan);
}

export async function deletePlatformPlan(planId: string): Promise<void> {
  await deleteDoc(doc(db, PLATFORM_PLANS_COLLECTION, planId));
}

export async function createPlatformMessage(message: Omit<PlatformMessage, 'id' | 'createdAt'>): Promise<string> {
  try {
    const messagesRef = collection(db, MESSAGES_COLLECTION);
    
    const messageData = {
      title: message.title,
      content: message.content,
      type: message.type,
      targetRoles: message.targetRoles,
      active: true,
      createdAt: Timestamp.now(),
      expiresAt: message.expiresAt ? Timestamp.fromDate(message.expiresAt) : null
    };

    const docRef = await addDoc(messagesRef, messageData);
    return docRef.id;
  } catch (error) {
    console.error('Error creating platform message:', error);
    throw new Error('Failed to create platform message');
  }
}

export async function getActivePlatformMessages(role: string): Promise<PlatformMessage[]> {
  try {
    const messagesRef = collection(db, MESSAGES_COLLECTION);
    const now = Timestamp.now();
    
    const q = query(messagesRef, where('active', '==', true));
    const querySnapshot = await getDocs(q);
    const messages: PlatformMessage[] = [];

    querySnapshot.forEach(doc => {
      const data = doc.data();
      const expiresAt = data.expiresAt?.toDate();
      
      // Only include messages that haven't expired and target the user's role
      if ((!expiresAt || expiresAt.getTime() > now.toMillis()) && 
          (role === 'platform_admin' || data.targetRoles.includes(role))) {
        messages.push({
          id: doc.id,
          title: data.title,
          content: data.content,
          type: data.type,
          targetRoles: data.targetRoles,
          active: data.active,
          createdAt: data.createdAt.toDate(),
          expiresAt: expiresAt || undefined
        });
      }
    });

    // Sort messages by creation date (newest first)
    return messages.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  } catch (error) {
    console.error('Error getting platform messages:', error);
    throw new Error('Failed to retrieve platform messages');
  }
}

export async function deletePlatformMessages(messageIds: string[]): Promise<void> {
  try {
    const batch = writeBatch(db);
    
    messageIds.forEach(messageId => {
      const messageRef = doc(db, MESSAGES_COLLECTION, messageId);
      batch.delete(messageRef);
    });

    await batch.commit();
  } catch (error) {
    console.error('Error deleting platform messages:', error);
    throw new Error('Failed to delete platform messages');
  }
}