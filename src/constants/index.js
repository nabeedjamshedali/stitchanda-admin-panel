export const ORDER_STATUSES = {
  REJECTED: -3,               // Rejected
  CANCELLED: -2,              // Cancelled
  JUST_CREATED: -1,           // Just created order
  UNASSIGNED: 0,              // Unassigned (customer side)
  ASSIGNED_RIDER: 1,          // Assigned (rider)
  PICKED_UP_CUSTOMER: 2,      // Picked up (customer side)
  COMPLETED_RIDER: 3,         // Completed by rider
  RECEIVED_TAILOR: 4,         // Received (tailor)
  COMPLETED_TAILOR: 5,        // Completed (tailor)
  CALL_RIDER_TAILOR: 6,       // Call a rider (by tailor)
  ASSIGNED_RIDER_TAILOR: 7,   // Assigned to rider (by tailor)
  PICKED_UP_TAILOR: 8,        // Picked up (from tailor)
  COMPLETED_TO_CUSTOMER: 9,   // Completed (to customer)
  CUSTOMER_CONFIRMATION: 10,  // Customer confirmation → received
  SELF_DELIVERY: 11           // Self delivery
};

export const ORDER_STATUS_LABELS = {
  [ORDER_STATUSES.REJECTED]: 'Rejected',
  [ORDER_STATUSES.CANCELLED]: 'Cancelled',
  [ORDER_STATUSES.JUST_CREATED]: 'Just Created',
  [ORDER_STATUSES.UNASSIGNED]: 'Unassigned',
  [ORDER_STATUSES.ASSIGNED_RIDER]: 'Assigned to Rider',
  [ORDER_STATUSES.PICKED_UP_CUSTOMER]: 'Picked Up',
  [ORDER_STATUSES.COMPLETED_RIDER]: 'Delivered to Tailor',
  [ORDER_STATUSES.RECEIVED_TAILOR]: 'Received by Tailor',
  [ORDER_STATUSES.COMPLETED_TAILOR]: 'Completed by Tailor',
  [ORDER_STATUSES.CALL_RIDER_TAILOR]: 'Calling Rider',
  [ORDER_STATUSES.ASSIGNED_RIDER_TAILOR]: 'Return Rider Assigned',
  [ORDER_STATUSES.PICKED_UP_TAILOR]: 'Picked Up from Tailor',
  [ORDER_STATUSES.COMPLETED_TO_CUSTOMER]: 'Delivered to Customer',
  [ORDER_STATUSES.CUSTOMER_CONFIRMATION]: 'Customer Confirmed',
  [ORDER_STATUSES.SELF_DELIVERY]: 'Self Delivery'
};

export const ORDER_STATUS_COLORS = {
  [ORDER_STATUSES.REJECTED]: 'bg-red-100 text-red-800',
  [ORDER_STATUSES.CANCELLED]: 'bg-red-100 text-red-800',
  [ORDER_STATUSES.JUST_CREATED]: 'bg-gray-100 text-gray-800',
  [ORDER_STATUSES.UNASSIGNED]: 'bg-yellow-100 text-yellow-800',
  [ORDER_STATUSES.ASSIGNED_RIDER]: 'bg-blue-100 text-blue-800',
  [ORDER_STATUSES.PICKED_UP_CUSTOMER]: 'bg-indigo-100 text-indigo-800',
  [ORDER_STATUSES.COMPLETED_RIDER]: 'bg-purple-100 text-purple-800',
  [ORDER_STATUSES.RECEIVED_TAILOR]: 'bg-orange-100 text-orange-800',
  [ORDER_STATUSES.COMPLETED_TAILOR]: 'bg-teal-100 text-teal-800',
  [ORDER_STATUSES.CALL_RIDER_TAILOR]: 'bg-yellow-100 text-yellow-800',
  [ORDER_STATUSES.ASSIGNED_RIDER_TAILOR]: 'bg-blue-100 text-blue-800',
  [ORDER_STATUSES.PICKED_UP_TAILOR]: 'bg-cyan-100 text-cyan-800',
  [ORDER_STATUSES.COMPLETED_TO_CUSTOMER]: 'bg-green-100 text-green-800',
  [ORDER_STATUSES.CUSTOMER_CONFIRMATION]: 'bg-emerald-100 text-emerald-800',
  [ORDER_STATUSES.SELF_DELIVERY]: 'bg-lime-100 text-lime-800'
};

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

export const ITEMS_PER_PAGE = 10;
export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

export const DATE_FORMAT = 'MMM dd, yyyy';
export const DATETIME_FORMAT = 'MMM dd, yyyy HH:mm';
