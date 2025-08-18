import React from 'react';
import Login from '../home/Login';

const parentBranding = {
  title: 'Parent Login',
  description: 'Monitor your child’s progress and stay connected with teachers. Welcome, parent!',
  imageUrl: 'https://cdn.pixabay.com/photo/2017/01/31/13/05/avatar-2026513_1280.png', // Free parent illustration
};

const ParentLoginForm: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-pink-900 via-purple-900 to-slate-900">
      <div className="w-full max-w-2xl bg-white/10 rounded-2xl shadow-2xl p-8 flex flex-col items-center">
        <img
          src={parentBranding.imageUrl}
          alt="Parent Login Illustration"
          className="w-32 h-32 object-contain mb-6 rounded-full border-4 border-pink-400 shadow-lg bg-white"
        />
        <h2 className="text-3xl font-black text-pink-200 mb-2 text-center">{parentBranding.title}</h2>
        <p className="text-white/70 text-center mb-8">{parentBranding.description}</p>
        <div className="w-full">
          <Login
            onLogin={async () => {}}
            onBackToHome={() => {}}
            isLoading={false}
            errors={{}}
            initialRole="parent"
            hideRoleSelect={true}
          />
        </div>
      </div>
    </div>
  );
};

export default ParentLoginForm;
