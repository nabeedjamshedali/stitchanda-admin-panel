import { format } from 'date-fns';
import { DATE_FORMAT, DATETIME_FORMAT } from '../constants';

// Format date
export const formatDate = (date, formatStr = DATE_FORMAT) => {
  if (!date) return 'N/A';

  // Handle Firestore Timestamp
  if (date.toDate) {
    return format(date.toDate(), formatStr);
  }

  // Handle regular Date object or string
  try {
    return format(new Date(date), formatStr);
  } catch (error) {
    return 'Invalid Date';
  }
};

// Format datetime
export const formatDateTime = (date) => {
  return formatDate(date, DATETIME_FORMAT);
};

// Format currency
export const formatCurrency = (amount, currency = 'PKR') => {
  if (amount === null || amount === undefined) return 'N/A';

  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Format phone number
export const formatPhone = (phone) => {
  if (!phone) return 'N/A';
  return phone;
};

// Truncate text
export const truncate = (text, length = 50) => {
  if (!text) return '';
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
};

// Get initials from name
export const getInitials = (name) => {
  if (!name) return '?';

  const parts = name.split(' ');
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }

  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

// Calculate percentage
export const calculatePercentage = (value, total) => {
  if (!total || total === 0) return 0;
  return Math.round((value / total) * 100);
};

// Get status badge color class
export const getStatusColor = (status, colorMap) => {
  return colorMap[status] || 'bg-gray-100 text-gray-800';
};

// Convert Firestore timestamp to JS Date
export const firestoreToDate = (timestamp) => {
  if (!timestamp) return null;
  if (timestamp.toDate) {
    return timestamp.toDate();
  }
  return new Date(timestamp);
};

// Sort array by field
export const sortBy = (array, field, direction = 'asc') => {
  return [...array].sort((a, b) => {
    const aVal = a[field];
    const bVal = b[field];

    if (direction === 'asc') {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });
};

// Filter array by search term
export const filterBySearch = (array, searchTerm, fields) => {
  if (!searchTerm) return array;

  const term = searchTerm.toLowerCase();

  return array.filter(item => {
    return fields.some(field => {
      const value = item[field];
      if (!value) return false;
      return value.toString().toLowerCase().includes(term);
    });
  });
};

// Paginate array
export const paginate = (array, page, itemsPerPage) => {
  const start = (page - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return array.slice(start, end);
};

// Calculate total pages
export const getTotalPages = (totalItems, itemsPerPage) => {
  return Math.ceil(totalItems / itemsPerPage);
};

// Validate email
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate phone number (Pakistan format)
export const isValidPhone = (phone) => {
  const phoneRegex = /^(\+92|0)?[0-9]{10}$/;
  return phoneRegex.test(phone.replace(/[\s-]/g, ''));
};

// Generate random ID
export const generateId = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// Deep clone object
export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

// Debounce function
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Get status description and color for orders
export const getOrderStatusInfo = (status) => {
  const ORDER_STATUSES = {
    '-2': { description: 'Cancelled', color: 'bg-red-100 text-red-800' },
    '-1': { description: 'Just Created', color: 'bg-gray-100 text-gray-800' },
    '0': { description: 'Unassigned', color: 'bg-yellow-100 text-yellow-800' },
    '1': { description: 'Assigned to Rider', color: 'bg-blue-100 text-blue-800' },
    '2': { description: 'Picked Up', color: 'bg-indigo-100 text-indigo-800' },
    '3': { description: 'Delivered to Tailor', color: 'bg-purple-100 text-purple-800' },
    '4': { description: 'Received by Tailor', color: 'bg-orange-100 text-orange-800' },
    '5': { description: 'Completed by Tailor', color: 'bg-teal-100 text-teal-800' },
    '6': { description: 'Calling Rider', color: 'bg-yellow-100 text-yellow-800' },
    '7': { description: 'Return Rider Assigned', color: 'bg-blue-100 text-blue-800' },
    '8': { description: 'Picked Up from Tailor', color: 'bg-cyan-100 text-cyan-800' },
    '9': { description: 'Delivered to Customer', color: 'bg-green-100 text-green-800' },
    '10': { description: 'Customer Confirmed', color: 'bg-emerald-100 text-emerald-800' },
    '11': { description: 'Self Delivery', color: 'bg-lime-100 text-lime-800' },
  };

  return ORDER_STATUSES[status.toString()] || { description: 'Unknown', color: 'bg-gray-100 text-gray-800' };
};

// Get status description and color for users (tailors/riders)
export const getUserStatusInfo = (status) => {
  const USER_STATUSES = {
    'pending': { description: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
    'approved': { description: 'Approved', color: 'bg-blue-100 text-blue-800' },
    'active': { description: 'Active', color: 'bg-green-100 text-green-800' },
    'suspended': { description: 'Suspended', color: 'bg-orange-100 text-orange-800' },
    'rejected': { description: 'Rejected', color: 'bg-red-100 text-red-800' },
  };

  return USER_STATUSES[status] || { description: status, color: 'bg-gray-100 text-gray-800' };
};

// Get payment status description and color
export const getPaymentStatusInfo = (status) => {
  const PAYMENT_STATUSES = {
    'pending': { description: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
    'completed': { description: 'Completed', color: 'bg-green-100 text-green-800' },
    'paid': { description: 'Paid', color: 'bg-green-100 text-green-800' },
    'refunded': { description: 'Refunded', color: 'bg-red-100 text-red-800' },
  };

  return PAYMENT_STATUSES[status?.toLowerCase()] || { description: status || 'Unknown', color: 'bg-gray-100 text-gray-800' };
};
