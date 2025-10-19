import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  getDocs,
  getDoc,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const analytics = getAnalytics(app);

// ==================== CUSTOMERS CRUD ====================

export const getCustomers = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'customers'));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting customers:', error);
    throw error;
  }
};

export const getCustomer = async (id) => {
  try {
    const docRef = doc(db, 'customers', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error('Error getting customer:', error);
    throw error;
  }
};

export const addCustomer = async (data) => {
  try {
    const docRef = await addDoc(collection(db, 'customers'), {
      ...data,
      createdAt: serverTimestamp(),
      totalOrders: 0,
      totalSpent: 0
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding customer:', error);
    throw error;
  }
};

export const updateCustomer = async (id, data) => {
  try {
    const docRef = doc(db, 'customers', id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating customer:', error);
    throw error;
  }
};

export const deleteCustomer = async (id) => {
  try {
    await deleteDoc(doc(db, 'customers', id));
  } catch (error) {
    console.error('Error deleting customer:', error);
    throw error;
  }
};

export const searchCustomers = async (searchTerm) => {
  try {
    const customers = await getCustomers();
    return customers.filter(customer =>
      customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone?.includes(searchTerm)
    );
  } catch (error) {
    console.error('Error searching customers:', error);
    throw error;
  }
};

// ==================== TAILORS CRUD + APPROVAL ====================

export const getTailors = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'tailors'));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting tailors:', error);
    throw error;
  }
};

export const getTailorsByStatus = async (status) => {
  try {
    const q = query(collection(db, 'tailors'), where('status', '==', status));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting tailors by status:', error);
    throw error;
  }
};

export const getPendingTailors = async () => {
  return getTailorsByStatus('pending');
};

export const getApprovedTailors = async () => {
  return getTailorsByStatus('approved');
};

export const getTailor = async (id) => {
  try {
    const docRef = doc(db, 'tailors', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error('Error getting tailor:', error);
    throw error;
  }
};

export const addTailor = async (data) => {
  try {
    const docRef = await addDoc(collection(db, 'tailors'), {
      ...data,
      status: 'pending',
      createdAt: serverTimestamp(),
      rating: 0,
      totalOrders: 0,
      totalEarnings: 0
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding tailor:', error);
    throw error;
  }
};

export const updateTailor = async (id, data) => {
  try {
    const docRef = doc(db, 'tailors', id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating tailor:', error);
    throw error;
  }
};

export const approveTailor = async (id) => {
  try {
    const docRef = doc(db, 'tailors', id);
    await updateDoc(docRef, {
      status: 'approved',
      approvedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error approving tailor:', error);
    throw error;
  }
};

export const rejectTailor = async (id) => {
  try {
    const docRef = doc(db, 'tailors', id);
    await updateDoc(docRef, {
      status: 'rejected',
      rejectedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error rejecting tailor:', error);
    throw error;
  }
};

export const suspendTailor = async (id) => {
  try {
    const docRef = doc(db, 'tailors', id);
    await updateDoc(docRef, {
      status: 'suspended',
      suspendedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error suspending tailor:', error);
    throw error;
  }
};

export const activateTailor = async (id) => {
  try {
    const docRef = doc(db, 'tailors', id);
    await updateDoc(docRef, {
      status: 'active',
      activatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error activating tailor:', error);
    throw error;
  }
};

export const deleteTailor = async (id) => {
  try {
    await deleteDoc(doc(db, 'tailors', id));
  } catch (error) {
    console.error('Error deleting tailor:', error);
    throw error;
  }
};

// ==================== RIDERS CRUD + APPROVAL ====================

export const getRiders = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'riders'));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting riders:', error);
    throw error;
  }
};

export const getRidersByStatus = async (status) => {
  try {
    const q = query(collection(db, 'riders'), where('status', '==', status));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting riders by status:', error);
    throw error;
  }
};

export const getPendingRiders = async () => {
  return getRidersByStatus('pending');
};

export const getApprovedRiders = async () => {
  return getRidersByStatus('approved');
};

export const getActiveRiders = async () => {
  return getRidersByStatus('active');
};

export const getRider = async (id) => {
  try {
    const docRef = doc(db, 'riders', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error('Error getting rider:', error);
    throw error;
  }
};

export const addRider = async (data) => {
  try {
    const docRef = await addDoc(collection(db, 'riders'), {
      ...data,
      status: 'pending',
      createdAt: serverTimestamp(),
      rating: 0,
      totalDeliveries: 0,
      currentlyAvailable: true
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding rider:', error);
    throw error;
  }
};

export const updateRider = async (id, data) => {
  try {
    const docRef = doc(db, 'riders', id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating rider:', error);
    throw error;
  }
};

export const approveRider = async (id) => {
  try {
    const docRef = doc(db, 'riders', id);
    await updateDoc(docRef, {
      status: 'approved',
      approvedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error approving rider:', error);
    throw error;
  }
};

export const rejectRider = async (id) => {
  try {
    const docRef = doc(db, 'riders', id);
    await updateDoc(docRef, {
      status: 'rejected',
      rejectedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error rejecting rider:', error);
    throw error;
  }
};

export const suspendRider = async (id) => {
  try {
    const docRef = doc(db, 'riders', id);
    await updateDoc(docRef, {
      status: 'suspended',
      suspendedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error suspending rider:', error);
    throw error;
  }
};

export const activateRider = async (id) => {
  try {
    const docRef = doc(db, 'riders', id);
    await updateDoc(docRef, {
      status: 'active',
      activatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error activating rider:', error);
    throw error;
  }
};

export const deleteRider = async (id) => {
  try {
    await deleteDoc(doc(db, 'riders', id));
  } catch (error) {
    console.error('Error deleting rider:', error);
    throw error;
  }
};

// ==================== ORDERS CRUD + STATUS MANAGEMENT ====================

export const getOrders = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'orders'));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting orders:', error);
    throw error;
  }
};

export const getOrdersByStatus = async (status) => {
  try {
    const q = query(collection(db, 'orders'), where('status', '==', status));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting orders by status:', error);
    throw error;
  }
};

export const getOrder = async (id) => {
  try {
    const docRef = doc(db, 'orders', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error('Error getting order:', error);
    throw error;
  }
};

export const addOrder = async (data) => {
  try {
    const docRef = await addDoc(collection(db, 'orders'), {
      ...data,
      status: 'pending',
      paymentStatus: 'pending',
      createdAt: serverTimestamp(),
      timeline: [{
        status: 'pending',
        timestamp: new Date(),
        description: 'Order created'
      }]
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding order:', error);
    throw error;
  }
};

export const updateOrder = async (id, data) => {
  try {
    const docRef = doc(db, 'orders', id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating order:', error);
    throw error;
  }
};

export const updateOrderStatus = async (id, status, description = '') => {
  try {
    const order = await getOrder(id);
    const timeline = order.timeline || [];

    timeline.push({
      status,
      timestamp: new Date(),
      description: description || `Order status updated to ${status}`
    });

    const docRef = doc(db, 'orders', id);
    await updateDoc(docRef, {
      status,
      timeline,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
};

export const assignTailor = async (orderId, tailorId, tailorName) => {
  try {
    const order = await getOrder(orderId);
    const timeline = order.timeline || [];

    timeline.push({
      status: 'assigned',
      timestamp: new Date(),
      description: `Tailor ${tailorName} assigned to order`
    });

    const docRef = doc(db, 'orders', orderId);
    await updateDoc(docRef, {
      tailorId,
      tailorName,
      status: 'assigned',
      assignedAt: serverTimestamp(),
      timeline
    });
  } catch (error) {
    console.error('Error assigning tailor:', error);
    throw error;
  }
};

export const assignRider = async (orderId, riderId, riderName, stage = 'pickup') => {
  try {
    const order = await getOrder(orderId);
    const timeline = order.timeline || [];

    timeline.push({
      status: stage === 'pickup' ? 'pickup_scheduled' : 'delivery_scheduled',
      timestamp: new Date(),
      description: `Rider ${riderName} assigned for ${stage}`
    });

    const docRef = doc(db, 'orders', orderId);
    await updateDoc(docRef, {
      riderId,
      riderName,
      timeline,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error assigning rider:', error);
    throw error;
  }
};

export const cancelOrder = async (id, reason = '') => {
  try {
    const order = await getOrder(id);
    const timeline = order.timeline || [];

    timeline.push({
      status: 'cancelled',
      timestamp: new Date(),
      description: reason || 'Order cancelled'
    });

    const docRef = doc(db, 'orders', id);
    await updateDoc(docRef, {
      status: 'cancelled',
      cancelledAt: serverTimestamp(),
      cancelReason: reason,
      timeline
    });
  } catch (error) {
    console.error('Error cancelling order:', error);
    throw error;
  }
};

export const deleteOrder = async (id) => {
  try {
    await deleteDoc(doc(db, 'orders', id));
  } catch (error) {
    console.error('Error deleting order:', error);
    throw error;
  }
};

// ==================== PAYMENTS ====================

export const getPayments = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'payments'));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting payments:', error);
    throw error;
  }
};

export const getPaymentsByOrder = async (orderId) => {
  try {
    const q = query(collection(db, 'payments'), where('orderId', '==', orderId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting payments by order:', error);
    throw error;
  }
};

// ==================== REAL-TIME LISTENERS ====================

export const listenToTailors = (callback) => {
  return onSnapshot(collection(db, 'tailors'), (snapshot) => {
    const tailors = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(tailors);
  });
};

export const listenToRiders = (callback) => {
  return onSnapshot(collection(db, 'riders'), (snapshot) => {
    const riders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(riders);
  });
};

export const listenToOrders = (callback) => {
  return onSnapshot(collection(db, 'orders'), (snapshot) => {
    const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(orders);
  });
};

export const listenToCustomers = (callback) => {
  return onSnapshot(collection(db, 'customers'), (snapshot) => {
    const customers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(customers);
  });
};

export const listenToPendingTailors = (callback) => {
  const q = query(collection(db, 'tailors'), where('status', '==', 'pending'));
  return onSnapshot(q, (snapshot) => {
    const pendingTailors = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(pendingTailors);
  });
};

export const listenToPendingRiders = (callback) => {
  const q = query(collection(db, 'riders'), where('status', '==', 'pending'));
  return onSnapshot(q, (snapshot) => {
    const pendingRiders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(pendingRiders);
  });
};

// ==================== ANALYTICS & STATISTICS ====================

export const getStatistics = async () => {
  try {
    const [customers, tailors, riders, orders, payments] = await Promise.all([
      getCustomers(),
      getTailors(),
      getRiders(),
      getOrders(),
      getPayments()
    ]);

    const totalRevenue = payments
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const monthlyRevenue = payments
      .filter(p => {
        if (!p.createdAt) return false;
        const date = p.createdAt.toDate ? p.createdAt.toDate() : new Date(p.createdAt);
        return date.getMonth() === currentMonth &&
               date.getFullYear() === currentYear &&
               p.status === 'completed';
      })
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    return {
      totalCustomers: customers.length,
      totalTailors: tailors.length,
      pendingTailors: tailors.filter(t => t.status === 'pending').length,
      approvedTailors: tailors.filter(t => t.status === 'approved' || t.status === 'active').length,
      totalRiders: riders.length,
      pendingRiders: riders.filter(r => r.status === 'pending').length,
      approvedRiders: riders.filter(r => r.status === 'approved' || r.status === 'active').length,
      totalOrders: orders.length,
      pendingOrders: orders.filter(o => o.status === 'pending').length,
      inProgressOrders: orders.filter(o => !['pending', 'delivered', 'cancelled', 'payment_completed'].includes(o.status)).length,
      completedOrders: orders.filter(o => o.status === 'delivered' || o.status === 'payment_completed').length,
      cancelledOrders: orders.filter(o => o.status === 'cancelled').length,
      totalRevenue,
      monthlyRevenue
    };
  } catch (error) {
    console.error('Error getting statistics:', error);
    throw error;
  }
};

export { Timestamp, serverTimestamp } from 'firebase/firestore';
