import React from 'react'
import EnquirytypeList from './enquirytypeList'
import Navbar from '@/app/Components/Navbar'

const Page = () => {
  return (
    <div>
       <Navbar name='Enquiry Type'/>
      <EnquirytypeList/>
    </div>
  )
}

export default Page
