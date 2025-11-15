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
