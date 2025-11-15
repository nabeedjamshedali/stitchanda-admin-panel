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
import { Plus, Edit, Eye, XCircle, ArrowRight } from 'lucide-react';
import {
  getOrders,
  addOrder,
  updateOrderStatus,
  assignTailor,
  assignRider,
  cancelOrder,
  listenToOrders,
  getApprovedTailors,
  getActiveRiders,
  getCustomers,
} from '../lib/firebase';
import { useAsyncOperation } from '../hooks/useFirestore';
import { formatDate, formatDateTime, filterBySearch, paginate, getTotalPages } from '../utils/helpers';
import {
  ITEMS_PER_PAGE,
  ORDER_STATUSES,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_COLORS,
} from '../constants';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showAssignTailorModal, setShowAssignTailorModal] = useState(false);
  const [showAssignRiderModal, setShowAssignRiderModal] = useState(false);
  const [showUpdateStatusModal, setShowUpdateStatusModal] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [tailors, setTailors] = useState([]);
  const [riders, setRiders] = useState([]);
  const [customers, setCustomers] = useState([]);

  const [formData, setFormData] = useState({
    customerId: '',
    items: '',
    totalAmount: '',
  });

  const [assignData, setAssignData] = useState({
    tailorId: '',
    riderId: '',
    newStatus: '',
    cancelReason: '',
  });

  const { execute, loading: actionLoading } = useAsyncOperation();

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tailorsData, ridersData, customersData] = await Promise.all([
          getApprovedTailors(),
          getActiveRiders(),
          getCustomers(),
        ]);
        setTailors(tailorsData);
        setRiders(ridersData);
        setCustomers(customersData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  // Real-time listener for orders
  useEffect(() => {
    const unsubscribe = listenToOrders((data) => {
      setOrders(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Filter orders
  useEffect(() => {
    let filtered = orders;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    filtered = filterBySearch(filtered, searchTerm, ['id', 'customerName', 'tailorName']);

    setFilteredOrders(filtered);
    setCurrentPage(1);
  }, [orders, searchTerm, statusFilter]);

  const paginatedOrders = paginate(filteredOrders, currentPage, ITEMS_PER_PAGE);
  const totalPages = getTotalPages(filteredOrders.length, ITEMS_PER_PAGE);

  const handleAdd = () => {
    setFormData({ customerId: '', items: '', totalAmount: '' });
    setShowAddModal(true);
  };

  const handleView = (order) => {
    setSelectedOrder(order);
    setShowViewModal(true);
  };

  const handleAssignTailor = (order) => {
    setSelectedOrder(order);
    setAssignData({ ...assignData, tailorId: '' });
    setShowAssignTailorModal(true);
  };

  const handleAssignRider = (order) => {
    setSelectedOrder(order);
    setAssignData({ ...assignData, riderId: '' });
    setShowAssignRiderModal(true);
  };

  const handleUpdateStatus = (order) => {
    setSelectedOrder(order);
    setAssignData({ ...assignData, newStatus: order.status });
    setShowUpdateStatusModal(true);
  };

  const handleCancelClick = (order) => {
    setSelectedOrder(order);
    setAssignData({ ...assignData, cancelReason: '' });
    setShowCancelDialog(true);
  };

  const handleSubmitAdd = async (e) => {
    e.preventDefault();
    const selectedCustomer = customers.find(c => c.id === formData.customerId);
    const data = {
      customerId: formData.customerId,
      customerName: selectedCustomer?.name || 'Customer',
      items: formData.items.split(',').map(item => ({ name: item.trim() })),
      totalAmount: parseFloat(formData.totalAmount),
    };
    await execute(() => addOrder(data), 'Order created successfully');
    setShowAddModal(false);
  };

  const handleSubmitAssignTailor = async (e) => {
    e.preventDefault();
    await execute(
      () => assignTailor(selectedOrder.id, assignData.tailorId),
      'Tailor assigned successfully'
    );
    setShowAssignTailorModal(false);
  };

  const handleSubmitAssignRider = async (e) => {
    e.preventDefault();
    await execute(
      () => assignRider(selectedOrder.id, assignData.riderId),
      'Rider assigned successfully'
    );
    setShowAssignRiderModal(false);
  };

  const handleSubmitUpdateStatus = async (e) => {
    e.preventDefault();
    await execute(
      () => updateOrderStatus(selectedOrder.id, assignData.newStatus),
      'Order status updated successfully'
    );
    setShowUpdateStatusModal(false);
  };

  const handleCancelOrder = async () => {
    await execute(
      () => cancelOrder(selectedOrder.id, assignData.cancelReason),
      'Order cancelled successfully'
    );
    setShowCancelDialog(false);
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
      render: (row) => row.customerName || 'N/A',
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
      render: (row) => formatDate(row.created_at),
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
          {!row.tailor_id && row.status === 0 && (
            <Button
              size="sm"
              variant="primary"
              onClick={(e) => {
                e.stopPropagation();
                handleAssignTailor(row);
              }}
            >
              Assign Tailor
            </Button>
          )}
          {row.tailor_id && !row.rider_id && (
            <Button
              size="sm"
              variant="primary"
              onClick={(e) => {
                e.stopPropagation();
                handleAssignRider(row);
              }}
            >
              Assign Rider
            </Button>
          )}
          {row.status !== -2 && row.status !== 10 && (
            <>
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
              <Button
                size="sm"
                variant="ghost"
                icon={XCircle}
                onClick={(e) => {
                  e.stopPropagation();
                  handleCancelClick(row);
                }}
                className="text-red-600"
              >
                Cancel
              </Button>
            </>
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
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Orders</h2>
            <p className="text-gray-600 mt-1">
              Manage all orders ({orders.length} total)
            </p>
          </div>
          <Button icon={Plus} onClick={handleAdd}>
            Create Order
          </Button>
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
          <Table columns={columns} data={paginatedOrders} />
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </div>

        {/* Add Order Modal */}
        <Modal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          title="Create New Order"
        >
          <form onSubmit={handleSubmitAdd} className="space-y-4">
            <Select
              label="Customer"
              value={formData.customerId}
              onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
              options={customers.map(c => ({ value: c.id, label: c.name }))}
              placeholder="Select a customer"
              required
            />
            <Input
              label="Items (comma-separated)"
              value={formData.items}
              onChange={(e) => setFormData({ ...formData, items: e.target.value })}
              placeholder="e.g. Shirt, Pants, Jacket"
              required
            />
            <Input
              label="Total Amount"
              type="number"
              value={formData.totalAmount}
              onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value })}
              placeholder="e.g. 5000"
              required
            />
            <div className="flex justify-end space-x-3 pt-4">
              <Button type="button" variant="secondary" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button type="submit" loading={actionLoading}>
                Create Order
              </Button>
            </div>
          </form>
        </Modal>

        {/* Assign Tailor Modal */}
        <Modal
          isOpen={showAssignTailorModal}
          onClose={() => setShowAssignTailorModal(false)}
          title="Assign Tailor"
          size="sm"
        >
          <form onSubmit={handleSubmitAssignTailor} className="space-y-4">
            <Select
              label="Select Tailor"
              value={assignData.tailorId}
              onChange={(e) => setAssignData({ ...assignData, tailorId: e.target.value })}
              options={tailors.map(t => ({ value: t.id, label: `${t.name} (${t.specialization?.join(', ')})` }))}
              placeholder="Choose a tailor"
              required
            />
            <div className="flex justify-end space-x-3 pt-4">
              <Button type="button" variant="secondary" onClick={() => setShowAssignTailorModal(false)}>
                Cancel
              </Button>
              <Button type="submit" loading={actionLoading}>
                Assign Tailor
              </Button>
            </div>
          </form>
        </Modal>

        {/* Assign Rider Modal */}
        <Modal
          isOpen={showAssignRiderModal}
          onClose={() => setShowAssignRiderModal(false)}
          title="Assign Rider"
          size="sm"
        >
          <form onSubmit={handleSubmitAssignRider} className="space-y-4">
            <Select
              label="Select Rider"
              value={assignData.riderId}
              onChange={(e) => setAssignData({ ...assignData, riderId: e.target.value })}
              options={riders.map(r => ({ value: r.id, label: `${r.name} (${r.vehicleType})` }))}
              placeholder="Choose a rider"
              required
            />
            <div className="flex justify-end space-x-3 pt-4">
              <Button type="button" variant="secondary" onClick={() => setShowAssignRiderModal(false)}>
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
          size="sm"
        >
          <form onSubmit={handleSubmitUpdateStatus} className="space-y-4">
            <Select
              label="New Status"
              value={assignData.newStatus}
              onChange={(e) => setAssignData({ ...assignData, newStatus: e.target.value })}
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

        {/* View Order Modal */}
        <Modal
          isOpen={showViewModal}
          onClose={() => setShowViewModal(false)}
          title="Order Details"
        >
          {selectedOrder && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Order ID</label>
                  <p className="text-gray-900">#{selectedOrder.id}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <StatusBadge
                    status={selectedOrder.status}
                    label={ORDER_STATUS_LABELS[selectedOrder.status]}
                    colorClass={ORDER_STATUS_COLORS[selectedOrder.status]}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
                <p className="text-gray-900">{selectedOrder.customerName || 'N/A'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Tailor</label>
                <p className="text-gray-900">{selectedOrder.tailorName || 'Not assigned yet'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Rider</label>
                <p className="text-gray-900">{selectedOrder.riderName || 'Not assigned yet'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Items</label>
                <ul className="list-disc list-inside text-gray-900">
                  {selectedOrder.items?.map((item, index) => (
                    <li key={index}>{item.name || item}</li>
                  )) || <li>No items</li>}
                </ul>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Amount</label>
                <p className="text-gray-900 text-lg font-semibold">
                  PKR {(selectedOrder.total_price || 0).toLocaleString()}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
                <StatusBadge
                  status={selectedOrder.payment_status || 'Pending'}
                  label={selectedOrder.payment_status || 'Pending'}
                  colorClass={selectedOrder.payment_status?.toLowerCase() === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                <p className="text-gray-900">{selectedOrder.payment_method || 'N/A'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Location</label>
                <p className="text-gray-900">{selectedOrder.pickup_location?.full_address || 'N/A'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dropoff Location</label>
                <p className="text-gray-900">{selectedOrder.dropoff_location?.full_address || 'N/A'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Created At</label>
                <p className="text-gray-900">{formatDateTime(selectedOrder.created_at)}</p>
              </div>
            </div>
          )}
        </Modal>

        {/* Cancel Order Dialog */}
        <Modal
          isOpen={showCancelDialog}
          onClose={() => setShowCancelDialog(false)}
          title="Cancel Order"
          size="sm"
        >
          <div className="space-y-4">
            <p className="text-gray-600">
              Are you sure you want to cancel this order? This action cannot be undone.
            </p>
            <Input
              label="Reason for cancellation (optional)"
              value={assignData.cancelReason}
              onChange={(e) => setAssignData({ ...assignData, cancelReason: e.target.value })}
              placeholder="Enter reason..."
            />
            <div className="flex justify-end space-x-3 pt-4">
              <Button variant="secondary" onClick={() => setShowCancelDialog(false)}>
                No, Keep Order
              </Button>
              <Button variant="danger" onClick={handleCancelOrder} loading={actionLoading}>
                Yes, Cancel Order
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </Layout>
  );
};

export default Orders;
