import React, { useState } from 'react'
import TeacherList from '@/components/dashboards/admin/TeacherList'
import AddTeacherForm from '@/components/dashboards/admin/AddTeacherForm'

const AllTeachers = () => {
  const [showAddForm, setShowAddForm] = useState(false);

  return (
    <div>
      {showAddForm ? (
        <div>
          <button onClick={() => setShowAddForm(false)} className="mb-4 bg-gray-200 px-4 py-2 rounded">Back to Teacher List</button>
          <AddTeacherForm />
        </div>
      ) : (
        <div>
          <div className="flex justify-end mt-6 mb-4">
            <button onClick={() => setShowAddForm(true)} className="bg-blue-600 text-white px-4 py-2 rounded shadow">Add Teacher</button>
          </div>
          <TeacherList />
        </div>
      )}
    </div>
  )
}

export default AllTeachers