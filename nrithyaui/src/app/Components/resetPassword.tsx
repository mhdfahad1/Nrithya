"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LockClosedIcon } from "@heroicons/react/24/outline";
import { useForm } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ToastAction } from "@radix-ui/react-toast";
import { Toaster } from "@/components/ui/toaster";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { resetPasswordApi } from "@/api/resetPassword";

type Inputs = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};
export type Reset = {
  password: string;
  new_password: string;
};

const ResetPassword = () => {
  const [confirmPassword, SetconfirmPassword] = useState("");
  const [currentpassword, setCurrentPassword] = useState("");
  const [viewCurrentPassword, setViewCurrentPassword] = useState(false);
  const [viewNewPassword, setViewNewPassword] = useState(false);
  const [viewConfirmPassword, setViewConfirmPassword] = useState(false);

  const { toast } = useToast();
  const router = useRouter();
  const queryClient = useQueryClient();
  const form = useForm<Inputs>();

  const { register, control, handleSubmit, setValue, formState, watch } = form;
  const { errors, isLoading, isSubmitting } = formState;

  const onResetPassword = useMutation({
    mutationFn: async (value: Inputs) => {
      const payload: Reset = {
        password: value.currentPassword,
        new_password: value.newPassword,
      };
      return await resetPasswordApi(payload);
    },

    onSuccess: () => {
      toast({
        variant: "Success",
        title: "Success",
        description: "Password updated successfully...",
        duration: 2000,
      });
      router.push("/login");
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
  const onSubmit = (value: Inputs) => {
    onResetPassword.mutate(value);
  };

  return (
    <>
      <Toaster />

      <form
        onSubmit={handleSubmit(onSubmit)}
        className=" flex items-center flex-col w-full gap-y-6 p-6 h-screen "
      >
        <div className=" bg-white p-7 w-full rounded flex flex-col items-center justify-center gap-y-3">
          {/* Current Password input field */}
          <div className="w-[100%]">
            <label
              className="block text-[#75172F]  font-bold mb-2 text-[14px] "
              htmlFor="currentPassword"
            >
              Current Password
            </label>
            <div className="flex relative items-center ">
              <Input
                type={viewCurrentPassword ? "text" : "password"}
                className="  h-[40px] border-[1px] border-[#EEF0F4] rounded-md pl-7"
                id="currentPassword"
                placeholder="Current password"
                {...register("currentPassword", {
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters long",
                  },
                })}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
              <br />

              {viewCurrentPassword ? (
                <Button
                  className="h-[17px] text-[#445069]  absolute right-2"
                  type="button"
                  variant={"link"}
                  onClick={() => setViewCurrentPassword(false)}
                >
                  <EyeOff />
                </Button>
              ) : (
                <Button
                  className="h-[17px] text-[#445069]  absolute right-2"
                  type="button"
                  variant={"link"}
                  onClick={() => setViewCurrentPassword(true)}
                >
                  <Eye />
                </Button>
              )}

              <LockClosedIcon className="w-[14px] h-[17px] text-[#445069] absolute left-2" />
            </div>
            {errors.currentPassword && (
              <span className="text-red-600 text-xs">
                {errors.currentPassword.message}
              </span>
            )}
          </div>

          <>
            <div className="w-[100%]">
              <label
                className="block text-[#75172F]  font-bold mb-2 text-[14px] "
                htmlFor="newPassword"
              >
                New Password
              </label>
              <div className="flex relative items-center ">
                <Input
                  type={viewNewPassword ? "text" : "password"}
                  className="  h-[40px] border-[1px] border-[#EEF0F4] rounded-md pl-7"
                  id="newPassword"
                  placeholder="New password"
                  {...register("newPassword", {
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters long",
                    },
                  })}
                />
                {viewNewPassword ? (
                  <Button
                    className="h-[17px] text-[#445069]  absolute right-2"
                    type="button"
                    variant={"link"}
                    onClick={() => setViewNewPassword(false)}
                  >
                    <EyeOff />
                  </Button>
                ) : (
                  <Button
                    className="h-[17px] text-[#445069]  absolute right-2"
                    type="button"
                    variant={"link"}
                    onClick={() => setViewNewPassword(true)}
                  >
                    <Eye />
                  </Button>
                )}

                <LockClosedIcon className="w-[14px] h-[17px] text-[#445069] absolute left-2" />
              </div>
              {errors.newPassword && (
                <span className="text-red-600 text-xs">
                  {errors.newPassword.message}
                </span>
              )}
            </div>

            <div className="w-[100%]">
              <label
                className="block text-[#75172F]  font-bold mb-2 text-[14px] "
                htmlFor="confirmPassword"
              >
                Confirm Password
              </label>
              <div className="flex relative items-center ">
                <Input
                  type={viewConfirmPassword ? "text" : "password"}
                  className="  h-[40px] border-[1px] border-[#EEF0F4] rounded-md pl-7"
                  id="confirmPassword"
                  placeholder="Confirm password"
                  {...register("confirmPassword", {
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters long",
                    },
                    validate: (value) =>
                      value === watch("newPassword") ||
                      "Passwords do not match",
                  })}
                />
                {viewConfirmPassword ? (
                  <Button
                    className="h-[17px] text-[#445069]  absolute right-2"
                    type="button"
                    variant={"link"}
                    onClick={() => setViewConfirmPassword(false)}
                  >
                    <EyeOff />
                  </Button>
                ) : (
                  <Button
                    className="h-[17px] text-[#445069]  absolute right-2"
                    type="button"
                    variant={"link"}
                    onClick={() => setViewConfirmPassword(true)}
                  >
                    <Eye />
                  </Button>
                )}

                <LockClosedIcon className="w-[14px] h-[17px] text-[#445069] absolute left-2" />
              </div>
              {errors.confirmPassword && (
                <span className="text-red-600 text-xs">
                  {errors.confirmPassword.message}
                </span>
              )}
            </div>
          </>

          <Button type="submit" variant={"violetFill"}>
            Reset Password
          </Button>
        </div>
      </form>
    </>
  );
};

export default ResetPassword;
