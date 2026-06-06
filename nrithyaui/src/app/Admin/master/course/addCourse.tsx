import { addCourse, updateCourse } from "@/api/course";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { AddCourseType, CourseType } from "@/Interfaces/course";
import { DialogClose } from "@radix-ui/react-dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Pencil, PlusCircle } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

function AddCourse() {
  const [open, setOpen] = useState(false);

  const { toast } = useToast();

  const form = useForm<CourseType>({
    defaultValues: {
      course_name: "",
    },
  });
  const { register, handleSubmit, formState, setValue } = form;
  const { errors } = formState;

  const onSubmit = (data: CourseType) => {
    onAddCourse.mutate(data);
  };

  // add
  const queryClient = useQueryClient();
  const onAddCourse = useMutation({
    mutationFn: async (data: CourseType) => {
      const payload: AddCourseType = {
        course_name: data.course_name,
      };
      return await addCourse(payload);
    },

    onSuccess: () => {
      toast({
        variant: "Success",
        title: "Success",
        description: "Course added successfully...",
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

  return (
    <div>
      <Button
        size="sm"
        className="h-9 gap-1 "
        variant={"primary"}
        onClick={() => setOpen(true)}
      >
        <PlusCircle className="h-3.5 w-3.5" />
        Add Course
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className=" w-[500px]">
          <form onSubmit={handleSubmit(onSubmit)}>
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
                  pattern: {
                    value: /^(?!\s).*$/,
                    message: "Name cannot start with a space",
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
                  Submit
                </Button>
              </DialogClose>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AddCourse;
