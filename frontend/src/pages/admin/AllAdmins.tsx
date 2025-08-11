import React, { useState } from 'react'
import AddAdminForm from './AddAdminForm'

const AllAdmins = () => {
  const [showAddForm, setShowAddForm] = useState(false);

  return (
    <div>
      {showAddForm ? (
        <div>
          <button onClick={() => setShowAddForm(false)} className="mb-4 bg-gray-200 px-4 py-2 rounded">Back to Admin List</button>
          <AddAdminForm />
        </div>
      ) : (
        <div>
          <div className="flex justify-end mt-6 mb-4">
            <button onClick={() => setShowAddForm(true)} className="bg-blue-600 text-white px-4 py-2 rounded shadow">Add Admin</button>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">All Admins</h2>
            <p className="text-gray-500">Admin list functionality coming soon...</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default AllAdmins 