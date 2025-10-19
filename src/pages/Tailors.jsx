import React, { useState, useEffect } from 'react';
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
  getTailors,
  addTailor,
  updateTailor,
  deleteTailor,
  approveTailor,
  rejectTailor,
  suspendTailor,
  activateTailor,
  listenToTailors,
} from '../services/firebase';
import { useAsyncOperation } from '../hooks/useFirestore';
import { formatDate, filterBySearch, paginate, getTotalPages } from '../utils/helpers';
import { ITEMS_PER_PAGE, USER_STATUSES, USER_STATUS_LABELS, USER_STATUS_COLORS } from '../utils/constants';
import toast from 'react-hot-toast';

const Tailors = () => {
  const [tailors, setTailors] = useState([]);
  const [filteredTailors, setFilteredTailors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const [selectedTailor, setSelectedTailor] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    skills: '',
    specialization: '',
  });

  const { execute, loading: actionLoading } = useAsyncOperation();

  // Real-time listener for tailors
  useEffect(() => {
    const unsubscribe = listenToTailors((data) => {
      setTailors(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Filter tailors when search term or status filter changes
  useEffect(() => {
    let filtered = tailors;

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(tailor => tailor.status === statusFilter);
    }

    // Filter by search term
    filtered = filterBySearch(filtered, searchTerm, ['name', 'email', 'phone']);

    setFilteredTailors(filtered);
    setCurrentPage(1);
  }, [tailors, searchTerm, statusFilter]);

  // Paginated data
  const paginatedTailors = paginate(filteredTailors, currentPage, ITEMS_PER_PAGE);
  const totalPages = getTotalPages(filteredTailors.length, ITEMS_PER_PAGE);

  // Count pending tailors
  const pendingCount = tailors.filter(t => t.status === 'pending').length;

  const handleAdd = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      skills: '',
      specialization: '',
    });
    setShowAddModal(true);
  };

  const handleEdit = (tailor) => {
    setSelectedTailor(tailor);
    setFormData({
      name: tailor.name || '',
      email: tailor.email || '',
      phone: tailor.phone || '',
      address: tailor.address || '',
      skills: Array.isArray(tailor.skills) ? tailor.skills.join(', ') : '',
      specialization: Array.isArray(tailor.specialization)
        ? tailor.specialization.join(', ')
        : '',
    });
    setShowEditModal(true);
  };

  const handleView = (tailor) => {
    setSelectedTailor(tailor);
    setShowViewModal(true);
  };

  const handleDeleteClick = (tailor) => {
    setSelectedTailor(tailor);
    setShowDeleteDialog(true);
  };

  const handleApprove = async (tailor) => {
    await execute(
      () => approveTailor(tailor.id),
      `${tailor.name} has been approved`
    );
  };

  const handleReject = async (tailor) => {
    await execute(
      () => rejectTailor(tailor.id),
      `${tailor.name} has been rejected`
    );
  };

  const handleSuspend = async (tailor) => {
    await execute(
      () => suspendTailor(tailor.id),
      `${tailor.name} has been suspended`
    );
  };

  const handleActivate = async (tailor) => {
    await execute(
      () => activateTailor(tailor.id),
      `${tailor.name} has been activated`
    );
  };

  const handleSubmitAdd = async (e) => {
    e.preventDefault();
    const data = {
      ...formData,
      skills: formData.skills.split(',').map(s => s.trim()),
      specialization: formData.specialization.split(',').map(s => s.trim()),
    };
    await execute(() => addTailor(data), 'Tailor added successfully');
    setShowAddModal(false);
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    const data = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      skills: formData.skills.split(',').map(s => s.trim()),
      specialization: formData.specialization.split(',').map(s => s.trim()),
    };
    await execute(
      () => updateTailor(selectedTailor.id, data),
      'Tailor updated successfully'
    );
    setShowEditModal(false);
  };

  const handleDelete = async () => {
    await execute(
      () => deleteTailor(selectedTailor.id),
      'Tailor deleted successfully'
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
      header: 'Orders',
      render: (row) => row.totalOrders || 0,
    },
    {
      header: 'Earnings',
      render: (row) => `PKR ${(row.totalEarnings || 0).toLocaleString()}`,
    },
    {
      header: 'Rating',
      render: (row) => (row.rating || 0).toFixed(1) + ' ⭐',
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
      <Layout title="Tailors">
        <Loading />
      </Layout>
    );
  }

  return (
    <Layout title="Tailors">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Tailors</h2>
            <p className="text-gray-600 mt-1">
              Manage all tailors ({tailors.length} total, {pendingCount} pending approval)
            </p>
          </div>
          <Button icon={Plus} onClick={handleAdd}>
            Add Tailor
          </Button>
        </div>

        {/* Pending Approvals Alert */}
        {pendingCount > 0 && (
          <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-orange-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-orange-700">
                  You have <strong>{pendingCount}</strong> tailor(s) waiting for approval.
                  Click on the approve/reject buttons to process them.
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
            placeholder="Search tailors by name, email, or phone..."
          />
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={statusOptions}
          />
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <Table columns={columns} data={paginatedTailors} />
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </div>

        {/* Add/Edit Modal */}
        <Modal
          isOpen={showAddModal || showEditModal}
          onClose={() => {
            setShowAddModal(false);
            setShowEditModal(false);
          }}
          title={showAddModal ? 'Add New Tailor' : 'Edit Tailor'}
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
            <Input
              label="Address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              required
            />
            <Input
              label="Skills (comma-separated)"
              value={formData.skills}
              onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
              placeholder="e.g. Stitching, Embroidery, Alterations"
            />
            <Input
              label="Specialization (comma-separated)"
              value={formData.specialization}
              onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
              placeholder="e.g. Men's Suits, Women's Dresses"
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
                {showAddModal ? 'Add Tailor' : 'Update Tailor'}
              </Button>
            </div>
          </form>
        </Modal>

        {/* View Modal */}
        <Modal
          isOpen={showViewModal}
          onClose={() => setShowViewModal(false)}
          title="Tailor Details"
        >
          {selectedTailor && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <p className="text-gray-900">{selectedTailor.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <StatusBadge
                  status={selectedTailor.status}
                  label={USER_STATUS_LABELS[selectedTailor.status]}
                  colorClass={USER_STATUS_COLORS[selectedTailor.status]}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <p className="text-gray-900">{selectedTailor.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <p className="text-gray-900">{selectedTailor.phone}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <p className="text-gray-900">{selectedTailor.address}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Skills
                </label>
                <p className="text-gray-900">
                  {Array.isArray(selectedTailor.skills)
                    ? selectedTailor.skills.join(', ')
                    : 'N/A'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Specialization
                </label>
                <p className="text-gray-900">
                  {Array.isArray(selectedTailor.specialization)
                    ? selectedTailor.specialization.join(', ')
                    : 'N/A'}
                </p>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Orders
                  </label>
                  <p className="text-gray-900">{selectedTailor.totalOrders || 0}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Earnings
                  </label>
                  <p className="text-gray-900">
                    PKR {(selectedTailor.totalEarnings || 0).toLocaleString()}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rating
                  </label>
                  <p className="text-gray-900">{(selectedTailor.rating || 0).toFixed(1)} ⭐</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Joined Date
                </label>
                <p className="text-gray-900">{formatDate(selectedTailor.createdAt)}</p>
              </div>
              {selectedTailor.approvedAt && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Approved Date
                  </label>
                  <p className="text-gray-900">{formatDate(selectedTailor.approvedAt)}</p>
                </div>
              )}
            </div>
          )}
        </Modal>

        {/* Delete Confirmation */}
        <ConfirmDialog
          isOpen={showDeleteDialog}
          onClose={() => setShowDeleteDialog(false)}
          onConfirm={handleDelete}
          title="Delete Tailor"
          message={`Are you sure you want to delete ${selectedTailor?.name}? This action cannot be undone.`}
          confirmText="Delete"
          loading={actionLoading}
        />
      </div>
    </Layout>
  );
};

export default Tailors;
