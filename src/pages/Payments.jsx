import { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import Table from '../components/shared/Table';
import SearchBar from '../components/shared/SearchBar';
import Select from '../components/shared/Select';
import Pagination from '../components/shared/Pagination';
import Loading from '../components/shared/Loading';
import StatusBadge from '../components/shared/StatusBadge';
import Modal from '../components/shared/Modal';
import { Eye, Download, DollarSign, CreditCard, TrendingUp, AlertCircle } from 'lucide-react';
import { getStripePayments, getPaymentStatistics } from '../lib/stripe';
import { formatDate, formatDateTime, filterBySearch, paginate, getTotalPages } from '../utils/helpers';
import { ITEMS_PER_PAGE } from '../constants';
import toast from 'react-hot-toast';

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);

  useEffect(() => {
    const fetchPaymentsFromStripe = async () => {
      try {
        setLoading(true);

        const [paymentsData, stats] = await Promise.all([
          getStripePayments(100),
          getPaymentStatistics()
        ]);

        setPayments(paymentsData);
        setStatistics(stats);
      } catch (error) {
        console.error('Error fetching Stripe payments:', error);
        toast.error('Failed to load payments from Stripe');
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentsFromStripe();
  }, []);

  useEffect(() => {
    let filtered = payments;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(payment => payment.status === statusFilter);
    }

    filtered = filterBySearch(filtered, searchTerm, ['id', 'customerEmail', 'customerName', 'description']);

    setFilteredPayments(filtered);
    setCurrentPage(1);
  }, [payments, searchTerm, statusFilter]);

  const paginatedPayments = paginate(filteredPayments, currentPage, ITEMS_PER_PAGE);
  const totalPages = getTotalPages(filteredPayments.length, ITEMS_PER_PAGE);

  const handleView = (payment) => {
    setSelectedPayment(payment);
    setShowViewModal(true);
  };

  const handleDownloadInvoice = (payment) => {
    if (payment.receiptUrl) {
      window.open(payment.receiptUrl, '_blank');
      toast.success('Opening receipt in new tab');
      return;
    }

    const invoiceContent = `
PAYMENT RECEIPT
=====================================

Transaction ID: ${payment.id}
Date: ${formatDateTime(payment.created)}
Status: ${payment.status.toUpperCase()}

CUSTOMER INFORMATION
-------------------------------------
Name: ${payment.customerName || 'N/A'}
Email: ${payment.customerEmail || 'N/A'}

PAYMENT DETAILS
-------------------------------------
Description: ${payment.description || 'N/A'}
Amount: ${payment.currency} ${payment.amount.toLocaleString()}
Payment Method: ${payment.paymentMethod}

=====================================
Generated from Stitchanda Admin Panel
    `.trim();

    const blob = new Blob([invoiceContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `invoice-${payment.id.substring(0, 15)}-${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    toast.success('Invoice downloaded successfully');
  };

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'succeeded', label: 'Succeeded' },
    { value: 'failed', label: 'Failed' },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'succeeded':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const columns = [
    {
      header: 'Transaction ID',
      render: (row) => (
        <div className="font-mono text-xs">
          {row.id.substring(0, 20)}...
        </div>
      ),
    },
    {
      header: 'Customer',
      render: (row) => (
        <div>
          <div className="font-medium">{row.customerName || '-'}</div>
          <div className="text-xs text-gray-500">{row.customerEmail || '-'}</div>
        </div>
      ),
    },
    {
      header: 'Description',
      render: (row) => row.description || '-',
    },
    {
      header: 'Amount',
      render: (row) => (
        <span className="font-semibold text-green-600">
          {row.currency} {row.amount.toLocaleString()}
        </span>
      ),
    },
    {
      header: 'Payment Method',
      render: (row) => (
        <span className="capitalize">{row.paymentMethod}</span>
      ),
    },
    {
      header: 'Status',
      render: (row) => (
        <StatusBadge
          status={row.status}
          label={row.status}
          colorClass={getStatusColor(row.status)}
        />
      ),
    },
    {
      header: 'Date',
      render: (row) => formatDate(row.created),
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
              handleDownloadInvoice(row);
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
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-100">Total Revenue (All Time)</p>
                <p className="text-3xl font-bold mt-2">
                  PKR {statistics?.totalRevenue?.toLocaleString() || '0'}
                </p>
                <p className="text-xs text-green-100 mt-1">From Stripe Payments</p>
              </div>
              <div className="p-3 bg-white/20 rounded-lg">
                <DollarSign className="w-8 h-8" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Successful Payments</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {statistics?.successfulPayments || 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">Completed transactions</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <CreditCard className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Failed Payments</p>
                <p className="text-2xl font-bold text-red-600 mt-1">
                  {statistics?.failedPayments || 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">Unsuccessful attempts</p>
              </div>
              <div className="p-3 bg-red-50 rounded-lg">
                <AlertCircle className="w-6 h-6 text-red-600" />
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
          title="Payment Details from Stripe"
        >
          {selectedPayment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Charge ID
                  </label>
                  <p className="text-gray-900 font-mono text-xs break-all">
                    {selectedPayment.id}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <StatusBadge
                    status={selectedPayment.status}
                    label={selectedPayment.status}
                    colorClass={getStatusColor(selectedPayment.status)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <p className="text-gray-900">
                  {selectedPayment.description || '-'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Customer Name
                  </label>
                  <p className="text-gray-900">{selectedPayment.customerName || '-'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Customer Email
                  </label>
                  <p className="text-gray-900">{selectedPayment.customerEmail || '-'}</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Amount
                    </label>
                    <p className="text-2xl font-bold text-green-600">
                      {selectedPayment.currency} {selectedPayment.amount.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Payment Method
                    </label>
                    <p className="text-gray-900 capitalize">
                      {selectedPayment.paymentMethod}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Created At
                  </label>
                  <p className="text-gray-900 text-sm">
                    {formatDateTime(selectedPayment.created)}
                  </p>
                </div>
              </div>

              {selectedPayment.receiptUrl && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-800 mb-2">
                    <strong>Receipt:</strong>
                  </p>
                  <a
                    href={selectedPayment.receiptUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 underline text-sm"
                  >
                    View Receipt
                  </a>
                </div>
              )}

              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-green-800">
                  <strong>✓ This payment was processed through Stripe</strong>
                </p>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </Layout>
  );
};

export default Payments;
