import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Eye, User, Phone, Mail, MapPin, Calendar, Users, GraduationCap, X, Save, UserPlus, Power, PowerOff } from 'lucide-react';
import api from '@/services/api';

// Updated interfaces to match API response
interface Child {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  education_level: string;
}

interface Parent {
  id: number;
  user: string; // email
  students: Child[];
  is_active: boolean;
  parent_username?: string;
  parent_password?: string;
}

const ParentAdminList: React.FC = () => {
  const [parents, setParents] = useState<Parent[]>([]);
  const [filteredParents, setFilteredParents] = useState<Parent[]>([]);
  const [selectedParent, setSelectedParent] = useState<Parent | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'view' | 'edit' | 'create'>('view');
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toggleLoading, setToggleLoading] = useState<number | null>(null);

  // Fetch parents from API
  const fetchParents = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/parents/');
      setParents(response);
      setFilteredParents(response);
    } catch (err) {
      console.error('Error fetching parents:', err);
      setError('Failed to load parents. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParents();
  }, []);

  useEffect(() => {
    const filtered = parents.filter((parent) =>
      parent.user.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredParents(filtered);
  }, [searchTerm, parents]);

  // Toggle parent activation status
  const handleToggleStatus = async (parent: Parent) => {
    try {
      setToggleLoading(parent.id);
      const endpoint = parent.is_active ? 'deactivate' : 'activate';
      await api.post(`/parents/${parent.id}/${endpoint}/`, {});
      
      // Update the parent in the local state
      setParents(parents.map(p => 
        p.id === parent.id ? { ...p, is_active: !p.is_active } : p
      ));
      
      // Show success message
      alert(`Parent ${parent.is_active ? 'deactivated' : 'activated'} successfully!`);
    } catch (err) {
      console.error('Error toggling parent status:', err);
      alert('Failed to update parent status. Please try again.');
    } finally {
      setToggleLoading(null);
    }
  };

  const handleView = (parent: Parent) => {
    setSelectedParent(parent);
    setModalMode('view');
    setShowModal(true);
  };

  const handleEdit = (parent: Parent) => {
    setSelectedParent(parent);
    setModalMode('edit');
    setShowModal(true);
  };

  const handleCreate = () => {
    setSelectedParent(null);
    setModalMode('create');
    setShowModal(true);
  };

  const handleDelete = (parentId: number) => {
    setShowDeleteConfirm(parentId);
  };

  const confirmDelete = async () => {
    if (!showDeleteConfirm) return;
    
    try {
      await api.delete(`/parents/${showDeleteConfirm}/`);
      setParents(parents.filter((p) => p.id !== showDeleteConfirm));
      setShowDeleteConfirm(null);
      alert('Parent deleted successfully!');
    } catch (err) {
      console.error('Error deleting parent:', err);
      alert('Failed to delete parent. Please try again.');
    }
  };

  const handleSave = async () => {
    try {
      if (modalMode === 'create') {
        // Handle parent creation
        const newParent = await api.post('/parents/', {
          // Add form data here
        });
        setParents([...parents, newParent]);
        alert('Parent created successfully!');
      } else if (modalMode === 'edit' && selectedParent) {
        // Handle parent update
        const updatedParent = await api.put(`/parents/${selectedParent.id}/`, {
          // Add form data here
        });
        setParents(parents.map(p => p.id === selectedParent.id ? updatedParent : p));
        alert('Parent updated successfully!');
      }
      setShowModal(false);
    } catch (err) {
      console.error('Error saving parent:', err);
      alert('Failed to save parent. Please try again.');
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedParent(null);
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100';
  };

  if (loading) {
    return (
      <div className="bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Loading parents...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-gray-900">Parent Management</h1>
            <button
              onClick={handleCreate}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus size={20} />
              Add Parent
            </button>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search parents by email..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Parent List */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Parents ({filteredParents.length})
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Children</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredParents.map((parent) => (
                  <tr key={parent.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="text-blue-600" size={20} />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {parent.user}
                          </div>
                          {parent.parent_username && (
                            <div className="text-sm text-gray-500">Username: {parent.parent_username}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Users className="text-gray-400 mr-2" size={16} />
                        <span className="text-sm text-gray-900">{parent.students.length}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(parent.is_active)}`}>
                        {parent.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleView(parent)}
                          className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleEdit(parent)}
                          className="text-green-600 hover:text-green-900 p-1 hover:bg-green-50 rounded"
                          title="Edit Parent"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(parent)}
                          disabled={toggleLoading === parent.id}
                          className={`p-1 rounded transition-colors ${
                            parent.is_active 
                              ? 'text-orange-600 hover:text-orange-900 hover:bg-orange-50' 
                              : 'text-green-600 hover:text-green-900 hover:bg-green-50'
                          } ${toggleLoading === parent.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                          title={parent.is_active ? 'Deactivate Parent' : 'Activate Parent'}
                        >
                          {toggleLoading === parent.id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                          ) : parent.is_active ? (
                            <PowerOff size={16} />
                          ) : (
                            <Power size={16} />
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(parent.id)}
                          className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded"
                          title="Delete Parent"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-screen overflow-y-auto">
              <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900">
                  {modalMode === 'view' ? 'Parent Details' : 
                   modalMode === 'edit' ? 'Edit Parent' : 'Add New Parent'}
                </h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-6">
                {modalMode === 'view' && selectedParent ? (
                  <div className="space-y-6">
                    {/* Parent Information */}
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <User className="mr-2" size={20} />
                        Parent Information
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Email</label>
                          <p className="mt-1 text-sm text-gray-900 flex items-center">
                            <Mail className="mr-1" size={16} />
                            {selectedParent.user}
                          </p>
                        </div>
                        {selectedParent.parent_username && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Username</label>
                            <p className="mt-1 text-sm text-gray-900">{selectedParent.parent_username}</p>
                          </div>
                        )}
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Status</label>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedParent.is_active)}`}>
                            {selectedParent.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Children Information */}
                    <div className="bg-blue-50 rounded-lg p-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <GraduationCap className="mr-2" size={20} />
                        Children ({selectedParent.students.length})
                      </h4>
                      {selectedParent.students.length > 0 ? (
                        <div className="grid gap-4">
                          {selectedParent.students.map((child) => (
                            <div key={child.id} className="bg-white rounded-lg p-4 border border-blue-200">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h5 className="font-medium text-gray-900">{child.full_name}</h5>
                                  <p className="text-sm text-gray-600">Education Level: {child.education_level}</p>
                                </div>
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                  <GraduationCap className="text-blue-600" size={16} />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-center py-4">No children registered</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Edit and create functionality will be implemented here.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirm Delete</h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete this parent? This action cannot be undone.
                </p>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowDeleteConfirm(null)}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ParentAdminList;