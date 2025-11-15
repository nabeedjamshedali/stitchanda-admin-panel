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
  Bike,
  Star,
  Calendar,
  Edit,
  Trash2,
  AlertCircle,
  CheckCircle,
  XCircle,
  Ban,
  PlayCircle,
  Package
} from 'lucide-react';
import {
  getRiderById,
  updateRider,
  deleteRider,
  approveRider,
  rejectRider,
  suspendRider,
  activateRider,
} from '../lib/firebase';
import { useAsyncOperation } from '../hooks/useFirestore';
import { formatDate } from '../utils/helpers';
import { USER_STATUS_LABELS, USER_STATUS_COLORS, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '../constants';

const RiderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [rider, setRider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  const { execute, loading: actionLoading } = useAsyncOperation();

  useEffect(() => {
    const fetchRiderData = async () => {
      try {
        setLoading(true);
        setError(null);
        const riderData = await getRiderById(id);
        if (!riderData) {
          setError('Rider not found');
          return;
        }
        setRider(riderData);
        setFormData({
          name: riderData.name || '',
          email: riderData.email || '',
          phone: riderData.phone || '',
        });
      } catch (err) {
        console.error('Error fetching rider:', err);
        setError('Failed to load rider details');
      } finally {
        setLoading(false);
      }
    };

    fetchRiderData();
  }, [id]);

  const handleEdit = () => setShowEditModal(true);

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    await execute(
      () => updateRider(rider.id, formData),
      'Rider updated successfully'
    );
    setShowEditModal(false);
    const updated = await getRiderById(id);
    setRider(updated);
  };

  const handleDelete = async () => {
    await execute(
      () => deleteRider(rider.id),
      'Rider deleted successfully'
    );
    setShowDeleteDialog(false);
    navigate('/riders');
  };

  const handleApprove = async () => {
    await execute(
      () => approveRider(rider.id),
      `${rider.name} has been approved`
    );
    const updated = await getRiderById(id);
    setRider(updated);
  };

  const handleReject = async () => {
    await execute(
      () => rejectRider(rider.id),
      `${rider.name} has been rejected`
    );
    const updated = await getRiderById(id);
    setRider(updated);
  };

  const handleSuspend = async () => {
    await execute(
      () => suspendRider(rider.id),
      `${rider.name} has been suspended`
    );
    const updated = await getRiderById(id);
    setRider(updated);
  };

  const handleActivate = async () => {
    await execute(
      () => activateRider(rider.id),
      `${rider.name} has been activated`
    );
    const updated = await getRiderById(id);
    setRider(updated);
  };

  if (loading) {
    return (
      <Layout title="Rider Details">
        <Loading />
      </Layout>
    );
  }

  if (error || !rider) {
    return (
      <Layout title="Rider Details">
        <div className="text-center py-12">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">{error || 'Rider not found'}</h3>
          <Button onClick={() => navigate('/riders')} icon={ArrowLeft}>
            Back to Riders
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
    <Layout title="Rider Details">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              icon={ArrowLeft}
              onClick={() => navigate('/riders')}
            >
              Back
            </Button>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{rider.name}</h2>
              <p className="text-gray-600 mt-1">
                <span className={rider.currentlyAvailable ? 'text-green-600' : 'text-gray-400'}>
                  {rider.currentlyAvailable ? '● Online' : '○ Offline'}
                </span>
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            {rider.status === 'pending' && (
              <>
                <Button variant="ghost" icon={CheckCircle} onClick={handleApprove} className="text-green-600">
                  Approve
                </Button>
                <Button variant="ghost" icon={XCircle} onClick={handleReject} className="text-red-600">
                  Reject
                </Button>
              </>
            )}
            {(rider.status === 'approved' || rider.status === 'active') && (
              <Button variant="ghost" icon={Ban} onClick={handleSuspend} className="text-orange-600">
                Suspend
              </Button>
            )}
            {rider.status === 'suspended' && (
              <Button variant="ghost" icon={PlayCircle} onClick={handleActivate} className="text-green-600">
                Activate
              </Button>
            )}
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
                  <p className="text-sm font-medium text-gray-500">Total Deliveries</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{rider.totalDeliveries || 0}</p>
                </div>
                <Package className="w-12 h-12 text-blue-500 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Completed</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{rider.completedDeliveries || 0}</p>
                </div>
                <CheckCircle className="w-12 h-12 text-green-500 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Rating</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{(rider.rating || 0).toFixed(1)} ⭐</p>
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
              <InfoRow label="Full Name" value={rider.name} />
              <div>
                <div className="text-sm font-medium text-gray-500 mb-1">Status</div>
                <StatusBadge
                  status={rider.status}
                  label={USER_STATUS_LABELS[rider.status]}
                  colorClass={USER_STATUS_COLORS[rider.status]}
                />
              </div>
              <InfoRow label="Driver ID" value={rider.driver_id || rider.id} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t pt-6">
              <InfoRow label="Email" value={rider.email} />
              <InfoRow label="Phone" value={rider.phone} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t pt-6">
              <InfoRow label="Vehicle Number" value={rider.vehicleNumber || 'N/A'} />
              <InfoRow
                label="Verification Status"
                value={rider.verification_status === 1 ? 'Verified' : 'Not Verified'}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t pt-6">
              <InfoRow
                label="Assignment Status"
                value={rider.is_assigned === 1 ? 'Assigned' : 'Not Assigned'}
              />
              <InfoRow
                label="Currently Available"
                value={rider.currentlyAvailable ? 'Yes' : 'No'}
              />
            </div>
          </CardContent>
        </Card>

        {/* Delivery History */}
        <Card>
          <CardHeader>
            <CardTitle icon={Bike}>Delivery History ({rider.orders?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            {rider.orders && rider.orders.length > 0 ? (
              <Table
                columns={orderColumns}
                data={rider.orders}
                onRowClick={(order) => navigate(`/orders/${order.id}`)}
              />
            ) : (
              <div className="text-center py-8 text-gray-500">No deliveries yet</div>
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
              <InfoRow label="Joined Date" value={formatDate(rider.created_at)} />
              <InfoRow label="Last Updated" value={formatDate(rider.updated_at)} />
            </div>
          </CardContent>
        </Card>

        {/* Edit Modal */}
        <Modal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          title="Edit Rider"
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
                Update Rider
              </Button>
            </div>
          </form>
        </Modal>

        {/* Delete Confirmation */}
        <Modal
          isOpen={showDeleteDialog}
          onClose={() => setShowDeleteDialog(false)}
          title="Delete Rider"
          size="sm"
        >
          <div className="space-y-4">
            <p className="text-gray-600">
              Are you sure you want to delete <strong>{rider.name}</strong>? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3 pt-4">
              <Button variant="secondary" onClick={() => setShowDeleteDialog(false)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleDelete} loading={actionLoading}>
                Delete Rider
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </Layout>
  );
};

export default RiderDetails;
