import React from 'react';
import Login from '../home/Login';

const teacherBranding = {
  title: 'Teacher Login',
  description: 'Manage your classes, assignments, and connect with students. Welcome, teacher!',
  imageUrl: 'https://cdn.pixabay.com/photo/2017/01/31/13/14/avatar-2026510_1280.png', // Free teacher illustration
};

const TeacherLoginForm: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-green-900 via-purple-900 to-slate-900">
      <div className="w-full max-w-2xl bg-white/10 rounded-2xl shadow-2xl p-8 flex flex-col items-center">
        <img
          src={teacherBranding.imageUrl}
          alt="Teacher Login Illustration"
          className="w-32 h-32 object-contain mb-6 rounded-full border-4 border-green-400 shadow-lg bg-white"
        />
        <h2 className="text-3xl font-black text-green-200 mb-2 text-center">{teacherBranding.title}</h2>
        <p className="text-white/70 text-center mb-8">{teacherBranding.description}</p>
        <div className="w-full">
          <Login
            onLogin={async () => {}}
            onBackToHome={() => {}}
            isLoading={false}
            errors={{}}
            initialRole="teacher"
            hideRoleSelect={true}
          />
        </div>
      </div>
    </div>
  );
};

export default TeacherLoginForm;
