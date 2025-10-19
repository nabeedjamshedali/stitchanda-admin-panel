import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import Table from '../components/shared/Table';
import Button from '../components/shared/Button';
import SearchBar from '../components/shared/SearchBar';
import Pagination from '../components/shared/Pagination';
import Loading from '../components/shared/Loading';
import Modal from '../components/shared/Modal';
import Input from '../components/shared/Input';
import ConfirmDialog from '../components/shared/ConfirmDialog';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import {
  getCustomers,
  addCustomer,
  updateCustomer,
  deleteCustomer,
  listenToCustomers,
} from '../services/firebase';
import { useAsyncOperation } from '../hooks/useFirestore';
import { formatDate, filterBySearch, paginate, getTotalPages } from '../utils/helpers';
import { ITEMS_PER_PAGE } from '../utils/constants';
import toast from 'react-hot-toast';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
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

  // Filter customers when search term changes
  useEffect(() => {
    const filtered = filterBySearch(customers, searchTerm, ['name', 'email', 'phone']);
    setFilteredCustomers(filtered);
    setCurrentPage(1); // Reset to first page on search
  }, [customers, searchTerm]);

  // Paginated data
  const paginatedCustomers = paginate(filteredCustomers, currentPage, ITEMS_PER_PAGE);
  const totalPages = getTotalPages(filteredCustomers.length, ITEMS_PER_PAGE);

  const handleAdd = () => {
    setFormData({ name: '', email: '', phone: '', address: '' });
    setShowAddModal(true);
  };

  const handleEdit = (customer) => {
    setSelectedCustomer(customer);
    setFormData({
      name: customer.name || '',
      email: customer.email || '',
      phone: customer.phone || '',
      address: customer.address || '',
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

  const handleSubmitAdd = async (e) => {
    e.preventDefault();
    await execute(
      () => addCustomer(formData),
      'Customer added successfully'
    );
    setShowAddModal(false);
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    await execute(
      () => updateCustomer(selectedCustomer.id, formData),
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
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Customers</h2>
            <p className="text-gray-600 mt-1">
              Manage all customers ({customers.length} total)
            </p>
          </div>
          <Button icon={Plus} onClick={handleAdd}>
            Add Customer
          </Button>
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search customers by name, email, or phone..."
          />
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

        {/* Add Modal */}
        <Modal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          title="Add New Customer"
        >
          <form onSubmit={handleSubmitAdd} className="space-y-4">
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
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </Button>
              <Button type="submit" loading={actionLoading}>
                Add Customer
              </Button>
            </div>
          </form>
        </Modal>

        {/* Edit Modal */}
        <Modal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          title="Edit Customer"
        >
          <form onSubmit={handleSubmitEdit} className="space-y-4">
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <p className="text-gray-900">{selectedCustomer.name}</p>
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
                  Address
                </label>
                <p className="text-gray-900">{selectedCustomer.address}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Orders
                </label>
                <p className="text-gray-900">{selectedCustomer.totalOrders || 0}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Spent
                </label>
                <p className="text-gray-900">
                  PKR {(selectedCustomer.totalSpent || 0).toLocaleString()}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Joined Date
                </label>
                <p className="text-gray-900">{formatDate(selectedCustomer.createdAt)}</p>
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
