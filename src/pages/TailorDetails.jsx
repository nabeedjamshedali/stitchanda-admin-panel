import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Button from '../components/shared/Button';
import Loading from '../components/shared/Loading';
import StatusBadge from '../components/shared/StatusBadge';
import Modal from '../components/shared/Modal';
import Input from '../components/shared/Input';
import Table from '../components/shared/Table';
import StatusUpdateModal from '../components/shared/StatusUpdateModal';
import { Card, CardHeader, CardTitle, CardContent, InfoRow } from '../components/shared/Card';
import {
  ArrowLeft,
  User,
  Scissors,
  DollarSign,
  Star,
  Calendar,
  Edit,
  Trash2,
  AlertCircle
} from 'lucide-react';
import {
  getTailorById,
  updateTailor,
  deleteTailor,
  approveTailor,
  rejectTailor,
  suspendTailor,
  activateTailor,
} from '../lib/firebase';
import { useAsyncOperation } from '../hooks/useFirestore';
import { formatDate } from '../utils/helpers';
import { USER_STATUS_LABELS, USER_STATUS_COLORS, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '../constants';

const TailorDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tailor, setTailor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  const { execute, loading: actionLoading } = useAsyncOperation();

  useEffect(() => {
    const fetchTailorData = async () => {
      try {
        setLoading(true);
        setError(null);
        const tailorData = await getTailorById(id);
        if (!tailorData) {
          setError('Tailor not found');
          return;
        }
        setTailor(tailorData);
        setFormData({
          name: tailorData.name || '',
          email: tailorData.email || '',
          phone: tailorData.phone || '',
        });
      } catch (err) {
        console.error('Error fetching tailor:', err);
        setError('Failed to load tailor details');
      } finally {
        setLoading(false);
      }
    };

    fetchTailorData();
  }, [id]);

  const handleEdit = () => setShowEditModal(true);

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    await execute(
      () => updateTailor(tailor.id, formData),
      'Tailor updated successfully'
    );
    setShowEditModal(false);
    const updated = await getTailorById(id);
    setTailor(updated);
  };

  const handleDelete = async () => {
    await execute(
      () => deleteTailor(tailor.id),
      'Tailor deleted successfully'
    );
    setShowDeleteDialog(false);
    navigate('/tailors');
  };

  const handleStatusUpdate = async (formData) => {
    const statusMap = {
      'approved': approveTailor,
      'rejected': rejectTailor,
      'suspended': suspendTailor,
      'active': activateTailor,
    };

    const updateFunction = statusMap[formData.status];
    if (updateFunction) {
      await execute(
        () => updateFunction(tailor.id),
        `Tailor status updated to ${formData.status}`
      );
      setShowStatusModal(false);
      const updated = await getTailorById(id);
      setTailor(updated);
    }
  };

  const getStatusOptions = () => {
    const allOptions = [
      { value: 'approved', label: 'Approved' },
      { value: 'rejected', label: 'Rejected' },
      { value: 'suspended', label: 'Suspended' },
      { value: 'active', label: 'Active' },
    ];

    // Filter out current status
    return allOptions.filter(opt => opt.value !== tailor.status);
  };

  if (loading) {
    return (
      <Layout title="Tailor Details">
        <Loading />
      </Layout>
    );
  }

  if (error || !tailor) {
    return (
      <Layout title="Tailor Details">
        <div className="text-center py-12">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">{error || 'Tailor not found'}</h3>
          <Button onClick={() => navigate('/tailors')} icon={ArrowLeft}>
            Back to Tailors
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
      header: 'Customer',
      render: (row) => row.customerName || 'N/A',
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
    <Layout title="Tailor Details">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              icon={ArrowLeft}
              onClick={() => navigate('/tailors')}
            >
              Back
            </Button>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{tailor.name}</h2>
              <p className="text-gray-600 mt-1">
                Joined {formatDate(tailor.created_at)}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button
              className="bg-[#6B4423] hover:bg-[#8D6A4F] text-white"
              onClick={() => setShowStatusModal(true)}
            >
              Update Status
            </Button>
            <Button variant="ghost" icon={Edit} onClick={handleEdit}>
              Edit
            </Button>
            <Button variant="ghost" icon={Trash2} onClick={() => setShowDeleteDialog(true)} className="text-red-600">
              Delete
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Orders</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{tailor.totalOrders || 0}</p>
                </div>
                <Scissors className="w-12 h-12 text-blue-500 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Earnings</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    PKR {(tailor.totalEarnings || 0).toLocaleString()}
                  </p>
                </div>
                <DollarSign className="w-12 h-12 text-green-500 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Rating</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{(tailor.rating || 0).toFixed(1)} ⭐</p>
                </div>
                <Star className="w-12 h-12 text-yellow-500 opacity-20" />
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <InfoRow label="Full Name" value={tailor.name} />
              <div>
                <div className="text-sm font-medium text-gray-500 mb-1">Status</div>
                <StatusBadge
                  status={tailor.status}
                  label={USER_STATUS_LABELS[tailor.status]}
                  colorClass={USER_STATUS_COLORS[tailor.status]}
                />
              </div>
              <InfoRow label="Tailor ID" value={tailor.tailor_id || tailor.id} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t pt-6">
              <InfoRow label="Email" value={tailor.email} />
              <InfoRow label="Phone" value={tailor.phone} />
            </div>

            {tailor.address && (
              <div className="border-t pt-6">
                <InfoRow label="Address" value={tailor.address} />
              </div>
            )}

            {tailor.specialization && tailor.specialization.length > 0 && (
              <div className="border-t pt-6">
                <div className="text-sm font-medium text-gray-500 mb-2">Specialization</div>
                <div className="flex flex-wrap gap-2">
                  {tailor.specialization.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Order History */}
        <Card>
          <CardHeader>
            <CardTitle icon={Scissors}>Order History ({tailor.orders?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            {tailor.orders && tailor.orders.length > 0 ? (
              <Table
                columns={orderColumns}
                data={tailor.orders}
                onRowClick={(order) => navigate(`/orders/${order.id}`)}
              />
            ) : (
              <div className="text-center py-8 text-gray-500">No orders yet</div>
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
              <InfoRow label="Joined Date" value={formatDate(tailor.created_at)} />
              <InfoRow label="Last Updated" value={formatDate(tailor.updated_at)} />
            </div>
          </CardContent>
        </Card>

        {/* Edit Modal */}
        <Modal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          title="Edit Tailor"
        >
          <form onSubmit={handleSubmitEdit} className="space-y-4">
            <Input
              label="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
            <Input
              label="Phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
            />
            <div className="flex justify-end space-x-3 pt-4">
              <Button type="button" variant="secondary" onClick={() => setShowEditModal(false)}>
                Cancel
              </Button>
              <Button type="submit" loading={actionLoading}>
                Update Tailor
              </Button>
            </div>
          </form>
        </Modal>

        {/* Status Update Modal */}
        <StatusUpdateModal
          isOpen={showStatusModal}
          onClose={() => setShowStatusModal(false)}
          onSubmit={handleStatusUpdate}
          title="Update Tailor Status"
          statusOptions={getStatusOptions()}
          currentStatus={tailor.status}
          loading={actionLoading}
        />

        {/* Delete Confirmation */}
        <Modal
          isOpen={showDeleteDialog}
          onClose={() => setShowDeleteDialog(false)}
          title="Delete Tailor"
          size="sm"
        >
          <div className="space-y-4">
            <p className="text-gray-600">
              Are you sure you want to delete <strong>{tailor.name}</strong>? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3 pt-4">
              <Button variant="secondary" onClick={() => setShowDeleteDialog(false)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleDelete} loading={actionLoading}>
                Delete Tailor
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </Layout>
  );
};

export default TailorDetails;
