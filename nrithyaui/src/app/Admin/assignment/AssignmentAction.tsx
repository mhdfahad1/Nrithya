import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/components/ui/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { assignmentDelete } from "@/api/assignment";
type AssignmentActionProp = {
  assignment_id: number;
};

function AssignmentAction({ assignment_id }: AssignmentActionProp) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const onDeleteAssignment = useMutation({
    mutationFn: async (teacherId: number) => {
      if (teacherId !== undefined) {
        return await assignmentDelete(assignment_id);
      }
    },

    onSuccess: () => {
      toast({
        variant: "Success",
        description: "Assignment deleted successfully...",
        duration: 2000,
      });
      queryClient.invalidateQueries({ queryKey: ["assignment"] });
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
    <div className="text-center">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button aria-haspopup="true" size="icon" variant="ghost">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <Link href={`/Admin/assignment/update-assignment/${assignment_id}`}>
            <DropdownMenuItem className="text-blue-500">
              <Pencil size={"15"} className="text-blue-500 mr-2" /> Edit
            </DropdownMenuItem>
          </Link>
          <DropdownMenuItem
            className="text-red-500"
            onClick={() => {
              onDeleteAssignment.mutate(assignment_id);
            }}
          >
            <Trash2 size={"15"} className="text-red-500 mr-2" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export default AssignmentAction;
