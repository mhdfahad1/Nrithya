import React from 'react'
import ListAssignment from './listAssignment'
import Navbar from '@/app/Components/Navbar'
const page = () => {
  return (
    <div>
       <Navbar name='Assignment'/>
      <ListAssignment/>
    </div>
  )
}

export default page
