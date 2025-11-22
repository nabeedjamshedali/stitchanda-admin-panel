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
  deleteTailor,
  approveTailor,
  rejectTailor,
  listenToTailors,
} from '../lib/firebase';
import { useAsyncOperation } from '../hooks/useFirestore';
import { formatDate, filterBySearch, paginate, getTotalPages } from '../utils/helpers';
import { DEFAULT_PAGE_SIZE, USER_STATUSES, USER_STATUS_LABELS, USER_STATUS_COLORS } from '../constants';
import toast from 'react-hot-toast';

const Tailors = () => {
  const navigate = useNavigate();
  const [tailors, setTailors] = useState([]);
  const [filteredTailors, setFilteredTailors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedTailor, setSelectedTailor] = useState(null);

  const { execute, loading: actionLoading } = useAsyncOperation();

  useEffect(() => {
    const unsubscribe = listenToTailors((data) => {
      setTailors(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let filtered = tailors;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(tailor => tailor.status === Number(statusFilter));
    }

    filtered = filterBySearch(filtered, searchTerm, ['name', 'email', 'phone']);

    setFilteredTailors(filtered);
    setCurrentPage(1);
  }, [tailors, searchTerm, statusFilter]);

  const paginatedTailors = paginate(filteredTailors, currentPage, pageSize);
  const totalPages = getTotalPages(filteredTailors.length, pageSize);

  const handlePageSizeChange = (newPageSize) => {
    setPageSize(newPageSize);
    setCurrentPage(1); 
  };

  const pendingCount = tailors.filter(t => t.status === 0).length;

  const handleView = (tailor) => {
    navigate(`/tailors/${tailor.id}`);
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

  const handleDelete = async () => {
    await execute(
      () => deleteTailor(selectedTailor.id),
      'Tailor deleted successfully'
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
        <div className="bg-white rounded-lg shadow-md p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
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
          <Table
            columns={columns}
            data={paginatedTailors}
            onRowClick={(tailor) => navigate(`/tailors/${tailor.id}`)}
          />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            pageSize={pageSize}
            onPageSizeChange={handlePageSizeChange}
            totalItems={filteredTailors.length}
          />
        </div>

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
