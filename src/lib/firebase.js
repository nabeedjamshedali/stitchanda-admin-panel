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
  writeBatch,
  arrayUnion
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

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const analytics = getAnalytics(app);

// Customer CRUD Operations
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
      orders: customerOrders
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

// Tailor CRUD Operations

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
  return getTailorsByStatus(0); 
};

export const getApprovedTailors = async () => {
  return getTailorsByStatus(1); 
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

    const orders = await getOrders();
    const tailorId = tailor.tailor_id || tailor.id;
    const tailorOrders = orders.filter(order => order.tailor_id === tailorId);

    const totalOrders = tailorOrders.length;
    const totalEarnings = tailorOrders
      .filter(order => order.payment_status?.toLowerCase() === 'paid')
      .reduce((sum, order) => sum + (order.total_price || 0), 0);

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
      is_verified: false,  
      availibility_status: false,  
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
      is_verified: true,  
      availibility_status: true,  
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

// Rider CRUD Operations

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

    const orders = await getOrders();
    const riderId = rider.driver_id || rider.id;
    const riderOrders = orders.filter(order => order.rider_id === riderId);

    const totalDeliveries = riderOrders.length;
    const completedDeliveries = riderOrders.filter(order => order.status === 10).length;

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
      availiability_status: 0, // 0 = offline, 1 = online 
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
      verification_status: 1,  
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
      verification_status: 2, 
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
      availiability_status: 0, 
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
      availiability_status: 1, // Mark as online 
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

// Order Details

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

    const [customers, tailors, drivers, orderDetailsData] = await Promise.all([
      getCustomers(),
      getTailors(),
      getRiders(),
      getOrderDetailsByOrderId(order.order_id || id)
    ]);

    const customerMap = Object.fromEntries(customers.map(c => [c.customerId || c.id, c.name]));
    const tailorMap = Object.fromEntries(tailors.map(t => [t.tailor_id || t.id, t.name]));
    const driverMap = Object.fromEntries(drivers.map(d => [d.driver_id || d.id, d.name]));

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
    const orderRef = doc(collection(db, 'order'));
    const orderId = orderRef.id;

    await setDoc(orderRef, {
      ...data,
      order_id: orderId,           
      status: 0,                   
      rider_id: '',                
      payment_status: 'Pending',  
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
      status,  
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
      tailor_id: tailorId,  
      status: 4,  
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
      rider_id: riderId,  
      status: 1,  
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
      status: -2,  
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

// Listeners for Real-time Updates

export const listenToTailors = (callback) => {
  return onSnapshot(collection(db, 'tailor'), (snapshot) => {
    const tailors = snapshot.docs.map(doc => {
      const data = doc.data();

      let status = 'pending';
      if (data.is_verified === true) {
        status = data.availibility_status === true ? 'active' : 'suspended';
      } else if (data.is_verified === false) {
        status = data.updated_at ? 'rejected' : 'pending';
      }

      return {
        id: doc.id,
        tailor_id: data.tailor_id || doc.id,
        ...data,
        specialization: data.category || [],  
        skills: data.category || [], 
        status: status, 
        rating: data.review || 0,  
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

      let status = 'pending';
      if (data.verification_status === 1) {
        status = data.availiability_status === 1 ? 'active' : 'suspended';
      } else if (data.verification_status === 0) {
        status = data.updated_at ? 'rejected' : 'pending';
      }

      return {
        id: doc.id,
        driver_id: data.driver_id || doc.id,
        ...data,
        currentlyAvailable: data.availiability_status === 1,  
        status: status,  
        rating: data.review || 0, 
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

    const [customers, tailors, drivers] = await Promise.all([
      getCustomers(),
      getTailors(),
      getRiders()
    ]);

    const customerMap = Object.fromEntries(customers.map(c => [c.customerId || c.id, c.name]));
    const tailorMap = Object.fromEntries(tailors.map(t => [t.tailor_id || t.id, t.name]));
    const driverMap = Object.fromEntries(drivers.map(d => [d.driver_id || d.id, d.name]));

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

    const orders = await getOrders();

    const enrichedCustomers = customers.map(customer => {
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

// Admin Authentication

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
    let admin = await getAdminByEmail(emailOrUsername);
    if (!admin) {
      admin = await getAdminByUsername(emailOrUsername);
    }

    if (!admin) {
      return { success: false, message: 'Invalid credentials' };
    }

    if (admin.password === password) {
      const { password: _, ...adminData } = admin;
      return { success: true, admin: adminData };
    }

    return { success: false, message: 'Invalid credentials' };
  } catch (error) {
    console.error('Error verifying admin credentials:', error);
    return { success: false, message: 'Authentication error' };
  }
};

// Dashboard Statistics

export const getStatistics = async () => {
  try {
    const [customers, tailors, riders, orders] = await Promise.all([
      getCustomers(),
      getTailors(),
      getRiders(),
      getOrders()
    ]);

    // Calculate total revenue (Admin gets 10% commission from completed orders)
    // Orders are considered completed from status 5 (COMPLETED_TAILOR) onwards
    const ADMIN_COMMISSION_RATE = 0.10; // 10%
    const totalRevenue = orders
      .filter(o => o.status >= 5 && o.status <= 11) // Completed by tailor to self delivery
      .reduce((sum, o) => sum + ((o.total_price || 0) * ADMIN_COMMISSION_RATE), 0);

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const monthlyRevenue = orders
      .filter(o => {
        if (!o.created_at || o.status < 5) return false;
        const date = o.created_at.toDate ? o.created_at.toDate() : new Date(o.created_at);
        return date.getMonth() === currentMonth &&
               date.getFullYear() === currentYear &&
               o.status >= 5 && o.status <= 11; // Completed orders
      })
      .reduce((sum, o) => sum + ((o.total_price || 0) * ADMIN_COMMISSION_RATE), 0);

    // Order status counts using numeric values
    // Status values: -3=rejected, -2=cancelled, -1=just_created, 0=unassigned, 1-9=in_progress, 10=completed
    const pendingOrders = orders.filter(o => o.status === 0 || o.status === -1).length;
    const inProgressOrders = orders.filter(o => o.status >= 1 && o.status <= 9).length;
    const completedOrders = orders.filter(o => o.status === 10 || o.status === 11).length;
    const cancelledOrders = orders.filter(o => o.status === -2 || o.status === -3).length;

    return {
      totalCustomers: customers.length,
      totalTailors: tailors.length,
      pendingTailors: tailors.filter(t => t.status === 0).length, // 0 = pending
      approvedTailors: tailors.filter(t => t.status === 1).length, // 1 = approved/active
      totalRiders: riders.length,
      pendingRiders: riders.filter(r => r.verification_status === 0).length, // 0 = pending
      approvedRiders: riders.filter(r => r.verification_status === 1).length, // 1 = approved/active
      totalOrders: orders.length,
      pendingOrders,
      inProgressOrders,
      completedOrders,
      cancelledOrders,
      totalRevenue,
      monthlyRevenue
    };
  } catch (error) {
    console.error('Error getting statistics:', error);
    throw error;
  }
};

// Admin Chat Functionality

export const getAdminConversations = async (adminId) => {
  try {
    const q = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', adminId),
      orderBy('last_updated', 'desc')
    );
    const querySnapshot = await getDocs(q);

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

    return conversations;
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
    const messageText = messageData.text || messageData.message; // Support both field names
    const messageType = messageData.type || 'text';

    await addDoc(messagesRef, {
      sender_id: messageData.sender_id,
      text: messageText,
      type: messageType,
      timestamp: serverTimestamp(),
      read_by: []
    });

    // Update conversation last_message and last_updated
    const conversationRef = doc(db, 'conversations', conversationId);
    await updateDoc(conversationRef, {
      last_message: messageType === 'text' ? messageText : `[${messageType}]`,
      last_updated: serverTimestamp()
    });
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

export const markMessagesAsRead = async (conversationId, userId) => {
  try {
    // Get all messages in the conversation
    const messagesRef = collection(db, 'conversations', conversationId, 'messages');
    const querySnapshot = await getDocs(messagesRef);

    const batch = writeBatch(db);
    querySnapshot.docs.forEach((docSnap) => {
      const data = docSnap.data();
      // Only mark as read if the user is not the sender and hasn't already read it
      if (data.sender_id !== userId && (!data.read_by || !data.read_by.includes(userId))) {
        batch.update(docSnap.ref, {
          read_by: arrayUnion(userId)
        });
      }
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
    // Create deterministic conversation ID (sorted user IDs joined with underscore)
    // This matches the Flutter app structure from chat_repository.dart
    const participants = [adminId, participantId].sort();
    const conversationId = participants.join('_');

    // Use setDoc with the deterministic ID instead of addDoc
    const conversationRef = doc(db, 'conversations', conversationId);
    await setDoc(conversationRef, {
      participants: participants,
      last_message: null,
      last_updated: serverTimestamp()
    });

    return conversationId;
  } catch (error) {
    console.error('Error creating conversation:', error);
    throw error;
  }
};

/**
 * Find existing conversation or create new one using deterministic ID
 * This matches the Flutter app structure from chat_repository.dart
 * Returns conversation ID
 */
export const findOrCreateConversation = async (adminId, participantId, participantType) => {
  try {
    // Create deterministic conversation ID (sorted user IDs joined with underscore)
    const participants = [adminId, participantId].sort();
    const conversationId = participants.join('_');

    // Check if conversation already exists
    const conversationRef = doc(db, 'conversations', conversationId);
    const conversationSnap = await getDoc(conversationRef);

    if (conversationSnap.exists()) {
      return conversationId;
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
