import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import AdminManagement from "./add-user/page";
import useUpdateUserStatus from "./updateUserStatus";
import { useState } from "react";
import { Row } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { CircleCheck, CircleX, MoreHorizontal, Pencil } from "lucide-react";
type DataType = {
  user_id: number;
  user_name: string;
  status: string;
};
const UserAction = ({ row }: { row: Row<DataType> }) => {
  const { toast } = useToast();
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const { onUpdateUserStatusApiCall, statusToast } = useUpdateUserStatus();

  const data = row.original;

  const handleUpdateStatus = (status: string) => {
    onUpdateUserStatusApiCall.mutate({ user_id: data.user_id, status });
    statusToast;
  };

  return (
    <div className="text-center">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button aria-haspopup="true" size="icon" variant="ghost">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem
            className="text-blue-500"
            onClick={() => setShowUpdateModal(true)}
          >
            <Pencil size={"15"} className="text-blue-500 mr-2" /> Edit
          </DropdownMenuItem>
          {data.status === "active" ? (
            <DropdownMenuItem
              className="text-orange-500"
              onClick={() => handleUpdateStatus("inactive")}
            >
              <CircleX size={"15"} className="text-orange-500 mr-2" /> Disable
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              className="text-green-500"
              onClick={() => handleUpdateStatus("active")}
            >
              <CircleCheck size={"15"} className="text-green-500 mr-2" /> Enable
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showUpdateModal} onOpenChange={setShowUpdateModal}>
        <DialogContent className="sm:max-w-[50%] ">
          <DialogHeader>
            <DialogTitle>Update User</DialogTitle>
            <DialogDescription>Update the user details here.</DialogDescription>
          </DialogHeader>
          <div className=" w-[100%]">
            <AdminManagement
              setShowUpdateModal={setShowUpdateModal}
              toast={toast}
              isUpdate={true}
              initialData={{
                user_name: data.user_name,
                user_id: data.user_id,
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
export default UserAction;
