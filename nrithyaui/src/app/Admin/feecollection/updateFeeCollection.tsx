import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CircleUser, Upload } from "lucide-react";
import React, { ChangeEvent, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { SubmitHandler, useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { addStatusFeeCollection } from "@/api/feeCollection";
import Image from "next/image";
import { AddFeePayload } from "@/Interfaces/feeCollection";
import { Datum } from "@/Interfaces/ListBankDetails";
import { getBankDetails } from "@/api/bankdetails";

type AddFeeCollectionProps = {
  student_id: number;
  payment_id: number;
  first_name: string;
  last_name: string;
};

export type FormValues = {
  payment_id: string;
  transaction_id: string;
  paid_date: string;
  remarks: string;
  bank_id: string;
  file: File;
};

function UpdateFeeCollection({
  student_id,
  payment_id,
  first_name,
  last_name,
}: AddFeeCollectionProps) {
  const { toast } = useToast();
  const form = useForm<FormValues>();
  const { register, control, handleSubmit, setValue, formState } = form;
  const { errors, isLoading, isSubmitting } = formState;
  const [toggle, setToggle] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();

  const [file, setFile] = useState<File>();
  const [preview, setPreview] = useState("");

  const handleUpload = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);

      setPreview(URL?.createObjectURL(e.target.files[0]));
    }
  };

  //List bank details
  const { data: bankdetails } = useQuery<Datum[]>({
    queryKey: ["bnkdtils"],
    queryFn: () => getBankDetails(),
  });

  //Add fee collection
  const onFeeCollection = useMutation({
    mutationFn: async (value: FormValues) => {
      const payload: AddFeePayload = {
        payment_id: String(payment_id),
        transaction_id: value.transaction_id,
        paid_date: value.paid_date,
        bank_id: value.bank_id,
        remarks: value.remarks,
        file: file !== undefined ? file : "",
      };

      return await addStatusFeeCollection(payload);
    },
    onSuccess: () => {
      toast({
        variant: "Success",
        title: "Success",
        description: "Fee Updated successfully...",
        duration: 2000,
      });

      queryClient.invalidateQueries({ queryKey: ["feecollections"] });

      setToggle(false);
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
  const onSubmit: SubmitHandler<FormValues> = (value: FormValues) => {
    onFeeCollection.mutate(value);
  };

  return (
    <div>
      <div className="text-center ">
        <Dialog>
          <DialogTrigger asChild>
            <Button
              onClick={() => setToggle(true)}
              variant={"violetFill"}
              className="text-[12px] h-fit"
            >
              Mark Payment
            </Button>
          </DialogTrigger>
          {toggle ? (
            <DialogContent className="sm:max-w-[425px] overflow-y-scroll max-h-[500px]">
              <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-1  font-bold">
                    <CircleUser />
                    {first_name}&nbsp;
                    {last_name}
                  </DialogTitle>

                  <DialogDescription>
                    Make changes students payment details.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-10 mt-1">
                  <div className="grid grid-cols-[80px,1fr] items-center gap-4 -mb-5 ">
                    <Label htmlFor="name" className="text-right">
                      Account:<span className="text-red-500 ml-1">*</span>
                    </Label>

                    <div>
                      <select
                        className="col-span-3 h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        id=""
                        {...register("bank_id", {
                          required: {
                            value: true,
                            message: "Acoount Details is required",
                          },
                        })}
                      >
                        <option value="" hidden>
                          Select Account
                        </option>
                        {bankdetails?.map((item) => (
                          <option key={item.bank_id} value={item.bank_id}>
                            {item.bank_name} - {item.account_number.slice(-4)}
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-red-700 pt-1 pl-1">
                        {errors.bank_id?.message}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-[80px,1fr] items-center gap-4 -mb-5 ">
                    <Label htmlFor="name" className="text-right">
                      Paid Date:<span className="text-red-500 ml-1">*</span>
                    </Label>

                    <div>
                      <Input
                        className="col-span-3"
                        id="state"
                        type="date"
                        placeholder="Enter Paid Date"
                        {...register("paid_date", {
                          required: {
                            value: true,
                            message: "Paid Date is required",
                          },
                        })}
                      />
                      <p className="text-xs text-red-700 pt-1 pl-1">
                        {errors.paid_date?.message}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-[80px,1fr] items-center gap-4 -mb-5 ">
                    <Label htmlFor="name" className="text-right">
                      Remarks:
                    </Label>

                    <div>
                      <Input
                        className="col-span-3"
                        id="remarks"
                        type="text"
                        placeholder="Remarks"
                        {...register("remarks", {})}
                      />
                      <p className="text-xs text-red-700 pt-1 pl-1">
                        {errors.remarks?.message}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-[80px,1fr] items-center gap-4 -mb-5 ">
                    <Label htmlFor="name" className="text-right">
                      Transaction ID:
                    </Label>

                    <div>
                      <Input
                        className="col-span-3"
                        id="remarks"
                        type="text"
                        placeholder="Transaction ID"
                        {...register("transaction_id", {})}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="username" className="">
                      File Upload:<span className="text-red-500 ml-1">*</span>
                    </Label>

                    <div>
                      <Label
                        htmlFor="fileUpload"
                        className="flex aspect-square w-full items-center justify-center rounded-md border border-dashed"
                      >
                        <Input
                          type="file"
                          id="fileUpload"
                          className="hidden"
                          {...register("file", {
                            onChange: handleUpload,
                            required: true,
                          })}
                          name="file"
                          accept=".jpg,.jpeg,.png,.pdf"
                        />
                        <Upload className="h-4 w-4 text-muted-foreground" />
                      </Label>
                      <p className="text-xs text-red-700 pt-1 pl-1">
                        {errors?.file?.message}
                      </p>
                    </div>

                    <div className="col-span-2">
                      {preview ? (
                        <Image
                          className="w-[200px] h-[200px] object-cover inline-block relative"
                          src={preview ? preview : ""}
                          alt="screenshot"
                          width={10}
                          height={10}
                        />
                      ) : (
                        ""
                      )}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button className="mt-3" type="submit" variant={"primary"}>
                    Submit
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          ) : (
            ""
          )}
        </Dialog>
      </div>
    </div>
  );
}

export default UpdateFeeCollection;
