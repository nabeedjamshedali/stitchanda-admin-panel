export const ORDER_STATUSES = {
  REJECTED_BY_TAILOR: -3,     // Rejected by tailor
  JUST_CREATED: -2,           // Just created order
  ACCEPTED_BY_TAILOR: -1,     // Accepted by tailor
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
  [-3]: 'Rejected by Tailor',
  [-2]: 'Just Created',
  [-1]: 'Accepted by Tailor',
  [0]: 'Unassigned',
  [1]: 'Assigned to Rider',
  [2]: 'Picked Up from Customer',
  [3]: 'Assigned to Tailor',
  [4]: 'Received by Tailor',
  [5]: 'Completed by Tailor',
  [6]: 'Calling Rider',
  [7]: 'Assigned to Rider (by Tailor)',
  [8]: 'Picked Up from Tailor',
  [9]: 'Completed to Customer',
  [10]: 'Completed',
  [11]: 'Self Delivery'
};

export const ORDER_STATUS_COLORS = {
  [-3]: 'bg-red-100 text-red-800',
  [-2]: 'bg-gray-100 text-gray-800',
  [-1]: 'bg-green-100 text-green-800',
  [0]: 'bg-yellow-100 text-yellow-800',
  [1]: 'bg-blue-100 text-blue-800',
  [2]: 'bg-indigo-100 text-indigo-800',
  [3]: 'bg-purple-100 text-purple-800',
  [4]: 'bg-orange-100 text-orange-800',
  [5]: 'bg-teal-100 text-teal-800',
  [6]: 'bg-yellow-100 text-yellow-800',
  [7]: 'bg-blue-100 text-blue-800',
  [8]: 'bg-cyan-100 text-cyan-800',
  [9]: 'bg-green-100 text-green-800',
  [10]: 'bg-emerald-100 text-emerald-800',
  [11]: 'bg-lime-100 text-lime-800'
};

export const USER_STATUSES = {
  PENDING: 0,      // Waiting for admin approval
  APPROVED: 1,     // Admin approved
  REJECTED: 2      // Admin rejected
};

export const USER_STATUS_LABELS = {
  [0]: 'Pending',
  [1]: 'Approved',
  [2]: 'Rejected'
};

export const USER_STATUS_COLORS = {
  [0]: 'bg-yellow-100 text-yellow-800',
  [1]: 'bg-green-100 text-green-800',
  [2]: 'bg-red-100 text-red-800'
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
