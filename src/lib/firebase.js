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
  serverTimestamp,
  orderBy,
  writeBatch
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
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        customerId: data.customerId || doc.id,
        ...data
      };
    });
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
      const data = docSnap.data();
      return {
        id: docSnap.id,
        customerId: data.customerId || docSnap.id,
        ...data
      };
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
      name: data.name,
      email: data.email,
      phone: data.phone,
      gender: data.gender || 'N/A',
      profileImagePath: data.profileImagePath || '',
      address: {
        fullAddress: data.address?.fullAddress || '',
        latitude: data.address?.latitude || 0,
        longitude: data.address?.longitude || 0
      },
      totalOrders: 0,
      totalSpent: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    // Update document with customerId
    await updateDoc(docRef, {
      customerId: docRef.id
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
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        tailor_id: data.tailor_id || doc.id,
        ...data
      };
    });
  } catch (error) {
    console.error('Error getting tailors:', error);
    throw error;
  }
};

export const getTailorsByStatus = async (verification_status) => {
  try {
    const q = query(collection(db, 'tailor'), where('verification_status', '==', verification_status));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        tailor_id: data.tailor_id || doc.id,
        ...data
      };
    });
  } catch (error) {
    console.error('Error getting tailors by status:', error);
    throw error;
  }
};

export const getPendingTailors = async () => {
  return getTailorsByStatus(0); // 0 = pending
};

export const getApprovedTailors = async () => {
  return getTailorsByStatus(1); // 1 = approved
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
      name: data.name,
      email: data.email,
      phone: data.phone,
      gender: data.gender || 'male',
      image_path: data.image_path || '',
      cnic: data.cnic || 0,
      cnic_front_image_path: data.cnic_front_image_path || '',
      cnic_back_image_path: data.cnic_back_image_path || '',
      address: {
        full_address: data.address?.full_address || '',
        latitude: data.address?.latitude || 0,
        longitude: data.address?.longitude || 0
      },
      category: data.category || [],
      experience: data.experience || 0,
      review: 0,
      availibility_status: false,
      is_verified: false,
      verification_status: 0, // 0 = pending, 1 = approved, 2 = rejected
      stripe_account_id: data.stripe_account_id || '',
      rating: 0,
      totalOrders: 0,
      totalEarnings: 0,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp()
    });

    // Update document with tailor_id
    await updateDoc(docRef, {
      tailor_id: docRef.id
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
      is_verified: true,
      verification_status: 1, // 1 = approved
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
      is_verified: false,
      verification_status: 2, // 2 = rejected
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
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        driver_id: data.driver_id || doc.id,
        ...data
      };
    });
  } catch (error) {
    console.error('Error getting riders:', error);
    throw error;
  }
};

export const getRidersByStatus = async (verification_status) => {
  try {
    const q = query(collection(db, 'driver'), where('verification_status', '==', verification_status));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        driver_id: data.driver_id || doc.id,
        ...data
      };
    });
  } catch (error) {
    console.error('Error getting riders by status:', error);
    throw error;
  }
};

export const getPendingRiders = async () => {
  return getRidersByStatus(0); // 0 = pending
};

export const getApprovedRiders = async () => {
  return getRidersByStatus(1); // 1 = approved
};

export const getActiveRiders = async () => {
  return getRidersByStatus(1); // 1 = approved/active
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
      name: data.name,
      email: data.email,
      phone: data.phone,
      profile_image_path: data.profile_image_path || '',
      cnic_image_path: data.cnic_image_path || '',
      current_location: {
        latitude: data.current_location?.latitude || 0,
        longitude: data.current_location?.longitude || 0
      },
      availiability_status: 0, // 0 = offline, 1 = online (note the typo in DB)
      is_assigned: 0, // 0 = no, 1 = yes
      verification_status: 0, // 0 = pending, 1 = approved, 2 = rejected
      rating: 0,
      totalDeliveries: 0,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp()
    });

    await updateDoc(docRef, {
      driver_id: docRef.id
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
      updated_at: serverTimestamp()
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
      verification_status: 2, // 2 = rejected
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
      availiability_status: 0, // Mark as offline (note the typo in DB)
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
      verification_status: 1, // 1 = approved
      availiability_status: 1, // Mark as online (note the typo in DB)
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

// ==================== ORDER DETAILS (Metadata for Orders) ====================

export const getOrderDetailsByOrderId = async (orderId) => {
  try {
    const q = query(collection(db, 'orderDetails'), where('order_id', '==', orderId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        details_id: data.details_id || doc.id,
        ...data
      };
    });
  } catch (error) {
    console.error('Error getting order details by order ID:', error);
    throw error;
  }
};

// ==================== ORDERS CRUD + STATUS MANAGEMENT ====================

export const getOrders = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'order'));
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        order_id: data.order_id || doc.id,
        ...data
      };
    });
  } catch (error) {
    console.error('Error getting orders:', error);
    throw error;
  }
};

export const getOrdersByStatus = async (status) => {
  try {
    const q = query(collection(db, 'order'), where('status', '==', status));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        order_id: data.order_id || doc.id,
        ...data
      };
    });
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

    // Fetch related entities and order details to enrich order data
    const [customers, tailors, drivers, orderDetailsData] = await Promise.all([
      getCustomers(),
      getTailors(),
      getRiders(),
      getOrderDetailsByOrderId(order.order_id || id)
    ]);

    // Create lookup maps
    const customerMap = Object.fromEntries(customers.map(c => [c.customerId || c.id, c.name]));
    const tailorMap = Object.fromEntries(tailors.map(t => [t.tailor_id || t.id, t.name]));
    const driverMap = Object.fromEntries(drivers.map(d => [d.driver_id || d.id, d.name]));

    // Enrich order with names and order details
    return {
      ...order,
      customerName: customerMap[order.customer_id] || 'Unknown Customer',
      tailorName: order.tailor_id ? (tailorMap[order.tailor_id] || 'Unknown Tailor') : null,
      riderName: order.rider_id ? (driverMap[order.rider_id] || 'Unknown Rider') : null,
      orderDetails: orderDetailsData.length > 0 ? orderDetailsData[0] : null
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
      updated_at: serverTimestamp()
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
        tailor_id: data.tailor_id || doc.id,
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
        driver_id: data.driver_id || doc.id,
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
    const orders = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        order_id: data.order_id || doc.id,
        ...data
      };
    });

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
    const customers = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        customerId: data.customerId || doc.id,
        ...data
      };
    });

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

export const getAdminByEmail = async (email) => {
  try {
    const q = query(collection(db, 'admin'), where('email', '==', email));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() };
    }
    return null;
  } catch (error) {
    console.error('Error getting admin by email:', error);
    throw error;
  }
};

export const verifyAdminCredentials = async (emailOrUsername, password) => {
  try {
    // Try to find admin by email first, then by username
    let admin = await getAdminByEmail(emailOrUsername);
    if (!admin) {
      admin = await getAdminByUsername(emailOrUsername);
    }

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

// ==================== CHAT / MESSAGES (Admin Support) ====================

export const getAdminConversations = async (adminId) => {
  try {
    // Query without orderBy to avoid index requirement initially
    const q = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', adminId)
    );
    const querySnapshot = await getDocs(q);

    // Enrich conversations with participant details
    const conversations = await Promise.all(
      querySnapshot.docs.map(async (docSnap) => {
        const data = docSnap.data();
        const otherParticipantId = data.participants?.find(p => p !== adminId);

        // Determine participant type and fetch details
        let participantDetails = null;
        let participantType = null;

        if (otherParticipantId) {
          // Check in customers first
          const customerDoc = await getDoc(doc(db, 'customer', otherParticipantId));
          if (customerDoc.exists()) {
            participantDetails = { id: customerDoc.id, ...customerDoc.data() };
            participantType = 'customer';
          } else {
            // Check in tailors
            const tailorDoc = await getDoc(doc(db, 'tailor', otherParticipantId));
            if (tailorDoc.exists()) {
              participantDetails = { id: tailorDoc.id, ...tailorDoc.data() };
              participantType = 'tailor';
            } else {
              // Check in drivers
              const driverDoc = await getDoc(doc(db, 'driver', otherParticipantId));
              if (driverDoc.exists()) {
                participantDetails = { id: driverDoc.id, ...driverDoc.data() };
                participantType = 'rider';
              }
            }
          }
        }

        return {
          id: docSnap.id,
          ...data,
          participantType,
          participantName: participantDetails?.name || 'Unknown',
          participantEmail: participantDetails?.email || '-',
        };
      })
    );

    // Sort by last_updated in JavaScript (descending - newest first)
    return conversations.sort((a, b) => {
      const aTime = a.last_updated?.toMillis?.() || 0;
      const bTime = b.last_updated?.toMillis?.() || 0;
      return bTime - aTime;
    });
  } catch (error) {
    console.error('Error getting admin conversations:', error);
    throw error;
  }
};

export const getConversationMessages = async (conversationId) => {
  try {
    const q = query(
      collection(db, 'conversations', conversationId, 'messages'),
      orderBy('timestamp', 'asc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data()
    }));
  } catch (error) {
    console.error('Error getting conversation messages:', error);
    throw error;
  }
};

export const sendMessage = async (conversationId, messageData) => {
  try {
    const messagesRef = collection(db, 'conversations', conversationId, 'messages');
    await addDoc(messagesRef, {
      sender_id: messageData.sender_id,
      sender_type: messageData.sender_type || 'admin',
      message: messageData.message,
      timestamp: serverTimestamp(),
      read: false
    });

    // Update conversation last_message and last_updated
    const conversationRef = doc(db, 'conversations', conversationId);
    await updateDoc(conversationRef, {
      last_message: messageData.message,
      last_updated: serverTimestamp()
    });
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

export const markMessagesAsRead = async (conversationId, userId) => {
  try {
    const q = query(
      collection(db, 'conversations', conversationId, 'messages'),
      where('sender_id', '!=', userId),
      where('read', '==', false)
    );
    const querySnapshot = await getDocs(q);

    const batch = writeBatch(db);
    querySnapshot.docs.forEach((docSnap) => {
      batch.update(docSnap.ref, { read: true });
    });

    await batch.commit();
  } catch (error) {
    console.error('Error marking messages as read:', error);
    throw error;
  }
};

export const listenToConversationMessages = (conversationId, callback) => {
  const q = query(
    collection(db, 'conversations', conversationId, 'messages'),
    orderBy('timestamp', 'asc')
  );

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data()
    }));
    callback(messages);
  });
};

export const createConversation = async (adminId, participantId, participantType) => {
  try {
    const conversationRef = await addDoc(collection(db, 'conversations'), {
      participants: [adminId, participantId],
      participant_types: {
        [adminId]: 'admin',
        [participantId]: participantType
      },
      type: `admin_${participantType}`,
      last_message: '',
      last_updated: serverTimestamp(),
      created_at: serverTimestamp()
    });

    return conversationRef.id;
  } catch (error) {
    console.error('Error creating conversation:', error);
    throw error;
  }
};

/**
 * Find existing conversation or create new one
 * Returns conversation ID
 */
export const findOrCreateConversation = async (adminId, participantId, participantType) => {
  try {
    // Check if conversation already exists
    const q = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', adminId)
    );
    const querySnapshot = await getDocs(q);

    // Find conversation with this specific participant
    let existingConversation = null;
    querySnapshot.docs.forEach(docSnap => {
      const data = docSnap.data();
      if (data.participants && data.participants.includes(participantId)) {
        existingConversation = { id: docSnap.id, ...data };
      }
    });

    // If conversation exists, return its ID
    if (existingConversation) {
      return existingConversation.id;
    }

    // Otherwise, create new conversation
    return await createConversation(adminId, participantId, participantType);
  } catch (error) {
    console.error('Error finding or creating conversation:', error);
    throw error;
  }
};

/**
 * Get all users (customers, tailors, riders) for starting conversations
 */
export const getAllUsersForMessaging = async () => {
  try {
    const [customers, tailors, riders] = await Promise.all([
      getCustomers(),
      getTailors(),
      getRiders()
    ]);

    return {
      customers: customers.map(c => ({
        id: c.customerId || c.id,
        name: c.name,
        email: c.email,
        type: 'customer',
        profileImage: c.profileImagePath
      })),
      tailors: tailors.map(t => ({
        id: t.tailor_id || t.id,
        name: t.name,
        email: t.email,
        type: 'tailor',
        profileImage: t.image_path,
        status: t.status
      })),
      riders: riders.map(r => ({
        id: r.driver_id || r.id,
        name: r.name,
        email: r.email,
        type: 'rider',
        profileImage: r.profile_image_path,
        status: r.status
      }))
    };
  } catch (error) {
    console.error('Error getting users for messaging:', error);
    throw error;
  }
};

export { Timestamp, serverTimestamp } from 'firebase/firestore';
