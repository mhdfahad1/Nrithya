"use client";

import { createUser, updateUser } from "@/api/adminManagement";
import Navbar from "@/app/Components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ButtonLoading } from "@/components/ui/loading-button";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/components/ui/use-toast";
import {
  CreateUserPayloadType,
  UpdateUserPayloadType,
} from "@/Interfaces/User";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { ReactElement, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
type Inputs = {
  user_name: string;
  password: string;
};

type UserData = {
  user_name: string;
  user_id: number;
};
type ToastAction = ReactElement<any, any>;

type Toast = {
  variant: "default" | "destructive" | "Success" | null | undefined;
  title: string;
  description?: string;
  action?: ToastAction;
};

type AdminManagementProps = {
  isUpdate: boolean;
  initialData?: UserData;
  toast: ({ ...props }: Toast) => {
    id: string;
    dismiss: () => void;
  };
  setShowUpdateModal: React.Dispatch<React.SetStateAction<boolean>>;
};
const AdminManagement: React.FC<any> = ({
  toast,
  isUpdate = false,
  initialData,
  setShowUpdateModal,
}: AdminManagementProps) => {
  const { toast: addUserToast } = useToast();
  const router = useRouter();
  const queryClient = useQueryClient();
  const onCreateUserApiCall = useMutation({
    mutationFn: async (value: Inputs) => {
      const payload: CreateUserPayloadType = {
        user_name: value?.user_name,
        password: value?.password,
        user_role: "admin",
      };
      return await createUser(payload);
    },
    onSuccess: () => {
      addUserToast({
        variant: "Success",
        title: "Success",
        description: "User added successfully...",
      });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      router.back();
    },
    onError: (error: any) => {
      if (error) {
        addUserToast({
          variant: "destructive",
          title: "Something went wrong!",
          description: error?.response?.data?.errorMessage,
        });
      }
    },
  });
  const onUpdateUserApiCall = useMutation({
    mutationFn: async (value: Inputs) => {
      if (value.password !== "" && value.user_name === initialData?.user_name) {
        const payload: UpdateUserPayloadType = {
          user_id: initialData?.user_id,
          password: value.password,
        };
        const user_id = initialData?.user_id;
        return await updateUser(payload, user_id);
      } else if (
        initialData?.user_id !== undefined &&
        (value.password !== "" || value.user_name !== initialData?.user_name)
      ) {
        const payload: UpdateUserPayloadType = {
          user_id: initialData?.user_id,
          user_name: value?.user_name,
          password: value?.password,
        };
        const user_id = initialData?.user_id;
        return await updateUser(payload, user_id);
      }
    },
    onSuccess: () => {
      toast({
        variant: "Success",
        title: "Success",
        description: "User updated successfully...",
      });
      setShowUpdateModal(false);
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error: any) => {
      if (error) {
        toast({
          variant: "destructive",
          title: "Something went wrong!",
          description: error?.response?.data?.errorMessage,
        });
      }
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isLoading, isSubmitting },
    reset,
  } = useForm<Inputs>({
    defaultValues: initialData
      ? {
          user_name: initialData?.user_name,
          password: "",
        }
      : {},
  });

  const onSubmit: SubmitHandler<Inputs> = (value: Inputs) => {
    if (isUpdate) {
      onUpdateUserApiCall.mutate(value);
    } else {
      onCreateUserApiCall.mutate(value);
    }
  };

  const [viewPassword, setViewPassword] = useState(false);

  return (
    <>
      {isUpdate === false && <Navbar name="Add User" />}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className={
          isUpdate
            ? " bg-white  rounded  flex flex-col px-5   "
            : " bg-white shadow-md rounded px-8 pt-6 pb-8 mt-[2rem] ms-[2rem] me-[1.3rem] flex flex-col  gap-y-3  "
        }
      >
        {isUpdate === false && <Toaster />}

        <div
          className={
            isUpdate
              ? "flex flex-row justify-between w-[100%] pb-7"
              : "flex flex-row justify-between w-[100%] "
          }
        >
          {/* User name */}
          <div className="w-[48%]">
            <label
              className="block text-[#75172F]  font-bold mb-2"
              htmlFor="username"
            >
              Username<span className="text-red-500 ml-1">*</span>
            </label>
            <div className="flex relative  items-center shadow appearance-none border rounded text-gray-700 leading-tight focus:outline-none focus:shadow-outline w-full ">
              <Input
                type="text"
                id="username"
                className="  h-[40px] border-[1px] border-[#EEF0F4] rounded-md pl-7"
                placeholder="username"
                {...register("user_name", {
                  required: "User name is required",
                  pattern: {
                    value: /^(?!\s).*$/,
                    message: "Cannot start with a space",
                  },
                })}
              />
            </div>
            {errors.user_name && (
              <span className="text-red-600 text-xs">
                {errors.user_name.message}
              </span>
            )}
          </div>
          <div className="w-[48%]">
            <label
              className=" block text-black  font-bold mb-2"
              htmlFor="password"
            >
              Password<span className="text-red-500 ml-1">*</span>
            </label>
            <div className="flex relative items-center  shadow appearance-none border rounded text-gray-700 leading-tight focus:outline-none focus:shadow-outline w-full">
              <Input
                type={viewPassword ? "text" : "password"}
                className="  h-[40px] border-[1px] border-[#EEF0F4] rounded-md pl-7 pr-20"
                id="password"
                placeholder="password"
                {...register("password", {
                  required: isUpdate ? false : "Password is required",
                  pattern: {
                    value: /^(?!\s).*$/,
                    message: "Cannot start with a space",
                  },
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters long",
                  },
                })}
              />
              {viewPassword ? (
                <Button
                  className="h-[17px] text-[#445069]  absolute right-2"
                  type="button"
                  variant={"link"}
                  onClick={() => setViewPassword(false)}
                >
                  <EyeOff />
                </Button>
              ) : (
                <Button
                  className="h-[17px] text-[#445069]  absolute right-2"
                  type="button"
                  variant={"link"}
                  onClick={() => setViewPassword(true)}
                >
                  <Eye />
                </Button>
              )}
            </div>
            {errors.password && (
              <span className="text-red-600 text-xs ">
                {errors?.password?.message}
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-row-reverse justify-right gap-3 ">
          {isLoading || isSubmitting ? (
            <ButtonLoading />
          ) : (
            <Button type="submit" variant={"primary"}>
              {isUpdate ? "Update User" : "Add User"}
            </Button>
          )}

          <Button
            onClick={
              isUpdate
                ? () => {
                    setShowUpdateModal(false);
                  }
                : router.back
            }
            className=" border-[#75172f] text-[#75172f] hover:text-[#75172f]"
            type="button"
            variant={"outline"}
          >
            Cancel
          </Button>
        </div>
      </form>
    </>
  );
};

export default AdminManagement;
