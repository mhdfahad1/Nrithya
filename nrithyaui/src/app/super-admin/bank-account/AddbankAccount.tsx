import {
  AddBankAccountApi,
  EditBankAccountApi,
  IndividualgetBankAccounts,
} from "@/api/bankAccount";
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
import { toast } from "@/components/ui/use-toast";
import {
  BankAccountPaylod,
  EditBankAccountPaylod,
} from "@/Interfaces/bankAccount";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, PlusCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
type FormType = {
  bank_id: number;

  acc_name: string;
  acc_no: string;
  bank_name: string;
  branch_name: string;
};
type DataType = {
  bank_id: number;
  account_holder: string;
  bank_name: string;
  account_number: string;
  branch: string;
  status: boolean;
  created_at: string;
  updated_at: string;
};
type Props = {
  AccountDetails?: DataType;
};
const AddbankAccount = ({ AccountDetails }: Props) => {
  const QueryClient = useQueryClient();

  const [open, setOpen] = useState(false);

  const { register, handleSubmit, formState, control, setValue, reset } =
    useForm<FormType>();
  const { errors } = formState;

  const OnSubmit = (data: FormType) => {
    if (AccountDetails) {
      oneditBankAccount.mutate(data);
    } else {
      onAddBankAccount.mutate(data);
    }
  };
  const {
    data: individualbankAccounts,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["idividualbankaccount", AccountDetails?.bank_id],
    queryFn: () =>
      IndividualgetBankAccounts(
        AccountDetails?.bank_id ? String(AccountDetails?.bank_id) : ""
      ),

    enabled: !!AccountDetails?.bank_id,
  });

  const onAddBankAccount = useMutation({
    mutationFn: async (value: FormType) => {
      const payload: BankAccountPaylod = {
        account_holder: value.acc_name,
        account_number: String(value.acc_no),
        bank_name: value.bank_name,
        branch: value.branch_name,
      };
      return await AddBankAccountApi(payload);
    },
    onSuccess: () => {
      toast({
        variant: "Success",
        title: "Success",
        description: "Bank Account Added successfully...",
        duration: 2000,
      });
      QueryClient.invalidateQueries({ queryKey: ["bankaccount"] });
      reset();

      setTimeout(() => {
        setOpen(false);
      }, 2000);
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

  const oneditBankAccount = useMutation({
    mutationFn: async (value: FormType) => {
      const payload: EditBankAccountPaylod = {
        bank_id: value.bank_id,
        account_holder: value.acc_name,
        account_number: String(value.acc_no),
        bank_name: value.bank_name,
        branch: value.branch_name,
      };
      return await EditBankAccountApi(payload);
    },
    onSuccess: () => {
      toast({
        variant: "Success",
        title: "Success",
        description: "Bank Account Edited successfully...",
        duration: 2000,
      });
      QueryClient.invalidateQueries({ queryKey: ["bankaccount"] });
      reset();
      setTimeout(() => {
        setOpen(false);
      }, 2000);
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
  useEffect(() => {
    if (individualbankAccounts) {
      setValue("acc_name", individualbankAccounts.account_holder);
      setValue("acc_no", individualbankAccounts.account_number);
      setValue("bank_name", individualbankAccounts.bank_name);
      setValue("branch_name", individualbankAccounts.branch);
      setValue("bank_id", individualbankAccounts.bank_id);
    }
  }, [individualbankAccounts]);
  return (
    <div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {!AccountDetails ? (
            <Button onClick={() => setOpen(true)} variant={"primary"}>
              <PlusCircle className="h-4 w-4 mr-1" />
              <span>Add Bank Account</span>
            </Button>
          ) : (
            <div
              onClick={() => {
                setOpen(true);
                refetch();
              }}
              className="text-blue-500 flex items-center text-sm p-1 cursor-pointer pl-2"
            >
              <Pencil size={"15"} className="text-blue-500 mr-2" /> Edit
            </div>
          )}
        </DialogTrigger>
        {open ? (
          <DialogContent className="w-[450px]">
            <form onSubmit={handleSubmit(OnSubmit)}>
              <DialogHeader>
                <DialogTitle>Add Bank Account</DialogTitle>
              </DialogHeader>
              <div className="flex-row gap-10 mt-5">
                <div className="grid grid-cols-[1fr,1fr] gap-3">
                  <div className="flex-row gap-1">
                    <Label htmlFor="name" className="py-3">
                      Account holder Name
                      <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Input
                      id="name"
                      className="col-span-3 mb-2"
                      {...register("acc_name", {
                        required: {
                          value: true,
                          message: "Account holder name is required",
                        },
                        pattern: {
                          value: /^[a-zA-Z ]/,
                          message: "Invalid Account holder name",
                        },
                      })}
                    />
                    <p className="text-xs text-red-700 pt-1 pl-1">
                      {errors.acc_name?.message}
                    </p>
                  </div>
                  <div className="flex-row gap-1 ">
                    <Label htmlFor="name" className="py-3">
                      Account Number<span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Input
                      id="name"
                      className="col-span-3 mb-2"
                      {...register("acc_no", {
                        required: {
                          value: true,
                          message: "Account Number is required",
                        },
                        pattern: {
                          value: /^[0-9]+$/,
                          message: "Only numbers are allowed",
                        },
                        minLength: {
                          value: 5,
                          message:
                            "Min length of the field should be 5 characters",
                        },
                      })}
                    />
                    <p className="text-xs text-red-700 pt-1 pl-1">
                      {errors.acc_no?.message}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-[1fr,1fr] gap-3">
                  <div className="flex-row gap-1 ">
                    <Label htmlFor="name" className="py-3">
                      Bank Name<span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Input
                      id="name"
                      className="col-span-3 mb-2"
                      {...register("bank_name", {
                        required: {
                          value: true,
                          message: "Bank name is required",
                        },
                      })}
                    />
                    <p className="text-xs text-red-700 pt-1 pl-1">
                      {errors.bank_name?.message}
                    </p>
                  </div>
                  <div className="flex-row gap-1 ">
                    <Label htmlFor="name" className="py-3">
                      Branch Name<span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Input
                      id="name"
                      className="col-span-3 mb-2"
                      {...register("branch_name", {
                        required: {
                          value: true,
                          message: "Branch name is required",
                        },
                      })}
                    />
                    <p className="text-xs text-red-700 pt-1 pl-1">
                      {errors.branch_name?.message}
                    </p>
                  </div>
                </div>
              </div>

              <DialogFooter>
                {AccountDetails ? (
                  <Button type="submit" variant="primary">
                    Edit
                  </Button>
                ) : (
                  <Button type="submit" variant="primary">
                    Add
                  </Button>
                )}
              </DialogFooter>
            </form>
          </DialogContent>
        ) : null}
      </Dialog>
    </div>
  );
};

export default AddbankAccount;
