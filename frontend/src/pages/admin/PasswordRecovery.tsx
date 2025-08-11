import React, { useState } from 'react';
import { toast } from 'react-toastify';
import api from '@/services/api';

const PasswordRecovery: React.FC = () => {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    newPassword?: string;
    userDetails?: any;
  } | null>(null);

  const handlePasswordReset = async () => {
    if (!username.trim()) {
      toast.error('Please enter a username');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      // First, search for the user by username
      const searchResponse = await api.get(`/api/parents/search/?q=${encodeURIComponent(username)}`);
      const users = Array.isArray(searchResponse) ? searchResponse : [];
      
      const foundUser = users.find((user: any) => user.username === username);
      
      if (!foundUser) {
        setResult({
          success: false,
          message: 'User not found. Please check the username.'
        });
        return;
      }

      // Generate a new password
      const newPassword = generatePassword();
      
      // Update the user's password
      const resetResponse = await api.post(`/api/auth/admin-reset-password/`, {
        user_id: foundUser.user_id,
        new_password: newPassword
      });

      setResult({
        success: true,
        message: 'Password reset successful!',
        newPassword: newPassword,
        userDetails: foundUser
      });

      toast.success('Password reset successful!');
    } catch (error: any) {
      console.error('Password reset error:', error);
      setResult({
        success: false,
        message: error.response?.data?.detail || 'Failed to reset password. Please try again.'
      });
      toast.error('Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Password Recovery</h2>
      
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="flex-1 p-3 border border-gray-300 rounded-lg"
            placeholder="Enter username (e.g., PAR/GTS/AUG/25/001)"
          />
          <button
            onClick={handlePasswordReset}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </div>
      </div>

      {result && (
        <div className={`p-4 rounded-lg border ${result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <h3 className={`font-semibold mb-2 ${result.success ? 'text-green-800' : 'text-red-800'}`}>
            {result.success ? '✅ Success' : '❌ Error'}
          </h3>
          <p className={`mb-3 ${result.success ? 'text-green-700' : 'text-red-700'}`}>
            {result.message}
          </p>
          
          {result.success && result.newPassword && result.userDetails && (
            <div className="bg-white p-4 rounded border border-green-300">
              <h4 className="font-semibold text-gray-800 mb-3">New Credentials</h4>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Username:</label>
                  <div className="flex items-center gap-2">
                    <span className="font-mono bg-gray-100 px-3 py-2 rounded flex-1">
                      {result.userDetails.username}
                    </span>
                    <button
                      onClick={() => copyToClipboard(result.userDetails.username)}
                      className="text-blue-600 hover:text-blue-800 text-sm underline"
                    >
                      Copy
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">New Password:</label>
                  <div className="flex items-center gap-2">
                    <span className="font-mono bg-gray-100 px-3 py-2 rounded flex-1">
                      {result.newPassword}
                    </span>
                    <button
                      onClick={() => copyToClipboard(result.newPassword || '')}
                      className="text-blue-600 hover:text-blue-800 text-sm underline"
                    >
                      Copy
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">User Details:</label>
                  <div className="text-sm text-gray-700">
                    <p><strong>Name:</strong> {result.userDetails.full_name}</p>
                    <p><strong>Email:</strong> {result.userDetails.email}</p>
                    <p><strong>Phone:</strong> {result.userDetails.phone}</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-sm text-yellow-800">
                  <strong>Important:</strong> Please copy and save these credentials. The password will not be shown again.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PasswordRecovery; 