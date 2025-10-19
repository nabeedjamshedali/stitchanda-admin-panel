import React from 'react';
import { formatDateTime } from '../../utils/helpers';
import { Clock } from 'lucide-react';

const RecentActivity = ({ orders = [] }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Recent Orders
      </h3>
      <div className="space-y-4">
        {orders.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No recent orders</p>
        ) : (
          orders.slice(0, 10).map((order) => (
            <div
              key={order.id}
              className="flex items-start space-x-3 pb-3 border-b border-gray-100 last:border-0"
            >
              <div className="flex-shrink-0">
                <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">
                  Order #{order.id.substring(0, 8)}
                </p>
                <p className="text-sm text-gray-500">
                  {order.customerName || 'Customer'} - {order.status}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {formatDateTime(order.createdAt)}
                </p>
              </div>
              <div className="text-sm font-medium text-primary-600">
                PKR {order.totalAmount?.toLocaleString() || '0'}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RecentActivity;
