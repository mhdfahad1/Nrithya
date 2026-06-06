import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Eye, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { TeacherDataType } from "./TeacherList";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteTeacher } from "@/api/teacherManagement";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";
import { Toaster } from "@/components/ui/toaster";

const TeacherAction = ({ data }: { data: TeacherDataType }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const onDeleteTeacher = useMutation({
    mutationFn: async (teacherId: number) => {
      if (teacherId !== undefined) {
        return await deleteTeacher(teacherId);
      }
    },

    onSuccess: () => {
      toast({
        variant: "Success",
        description: "Teacher deleted successfully...",
      });
      queryClient.invalidateQueries({ queryKey: ["teachers"] });
    },
    onError: (error: any) => {
      if (error) {
        toast({
          variant: "destructive",
          title: "Something went wrong.",
          description: error?.response?.data?.errorMessage,
        });
      }
    },
  });
  return (
    <div>
      <Toaster />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button aria-haspopup="true" size="icon" variant="ghost">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <Link href={`/Admin/teachers/${data.teacher_id}`}>
            {" "}
            <DropdownMenuItem className="text-yellow-600">
              <Eye size={"15"} className="text-yellow-600 mr-2" /> View
            </DropdownMenuItem>
          </Link>
          <Link href={`/Admin/teachers/update-teacher/${data.teacher_id}`}>
            <DropdownMenuItem className="text-blue-500">
              <Pencil size={"15"} className="text-blue-500 mr-2" /> Edit
            </DropdownMenuItem>
          </Link>
          <DropdownMenuItem
            className="text-red-500"
            onClick={() => onDeleteTeacher.mutate(data.teacher_id)}
          >
            <Trash2 size={"15"} className="text-red-500 mr-2" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default TeacherAction;
