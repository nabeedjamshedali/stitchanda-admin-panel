import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Button from '../components/shared/Button';
import Loading from '../components/shared/Loading';
import StatusBadge from '../components/shared/StatusBadge';
import Modal from '../components/shared/Modal';
import Select from '../components/shared/Select';
import Input from '../components/shared/Input';
import { Card, CardHeader, CardTitle, CardContent, InfoRow } from '../components/shared/Card';
import {
  ArrowLeft,
  Package,
  User,
  MapPin,
  CreditCard,
  Calendar,
  Edit,
  XCircle,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import {
  getOrderById,
  updateOrderStatus,
  assignRider,
  getActiveRiders,
} from '../lib/firebase';
import { useAsyncOperation } from '../hooks/useFirestore';
import { formatDateTime } from '../utils/helpers';
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_COLORS,
} from '../constants';

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showAssignRiderModal, setShowAssignRiderModal] = useState(false);
  const [showUpdateStatusModal, setShowUpdateStatusModal] = useState(false);

  const [riders, setRiders] = useState([]);
  const [assignData, setAssignData] = useState({
    riderId: '',
    newStatus: '',
  });

  const { execute, loading: actionLoading } = useAsyncOperation();

  useEffect(() => {
    const fetchOrderData = async () => {
      try {
        setLoading(true);
        setError(null);
        const orderData = await getOrderById(id);
        if (!orderData) {
          setError('Order not found');
          return;
        }
        setOrder(orderData);

        const ridersData = await getActiveRiders();
        setRiders(ridersData);
      } catch (err) {
        console.error('Error fetching order:', err);
        setError('Failed to load order details');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderData();
  }, [id]);


  const handleAssignRider = async (e) => {
    e.preventDefault();
    await execute(
      () => assignRider(order.id, assignData.riderId),
      'Rider assigned successfully'
    );
    setShowAssignRiderModal(false);
    const updated = await getOrderById(id);
    setOrder(updated);
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    await execute(
      () => updateOrderStatus(order.id, parseInt(assignData.newStatus)),
      'Order status updated successfully'
    );
    setShowUpdateStatusModal(false);
    const updated = await getOrderById(id);
    setOrder(updated);
  };


  if (loading) {
    return (
      <Layout title="Order Details">
        <Loading />
      </Layout>
    );
  }

  if (error || !order) {
    return (
      <Layout title="Order Details">
        <div className="text-center py-12">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">{error || 'Order not found'}</h3>
          <Button onClick={() => navigate('/orders')} icon={ArrowLeft}>
            Back to Orders
          </Button>
        </div>
      </Layout>
    );
  }

  const statusOptions = Object.keys(ORDER_STATUS_LABELS)
    .filter(key => parseInt(key) > order.status) 
    .map(key => ({
      value: key,
      label: ORDER_STATUS_LABELS[key]
    }));

  const riderOptions = riders.map(r => ({ value: r.id, label: r.name }));

  const canAssignRider = order.status === 0 && !order.rider_id;
  const canUpdateStatus = order.status !== -3 && order.status !== 10 && order.status >= 0;

  return (
    <Layout title="Order Details">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              icon={ArrowLeft}
              onClick={() => navigate('/orders')}
            >
              Back
            </Button>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Order #{order.id.substring(0, 8)}
              </h2>
              <p className="text-gray-600 mt-1">
                Created {formatDateTime(order.created_at)}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            {canAssignRider && (
              <Button
                variant="primary"
                onClick={() => setShowAssignRiderModal(true)}
              >
                Assign Rider
              </Button>
            )}
            {canUpdateStatus && (
              <Button
                variant="ghost"
                icon={Edit}
                onClick={() => setShowUpdateStatusModal(true)}
              >
                Update Status
              </Button>
            )}
          </div>
        </div>

        {order.status === -2 && (
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-blue-400" />
              <div>
                <p className="text-sm text-blue-700 font-semibold">
                  Order created - Waiting for tailor to accept or reject
                </p>
                <p className="text-sm text-blue-600 mt-1">
                  The tailor will review and respond to this order soon.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Status Banner for -1: Waiting for customer choice */}
        {order.status === -1 && (
          <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <div>
                <p className="text-sm text-green-700 font-semibold">
                  Tailor accepted - Waiting for customer delivery choice
                </p>
                <p className="text-sm text-green-600 mt-1">
                  Customer will choose between self-delivery or booking a rider.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Status Banner for 0: Waiting for rider assignment */}
        {order.status === 0 && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-400" />
              <div>
                <p className="text-sm text-yellow-700 font-semibold">
                  Customer chose to book a rider - Assign a rider to proceed
                </p>
                <p className="text-sm text-yellow-600 mt-1">
                  Please assign an available rider to pick up this order from the customer.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Status Banner for -3: Rejected by tailor */}
        {order.status === -3 && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-400" />
              <div>
                <p className="text-sm text-red-700 font-semibold">
                  This order has been rejected by tailor
                </p>
                {order.rejection_reason && (
                  <p className="text-sm text-red-600 mt-1">
                    Reason: {order.rejection_reason}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Status Banner (if completed) */}
        {order.status === 10 && (
          <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <p className="text-sm text-green-700 font-semibold">
                This order has been completed
              </p>
            </div>
          </div>
        )}

        {/* Main Info Card */}
        <Card>
          <CardHeader>
            <CardTitle icon={Package}>Order Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="text-sm font-medium text-gray-500 mb-1">Status</div>
                <StatusBadge
                  status={order.status}
                  label={ORDER_STATUS_LABELS[order.status]}
                  colorClass={ORDER_STATUS_COLORS[order.status]}
                />
              </div>
              <InfoRow
                label="Order ID"
                value={`#${order.id.substring(0, 12)}`}
              />
              <InfoRow
                label="Created At"
                value={formatDateTime(order.created_at)}
              />
            </div>

            <div className="border-t pt-6">
              <h4 className="text-md font-semibold text-gray-900 mb-4">Items Ordered</h4>
              <ul className="space-y-2">
                {order.items?.map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-900">{item.name || item}</span>
                  </li>
                )) || <li className="text-gray-500">No items</li>}
              </ul>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t pt-6">
              <InfoRow
                label="Total Amount"
                value={`PKR ${(order.total_price || 0).toLocaleString()}`}
                className="text-lg font-semibold"
              />
            </div>
          </CardContent>
        </Card>

        {/* Customer & Assignment Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Customer Card */}
          <Card>
            <CardHeader>
              <CardTitle icon={User}>Customer Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <InfoRow label="Customer Name" value={order.customerName} />
              <InfoRow label="Customer ID" value={order.customer_id} />
            </CardContent>
          </Card>

          {/* Assignment Card */}
          <Card>
            <CardHeader>
              <CardTitle icon={User}>Assignments</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <InfoRow
                label="Assigned Tailor"
                value={order.tailorName || 'Not assigned yet'}
              />
              <InfoRow
                label="Assigned Rider"
                value={order.riderName || 'Not assigned yet'}
              />
            </CardContent>
          </Card>
        </div>

        {/* Location Info */}
        <Card>
          <CardHeader>
            <CardTitle icon={MapPin}>Location Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="text-sm font-medium text-gray-500 mb-1">Pickup Location</div>
                <p className="text-gray-900">
                  {order.pickup_location?.full_address || 'N/A'}
                </p>
                {order.pickup_location?.latitude && order.pickup_location?.longitude && (
                  <p className="text-xs text-gray-500 mt-1">
                    Coordinates: {order.pickup_location.latitude}, {order.pickup_location.longitude}
                  </p>
                )}
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500 mb-1">Dropoff Location</div>
                <p className="text-gray-900">
                  {order.dropoff_location?.full_address || 'N/A'}
                </p>
                {order.dropoff_location?.latitude && order.dropoff_location?.longitude && (
                  <p className="text-xs text-gray-500 mt-1">
                    Coordinates: {order.dropoff_location.latitude}, {order.dropoff_location.longitude}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Info */}
        <Card>
          <CardHeader>
            <CardTitle icon={CreditCard}>Payment Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="text-sm font-medium text-gray-500 mb-1">Payment Status</div>
                <StatusBadge
                  status={order.payment_status || 'Pending'}
                  label={order.payment_status || 'Pending'}
                  colorClass={order.payment_status?.toLowerCase() === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}
                />
              </div>
              <InfoRow
                label="Payment Method"
                value={order.payment_method}
              />
              <InfoRow
                label="Amount"
                value={`PKR ${(order.total_price || 0).toLocaleString()}`}
              />
            </div>
          </CardContent>
        </Card>

        {/* Assign Rider Modal */}
        <Modal
          isOpen={showAssignRiderModal}
          onClose={() => setShowAssignRiderModal(false)}
          title="Assign Rider"
        >
          <form onSubmit={handleAssignRider} className="space-y-4">
            <Select
              label="Select Rider"
              value={assignData.riderId}
              onChange={(e) => setAssignData({ ...assignData, riderId: e.target.value })}
              options={[
                { value: '', label: 'Choose a rider...' },
                ...riderOptions
              ]}
              required
            />
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowAssignRiderModal(false)}
              >
                Cancel
              </Button>
              <Button type="submit" loading={actionLoading}>
                Assign Rider
              </Button>
            </div>
          </form>
        </Modal>

        {/* Update Status Modal */}
        <Modal
          isOpen={showUpdateStatusModal}
          onClose={() => setShowUpdateStatusModal(false)}
          title="Update Order Status"
        >
          <form onSubmit={handleUpdateStatus} className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-blue-800">
                Current Status: <strong>{ORDER_STATUS_LABELS[order.status]}</strong>
              </p>
            </div>
            <Select
              label="New Status"
              value={assignData.newStatus}
              onChange={(e) => setAssignData({ ...assignData, newStatus: e.target.value })}
              options={[
                { value: '', label: 'Select new status...' },
                ...statusOptions
              ]}
              required
            />
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowUpdateStatusModal(false)}
              >
                Cancel
              </Button>
              <Button type="submit" loading={actionLoading}>
                Update Status
              </Button>
            </div>
          </form>
        </Modal>

      </div>
    </Layout>
  );
};

export default OrderDetails;
