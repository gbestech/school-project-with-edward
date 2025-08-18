import React from 'react';
import Login from '../home/Login';

const adminBranding = {
  title: 'Admin Login',
  description: 'Access administrative tools and manage the school system. Welcome, admin!',
  imageUrl: 'https://cdn.pixabay.com/photo/2016/03/31/19/56/avatar-1295396_1280.png', // Free admin illustration
};

const AdminLoginForm: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-yellow-900 via-purple-900 to-slate-900">
      <div className="w-full max-w-2xl bg-white/10 rounded-2xl shadow-2xl p-8 flex flex-col items-center">
        <img
          src={adminBranding.imageUrl}
          alt="Admin Login Illustration"
          className="w-32 h-32 object-contain mb-6 rounded-full border-4 border-yellow-400 shadow-lg bg-white"
        />
        <h2 className="text-3xl font-black text-yellow-200 mb-2 text-center">{adminBranding.title}</h2>
        <p className="text-white/70 text-center mb-8">{adminBranding.description}</p>
        <div className="w-full">
          <Login
            onLogin={async () => {}}
            onBackToHome={() => {}}
            isLoading={false}
            errors={{}}
            initialRole="admin"
            hideRoleSelect={true}
          />
        </div>
      </div>
    </div>
  );
};

export default AdminLoginForm;
