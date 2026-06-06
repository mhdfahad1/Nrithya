import {
  addEnquiryPayload,
  addEnquiryResponsePayload,
  addEnquiryTypePayload,
  editEnquiryPayload,
  GetEnquiryRootObject,
  GetEnquiryTypeComboBox,
  GetEnquiryTypeRootObject,
  updateEnquiryPayload,
  updateEnquiryResponsePayload,
  updateEnquiryTypePayload,
} from "@/Interfaces/Enquiry";
import { axiosInstance } from "@/service/axios";
// Enquiry
// add
const addEnquiry = async (payload: addEnquiryPayload) => {
  const response = await axiosInstance.post(`/enquries`, payload);
  return response.data;
};
// get
const getEnquiry = async (
  pageNum: number,
  searchKey: string,
  enquiryId: string,
  enquiryStatus: string,
  demoRequested: string,
  from: string,
  to: string,
  course: string,
  assignee: string,
  last_call: string,
  enquiry_date: string,
  follow_up: string
) => {
  try {
    const response = await axiosInstance.get<GetEnquiryRootObject>(
      `/enquries?page=${pageNum}&name=${searchKey}&enquiry_type=${
        enquiryId && Number(enquiryId)
      }&enquiry_status=${enquiryStatus}&demo_requested=${demoRequested}&from=${from}&to=${to}&limit=100&course=${
        course && Number(course)
      }&assignee=${
        assignee && Number(assignee)
      }&last_call=${last_call}&enquiry_date=${enquiry_date}&follow_up=${
        follow_up && Number(follow_up)
      }`
    );

    return response.data.payload;
  } catch (error) {
    throw error;
  }
};
// download
const downloadEnquiryList = async (
  searchKey: string,
  enquiryId: string,
  enquiryStatus: string,
  demoRequested: string,
  from: string,
  to: string,
  course: string,
  assignee: string,
  last_call: string,
  enquiry_date: string,
  follow_up: string
) => {
  try {
    const response = await axiosInstance.get(
      `/enquries?save=true&pagenation=none&name=${searchKey}&enquiry_type=${
        enquiryId && Number(enquiryId)
      }&enquiry_status=${enquiryStatus}&demo_requested=${demoRequested}&from=${from}&to=${to}&course=${
        course && Number(course)
      }&assignee=${
        assignee && Number(assignee)
      }&last_call=${last_call}&enquiry_date=${enquiry_date}&follow_up${
        follow_up && Number(follow_up)
      }`,
      {
        responseType: "blob",
        headers: {
          accept: "*/*",
        },
      }
    );
    return response?.data;
  } catch (error) {
    throw error;
  }
};
// edit
const editEnquiry = async (payload: editEnquiryPayload) => {
  const response = await axiosInstance.patch(`/enquries`, payload);
  return response.data;
};
// update
const updateEnquiry = async (payload: updateEnquiryPayload) => {
  const response = await axiosInstance.put(`/enquries`, payload);
  return response.data;
};

// Enquiry Type
const addEnquiryType = async (payload: addEnquiryTypePayload) => {
  try {
    const response = await axiosInstance.post(`/enquries/types`, payload);
    return response.data;
  } catch (error) {
    throw error;
  }
};
const getEnquiryType = async (pageNum: number, searchKey: string) => {
  try {
    const response = await axiosInstance.get<GetEnquiryTypeRootObject>(
      `/enquries/types?page=${pageNum}&enquiry_type=${searchKey}&limit=25`
    );
    return response?.data?.payload;
  } catch (error) {
    throw error;
  }
};
const deleteEnquiryType = async (enquiryTypeId: number) => {
  const response = await axiosInstance.delete(
    `/enquries/types?enq_type_id=${enquiryTypeId}`
  );
};
// enquirytype for combobox
const getComboboxEnquiryType = async () => {
  try {
    const response = await axiosInstance.get<GetEnquiryTypeComboBox>(
      `/enquries/types?pagenation=none`
    );
    return response?.data?.payload?.data;
  } catch (error) {
    throw error;
  }
};
// assignee for combobox
const getAssignee = async (courseId: number) => {
  try {
    const response = await axiosInstance.get(
      `/teachers?course_id=${courseId && Number(courseId)}`
    );

    return response?.data?.payload?.data;
  } catch (error) {
    throw error;
  }
};
const updateEnquiryType = async (payload: updateEnquiryTypePayload) => {
  try {
    const response = await axiosInstance.put(`/enquries/types`, payload);
    return response.data;
  } catch (error) {
    throw error;
  }
};
// Enquiry Response
const addEnquiryResponse = async (payload: addEnquiryResponsePayload) => {
  try {
    const response = await axiosInstance.post(`/enquries/responses`, payload);
    return response.data;
  } catch (error) {
    throw error;
  }
};
const getEnquiryResponse = async (pageNum: number, searchKey: string) => {
  try {
    const response = await axiosInstance.get(
      `/enquries/responses?page=${pageNum}&enquiry_response=${searchKey}`
    );

    return response.data.payload;
  } catch (error) {
    throw error;
  }
};
const updateEnquiryResponse = async (payload: updateEnquiryResponsePayload) => {
  try {
    const response = await axiosInstance.put(`/enquries/responses`, payload);
    return response.data;
  } catch (error) {
    throw error;
  }
};
// delete enquiry

const DeleteEnquiry = async (id: number) => {
  const response = await axiosInstance.delete(`/enquries?enquiry_id=${id}`);
  return response.data;
};
export {
  downloadEnquiryList,
  addEnquiryType,
  getEnquiryType,
  updateEnquiryType,
  addEnquiryResponse,
  getEnquiryResponse,
  getComboboxEnquiryType,
  updateEnquiryResponse,
  getAssignee,
  addEnquiry,
  getEnquiry,
  editEnquiry,
  updateEnquiry,
  deleteEnquiryType,
  DeleteEnquiry,
};
