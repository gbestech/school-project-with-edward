
import React, { useState } from 'react'

// import Exams from '../../components/dashboards/admin/Exams'
import ExamFormModal from '../../components/dashboards/admin/exams/ExamFormModal'

const AdminExamsManagement = () => {
  const [isExamFormOpen, setExamFormOpen] = useState(false)

  const handleOpen = () => setExamFormOpen(true)
  const handleClose = () => setExamFormOpen(false)
  const handleSubmit = (data: any) => {
    // handle submitted exam data here
    console.log('Exam submitted', data)
    setExamFormOpen(false)
  }

  return (
    <div>
      <button onClick={handleOpen}>New Exam</button>
      <ExamFormModal open={isExamFormOpen} onClose={handleClose} onSubmit={handleSubmit} />
    </div>
  )
}

export default AdminExamsManagement