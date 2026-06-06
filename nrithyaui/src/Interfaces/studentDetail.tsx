export interface RootObject {
  success: boolean;
  payload: Payload;
}

export interface Payload {
  reg_no: string;
  student_id: number;
  first_name: string;
  last_name: string;
  gender: string;
  date_of_birth: string;
  address: string;
  place: string;
  city: string;
  state: string;
  alternative_number: string;
  whatsapp_number: string;
  email: string;
  registration_date: string;
  status: string;
  batches: {
    batches: {
      courses: {
        course_name: string;
      };
      teachers: {
        first_name: string;
        last_name: string;
      };
    };
    batch_name: string;
    joining_date: string;
  }[];
}
