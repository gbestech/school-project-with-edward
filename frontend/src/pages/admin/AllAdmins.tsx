
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '@/services/api';
import AddAdminForm from './AddAdminForm';

interface Admin {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  is_active: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  date_joined: string;
  last_login: string | null;
  phone?: string;
  role?: string; // Added role field
}

const AllAdmins = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

  // useEffect(() => {
  //   if (!showAddForm) {
  //     fetchAdmins();
  //   }
  // }, [showAddForm]);

  useEffect(() => {
  fetchAdmins();
}, []);

  // const fetchAdmins = async () => {
  //   setLoading(true);
  //   try {
  //     const response = await api.get('/api/auth/admins/list/');
  //     const adminList = Array.isArray(response.data) ? response.data : 
  //                      Array.isArray(response.data?.results) ? response.data.results : [];
      
  //     console.log('✅ Fetched admins:', adminList);
  //     setAdmins(adminList);
   
  //   } catch (error: any) {
  //     console.error('❌ Error fetching admins:', error);
  //     toast.error('Failed to load admins. Please ensure the endpoint exists.');
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const fetchAdmins = async (): Promise<void> => {
  setLoading(true);
  try {
    const response = await api.get("/api/auth/admins/list/");
    console.log("✅ Full response:", response);

    // The admins are directly returned as an array
    const adminList = Array.isArray(response.data) ? response.data : [];
    console.log("✅ Extracted admin list:", adminList);

    setAdmins(adminList);
  } catch (error: any) {
    console.error("❌ Error fetching admins:", error);
    toast.error("Failed to load admins.");
  } finally {
    setLoading(false);
  }
};



  useEffect(() => {
  console.log("🧠 Admin state updated:", admins);
}, [admins]);

  const handleToggleStatus = async (adminId: number, currentStatus: boolean) => {
    try {
      await api.patch(`/api/auth/activate-user/${adminId}/`, {
        is_active: !currentStatus
      });
      
      toast.success(`Admin ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      fetchAdmins();
    } catch (error: any) {
      console.error('Error toggling admin status:', error);
      toast.error('Failed to update admin status');
    }
  };

  const handleDeleteAdmin = async (adminId: number, adminName: string) => {
    if (!window.confirm(`Are you sure you want to delete admin "${adminName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await api.delete(`/api/profiles/users/${adminId}/`);
      toast.success('Admin deleted successfully');
      fetchAdmins();
    } catch (error: any) {
      console.error('Error deleting admin:', error);
      toast.error('Failed to delete admin');
    }
  };

  const filteredAdmins = admins.filter(admin => {
    const matchesSearch = 
      (admin.username || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (admin.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (admin.first_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (admin.last_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (admin.full_name || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = 
      filterStatus === 'all' ? true :
      filterStatus === 'active' ? admin.is_active :
      !admin.is_active;
      console.log("🧩 Filter Status:", filterStatus);
console.log("🔍 Search Term:", searchTerm);
console.log("👥 Admins Before Filter:", admins);
console.log("✅ Filtered Admins:", filteredAdmins);


    return matchesSearch && matchesFilter;
  });

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (showAddForm) {
    return (
      <div>
        <button 
          onClick={() => setShowAddForm(false)} 
          className="mb-4 bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded transition-colors"
        >
          ← Back to Admin List
        </button>
        <AddAdminForm />
      </div>
    );
  }
  console.log("This is the list of filtered admin", filteredAdmins)
  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Admin Management</h1>
        <button 
          onClick={() => setShowAddForm(true)} 
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow transition-colors font-semibold"
        >
          + Add Admin
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {/* Debug Info - Remove this after testing */}
        {admins.length > 0 && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm">
            <strong>Debug:</strong> Total admins loaded: {admins.length}, 
            Filtered admins: {filteredAdmins.length}
          </div>
        )}

        {/* Search and Filter Bar */}
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by username, email, or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === 'all' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All ({admins.length})
            </button>
            <button
              onClick={() => setFilterStatus('active')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === 'active' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Active ({admins.filter(a => a.is_active).length})
            </button>
            <button
              onClick={() => setFilterStatus('inactive')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === 'inactive' 
                  ? 'bg-red-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Inactive ({admins.filter(a => !a.is_active).length})
            </button>
          </div>
        </div>

        {/* Admin Table */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading admins...</p>
          </div>
        ) : filteredAdmins.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              {searchTerm || filterStatus !== 'all' 
                ? 'No admins found matching your criteria' 
                : 'No admins found. Click "Add Admin" to create one.'}
            </p>
            {admins.length > 0 && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterStatus('all');
                }}
                className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Username
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Date Joined
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Last Login
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
            
              <tbody className="divide-y divide-gray-200">
                {filteredAdmins.map((admin) => (
                  
                  <tr key={admin.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4">
                      <div className="flex flex-col">
                        <span className="font-mono text-sm text-gray-900">{admin.username}</span>
                        {admin.role && (
                          <span className="text-xs text-gray-500 mt-0.5">Role: {admin.role}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm font-medium text-gray-900">
                        {admin.full_name || `${admin.first_name} ${admin.last_name}`.trim() || 'N/A'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-gray-600">{admin.email}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        admin.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {admin.is_active ? '● Active' : '● Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">
                      {formatDate(admin.date_joined)}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">
                      {formatDate(admin.last_login)}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleToggleStatus(admin.id, admin.is_active)}
                          className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                            admin.is_active
                              ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                              : 'bg-green-100 text-green-800 hover:bg-green-200'
                          }`}
                          title={admin.is_active ? 'Deactivate' : 'Activate'}
                        >
                          {admin.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => handleDeleteAdmin(admin.id, admin.full_name || `${admin.first_name} ${admin.last_name}` || admin.username)}
                          className="px-3 py-1 text-xs font-medium rounded bg-red-100 text-red-800 hover:bg-red-200 transition-colors"
                          title="Delete admin"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Summary Footer */}
        {!loading && filteredAdmins.length > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-200 flex justify-between items-center text-sm text-gray-600">
            <span>
              Showing {filteredAdmins.length} of {admins.length} admin{admins.length !== 1 ? 's' : ''}
            </span>
            <button
              onClick={fetchAdmins}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Refresh List
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllAdmins;