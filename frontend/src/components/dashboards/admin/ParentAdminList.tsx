import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Eye, User, Phone, Mail, MapPin, Calendar, Users, GraduationCap, X, Save, UserPlus } from 'lucide-react';

// Add interfaces for Parent and Child
interface Child {
  id: number;
  name: string;
  grade: string;
  age: number;
  class: string;
}

interface Parent {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  occupation: string;
  emergencyContact: string;
  dateJoined: string;
  status: string;
  children: Child[];
}

const ParentAdminList: React.FC = () => {
  // TEST ELEMENT FOR RENDERING CONFIRMATION
  // Remove this after confirming rendering works
  const testBanner = (
    <div style={{ background: '#fffae6', color: '#b45309', padding: '16px', textAlign: 'center', fontWeight: 'bold', fontSize: '18px', border: '2px solid #fbbf24', borderRadius: '8px', marginBottom: '24px', zIndex: 1000 }}>
      TEST: ParentAdminList component is rendering!
    </div>
  );
  const [parents, setParents] = useState<Parent[]>([]);
  const [filteredParents, setFilteredParents] = useState<Parent[]>([]);
  const [selectedParent, setSelectedParent] = useState<Parent | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'view' | 'edit' | 'create'>('view'); // 'view', 'edit', 'create'
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);

  // Sample data - in real app, this would come from API
  const initialParents: Parent[] = [
    {
      id: 1,
      firstName: 'John',
      lastName: 'Smith',
      email: 'john.smith@email.com',
      phone: '+1-555-0123',
      address: '123 Main St, Springfield, IL 62701',
      occupation: 'Software Engineer',
      emergencyContact: '+1-555-0124',
      dateJoined: '2023-01-15',
      status: 'Active',
      children: [
        { id: 101, name: 'Emma Smith', grade: '5th Grade', age: 10, class: '5A' },
        { id: 102, name: 'Liam Smith', grade: '3rd Grade', age: 8, class: '3B' }
      ]
    },
    {
      id: 2,
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah.johnson@email.com',
      phone: '+1-555-0234',
      address: '456 Oak Ave, Springfield, IL 62702',
      occupation: 'Marketing Manager',
      emergencyContact: '+1-555-0235',
      dateJoined: '2023-03-20',
      status: 'Active',
      children: [
        { id: 201, name: 'Noah Johnson', grade: '7th Grade', age: 12, class: '7C' }
      ]
    },
    {
      id: 3,
      firstName: 'Michael',
      lastName: 'Brown',
      email: 'michael.brown@email.com',
      phone: '+1-555-0345',
      address: '789 Pine St, Springfield, IL 62703',
      occupation: 'Teacher',
      emergencyContact: '+1-555-0346',
      dateJoined: '2022-09-10',
      status: 'Inactive',
      children: [
        { id: 301, name: 'Olivia Brown', grade: '6th Grade', age: 11, class: '6A' },
        { id: 302, name: 'Ethan Brown', grade: '4th Grade', age: 9, class: '4B' },
        { id: 303, name: 'Ava Brown', grade: '2nd Grade', age: 7, class: '2C' }
      ]
    }
  ];

  const [formData, setFormData] = useState<Omit<Parent, 'id' | 'dateJoined' | 'children'>>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    occupation: '',
    emergencyContact: '',
    status: 'Active'
  });

  useEffect(() => {
    setParents(initialParents);
    setFilteredParents(initialParents);
  }, []);

  useEffect(() => {
    const filtered = parents.filter((parent) =>
      `${parent.firstName} ${parent.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      parent.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      parent.phone.includes(searchTerm)
    );
    setFilteredParents(filtered);
  }, [searchTerm, parents]);

  const handleView = (parent: Parent) => {
    setSelectedParent(parent);
    setModalMode('view');
    setShowModal(true);
  };

  const handleEdit = (parent: Parent) => {
    setSelectedParent(parent);
    setFormData({
      firstName: parent.firstName,
      lastName: parent.lastName,
      email: parent.email,
      phone: parent.phone,
      address: parent.address,
      occupation: parent.occupation,
      emergencyContact: parent.emergencyContact,
      status: parent.status
    });
    setModalMode('edit');
    setShowModal(true);
  };

  const handleCreate = () => {
    setSelectedParent(null);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      occupation: '',
      emergencyContact: '',
      status: 'Active'
    });
    setModalMode('create');
    setShowModal(true);
  };

  const handleDelete = (parentId: number) => {
    setShowDeleteConfirm(parentId);
  };

  const confirmDelete = () => {
    setParents(parents.filter((p) => p.id !== showDeleteConfirm));
    setShowDeleteConfirm(null);
  };

  const handleSave = () => {
    if (modalMode === 'create') {
      const newParent: Parent = {
        ...formData,
        id: parents.length > 0 ? Math.max(...parents.map((p) => p.id)) + 1 : 1,
        dateJoined: new Date().toISOString().split('T')[0],
        children: []
      };
      setParents([...parents, newParent]);
    } else if (modalMode === 'edit' && selectedParent) {
      setParents(
        parents.map((p) =>
          p.id === selectedParent.id ? { ...p, ...formData } : p
        )
      );
    }
    setShowModal(false);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedParent(null);
  };

  const getStatusColor = (status: string) => {
    return status === 'Active' ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
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
              placeholder="Search parents by name, email, or phone..."
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Children</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
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
                            {parent.firstName} {parent.lastName}
                          </div>
                          <div className="text-sm text-gray-500">{parent.occupation}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{parent.email}</div>
                      <div className="text-sm text-gray-500">{parent.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Users className="text-gray-400 mr-2" size={16} />
                        <span className="text-sm text-gray-900">{parent.children.length}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(parent.status)}`}>
                        {parent.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(parent.dateJoined).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleView(parent)}
                          className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleEdit(parent)}
                          className="text-green-600 hover:text-green-900 p-1 hover:bg-green-50 rounded"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(parent.id)}
                          className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded"
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
                          <label className="block text-sm font-medium text-gray-700">Full Name</label>
                          <p className="mt-1 text-sm text-gray-900">{selectedParent.firstName} {selectedParent.lastName}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Email</label>
                          <p className="mt-1 text-sm text-gray-900 flex items-center">
                            <Mail className="mr-1" size={16} />
                            {selectedParent.email}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Phone</label>
                          <p className="mt-1 text-sm text-gray-900 flex items-center">
                            <Phone className="mr-1" size={16} />
                            {selectedParent.phone}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Emergency Contact</label>
                          <p className="mt-1 text-sm text-gray-900">{selectedParent.emergencyContact}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Address</label>
                          <p className="mt-1 text-sm text-gray-900 flex items-center">
                            <MapPin className="mr-1" size={16} />
                            {selectedParent.address}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Occupation</label>
                          <p className="mt-1 text-sm text-gray-900">{selectedParent.occupation}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Date Joined</label>
                          <p className="mt-1 text-sm text-gray-900 flex items-center">
                            <Calendar className="mr-1" size={16} />
                            {new Date(selectedParent.dateJoined).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Status</label>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedParent.status)}`}>
                            {selectedParent.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Children Information */}
                    <div className="bg-blue-50 rounded-lg p-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <GraduationCap className="mr-2" size={20} />
                        Children ({selectedParent.children.length})
                      </h4>
                      {selectedParent.children.length > 0 ? (
                        <div className="grid gap-4">
                          {selectedParent.children.map((child) => (
                            <div key={child.id} className="bg-white rounded-lg p-4 border border-blue-200">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h5 className="font-medium text-gray-900">{child.name}</h5>
                                  <p className="text-sm text-gray-600">Grade: {child.grade} | Class: {child.class}</p>
                                  <p className="text-sm text-gray-600">Age: {child.age} years old</p>
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
                  <form>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">First Name</label>
                        <input
                          type="text"
                          required
                          className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          value={formData.firstName}
                          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Last Name</label>
                        <input
                          type="text"
                          required
                          className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          value={formData.lastName}
                          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                          type="email"
                          required
                          className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Phone</label>
                        <input
                          type="tel"
                          required
                          className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700">Address</label>
                        <input
                          type="text"
                          required
                          className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          value={formData.address}
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Occupation</label>
                        <input
                          type="text"
                          required
                          className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          value={formData.occupation}
                          onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Emergency Contact</label>
                        <input
                          type="tel"
                          required
                          className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          value={formData.emergencyContact}
                          onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700">Status</label>
                        <select
                          className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          value={formData.status}
                          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        >
                          <option value="Active">Active</option>
                          <option value="Inactive">Inactive</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex justify-end space-x-3 mt-6">
                      <button
                        type="button"
                        onClick={closeModal}
                        className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleSave}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                      >
                        <Save size={16} />
                        {modalMode === 'create' ? 'Create Parent' : 'Save Changes'}
                      </button>
                    </div>
                  </form>
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