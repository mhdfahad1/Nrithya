import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AddAttendanceType } from "@/Interfaces/batchAttendance";
import { DialogClose } from "@radix-ui/react-dialog";
import { Clock } from "lucide-react";
import React from "react";
import { UseFormRegister } from "react-hook-form";
type LateProps = {
  name: string;
  register?: UseFormRegister<AddAttendanceType>;
  index?: number;
  viewType: "student" | "teacher";
};

function LateComponent({ name, register, index, viewType }: LateProps) {
  return (
    <div>
      <Dialog>
        <DialogTrigger className=" ">
          <Clock className="h-4 w-4 mt-1" />
        </DialogTrigger>
        <DialogContent className="w-[450px]">
          <DialogHeader>
            <DialogTitle>{name}</DialogTitle>
          </DialogHeader>
          {viewType === "student" ? (
            <div className="grid gap-4 p-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="late" className="text-right">
                  Late by :
                </Label>
                {register && index !== undefined ? (
                  <Input
                    id="late"
                    className="col-span-3 border-2"
                    type="text"
                    {...register(`attendance.${index}.late_by`)}
                  />
                ) : null}
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="remarks" className="text-right">
                  Remarks :
                </Label>
                {register && index !== undefined ? (
                  <Input
                    id="remarks"
                    className="col-span-3 border-2"
                    type="text"
                    {...register(`attendance.${index}.reason`)}
                  />
                ) : null}
              </div>
            </div>
          ) : null}

          {viewType === "teacher" ? (
            <div className="grid gap-4 p-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="late" className="text-right">
                  Late by :
                </Label>
                {register !== undefined ? (
                  <Input
                    id="late"
                    className="col-span-3 border-2"
                    type="text"
                    {...register(`teacher_lateBy`)}
                  />
                ) : null}
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="remarks" className="text-right">
                  Remarks :
                </Label>
                {register !== undefined ? (
                  <Input
                    id="remarks"
                    className="col-span-3 border-2"
                    type="text"
                    {...register(`teacher_remarks`)}
                  />
                ) : null}
              </div>
            </div>
          ) : null}

          <DialogFooter>
            <DialogClose asChild>
              <Button type="submit" variant="primary">
                Mark Late
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default LateComponent;
