import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Table from '../components/shared/Table';
import Button from '../components/shared/Button';
import SearchBar from '../components/shared/SearchBar';
import Select from '../components/shared/Select';
import Pagination from '../components/shared/Pagination';
import Loading from '../components/shared/Loading';
import Modal from '../components/shared/Modal';
import StatusBadge from '../components/shared/StatusBadge';
import { Eye, ArrowRight } from 'lucide-react';
import {
  updateOrderStatus,
  listenToOrders,
} from '../lib/firebase';
import { useAsyncOperation } from '../hooks/useFirestore';
import { formatDate, filterBySearch, paginate, getTotalPages } from '../utils/helpers';
import {
  DEFAULT_PAGE_SIZE,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_COLORS,
} from '../constants';

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const [showUpdateStatusModal, setShowUpdateStatusModal] = useState(false);

  const [selectedOrder, setSelectedOrder] = useState(null);

  const [updateData, setUpdateData] = useState({
    newStatus: '',
  });

  const { execute, loading: actionLoading } = useAsyncOperation();

  useEffect(() => {
    const unsubscribe = listenToOrders((data) => {
      setOrders(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let filtered = orders;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    filtered = filterBySearch(filtered, searchTerm, ['id', 'customerName', 'tailorName']);

    setFilteredOrders(filtered);
    setCurrentPage(1);
  }, [orders, searchTerm, statusFilter]);

  const paginatedOrders = paginate(filteredOrders, currentPage, pageSize);
  const totalPages = getTotalPages(filteredOrders.length, pageSize);

  const handlePageSizeChange = (newPageSize) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
  };

  const handleView = (order) => {
    navigate(`/orders/${order.id}`);
  };

  const handleUpdateStatus = (order) => {
    setSelectedOrder(order);
    setUpdateData({ newStatus: order.status });
    setShowUpdateStatusModal(true);
  };

  const handleSubmitUpdateStatus = async (e) => {
    e.preventDefault();
    await execute(
      () => updateOrderStatus(selectedOrder.id, updateData.newStatus),
      'Order status updated successfully'
    );
    setShowUpdateStatusModal(false);
  };

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    ...Object.keys(ORDER_STATUS_LABELS).map(key => ({
      value: key,
      label: ORDER_STATUS_LABELS[key]
    }))
  ];

  const columns = [
    {
      header: 'Order ID',
      render: (row) => `#${row.id.substring(0, 8)}`,
    },
    {
      header: 'Customer',
      render: (row) => row.customerName || '-',
    },
    {
      header: 'Tailor',
      render: (row) => row.tailorName || <span className="text-gray-400">Not assigned</span>,
    },
    {
      header: 'Rider',
      render: (row) => row.riderName || <span className="text-gray-400">Not assigned</span>,
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
      render: (row) => row.created_at ? formatDate(row.created_at) : '-',
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex space-x-1">
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
          {row.status !== 10 && row.status !== 11 && (
            <Button
              size="sm"
              variant="ghost"
              icon={ArrowRight}
              onClick={(e) => {
                e.stopPropagation();
                handleUpdateStatus(row);
              }}
            >
              Update
            </Button>
          )}
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <Layout title="Orders">
        <Loading />
      </Layout>
    );
  }

  return (
    <Layout title="Orders">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Orders</h2>
          <p className="text-gray-600 mt-1">
            Manage all orders ({orders.length} total)
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search by order ID, customer, or tailor..."
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
            data={paginatedOrders}
            onRowClick={(order) => navigate(`/orders/${order.id}`)}
          />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            pageSize={pageSize}
            onPageSizeChange={handlePageSizeChange}
            totalItems={filteredOrders.length}
          />
        </div>

        {/* Update Status Modal */}
        <Modal
          isOpen={showUpdateStatusModal}
          onClose={() => setShowUpdateStatusModal(false)}
          title="Update Order Status"
          size="sm"
        >
          <form onSubmit={handleSubmitUpdateStatus} className="space-y-4">
            <Select
              label="New Status"
              value={updateData.newStatus}
              onChange={(e) => setUpdateData({ newStatus: e.target.value })}
              options={Object.keys(ORDER_STATUS_LABELS)
                .filter(key => key !== 'cancelled')
                .map(key => ({ value: key, label: ORDER_STATUS_LABELS[key] }))}
              required
            />
            <div className="flex justify-end space-x-3 pt-4">
              <Button type="button" variant="secondary" onClick={() => setShowUpdateStatusModal(false)}>
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

export default Orders;
