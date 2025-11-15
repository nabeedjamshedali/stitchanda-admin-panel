import { useState, useEffect } from 'react';
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
import { Edit, Trash2, Eye } from 'lucide-react';
import {
  updateCustomer,
  deleteCustomer,
  listenToCustomers,
} from '../lib/firebase';
import { useAsyncOperation } from '../hooks/useFirestore';
import { formatDate, filterBySearch, paginate, getTotalPages } from '../utils/helpers';
import { ITEMS_PER_PAGE } from '../constants';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Filter states
  const [genderFilter, setGenderFilter] = useState('all');
  const [orderRangeFilter, setOrderRangeFilter] = useState('all');
  const [spentRangeFilter, setSpentRangeFilter] = useState('all');

  // Modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });

  const { execute, loading: actionLoading } = useAsyncOperation();

  // Real-time listener for customers
  useEffect(() => {
    const unsubscribe = listenToCustomers((data) => {
      setCustomers(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Filter customers when search term or filters change
  useEffect(() => {
    let filtered = filterBySearch(customers, searchTerm, ['name', 'email', 'phone']);

    // Gender filter
    if (genderFilter !== 'all') {
      filtered = filtered.filter(c => c.gender?.toLowerCase() === genderFilter.toLowerCase());
    }

    // Order range filter
    if (orderRangeFilter === '0') {
      filtered = filtered.filter(c => (c.totalOrders || 0) === 0);
    } else if (orderRangeFilter === '1-5') {
      filtered = filtered.filter(c => (c.totalOrders || 0) >= 1 && (c.totalOrders || 0) <= 5);
    } else if (orderRangeFilter === '5+') {
      filtered = filtered.filter(c => (c.totalOrders || 0) > 5);
    }

    // Spent range filter
    if (spentRangeFilter === '0') {
      filtered = filtered.filter(c => (c.totalSpent || 0) === 0);
    } else if (spentRangeFilter === '<5000') {
      filtered = filtered.filter(c => (c.totalSpent || 0) > 0 && (c.totalSpent || 0) < 5000);
    } else if (spentRangeFilter === '5000-20000') {
      filtered = filtered.filter(c => (c.totalSpent || 0) >= 5000 && (c.totalSpent || 0) <= 20000);
    } else if (spentRangeFilter === '20000+') {
      filtered = filtered.filter(c => (c.totalSpent || 0) > 20000);
    }

    setFilteredCustomers(filtered);
    setCurrentPage(1); // Reset to first page on filter change
  }, [customers, searchTerm, genderFilter, orderRangeFilter, spentRangeFilter]);

  // Paginated data
  const paginatedCustomers = paginate(filteredCustomers, currentPage, ITEMS_PER_PAGE);
  const totalPages = getTotalPages(filteredCustomers.length, ITEMS_PER_PAGE);

  const handleEdit = (customer) => {
    setSelectedCustomer(customer);
    setFormData({
      name: customer.name || '',
      email: customer.email || '',
      phone: customer.phone || '',
      address: customer.address?.fullAddress || customer.address || '',
    });
    setShowEditModal(true);
  };

  const handleView = (customer) => {
    setSelectedCustomer(customer);
    setShowViewModal(true);
  };

  const handleDeleteClick = (customer) => {
    setSelectedCustomer(customer);
    setShowDeleteDialog(true);
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();

    // Only update fields that have values, preserve address structure
    const updates = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
    };

    // If address is being updated, preserve the object structure
    if (formData.address) {
      if (selectedCustomer.address && typeof selectedCustomer.address === 'object') {
        updates.address = {
          ...selectedCustomer.address,
          fullAddress: formData.address
        };
      } else {
        updates.address = formData.address;
      }
    }

    await execute(
      () => updateCustomer(selectedCustomer.id, updates),
      'Customer updated successfully'
    );
    setShowEditModal(false);
  };

  const handleDelete = async () => {
    await execute(
      () => deleteCustomer(selectedCustomer.id),
      'Customer deleted successfully'
    );
    setShowDeleteDialog(false);
  };

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
      header: 'Gender',
      render: (row) => row.gender || 'N/A',
    },
    {
      header: 'Total Orders',
      render: (row) => row.totalOrders || 0,
    },
    {
      header: 'Total Spent',
      render: (row) => `PKR ${(row.totalSpent || 0).toLocaleString()}`,
    },
    {
      header: 'Joined',
      render: (row) => formatDate(row.createdAt),
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex space-x-2">
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
            icon={Trash2}
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteClick(row);
            }}
            className="text-red-600 hover:text-red-700"
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <Layout title="Customers">
        <Loading />
      </Layout>
    );
  }

  return (
    <Layout title="Customers">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Customers</h2>
          <p className="text-gray-600 mt-1">
            Manage all customers ({customers.length} total)
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-1">
              <SearchBar
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Search customers..."
              />
            </div>
            <Select
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value)}
              options={[
                { value: 'all', label: 'All Genders' },
                { value: 'male', label: 'Male' },
                { value: 'female', label: 'Female' },
              ]}
            />
            <Select
              value={orderRangeFilter}
              onChange={(e) => setOrderRangeFilter(e.target.value)}
              options={[
                { value: 'all', label: 'All Orders' },
                { value: '0', label: 'No Orders' },
                { value: '1-5', label: '1-5 Orders' },
                { value: '5+', label: '5+ Orders' },
              ]}
            />
            <Select
              value={spentRangeFilter}
              onChange={(e) => setSpentRangeFilter(e.target.value)}
              options={[
                { value: 'all', label: 'All Spending' },
                { value: '0', label: 'PKR 0' },
                { value: '<5000', label: '< PKR 5,000' },
                { value: '5000-20000', label: 'PKR 5k-20k' },
                { value: '20000+', label: 'PKR 20k+' },
              ]}
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <Table columns={columns} data={paginatedCustomers} />
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </div>

        {/* Edit Modal */}
        <Modal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          title="Edit Customer"
        >
          <form onSubmit={handleSubmitEdit} className="space-y-4">
            <p className="text-sm text-gray-500 mb-4">
              Update customer information. All fields are optional.
            </p>
            <Input
              label="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Customer name"
            />
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="customer@email.com"
            />
            <Input
              label="Phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="03XX XXXXXXX"
            />
            <Input
              label="Address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Full address"
            />
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-xs text-amber-800">
                <strong>Note:</strong> Gender, profile picture, and customer ID cannot be edited by admin.
              </p>
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowEditModal(false)}
              >
                Cancel
              </Button>
              <Button type="submit" loading={actionLoading}>
                Update Customer
              </Button>
            </div>
          </form>
        </Modal>

        {/* View Modal */}
        <Modal
          isOpen={showViewModal}
          onClose={() => setShowViewModal(false)}
          title="Customer Details"
        >
          {selectedCustomer && (
            <div className="space-y-4">
              {/* Profile Image */}
              {selectedCustomer.profileImagePath && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Profile Picture
                  </label>
                  <img
                    src={selectedCustomer.profileImagePath}
                    alt={selectedCustomer.name}
                    className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <p className="text-gray-900">{selectedCustomer.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gender
                  </label>
                  <p className="text-gray-900">{selectedCustomer.gender || 'N/A'}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <p className="text-gray-900">{selectedCustomer.email}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <p className="text-gray-900">{selectedCustomer.phone}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Customer ID
                </label>
                <p className="text-gray-900 text-sm font-mono">{selectedCustomer.customerId || selectedCustomer.id}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Address
                </label>
                <p className="text-gray-900">
                  {selectedCustomer.address?.fullAddress || selectedCustomer.address || 'N/A'}
                </p>
                {selectedCustomer.address?.latitude && selectedCustomer.address?.longitude && (
                  <p className="text-xs text-gray-500 mt-1">
                    Coordinates: {selectedCustomer.address.latitude}, {selectedCustomer.address.longitude}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Orders
                  </label>
                  <p className="text-gray-900 text-lg font-semibold">{selectedCustomer.totalOrders || 0}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Spent
                  </label>
                  <p className="text-gray-900 text-lg font-semibold">
                    PKR {(selectedCustomer.totalSpent || 0).toLocaleString()}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rating
                  </label>
                  <p className="text-gray-900 text-lg font-semibold">
                    {selectedCustomer.review || 0} ⭐
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Joined Date
                  </label>
                  <p className="text-gray-900">{formatDate(selectedCustomer.createdAt)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Updated
                  </label>
                  <p className="text-gray-900">{formatDate(selectedCustomer.updatedAt)}</p>
                </div>
              </div>
            </div>
          )}
        </Modal>

        {/* Delete Confirmation */}
        <ConfirmDialog
          isOpen={showDeleteDialog}
          onClose={() => setShowDeleteDialog(false)}
          onConfirm={handleDelete}
          title="Delete Customer"
          message={`Are you sure you want to delete ${selectedCustomer?.name}? This action cannot be undone.`}
          confirmText="Delete"
          loading={actionLoading}
        />
      </div>
    </Layout>
  );
};

export default Customers;
