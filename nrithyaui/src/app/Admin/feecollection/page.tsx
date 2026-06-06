import React from 'react'
import ListFeeCollection from './listFeeCollection'
import Navbar from '@/app/Components/Navbar'
const page = () => {
  return (
    <div>
       <Navbar name='Fee Collection'/>
      <ListFeeCollection/>
    </div>
  )
}

export default page
