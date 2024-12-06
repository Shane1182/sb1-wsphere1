import { collection, addDoc, getDocs, doc, updateDoc, getDoc, query, where } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage, collections } from '../lib/firebase';
import { Tenant, TenantAdmin } from '../types/tenant';

export async function createTenant(
  tenant: Omit<Tenant, 'id' | 'createdAt' | 'updatedAt'>,
  adminData: Omit<TenantAdmin, 'id' | 'tenantId' | 'createdAt'>
): Promise<{ tenantId: string; adminId: string }> {
  try {
    // First, create the tenant document
    const tenantData = {
      ...tenant,
      createdAt: new Date(),
      updatedAt: new Date(),
      settings: {
        ...tenant.settings,
        allowedModules: tenant.settings?.allowedModules || [],
        maxUsers: tenant.settings?.maxUsers || 10,
        features: {
          governance: tenant.settings?.features?.governance || false,
          learning: tenant.settings?.features?.learning || false,
          analytics: tenant.settings?.features?.analytics || false,
        },
      },
      status: tenant.status || 'active',
    };

    const tenantRef = await addDoc(collection(db, collections.tenants), tenantData);

    // Then create the admin user
    const adminRef = await addDoc(collection(db, collections.users), {
      ...adminData,
      tenantId: tenantRef.id,
      role: 'tenant_admin',
      createdAt: new Date(),
    });

    return { tenantId: tenantRef.id, adminId: adminRef.id };
  } catch (error) {
    console.error('Error creating tenant:', error);
    throw new Error('Failed to create tenant');
  }
}

export async function getTenants(): Promise<Tenant[]> {
  try {
    const querySnapshot = await getDocs(collection(db, collections.tenants));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate(),
    } as Tenant));
  } catch (error) {
    console.error('Error fetching tenants:', error);
    return [];
  }
}

export async function getTenantById(tenantId: string): Promise<Tenant | null> {
  try {
    if (!tenantId) throw new Error('Tenant ID is required');
    
    const docRef = doc(db, collections.tenants, tenantId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return null;
    }

    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
    } as Tenant;
  } catch (error) {
    console.error('Error fetching tenant:', error);
    throw error;
  }
}

export async function updateTenant(
  tenantId: string,
  updates: Partial<Omit<Tenant, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<void> {
  try {
    if (!tenantId) throw new Error('Tenant ID is required');
    
    const docRef = doc(db, collections.tenants, tenantId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Error updating tenant:', error);
    throw error;
  }
}

export async function uploadTenantLogo(tenantId: string, file: File): Promise<string> {
  try {
    if (!tenantId) throw new Error('Tenant ID is required');
    
    const storageRef = ref(storage, `tenants/${tenantId}/logo-${Date.now()}`);
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
  } catch (error) {
    console.error('Error uploading logo:', error);
    throw new Error('Failed to upload logo');
  }
}

export async function getTenantAdmins(tenantId: string): Promise<TenantAdmin[]> {
  try {
    if (!tenantId) throw new Error('Tenant ID is required');
    
    const q = query(
      collection(db, collections.users),
      where('tenantId', '==', tenantId),
      where('role', '==', 'tenant_admin')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate(),
    } as TenantAdmin));
  } catch (error) {
    console.error('Error fetching tenant admins:', error);
    return [];
  }
}