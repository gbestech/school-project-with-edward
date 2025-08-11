import EnhancedClassroom from '@/components/dashboards/admin/EnhancedClassroom'
import AuthCheck from '@/components/dashboards/admin/AuthCheck'

const AdminClassroomManagement = () => {
  return (
    <AuthCheck>
      <div>
        <EnhancedClassroom/>
      </div>
    </AuthCheck>
  )
}

export default AdminClassroomManagement