import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Table from '../components/shared/Table';
import Button from '../components/shared/Button';
import SearchBar from '../components/shared/SearchBar';
import Select from '../components/shared/Select';
import Pagination from '../components/shared/Pagination';
import Loading from '../components/shared/Loading';
import Modal from '../components/shared/Modal';
import Input from '../components/shared/Input';
import ConfirmDialog from '../components/shared/ConfirmDialog';
import StatusBadge from '../components/shared/StatusBadge';
import { Plus, Edit, Trash2, Eye, CheckCircle, XCircle, Ban, PlayCircle } from 'lucide-react';
import {
  getRiders,
  addRider,
  updateRider,
  deleteRider,
  approveRider,
  rejectRider,
  suspendRider,
  activateRider,
  listenToRiders,
} from '../lib/firebase';
import { useAsyncOperation } from '../hooks/useFirestore';
import { filterBySearch, paginate, getTotalPages } from '../utils/helpers';
import { DEFAULT_PAGE_SIZE, USER_STATUSES, USER_STATUS_LABELS, USER_STATUS_COLORS } from '../constants';

const Riders = () => {
  const navigate = useNavigate();
  const [riders, setRiders] = useState([]);
  const [filteredRiders, setFilteredRiders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const [selectedRider, setSelectedRider] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  const { execute, loading: actionLoading } = useAsyncOperation();

  useEffect(() => {
    const unsubscribe = listenToRiders((data) => {
      setRiders(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let filtered = riders;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(rider => rider.status === statusFilter);
    }

    filtered = filterBySearch(filtered, searchTerm, ['name', 'email', 'phone', 'vehicleNumber']);

    setFilteredRiders(filtered);
    setCurrentPage(1);
  }, [riders, searchTerm, statusFilter]);

  const paginatedRiders = paginate(filteredRiders, currentPage, pageSize);
  const totalPages = getTotalPages(filteredRiders.length, pageSize);

  const handlePageSizeChange = (newPageSize) => {
    setPageSize(newPageSize);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  const pendingCount = riders.filter(r => r.status === 'pending').length;

  const handleAdd = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
    });
    setShowAddModal(true);
  };

  const handleEdit = (rider) => {
    setSelectedRider(rider);
    setFormData({
      name: rider.name || '',
      email: rider.email || '',
      phone: rider.phone || '',
    });
    setShowEditModal(true);
  };

  const handleView = (rider) => {
    navigate(`/riders/${rider.id}`);
  };

  const handleDeleteClick = (rider) => {
    setSelectedRider(rider);
    setShowDeleteDialog(true);
  };

  const handleApprove = async (rider) => {
    await execute(
      () => approveRider(rider.id),
      `${rider.name} has been approved`
    );
  };

  const handleReject = async (rider) => {
    await execute(
      () => rejectRider(rider.id),
      `${rider.name} has been rejected`
    );
  };

  const handleSuspend = async (rider) => {
    await execute(
      () => suspendRider(rider.id),
      `${rider.name} has been suspended`
    );
  };

  const handleActivate = async (rider) => {
    await execute(
      () => activateRider(rider.id),
      `${rider.name} has been activated`
    );
  };

  const handleSubmitAdd = async (e) => {
    e.preventDefault();
    await execute(() => addRider(formData), 'Rider added successfully');
    setShowAddModal(false);
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    await execute(
      () => updateRider(selectedRider.id, formData),
      'Rider updated successfully'
    );
    setShowEditModal(false);
  };

  const handleDelete = async () => {
    await execute(
      () => deleteRider(selectedRider.id),
      'Rider deleted successfully'
    );
    setShowDeleteDialog(false);
  };

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: USER_STATUSES.PENDING, label: 'Pending' },
    { value: USER_STATUSES.APPROVED, label: 'Approved' },
    { value: USER_STATUSES.ACTIVE, label: 'Active' },
    { value: USER_STATUSES.SUSPENDED, label: 'Suspended' },
    { value: USER_STATUSES.REJECTED, label: 'Rejected' },
  ];

  const columns = [
    {
      header: 'Name',
      accessor: 'name',
    },
    {
      header: 'Email',
      accessor: 'email',
    },
    {
      header: 'Phone',
      accessor: 'phone',
    },
    {
      header: 'CNIC',
      render: (row) => row.cnic_image_path ? 'Uploaded' : 'Not uploaded',
    },
    {
      header: 'Status',
      render: (row) => (
        <StatusBadge
          status={row.status}
          label={USER_STATUS_LABELS[row.status]}
          colorClass={USER_STATUS_COLORS[row.status]}
        />
      ),
    },
    {
      header: 'Deliveries',
      render: (row) => row.totalDeliveries || 0,
    },
    {
      header: 'Rating',
      render: (row) => (row.rating || 0).toFixed(1) + ' ⭐',
    },
    {
      header: 'Available',
      render: (row) => (
        <span className={row.currentlyAvailable ? 'text-green-600' : 'text-gray-400'}>
          {row.currentlyAvailable ? '● Online' : '○ Offline'}
        </span>
      ),
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex space-x-1">
          {row.status === 'pending' && (
            <>
              <Button
                size="sm"
                variant="success"
                onClick={(e) => {
                  e.stopPropagation();
                  handleApprove(row);
                }}
                title="Approve"
              >
                <CheckCircle className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="danger"
                onClick={(e) => {
                  e.stopPropagation();
                  handleReject(row);
                }}
                title="Reject"
              >
                <XCircle className="w-4 h-4" />
              </Button>
            </>
          )}
          {(row.status === 'approved' || row.status === 'active') && (
            <Button
              size="sm"
              variant="warning"
              onClick={(e) => {
                e.stopPropagation();
                handleSuspend(row);
              }}
              title="Suspend"
            >
              <Ban className="w-4 h-4" />
            </Button>
          )}
          {row.status === 'suspended' && (
            <Button
              size="sm"
              variant="success"
              onClick={(e) => {
                e.stopPropagation();
                handleActivate(row);
              }}
              title="Activate"
            >
              <PlayCircle className="w-4 h-4" />
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            icon={Eye}
            onClick={(e) => {
              e.stopPropagation();
              handleView(row);
            }}
          >
            View
          </Button>
          <Button
            size="sm"
            variant="ghost"
            icon={Edit}
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(row);
            }}
          >
            Edit
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteClick(row);
            }}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <Layout title="Riders">
        <Loading />
      </Layout>
    );
  }

  return (
    <Layout title="Riders">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Riders</h2>
            <p className="text-gray-600 mt-1">
              Manage all riders ({riders.length} total, {pendingCount} pending approval)
            </p>
          </div>
          <Button icon={Plus} onClick={handleAdd}>
            Add Rider
          </Button>
        </div>

        {/* Pending Approvals Alert */}
        {pendingCount > 0 && (
          <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-orange-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-orange-700">
                  You have <strong>{pendingCount}</strong> rider(s) waiting for approval.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search riders by name, email, phone, or vehicle..."
          />
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={statusOptions}
          />
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <Table
            columns={columns}
            data={paginatedRiders}
            onRowClick={(rider) => navigate(`/riders/${rider.id}`)}
          />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            pageSize={pageSize}
            onPageSizeChange={handlePageSizeChange}
            totalItems={filteredRiders.length}
          />
        </div>

        {/* Add/Edit Modal */}
        <Modal
          isOpen={showAddModal || showEditModal}
          onClose={() => {
            setShowAddModal(false);
            setShowEditModal(false);
          }}
          title={showAddModal ? 'Add New Rider' : 'Edit Rider'}
        >
          <form onSubmit={showAddModal ? handleSubmitAdd : handleSubmitEdit} className="space-y-4">
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
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setShowAddModal(false);
                  setShowEditModal(false);
                }}
              >
                Cancel
              </Button>
              <Button type="submit" loading={actionLoading}>
                {showAddModal ? 'Add Rider' : 'Update Rider'}
              </Button>
            </div>
          </form>
        </Modal>

        {/* Delete Confirmation */}
        <ConfirmDialog
          isOpen={showDeleteDialog}
          onClose={() => setShowDeleteDialog(false)}
          onConfirm={handleDelete}
          title="Delete Rider"
          message={`Are you sure you want to delete ${selectedRider?.name}? This action cannot be undone.`}
          confirmText="Delete"
          loading={actionLoading}
        />
      </div>
    </Layout>
  );
};

export default Riders;
