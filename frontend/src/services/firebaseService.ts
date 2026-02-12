import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  QueryConstraint,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Generic document operations
export async function getDocumentById(collectionName: string, docId: string) {
  if (!db) throw new Error('Firestore not initialized');
  try {
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error(`Error fetching document from ${collectionName}:`, error);
    throw error;
  }
}

export async function getCollectionData(
  collectionName: string,
  constraints: QueryConstraint[] = []
) {
  if (!db) throw new Error('Firestore not initialized');
  try {
    const q = constraints.length > 0 ? query(collection(db, collectionName), ...constraints) : collection(db, collectionName);
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error(`Error fetching collection ${collectionName}:`, error);
    throw error;
  }
}

export async function addDocument(
  collectionName: string,
  docId: string,
  data: any
) {
  if (!db) throw new Error('Firestore not initialized');
  try {
    const docRef = doc(db, collectionName, docId);
    await setDoc(docRef, {
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return docId;
  } catch (error) {
    console.error(`Error adding document to ${collectionName}:`, error);
    throw error;
  }
}

export async function updateDocument(
  collectionName: string,
  docId: string,
  data: any
) {
  if (!db) throw new Error('Firestore not initialized');
  try {
    const docRef = doc(db, collectionName, docId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error(`Error updating document in ${collectionName}:`, error);
    throw error;
  }
}

export async function deleteDocument(
  collectionName: string,
  docId: string
) {
  if (!db) throw new Error('Firestore not initialized');
  try {
    await deleteDoc(doc(db, collectionName, docId));
  } catch (error) {
    console.error(`Error deleting document from ${collectionName}:`, error);
    throw error;
  }
}

// VoiceLink specific services
export const marketPriceService = {
  async getPrices(filters?: QueryConstraint[]) {
    return getCollectionData('marketPrices', filters);
  },
  async getPriceById(docId: string) {
    return getDocumentById('marketPrices', docId);
  },
  async addPrice(docId: string, data: any) {
    return addDocument('marketPrices', docId, data);
  },
  async updatePrice(docId: string, data: any) {
    return updateDocument('marketPrices', docId, data);
  },
};

export const transportService = {
  async getSchedules(filters?: QueryConstraint[]) {
    return getCollectionData('transportSchedules', filters);
  },
  async getScheduleById(docId: string) {
    return getDocumentById('transportSchedules', docId);
  },
  async addSchedule(docId: string, data: any) {
    return addDocument('transportSchedules', docId, data);
  },
  async updateSchedule(docId: string, data: any) {
    return updateDocument('transportSchedules', docId, data);
  },
};

export const alertService = {
  async getAlerts(filters?: QueryConstraint[]) {
    return getCollectionData('alerts', filters);
  },
  async getAlertById(docId: string) {
    return getDocumentById('alerts', docId);
  },
  async addAlert(docId: string, data: any) {
    return addDocument('alerts', docId, data);
  },
  async updateAlert(docId: string, data: any) {
    return updateDocument('alerts', docId, data);
  },
};
