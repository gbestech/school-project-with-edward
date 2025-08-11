import React, { useState } from 'react';
import { toast } from 'react-toastify';
import api from '@/services/api';

const AddAdminForm: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [adminUsername, setAdminUsername] = useState<string | null>(null);
  const [adminPassword, setAdminPassword] = useState<string | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    setAdminUsername(null);
    setAdminPassword(null);
    setShowPasswordModal(false);
    try {
      const payload = {
        user_email: formData.email,
        user_first_name: formData.firstName,
        user_last_name: formData.lastName,
      };
      const response = await api.post('/api/admins/', payload);
      setSuccess('Admin created successfully!');
      toast.success('Admin added successfully');
      if (response.data) {
        setAdminUsername(response.data.admin_username);
        setAdminPassword(response.data.admin_password);
        setShowPasswordModal(true);
      }
      setTimeout(() => {
        setLoading(false);
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
        });
      }, 1200);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create admin');
      toast.error('Cannot add admin');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Add New Admin</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">First Name*</label>
          <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-lg" placeholder="First name" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Last Name*</label>
          <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-lg" placeholder="Last name" />
        </div>
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Email*</label>
        <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-lg" placeholder="admin@example.com" />
      </div>
      <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
        <button onClick={handleSave} className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors" disabled={loading}>{loading ? 'Saving...' : 'Save Admin'}</button>
      </div>
      {error && <div className="text-red-500 mt-2">{error}</div>}
      {success && <div className="text-green-600 mt-2">{success}</div>}
      {/* Modal for showing credentials */}
      {showPasswordModal && (adminUsername || adminPassword) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
            <h3 className="text-lg font-semibold mb-4 text-blue-700">Account Credentials</h3>
            {adminUsername && (
              <div className="mb-2 p-3 bg-blue-50 rounded">
                <h4 className="font-semibold text-blue-800 mb-2">Admin Account</h4>
                <div className="text-sm text-gray-800">
                  <span className="font-semibold">Username:</span>
                  <span className="ml-2 font-mono text-lg bg-gray-100 px-2 py-1 rounded">{adminUsername}</span>
                  <button onClick={() => navigator.clipboard.writeText(adminUsername!)} className="ml-2 text-xs text-blue-600 underline">Copy</button>
                </div>
                <div className="text-sm text-gray-800 mt-2">
                  <span className="font-semibold">Password:</span>
                  <span className="ml-2 font-mono text-lg bg-gray-100 px-2 py-1 rounded">{adminPassword}</span>
                  <button onClick={() => navigator.clipboard.writeText(adminPassword!)} className="ml-2 text-xs text-blue-600 underline">Copy</button>
                </div>
              </div>
            )}
            <p className="text-sm text-gray-600 mb-4">Please copy and send these credentials to the admin. They should be required to reset their password on first login.</p>
            <button onClick={() => setShowPasswordModal(false)} className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddAdminForm; 