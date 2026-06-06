import React from 'react'
import TeacherDetail from './teacherDetail'

type Props = {
  params: { teacherId: string };
};
const page = ({ params }: Props) => {
  
  return (
    <div>
      <TeacherDetail teacherId={params.teacherId}/>
    </div>
  )
}

export default page
