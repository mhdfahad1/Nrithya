import React from 'react'
import CourseList from './courseList'
import Navbar from '@/app/Components/Navbar'
const page = () => {
  return (
    <div>
       <Navbar name='Course'/>
      <CourseList/>
    </div>
  )
}

export default page


