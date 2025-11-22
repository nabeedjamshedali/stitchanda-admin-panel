import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Button from '../components/shared/Button';
import Loading from '../components/shared/Loading';
import StatusBadge from '../components/shared/StatusBadge';
import Modal from '../components/shared/Modal';
import Input from '../components/shared/Input';
import Table from '../components/shared/Table';
import { Card, CardHeader, CardTitle, CardContent, InfoRow } from '../components/shared/Card';
import {
  ArrowLeft,
  User,
  MapPin,
  ShoppingBag,
  Calendar,
  Edit,
  Trash2,
  AlertCircle,
  DollarSign
} from 'lucide-react';
import {
  getCustomerById,
  updateCustomer,
  deleteCustomer,
} from '../lib/firebase';
import { useAsyncOperation } from '../hooks/useFirestore';
import { formatDate } from '../utils/helpers';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '../constants';

const CustomerDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [viewingImage, setViewingImage] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });

  const { execute, loading: actionLoading } = useAsyncOperation();

  useEffect(() => {
    const fetchCustomerData = async () => {
      try {
        setLoading(true);
        setError(null);
        const customerData = await getCustomerById(id);
        if (!customerData) {
          setError('Customer not found');
          return;
        }
        setCustomer(customerData);
        setFormData({
          name: customerData.name || '',
          email: customerData.email || '',
          phone: customerData.phone || '',
          address: customerData.address?.fullAddress || customerData.address || '',
        });
      } catch (err) {
        console.error('Error fetching customer:', err);
        setError('Failed to load customer details');
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerData();
  }, [id]);

  const handleEdit = () => {
    setShowEditModal(true);
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();

    const updates = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
    };

    if (formData.address) {
      if (customer.address && typeof customer.address === 'object') {
        updates.address = {
          ...customer.address,
          fullAddress: formData.address
        };
      } else {
        updates.address = formData.address;
      }
    }

    await execute(
      () => updateCustomer(customer.id, updates),
      'Customer updated successfully'
    );
    setShowEditModal(false);

    const updated = await getCustomerById(id);
    setCustomer(updated);
  };

  const handleDelete = async () => {
    await execute(
      () => deleteCustomer(customer.id),
      'Customer deleted successfully'
    );
    setShowDeleteDialog(false);
    navigate('/customers');
  };

  if (loading) {
    return (
      <Layout title="Customer Details">
        <Loading />
      </Layout>
    );
  }

  if (error || !customer) {
    return (
      <Layout title="Customer Details">
        <div className="text-center py-12">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">{error || 'Customer not found'}</h3>
          <Button onClick={() => navigate('/customers')} icon={ArrowLeft}>
            Back to Customers
          </Button>
        </div>
      </Layout>
    );
  }

  const orderColumns = [
    {
      header: 'Order ID',
      render: (row) => `#${row.id.substring(0, 8)}`,
    },
    {
      header: 'Items',
      render: (row) => row.items?.length || 0,
    },
    {
      header: 'Amount',
      render: (row) => `PKR ${(row.total_price || 0).toLocaleString()}`,
    },
    {
      header: 'Status',
      render: (row) => (
        <StatusBadge
          status={row.status}
          label={ORDER_STATUS_LABELS[row.status]}
          colorClass={ORDER_STATUS_COLORS[row.status]}
        />
      ),
    },
    {
      header: 'Date',
      render: (row) => formatDate(row.created_at),
    },
  ];

  return (
    <Layout title="Customer Details">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              icon={ArrowLeft}
              onClick={() => navigate('/customers')}
            >
              Back
            </Button>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {customer.name}
              </h2>
              <p className="text-gray-600 mt-1">
                Customer since {formatDate(customer.createdAt)}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant="ghost"
              icon={Edit}
              onClick={handleEdit}
            >
              Edit Customer
            </Button>
            <Button
              variant="ghost"
              icon={Trash2}
              onClick={() => setShowDeleteDialog(true)}
              className="text-red-600 hover:text-red-700"
            >
              Delete
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Orders</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {customer.totalOrders || 0}
                  </p>
                </div>
                <ShoppingBag className="w-12 h-12 text-blue-500 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Spent</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    PKR {(customer.totalSpent || 0).toLocaleString()}
                  </p>
                </div>
                <DollarSign className="w-12 h-12 text-green-500 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle icon={User}>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Profile Image */}
            {customer.profileImagePath && (
              <div>
                <div className="text-sm font-medium text-gray-500 mb-2">Profile Picture</div>
                <img
                  src={customer.profileImagePath}
                  alt={customer.name}
                  className="w-24 h-24 rounded-full object-cover border-2 border-gray-200 cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => setViewingImage(customer.profileImagePath)}
                />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <InfoRow label="Full Name" value={customer.name} />
              <InfoRow label="Gender" value={customer.gender || 'N/A'} />
              <InfoRow label="Customer ID" value={customer.customerId || customer.id} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t pt-6">
              <InfoRow label="Email" value={customer.email} />
              <InfoRow label="Phone" value={customer.phone} />
            </div>
          </CardContent>
        </Card>

        {/* Address Information */}
        <Card>
          <CardHeader>
            <CardTitle icon={MapPin}>Address</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <InfoRow
              label="Full Address"
              value={customer.address?.fullAddress || customer.address || 'N/A'}
            />
          </CardContent>
        </Card>

        {/* Order History */}
        <Card>
          <CardHeader>
            <CardTitle icon={ShoppingBag}>Order History ({customer.orders?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            {customer.orders && customer.orders.length > 0 ? (
              <Table
                columns={orderColumns}
                data={customer.orders}
                onRowClick={(order) => navigate(`/orders/${order.id}`)}
              />
            ) : (
              <div className="text-center py-8 text-gray-500">
                No orders yet
              </div>
            )}
          </CardContent>
        </Card>

        {/* Timestamps */}
        <Card>
          <CardHeader>
            <CardTitle icon={Calendar}>Account Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InfoRow label="Joined Date" value={formatDate(customer.createdAt)} />
              <InfoRow label="Last Updated" value={formatDate(customer.updatedAt)} />
            </div>
          </CardContent>
        </Card>

        {/* Edit Modal */}
        <Modal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          title="Edit Customer"
        >
          <form onSubmit={handleSubmitEdit} className="space-y-4">
            <p className="text-sm text-gray-500 mb-4">
              Update customer information. All fields are optional.
            </p>
            <Input
              label="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Customer name"
            />
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="customer@email.com"
            />
            <Input
              label="Phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="03XX XXXXXXX"
            />
            <Input
              label="Address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Full address"
            />
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-xs text-amber-800">
                <strong>Note:</strong> Gender, profile picture, and customer ID cannot be edited by admin.
              </p>
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowEditModal(false)}
              >
                Cancel
              </Button>
              <Button type="submit" loading={actionLoading}>
                Update Customer
              </Button>
            </div>
          </form>
        </Modal>

        {/* Delete Confirmation */}
        <Modal
          isOpen={showDeleteDialog}
          onClose={() => setShowDeleteDialog(false)}
          title="Delete Customer"
          size="sm"
        >
          <div className="space-y-4">
            <p className="text-gray-600">
              Are you sure you want to delete <strong>{customer.name}</strong>? This action cannot be undone.
            </p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-xs text-red-800">
                <strong>Warning:</strong> All customer data will be permanently deleted.
              </p>
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <Button variant="secondary" onClick={() => setShowDeleteDialog(false)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleDelete} loading={actionLoading}>
                Delete Customer
              </Button>
            </div>
          </div>
        </Modal>

        {/* Image Viewer Modal */}
        {viewingImage && (
          <Modal
            isOpen={!!viewingImage}
            onClose={() => setViewingImage(null)}
            title="Image Preview"
            size="lg"
          >
            <div className="flex items-center justify-center">
              <img
                src={viewingImage}
                alt="Full size preview"
                className="max-w-full max-h-[80vh] object-contain rounded-lg"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/800x600?text=Image+Not+Available';
                }}
              />
            </div>
          </Modal>
        )}
      </div>
    </Layout>
  );
};

export default CustomerDetails;
