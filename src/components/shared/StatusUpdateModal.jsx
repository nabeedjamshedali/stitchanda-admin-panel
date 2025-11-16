import { useState } from 'react';
import Modal from './Modal';
import Select from './Select';
import Button from './Button';

const StatusUpdateModal = ({
  isOpen,
  onClose,
  onSubmit,
  title = "Update Status",
  statusOptions = [],
  currentStatus,
  loading = false,
  showComment = true,
  additionalFields = null,
}) => {
  const [formData, setFormData] = useState({
    status: currentStatus || '',
    comment: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Status Dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Status
          </label>
          <Select
            value={formData.status}
            onChange={(e) => handleChange('status', e.target.value)}
            options={statusOptions}
            required
          />
        </div>

        {/* Additional Fields (e.g., Select Auditors) */}
        {additionalFields}

        {/* Comment Field */}
        {showComment && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Comment
            </label>
            <textarea
              value={formData.comment}
              onChange={(e) => handleChange('comment', e.target.value)}
              placeholder="Add a comment..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A67B5B] focus:border-transparent resize-none"
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-[#6B4423] hover:bg-[#8D6A4F] text-white"
            loading={loading}
          >
            Save changes
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default StatusUpdateModal;
