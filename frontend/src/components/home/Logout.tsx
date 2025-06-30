// components/Logout.tsx
import React, { useState } from 'react';
import { 
  LogOut, 
  User, 
  Settings, 
  Shield, 
  AlertCircle,
  CheckCircle,
  X
} from 'lucide-react';

type UserRole = 'student' | 'teacher' | 'parent';

interface CustomUser {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  is_active: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  date_joined: string;
  full_name: string;
}

interface LogoutProps {
  user: CustomUser;
  onLogout: () => void;
  onCancel: () => void;
  isDropdown?: boolean;
}

const Logout: React.FC<LogoutProps> = ({ 
  user, 
  onLogout, 
  onCancel, 
  isDropdown = false 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    
    // Simulate API call for logout
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsLoading(false);
    onLogout();
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'student': return 'from-blue-500 to-cyan-500';
      case 'teacher': return 'from-green-500 to-emerald-500';
      case 'parent': return 'from-purple-500 to-violet-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'student': return '🎓';
      case 'teacher': return '👨‍🏫';
      case 'parent': return '👨‍👩‍👧‍👦';
      default: return '👤';
    }
  };

  if (isDropdown) {
    return (
      <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 p-6 w-80">
        {/* User Profile Section */}
        <div className="flex items-center space-x-4 mb-6 pb-6 border-b border-gray-200/50">
          <div className={`w-16 h-16 bg-gradient-to-r ${getRoleColor(user.role)} rounded-2xl flex items-center justify-center text-2xl shadow-lg`}>
            {getRoleIcon(user.role)}
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-gray-800 text-lg">{user.full_name}</h3>
            <p className="text-gray-600 text-sm">{user.email}</p>
            <div className="flex items-center space-x-2 mt-1">
              <span className={`px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getRoleColor(user.role)} text-white`}>
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </span>
              {user.is_active && (
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-green-600 font-medium">Active</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-2 mb-6">
          <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-gray-100/50 transition-colors text-left group">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
              <User className="text-blue-600" size={18} />
            </div>
            <div>
              <p className="font-medium text-gray-800">Profile Settings</p>
              <p className="text-xs text-gray-500">Manage your account</p>
            </div>
          </button>

          <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-gray-100/50 transition-colors text-left group">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center group-hover:bg-purple-200 transition-colors">
              <Settings className="text-purple-600" size={18} />
            </div>
            <div>
              <p className="font-medium text-gray-800">Preferences</p>
              <p className="text-xs text-gray-500">Customize your experience</p>
            </div>
          </button>

          <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-gray-100/50 transition-colors text-left group">
            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center group-hover:bg-orange-200 transition-colors">
              <Shield className="text-orange-600" size={18} />
            </div>
            <div>
              <p className="font-medium text-gray-800">Security</p>
              <p className="text-xs text-gray-500">Password & privacy</p>
            </div>
          </button>
        </div>

        {/* Logout Section */}
        <div className="pt-6 border-t border-gray-200/50">
          {!showConfirmation ? (
            <button
              onClick={() => setShowConfirmation(true)}
              className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-red-500 to-pink-500 text-white py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-red-500/25 transition-all transform hover:scale-[1.02] group"
            >
              <LogOut className="group-hover:translate-x-1 transition-transform" size={18} />
              <span>Sign Out</span>
            </button>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-orange-600 bg-orange-50 p-3 rounded-xl">
                <AlertCircle size={18} />
                <span className="text-sm font-medium">Are you sure you want to sign out?</span>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleLogout}
                  disabled={isLoading}
                  className="flex-1 bg-red-500 text-white py-2 rounded-lg font-medium hover:bg-red-600 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Signing out...</span>
                    </div>
                  ) : (
                    'Yes, Sign Out'
                  )}
                </button>
                <button
                  onClick={() => setShowConfirmation(false)}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Full page logout component
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white/95 backdrop-blur-2xl rounded-3xl p-8 m-4 max-w-md w-full border border-white/20 shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-red-500/25">
            <LogOut className="text-white" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Sign Out</h2>
          <p className="text-gray-600">Are you sure you want to sign out of your account?</p>
        </div>

        {/* User Info */}
        <div className="bg-gray-50 rounded-2xl p-4 mb-6">
          <div className="flex items-center space-x-4">
            <div className={`w-12 h-12 bg-gradient-to-r ${getRoleColor(user.role)} rounded-xl flex items-center justify-center text-lg shadow-md`}>
              {getRoleIcon(user.role)}
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">{user.full_name}</h3>
              <p className="text-sm text-gray-600">{user.email}</p>
              <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getRoleColor(user.role)} text-white mt-1`}>
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4">
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleLogout}
            disabled={isLoading}
            className="flex-1 bg-gradient-to-r from-red-500 to-pink-500 text-white py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-red-500/25 transition-all transform hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Signing out...</span>
              </div>
            ) : (
              'Sign Out'
            )}
          </button>
        </div>

        {/* Close button */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="text-gray-500" size={20} />
        </button>
      </div>
    </div>
  );
};

export default Logout;