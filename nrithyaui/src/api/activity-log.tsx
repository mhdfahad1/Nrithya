import { ActivityLogRootObject } from "@/Interfaces/activityLog";
import { UserListRootObject } from "@/Interfaces/AuditUser";
import { axiosInstance } from "@/service/axios";

export const ActivitylogList = async (
  date: string,
  userId: string,
  pageNum: number
) => {
  const response = await axiosInstance.get<ActivityLogRootObject>(
    `/auditlog?date=${date}&user_id=${
      userId ? Number(userId) : ""
    }&page=${pageNum}&limit=25`
  );
  return response.data.payload;
};

export const UsersList = async () => {
  const response = await axiosInstance.get<UserListRootObject>(
    `/users?pagenation=none`
  );
  return response.data.payload.data;
};
