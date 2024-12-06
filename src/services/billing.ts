import { collection, addDoc, getDocs, query, where, doc, updateDoc } from 'firebase/firestore';
import { db, collections } from '../lib/firebase';
import { BillingPlan, TenantBilling, PaymentHistory } from '../types/billing';

export const plans: BillingPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 39,
    currency: 'GBP',
    billingCycle: 'monthly',
    features: {
      maxUsers: 10,
      governance: true,
      learning: true,
      analytics: false,
    },
  },
  {
    id: 'business',
    name: 'Business',
    price: 79,
    currency: 'GBP',
    billingCycle: 'monthly',
    features: {
      maxUsers: 25,
      governance: true,
      learning: true,
      analytics: true,
    },
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 159,
    currency: 'GBP',
    billingCycle: 'monthly',
    features: {
      maxUsers: 100,
      governance: true,
      learning: true,
      analytics: true,
    },
  },
];

export async function getTenantBilling(tenantId: string): Promise<TenantBilling | null> {
  const q = query(
    collection(db, collections.billing),
    where('tenantId', '==', tenantId)
  );
  
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;

  const doc = snapshot.docs[0];
  return {
    ...doc.data(),
    currentPeriodEnd: doc.data().currentPeriodEnd.toDate(),
  } as TenantBilling;
}

export async function updateTenantBilling(
  tenantId: string,
  updates: Partial<TenantBilling>
): Promise<void> {
  const q = query(
    collection(db, collections.billing),
    where('tenantId', '==', tenantId)
  );
  
  const snapshot = await getDocs(q);
  if (!snapshot.empty) {
    const docRef = doc(db, collections.billing, snapshot.docs[0].id);
    await updateDoc(docRef, updates);
  } else {
    await addDoc(collection(db, collections.billing), {
      tenantId,
      ...updates,
      createdAt: new Date(),
    });
  }
}

export async function getPaymentHistory(tenantId: string): Promise<PaymentHistory[]> {
  const q = query(
    collection(db, collections.payments),
    where('tenantId', '==', tenantId),
    where('status', '==', 'succeeded')
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    date: doc.data().date.toDate(),
  })) as PaymentHistory[];
}