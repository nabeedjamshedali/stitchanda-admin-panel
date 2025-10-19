// Order Status Constants
export const ORDER_STATUSES = {
  PENDING: 'pending',
  ASSIGNED: 'assigned',
  PICKUP_SCHEDULED: 'pickup_scheduled',
  IN_TRANSIT_TO_TAILOR: 'in_transit_to_tailor',
  WITH_TAILOR: 'with_tailor',
  READY_FOR_DELIVERY: 'ready_for_delivery',
  IN_TRANSIT_TO_CUSTOMER: 'in_transit_to_customer',
  DELIVERED: 'delivered',
  PAYMENT_COMPLETED: 'payment_completed',
  CANCELLED: 'cancelled'
};

export const ORDER_STATUS_LABELS = {
  [ORDER_STATUSES.PENDING]: 'Pending',
  [ORDER_STATUSES.ASSIGNED]: 'Assigned',
  [ORDER_STATUSES.PICKUP_SCHEDULED]: 'Pickup Scheduled',
  [ORDER_STATUSES.IN_TRANSIT_TO_TAILOR]: 'In Transit to Tailor',
  [ORDER_STATUSES.WITH_TAILOR]: 'With Tailor',
  [ORDER_STATUSES.READY_FOR_DELIVERY]: 'Ready for Delivery',
  [ORDER_STATUSES.IN_TRANSIT_TO_CUSTOMER]: 'In Transit to Customer',
  [ORDER_STATUSES.DELIVERED]: 'Delivered',
  [ORDER_STATUSES.PAYMENT_COMPLETED]: 'Payment Completed',
  [ORDER_STATUSES.CANCELLED]: 'Cancelled'
};

export const ORDER_STATUS_COLORS = {
  [ORDER_STATUSES.PENDING]: 'bg-yellow-100 text-yellow-800',
  [ORDER_STATUSES.ASSIGNED]: 'bg-blue-100 text-blue-800',
  [ORDER_STATUSES.PICKUP_SCHEDULED]: 'bg-indigo-100 text-indigo-800',
  [ORDER_STATUSES.IN_TRANSIT_TO_TAILOR]: 'bg-purple-100 text-purple-800',
  [ORDER_STATUSES.WITH_TAILOR]: 'bg-orange-100 text-orange-800',
  [ORDER_STATUSES.READY_FOR_DELIVERY]: 'bg-teal-100 text-teal-800',
  [ORDER_STATUSES.IN_TRANSIT_TO_CUSTOMER]: 'bg-cyan-100 text-cyan-800',
  [ORDER_STATUSES.DELIVERED]: 'bg-green-100 text-green-800',
  [ORDER_STATUSES.PAYMENT_COMPLETED]: 'bg-emerald-100 text-emerald-800',
  [ORDER_STATUSES.CANCELLED]: 'bg-red-100 text-red-800'
};

// User Status Constants
export const USER_STATUSES = {
  PENDING: 'pending',
  APPROVED: 'approved',
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
  REJECTED: 'rejected'
};

export const USER_STATUS_LABELS = {
  [USER_STATUSES.PENDING]: 'Pending',
  [USER_STATUSES.APPROVED]: 'Approved',
  [USER_STATUSES.ACTIVE]: 'Active',
  [USER_STATUSES.SUSPENDED]: 'Suspended',
  [USER_STATUSES.REJECTED]: 'Rejected'
};

export const USER_STATUS_COLORS = {
  [USER_STATUSES.PENDING]: 'bg-yellow-100 text-yellow-800',
  [USER_STATUSES.APPROVED]: 'bg-blue-100 text-blue-800',
  [USER_STATUSES.ACTIVE]: 'bg-green-100 text-green-800',
  [USER_STATUSES.SUSPENDED]: 'bg-orange-100 text-orange-800',
  [USER_STATUSES.REJECTED]: 'bg-red-100 text-red-800'
};

// Payment Status Constants
export const PAYMENT_STATUSES = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  REFUNDED: 'refunded'
};

export const PAYMENT_STATUS_LABELS = {
  [PAYMENT_STATUSES.PENDING]: 'Pending',
  [PAYMENT_STATUSES.COMPLETED]: 'Completed',
  [PAYMENT_STATUSES.REFUNDED]: 'Refunded'
};

export const PAYMENT_STATUS_COLORS = {
  [PAYMENT_STATUSES.PENDING]: 'bg-yellow-100 text-yellow-800',
  [PAYMENT_STATUSES.COMPLETED]: 'bg-green-100 text-green-800',
  [PAYMENT_STATUSES.REFUNDED]: 'bg-red-100 text-red-800'
};

// Pagination
export const ITEMS_PER_PAGE = 10;

// Date Formats
export const DATE_FORMAT = 'MMM dd, yyyy';
export const DATETIME_FORMAT = 'MMM dd, yyyy HH:mm';
