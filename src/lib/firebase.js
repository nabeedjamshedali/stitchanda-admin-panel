import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  getDocs,
  getDoc,
  doc,
  addDoc,
  setDoc,
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
    const querySnapshot = await getDocs(collection(db, 'customer'));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting customers:', error);
    throw error;
  }
};

export const getCustomer = async (id) => {
  try {
    const docRef = doc(db, 'customer', id);
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

export const getCustomerById = async (id) => {
  try {
    const docRef = doc(db, 'customer', id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    const customer = { id: docSnap.id, ...docSnap.data() };

    // Fetch orders to calculate totalOrders and totalSpent
    const orders = await getOrders();
    const customerId = customer.customerId || customer.id;
    const customerOrders = orders.filter(order => order.customer_id === customerId);

    const totalOrders = customerOrders.length;
    const totalSpent = customerOrders
      .filter(order => order.payment_status?.toLowerCase() === 'paid')
      .reduce((sum, order) => sum + (order.total_price || 0), 0);

    return {
      ...customer,
      totalOrders,
      totalSpent,
      orders: customerOrders // Include orders for history section
    };
  } catch (error) {
    console.error('Error getting customer by ID:', error);
    throw error;
  }
};

export const addCustomer = async (data) => {
  try {
    const docRef = await addDoc(collection(db, 'customer'), {
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
    const docRef = doc(db, 'customer', id);
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
    await deleteDoc(doc(db, 'customer', id));
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
    const querySnapshot = await getDocs(collection(db, 'tailor'));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting tailors:', error);
    throw error;
  }
};

export const getTailorsByStatus = async (status) => {
  try {
    const q = query(collection(db, 'tailor'), where('status', '==', status));
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
    const docRef = doc(db, 'tailor', id);
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

export const getTailorById = async (id) => {
  try {
    const docRef = doc(db, 'tailor', id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    const tailor = { id: docSnap.id, ...docSnap.data() };

    // Fetch orders to calculate stats
    const orders = await getOrders();
    const tailorId = tailor.tailor_id || tailor.id;
    const tailorOrders = orders.filter(order => order.tailor_id === tailorId);

    const totalOrders = tailorOrders.length;
    const totalEarnings = tailorOrders
      .filter(order => order.payment_status?.toLowerCase() === 'paid')
      .reduce((sum, order) => sum + (order.total_price || 0), 0);

    // Determine status from DB fields
    let status = 'pending';
    if (tailor.is_verified === true) {
      status = tailor.availibility_status === true ? 'active' : 'suspended';
    } else if (tailor.is_verified === false) {
      status = tailor.updated_at ? 'rejected' : 'pending';
    }

    return {
      ...tailor,
      status,
      specialization: tailor.category || [],
      skills: tailor.category || [],
      rating: tailor.review || 0,
      totalOrders,
      totalEarnings,
      orders: tailorOrders,
      address: typeof tailor.address === 'object' ? tailor.address.full_address : tailor.address
    };
  } catch (error) {
    console.error('Error getting tailor by ID:', error);
    throw error;
  }
};

export const addTailor = async (data) => {
  try {
    const docRef = await addDoc(collection(db, 'tailor'), {
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
    const docRef = doc(db, 'tailor', id);
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
    const docRef = doc(db, 'tailor', id);
    await updateDoc(docRef, {
      is_verified: true,  // Actual DB field
      updated_at: serverTimestamp()
    });
  } catch (error) {
    console.error('Error approving tailor:', error);
    throw error;
  }
};

export const rejectTailor = async (id) => {
  try {
    const docRef = doc(db, 'tailor', id);
    await updateDoc(docRef, {
      is_verified: false,  // Actual DB field
      updated_at: serverTimestamp()
    });
  } catch (error) {
    console.error('Error rejecting tailor:', error);
    throw error;
  }
};

export const suspendTailor = async (id) => {
  try {
    const docRef = doc(db, 'tailor', id);
    await updateDoc(docRef, {
      is_verified: false,  // Suspend means not verified
      availibility_status: false,  // Also mark as unavailable (note the typo in DB)
      updated_at: serverTimestamp()
    });
  } catch (error) {
    console.error('Error suspending tailor:', error);
    throw error;
  }
};

export const activateTailor = async (id) => {
  try {
    const docRef = doc(db, 'tailor', id);
    await updateDoc(docRef, {
      is_verified: true,  // Actual DB field
      availibility_status: true,  // Mark as available (note the typo in DB)
      updated_at: serverTimestamp()
    });
  } catch (error) {
    console.error('Error activating tailor:', error);
    throw error;
  }
};

export const deleteTailor = async (id) => {
  try {
    await deleteDoc(doc(db, 'tailor', id));
  } catch (error) {
    console.error('Error deleting tailor:', error);
    throw error;
  }
};

// ==================== RIDERS CRUD + APPROVAL ====================

export const getRiders = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'driver'));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting riders:', error);
    throw error;
  }
};

export const getRidersByStatus = async (status) => {
  try {
    const q = query(collection(db, 'driver'), where('status', '==', status));
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
    const docRef = doc(db, 'driver', id);
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

export const getRiderById = async (id) => {
  try {
    const docRef = doc(db, 'driver', id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    const rider = { id: docSnap.id, ...docSnap.data() };

    // Fetch orders to calculate delivery stats
    const orders = await getOrders();
    const riderId = rider.driver_id || rider.id;
    const riderOrders = orders.filter(order => order.rider_id === riderId);

    const totalDeliveries = riderOrders.length;
    const completedDeliveries = riderOrders.filter(order => order.status === 10).length;

    // Determine status from DB fields
    let status = 'pending';
    if (rider.verification_status === 1) {
      status = rider.availiability_status === 1 ? 'active' : 'suspended';
    } else if (rider.verification_status === 0) {
      status = rider.updated_at ? 'rejected' : 'pending';
    }

    return {
      ...rider,
      status,
      rating: rider.rating || 0,
      totalDeliveries,
      completedDeliveries,
      currentlyAvailable: rider.currentlyAvailable || false,
      orders: riderOrders
    };
  } catch (error) {
    console.error('Error getting rider by ID:', error);
    throw error;
  }
};

export const addRider = async (data) => {
  try {
    const docRef = await addDoc(collection(db, 'driver'), {
      ...data,
      status: 'pending',
      createdAt: serverTimestamp(),
      rating: 0,
      totalDeliveries: 0,
      is_assigned: 0,          // PDF Rule: Driver availability (0 = not assigned, 1 = assigned)
      availability_status: 1   // PDF Rule: Driver availability (0 = unavailable, 1 = available)
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding rider:', error);
    throw error;
  }
};

export const updateRider = async (id, data) => {
  try {
    const docRef = doc(db, 'driver', id);
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
    const docRef = doc(db, 'driver', id);
    await updateDoc(docRef, {
      verification_status: 1,  // Actual DB field (1 = verified)
      updated_at: serverTimestamp()
    });
  } catch (error) {
    console.error('Error approving rider:', error);
    throw error;
  }
};

export const rejectRider = async (id) => {
  try {
    const docRef = doc(db, 'driver', id);
    await updateDoc(docRef, {
      verification_status: 0,  // Actual DB field (0 = not verified)
      updated_at: serverTimestamp()
    });
  } catch (error) {
    console.error('Error rejecting rider:', error);
    throw error;
  }
};

export const suspendRider = async (id) => {
  try {
    const docRef = doc(db, 'driver', id);
    await updateDoc(docRef, {
      verification_status: 0,  // Suspend means not verified
      availiability_status: 0,  // Also mark as unavailable (note the typo in DB)
      updated_at: serverTimestamp()
    });
  } catch (error) {
    console.error('Error suspending rider:', error);
    throw error;
  }
};

export const activateRider = async (id) => {
  try {
    const docRef = doc(db, 'driver', id);
    await updateDoc(docRef, {
      verification_status: 1,  // Actual DB field (1 = verified)
      availiability_status: 1,  // Mark as available (note the typo in DB)
      updated_at: serverTimestamp()
    });
  } catch (error) {
    console.error('Error activating rider:', error);
    throw error;
  }
};

export const deleteRider = async (id) => {
  try {
    await deleteDoc(doc(db, 'driver', id));
  } catch (error) {
    console.error('Error deleting rider:', error);
    throw error;
  }
};

// ==================== ORDERS CRUD + STATUS MANAGEMENT ====================

export const getOrders = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'order'));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting orders:', error);
    throw error;
  }
};

export const getOrdersByStatus = async (status) => {
  try {
    const q = query(collection(db, 'order'), where('status', '==', status));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting orders by status:', error);
    throw error;
  }
};

export const getOrder = async (id) => {
  try {
    const docRef = doc(db, 'order', id);
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

export const getOrderById = async (id) => {
  try {
    const docRef = doc(db, 'order', id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    const order = { id: docSnap.id, ...docSnap.data() };

    // Fetch related entities to enrich order data
    const [customers, tailors, drivers] = await Promise.all([
      getCustomers(),
      getTailors(),
      getRiders()
    ]);

    // Create lookup maps
    const customerMap = Object.fromEntries(customers.map(c => [c.customerId || c.id, c.name]));
    const tailorMap = Object.fromEntries(tailors.map(t => [t.tailor_id || t.id, t.name]));
    const driverMap = Object.fromEntries(drivers.map(d => [d.driver_id || d.id, d.name]));

    // Enrich order with names
    return {
      ...order,
      customerName: customerMap[order.customer_id] || 'Unknown Customer',
      tailorName: order.tailor_id ? (tailorMap[order.tailor_id] || 'Unknown Tailor') : null,
      riderName: order.rider_id ? (driverMap[order.rider_id] || 'Unknown Rider') : null
    };
  } catch (error) {
    console.error('Error getting order by ID:', error);
    throw error;
  }
};

export const addOrder = async (data) => {
  try {
    // Create a new doc reference to get the auto ID
    const orderRef = doc(collection(db, 'order'));
    const orderId = orderRef.id;

    // Set the document with the ID matching order_id (matches actual DB schema)
    await setDoc(orderRef, {
      ...data,
      order_id: orderId,           // Match docid with order_id field
      status: 0,                   // New orders have status 0 (unassigned)
      rider_id: '',                // Empty string for unassigned rider (as per actual DB)
      payment_status: 'Pending',   // Capital P to match actual DB
      delivery_date: null,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp()
    });

    return orderId;
  } catch (error) {
    console.error('Error adding order:', error);
    throw error;
  }
};

export const updateOrder = async (id, data) => {
  try {
    const docRef = doc(db, 'order', id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating order:', error);
    throw error;
  }
};

export const updateOrderStatus = async (id, status) => {
  try {
    const docRef = doc(db, 'order', id);
    await updateDoc(docRef, {
      status,  // Numeric status value (0-11)
      updated_at: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
};

export const assignTailor = async (orderId, tailorId) => {
  try {
    const docRef = doc(db, 'order', orderId);
    await updateDoc(docRef, {
      tailor_id: tailorId,  // Use snake_case to match DB schema
      status: 4,  // RECEIVED_TAILOR status
      updated_at: serverTimestamp()
    });
  } catch (error) {
    console.error('Error assigning tailor:', error);
    throw error;
  }
};

export const assignRider = async (orderId, riderId) => {
  try {
    const docRef = doc(db, 'order', orderId);
    await updateDoc(docRef, {
      rider_id: riderId,  // Use snake_case to match DB schema
      status: 1,  // ASSIGNED_RIDER status
      updated_at: serverTimestamp()
    });
  } catch (error) {
    console.error('Error assigning rider:', error);
    throw error;
  }
};

export const cancelOrder = async (id) => {
  try {
    const docRef = doc(db, 'order', id);
    await updateDoc(docRef, {
      status: -2,  // CANCELLED status (numeric)
      updated_at: serverTimestamp()
    });
  } catch (error) {
    console.error('Error cancelling order:', error);
    throw error;
  }
};

export const deleteOrder = async (id) => {
  try {
    await deleteDoc(doc(db, 'order', id));
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
  return onSnapshot(collection(db, 'tailor'), (snapshot) => {
    const tailors = snapshot.docs.map(doc => {
      const data = doc.data();

      // Determine status based on is_verified and availibility_status
      let status = 'pending';
      if (data.is_verified === true) {
        status = data.availibility_status === true ? 'active' : 'suspended';
      } else if (data.is_verified === false) {
        // Check if it was explicitly rejected or just pending
        status = data.updated_at ? 'rejected' : 'pending';
      }

      return {
        id: doc.id,
        ...data,
        // Map DB fields to UI-expected fields
        specialization: data.category || [],  // Map category to specialization
        skills: data.category || [],  // Use category as skills too
        status: status,  // Derived from is_verified and availibility_status
        rating: data.review || 0,  // Map review to rating
        totalOrders: data.totalOrders || 0,
        totalEarnings: data.totalEarnings || 0,
        address: typeof data.address === 'object' ? data.address.full_address : data.address
      };
    });
    callback(tailors);
  });
};

export const listenToRiders = (callback) => {
  return onSnapshot(collection(db, 'driver'), (snapshot) => {
    const riders = snapshot.docs.map(doc => {
      const data = doc.data();

      // Determine status based on verification_status and availiability_status
      let status = 'pending';
      if (data.verification_status === 1) {
        status = data.availiability_status === 1 ? 'active' : 'suspended';
      } else if (data.verification_status === 0) {
        // Check if it was explicitly rejected or just pending
        status = data.updated_at ? 'rejected' : 'pending';
      }

      return {
        id: doc.id,
        ...data,
        // Map DB fields to UI-expected fields
        currentlyAvailable: data.availiability_status === 1,  // Note: typo in DB field name
        status: status,  // Derived from verification_status and availiability_status
        rating: data.review || 0,  // Use review field if rating doesn't exist
        totalDeliveries: data.totalDeliveries || 0
      };
    });
    callback(riders);
  });
};

export const listenToOrders = (callback) => {
  return onSnapshot(collection(db, 'order'), async (snapshot) => {
    const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Fetch all customers, tailors, and drivers to enrich orders with names
    const [customers, tailors, drivers] = await Promise.all([
      getCustomers(),
      getTailors(),
      getRiders()
    ]);

    // Create lookup maps for quick access
    const customerMap = Object.fromEntries(customers.map(c => [c.customerId || c.id, c.name]));
    const tailorMap = Object.fromEntries(tailors.map(t => [t.tailor_id || t.id, t.name]));
    const driverMap = Object.fromEntries(drivers.map(d => [d.driver_id || d.id, d.name]));

    // Enrich orders with names from related collections
    const enrichedOrders = orders.map(order => ({
      ...order,
      customerName: customerMap[order.customer_id] || 'Unknown Customer',
      tailorName: order.tailor_id ? (tailorMap[order.tailor_id] || 'Unknown Tailor') : null,
      riderName: order.rider_id ? (driverMap[order.rider_id] || 'Unknown Rider') : null
    }));

    callback(enrichedOrders);
  });
};

export const listenToCustomers = (callback) => {
  return onSnapshot(collection(db, 'customer'), async (snapshot) => {
    const customers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Calculate totalOrders and totalSpent for each customer from orders
    const orders = await getOrders();

    const enrichedCustomers = customers.map(customer => {
      // Match using customerId field from DB, fallback to doc id
      const customerId = customer.customerId || customer.id;
      const customerOrders = orders.filter(order => order.customer_id === customerId);
      const totalOrders = customerOrders.length;
      const totalSpent = customerOrders
        .filter(order => order.payment_status?.toLowerCase() === 'paid')
        .reduce((sum, order) => sum + (order.total_price || 0), 0);

      return {
        ...customer,
        totalOrders,
        totalSpent
      };
    });

    callback(enrichedCustomers);
  });
};

export const listenToPendingTailors = (callback) => {
  const q = query(collection(db, 'tailor'), where('status', '==', 'pending'));
  return onSnapshot(q, (snapshot) => {
    const pendingTailors = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(pendingTailors);
  });
};

export const listenToPendingRiders = (callback) => {
  const q = query(collection(db, 'driver'), where('status', '==', 'pending'));
  return onSnapshot(q, (snapshot) => {
    const pendingRiders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(pendingRiders);
  });
};

export const listenToPayments = (callback) => {
  return onSnapshot(collection(db, 'payments'), (snapshot) => {
    const payments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(payments);
  });
};

// ==================== ADMIN AUTHENTICATION ====================

export const getAdminByUsername = async (username) => {
  try {
    const q = query(collection(db, 'admin'), where('username', '==', username));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() };
    }
    return null;
  } catch (error) {
    console.error('Error getting admin:', error);
    throw error;
  }
};

export const verifyAdminCredentials = async (username, password) => {
  try {
    const admin = await getAdminByUsername(username);
    if (!admin) {
      return { success: false, message: 'Invalid credentials' };
    }

    // Direct password comparison (you may want to use hashing in production)
    if (admin.password === password) {
      // Return admin data without password
      const { password: _, ...adminData } = admin;
      return { success: true, admin: adminData };
    }

    return { success: false, message: 'Invalid credentials' };
  } catch (error) {
    console.error('Error verifying admin credentials:', error);
    return { success: false, message: 'Authentication error' };
  }
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
