import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateUser } from "@/api/adminManagement";
import { UpdateUserPayloadType } from "@/Interfaces/User";
import { useToast } from "@/components/ui/use-toast";

const useUpdateUserStatus = () => {
  const { toast: statusToast } = useToast();
  const queryClient = useQueryClient();
  const onUpdateUserStatusApiCall = useMutation({
    mutationFn: async (data: { user_id: number; status: string }) => {
      const payload: UpdateUserPayloadType = {
        user_id: data.user_id,
        status: data.status,
      };

      return await updateUser(payload, data.user_id);
    },

    onSuccess: () => {
      statusToast({
        variant: "Success",
        title: "Success",
        description: "User status updated successfully...",
      });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error: any) => {
      if (error) {
        statusToast({
          variant: "destructive",
          title: "Something went wrong!",
          description: error?.response?.data?.errorMessage,
        });
      }
    },
  });

  return { onUpdateUserStatusApiCall, statusToast };
};

export default useUpdateUserStatus;
