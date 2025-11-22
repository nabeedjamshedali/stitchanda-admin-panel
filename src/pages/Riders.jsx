import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Table from '../components/shared/Table';
import Button from '../components/shared/Button';
import SearchBar from '../components/shared/SearchBar';
import Select from '../components/shared/Select';
import Pagination from '../components/shared/Pagination';
import Loading from '../components/shared/Loading';
import ConfirmDialog from '../components/shared/ConfirmDialog';
import StatusBadge from '../components/shared/StatusBadge';
import { Trash2, Eye, CheckCircle, XCircle } from 'lucide-react';
import {
  deleteRider,
  approveRider,
  rejectRider,
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

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedRider, setSelectedRider] = useState(null);

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
      filtered = filtered.filter(rider => rider.status === Number(statusFilter));
    }

    filtered = filterBySearch(filtered, searchTerm, ['name', 'email', 'phone', 'vehicleNumber']);

    setFilteredRiders(filtered);
    setCurrentPage(1);
  }, [riders, searchTerm, statusFilter]);

  const paginatedRiders = paginate(filteredRiders, currentPage, pageSize);
  const totalPages = getTotalPages(filteredRiders.length, pageSize);

  const handlePageSizeChange = (newPageSize) => {
    setPageSize(newPageSize);
    setCurrentPage(1); 
  };

  const pendingCount = riders.filter(r => r.status === 0).length;

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

  const handleDelete = async () => {
    await execute(
      () => deleteRider(selectedRider.id),
      'Rider deleted successfully'
    );
    setShowDeleteDialog(false);
  };

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 0, label: 'Pending' },
    { value: 1, label: 'Approved' },
    { value: 2, label: 'Rejected' },
  ];

  const columns = [
    {
      header: 'Name',
      render: (row) => row.name || '-',
    },
    {
      header: 'Email',
      render: (row) => row.email || '-',
    },
    {
      header: 'Phone',
      render: (row) => row.phone || '-',
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
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-1">
          {row.status === 0 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleApprove(row);
                }}
                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                title="Approve"
              >
                <CheckCircle className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleReject(row);
                }}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Reject"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleView(row);
            }}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="View"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteClick(row);
            }}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
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
        <div className="bg-white rounded-lg shadow-md p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
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
