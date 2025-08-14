import ClassroomManagement from '@/components/dashboards/admin/ClassroomManagement'
import AuthCheck from '@/components/dashboards/admin/AuthCheck'

const AdminClassroomManagement = () => {
  return (
    <AuthCheck>
      <ClassroomManagement />
    </AuthCheck>
  )
}

export default AdminClassroomManagement