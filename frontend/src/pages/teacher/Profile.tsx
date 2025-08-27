import React from 'react';
import TeacherDashboardLayout from '@/components/layouts/TeacherDashboardLayout';
import TeacherProfile from '@/components/dashboards/teacher/TeacherProfile';

const TeacherProfilePage: React.FC = () => {
  return (
    <TeacherDashboardLayout>
      <TeacherProfile />
    </TeacherDashboardLayout>
  );
};

export default TeacherProfilePage;

