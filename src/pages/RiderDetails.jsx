import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Button from '../components/shared/Button';
import Loading from '../components/shared/Loading';
import StatusBadge from '../components/shared/StatusBadge';
import Modal from '../components/shared/Modal';
import Table from '../components/shared/Table';
import StatusUpdateModal from '../components/shared/StatusUpdateModal';
import { Card, CardHeader, CardTitle, CardContent, InfoRow } from '../components/shared/Card';
import {
  ArrowLeft,
  User,
  Bike,
  Calendar,
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
  deleteRider,
  approveRider,
  rejectRider,
  pendingRider,
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

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [viewingImage, setViewingImage] = useState(null);

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
      } catch (err) {
        console.error('Error fetching rider:', err);
        setError('Failed to load rider details');
      } finally {
        setLoading(false);
      }
    };

    fetchRiderData();
  }, [id]);

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

  const handleStatusUpdate = async (formData) => {
    const statusMap = {
      0: pendingRider,  
      1: approveRider,  
      2: rejectRider,   
    };

    const updateFunction = statusMap[formData.status];
    if (updateFunction) {
      await execute(
        () => updateFunction(rider.id),
        `Rider status updated successfully`
      );
      setShowStatusModal(false);
      const updated = await getRiderById(id);
      setRider(updated);
    }
  };

  const getStatusOptions = () => {
    const allOptions = [
      { value: 0, label: 'Pending' },
      { value: 1, label: 'Approved' },
      { value: 2, label: 'Rejected' },
    ];

    return allOptions.filter(opt => opt.value !== rider.status);
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
            <Button variant="ghost" icon={Trash2} onClick={() => setShowDeleteDialog(true)} className="text-red-600">
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
        </div>

        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle icon={User}>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Profile Picture and CNIC Section */}
            <div className="space-y-6 pb-6 border-b">
              {/* Profile Picture */}
              <div>
                <div className="text-sm font-medium text-gray-500 mb-2">Profile Picture</div>
                {rider.profile_image_path ? (
                  <div
                    className="relative w-48 h-48 rounded-lg overflow-hidden border-2 border-gray-200 shadow-md cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => setViewingImage(rider.profile_image_path)}
                  >
                    <img
                      src={rider.profile_image_path}
                      alt={`${rider.name}'s profile`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/200x200?text=No+Image';
                      }}
                    />
                  </div>
                ) : (
                  <div className="w-48 h-48 rounded-lg bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300">
                    <div className="text-center">
                      <User className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">No Image</p>
                    </div>
                  </div>
                )}
              </div>

              {/* CNIC Image */}
              <div>
                <div className="text-sm font-medium text-gray-500 mb-2">CNIC Image</div>
                {rider.cnic_image_path ? (
                  <div
                    className="relative w-64 h-48 rounded-lg overflow-hidden border-2 border-gray-200 shadow-md cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => setViewingImage(rider.cnic_image_path)}
                  >
                    <img
                      src={rider.cnic_image_path}
                      alt="CNIC"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/300x200?text=No+CNIC+Image';
                      }}
                    />
                  </div>
                ) : (
                  <div className="w-64 h-48 rounded-lg bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300">
                    <div className="text-center">
                      <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">No CNIC Image</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

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

        {/* Status Update Modal */}
        <StatusUpdateModal
          isOpen={showStatusModal}
          onClose={() => setShowStatusModal(false)}
          onSubmit={handleStatusUpdate}
          title="Update Rider Status"
          statusOptions={getStatusOptions()}
          currentStatus={rider.status}
          loading={actionLoading}
        />

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

export default RiderDetails;
