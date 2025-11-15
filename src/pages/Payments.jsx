import { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import Table from '../components/shared/Table';
import SearchBar from '../components/shared/SearchBar';
import Select from '../components/shared/Select';
import Pagination from '../components/shared/Pagination';
import Loading from '../components/shared/Loading';
import StatusBadge from '../components/shared/StatusBadge';
import Modal from '../components/shared/Modal';
import { Eye, Download, DollarSign, CreditCard } from 'lucide-react';
import { getPayments, listenToPayments } from '../lib/firebase';
import { formatDate, formatDateTime, formatCurrency, filterBySearch, paginate, getTotalPages } from '../utils/helpers';
import { ITEMS_PER_PAGE, PAYMENT_STATUS_COLORS, PAYMENT_STATUS_LABELS } from '../constants';

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);

  // Real-time listener for payments
  useEffect(() => {
    const unsubscribe = listenToPayments((data) => {
      setPayments(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Filter payments
  useEffect(() => {
    let filtered = payments;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(payment => payment.status === statusFilter);
    }

    filtered = filterBySearch(filtered, searchTerm, ['id', 'orderId', 'stripeTransactionId', 'customerName', 'tailorName']);

    setFilteredPayments(filtered);
    setCurrentPage(1);
  }, [payments, searchTerm, statusFilter]);

  const paginatedPayments = paginate(filteredPayments, currentPage, ITEMS_PER_PAGE);
  const totalPages = getTotalPages(filteredPayments.length, ITEMS_PER_PAGE);

  // Calculate statistics
  const totalRevenue = payments
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const pendingAmount = payments
    .filter(p => p.status === 'pending')
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const handleView = (payment) => {
    setSelectedPayment(payment);
    setShowViewModal(true);
  };

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'completed', label: 'Completed' },
    { value: 'refunded', label: 'Refunded' },
  ];

  const columns = [
    {
      header: 'Transaction ID',
      render: (row) => (
        <div className="font-mono text-xs">
          #{row.stripeTransactionId ? row.stripeTransactionId.substring(0, 12) : row.id.substring(0, 8)}...
        </div>
      ),
    },
    {
      header: 'Order ID',
      render: (row) => (
        <div className="font-mono text-xs">
          #{row.orderId ? row.orderId.substring(0, 8) : 'N/A'}
        </div>
      ),
    },
    {
      header: 'Customer',
      render: (row) => row.customerName || 'N/A',
    },
    {
      header: 'Tailor',
      render: (row) => row.tailorName || 'N/A',
    },
    {
      header: 'Amount',
      render: (row) => (
        <span className="font-semibold text-green-600">
          {formatCurrency(row.amount || 0)}
        </span>
      ),
    },
    {
      header: 'Platform Fee',
      render: (row) => formatCurrency(row.platformFee || 0),
    },
    {
      header: 'Tailor Earnings',
      render: (row) => (
        <span className="text-blue-600">
          {formatCurrency(row.tailorEarnings || 0)}
        </span>
      ),
    },
    {
      header: 'Status',
      render: (row) => (
        <StatusBadge
          status={row.status || 'pending'}
          label={PAYMENT_STATUS_LABELS[row.status || 'pending']}
          colorClass={PAYMENT_STATUS_COLORS[row.status || 'pending']}
        />
      ),
    },
    {
      header: 'Date',
      render: (row) => formatDate(row.createdAt),
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleView(row);
            }}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              // Handle download invoice
            }}
            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
            title="Download Invoice"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <Layout title="Payments & Transactions">
        <Loading />
      </Layout>
    );
  }

  return (
    <Layout title="Payments & Transactions">
      <div className="space-y-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {formatCurrency(totalRevenue)}
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Amount</p>
                <p className="text-2xl font-bold text-orange-600 mt-1">
                  {formatCurrency(pendingAmount)}
                </p>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg">
                <CreditCard className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Transactions</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">
                  {payments.length}
                </p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <CreditCard className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Payment Transactions</h2>
            <p className="text-gray-600 mt-1">
              All Stripe payment transactions ({payments.length} total)
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search by transaction ID, order ID, customer, or tailor..."
          />
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={statusOptions}
          />
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <Table columns={columns} data={paginatedPayments} emptyMessage="No transactions found" />
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </div>

        {/* View Payment Modal */}
        <Modal
          isOpen={showViewModal}
          onClose={() => setShowViewModal(false)}
          title="Payment Details"
        >
          {selectedPayment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Transaction ID
                  </label>
                  <p className="text-gray-900 font-mono text-sm">
                    {selectedPayment.stripeTransactionId || selectedPayment.id}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <StatusBadge
                    status={selectedPayment.status || 'pending'}
                    label={PAYMENT_STATUS_LABELS[selectedPayment.status || 'pending']}
                    colorClass={PAYMENT_STATUS_COLORS[selectedPayment.status || 'pending']}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Order ID
                </label>
                <p className="text-gray-900 font-mono text-sm">
                  #{selectedPayment.orderId}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Customer
                  </label>
                  <p className="text-gray-900">{selectedPayment.customerName || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tailor
                  </label>
                  <p className="text-gray-900">{selectedPayment.tailorName || 'N/A'}</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Total Amount
                    </label>
                    <p className="text-xl font-bold text-green-600">
                      {formatCurrency(selectedPayment.amount || 0)}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Platform Fee
                    </label>
                    <p className="text-xl font-semibold text-gray-900">
                      {formatCurrency(selectedPayment.platformFee || 0)}
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tailor Earnings
                  </label>
                  <p className="text-xl font-bold text-blue-600">
                    {formatCurrency(selectedPayment.tailorEarnings || 0)}
                  </p>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Created At
                    </label>
                    <p className="text-gray-900 text-sm">
                      {formatDateTime(selectedPayment.createdAt)}
                    </p>
                  </div>
                  {selectedPayment.completedAt && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Completed At
                      </label>
                      <p className="text-gray-900 text-sm">
                        {formatDateTime(selectedPayment.completedAt)}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {selectedPayment.stripeTransactionId && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Stripe Transaction:</strong>
                  </p>
                  <p className="text-xs text-blue-600 font-mono mt-1">
                    {selectedPayment.stripeTransactionId}
                  </p>
                </div>
              )}
            </div>
          )}
        </Modal>
      </div>
    </Layout>
  );
};

export default Payments;
