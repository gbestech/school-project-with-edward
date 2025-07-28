import React from 'react'
import StudentList from '@/components/dashboards/student/StudentList'

const Allstudents = () => {
  return (
    <div>
        {/* <h1 className='font-bold text-4xl text-blue-500 p-4'>
            All Students Dashboard
        </h1> */}
        <StudentList />
    </div>
  )
}

export default Allstudents