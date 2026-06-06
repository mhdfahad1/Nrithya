import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { AddCourseType, CourseType } from "@/Interfaces/course";
import { ToastAction } from "@/components/ui/toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteCourse, updateCourse } from "@/api/course";
import { useToast } from "@/components/ui/use-toast";

type AddCourseProps = {
  course_name?: string;
  course_id?: number;
};

function UpdateCourse({ course_name, course_id }: AddCourseProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (course_name && course_id) {
      setValue("course_name", course_name);
      setValue("course_id", course_id);
    }
  }, []);
  const form = useForm<CourseType>({
    defaultValues: {
      course_name: "",
      course_id: 0,
    },
  });
  const { register, handleSubmit, formState, setValue } = form;
  const { errors } = formState;

  const onUpdate = (data: CourseType) => {
    onUpdateCourse.mutate(data);
  };
  const queryClient = useQueryClient();
  const onUpdateCourse = useMutation({
    mutationFn: async (data: CourseType) => {
      const payload: CourseType = {
        course_id: data?.course_id,
        course_name: data?.course_name,
      };
      if (course_id !== undefined) {
        return await updateCourse(course_id, payload);
      }
    },

    onSuccess: () => {
      toast({
        variant: "Success",
        title: "Success",
        description: "Course updated successfully...",
        duration: 2000,
      });
      queryClient.invalidateQueries({ queryKey: ["course"] });
    },
    onError: (error: any) => {
      if (error) {
        toast({
          variant: "destructive",
          title: "Uh oh! Something went wrong.",
          description: error?.response?.data?.errorMessage,
        });
      }
    },
  });

  // delete
  const onDeleteCourse = useMutation({
    mutationFn: async (course_id: number) => {
      return await deleteCourse(course_id);
    },

    onSuccess: () => {
      toast({
        variant: "Success",
        title: "Success",
        description: "Course deleted successfully...",
        duration: 2000,
      });
      queryClient.invalidateQueries({ queryKey: ["course"] });
    },
    onError: (error: any) => {
      if (error) {
        toast({
          variant: "destructive",
          title: " Something went wrong.",
          description: error?.response?.data?.errorMessage,
        });
      }
    },
  });

  return (
    <div>
      <div className="text-center">
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button aria-haspopup="true" size="icon" variant="ghost">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem
              className="text-blue-500"
              onClick={() => setOpen(true)}
            >
              <Pencil size={"15"} className="text-blue-500 mr-2" /> Edit
            </DropdownMenuItem>
            {course_id !== undefined ? (
              <DropdownMenuItem
                className="text-red-500"
                onClick={() => onDeleteCourse.mutate(course_id)}
              >
                <Trash2 size={"15"} className="text-red-500 mr-2" /> Delete
              </DropdownMenuItem>
            ) : null}
          </DropdownMenuContent>
        </DropdownMenu>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className=" w-[500px]">
            <form onSubmit={handleSubmit(onUpdate)}>
              <DialogHeader>
                <DialogTitle>Add Course</DialogTitle>
              </DialogHeader>
              <div className="grid row-gap-3 ">
                <Label htmlFor="name" className="py-3">
                  Course Name
                  <span className="text-red-500 ml-1">*</span>
                </Label>
                <Input
                  id="name"
                  className="col-span-3 mb-2"
                  {...register("course_name", {
                    required: {
                      value: true,
                      message: "Course name is required",
                    },
                  })}
                />
                <p className="text-xs text-red-700 pt-1 pl-1">
                  {errors.course_name?.message}
                </p>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="submit" variant={"primary"}>
                    Update
                  </Button>
                </DialogClose>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

export default UpdateCourse;
