"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LockClosedIcon, UserIcon } from "@heroicons/react/24/outline";
import { SubmitHandler, useForm } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { login } from "@/api/userManagement";
import { LoginPayloadType, LoginSuccessType } from "@/Interfaces/Login";
import { useRouter } from "next/navigation";
import { LocalStorage } from "@/app/utility/localstorage";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { ButtonLoading } from "@/components/ui/loading-button";

type Inputs = {
  user_name: string;
  password: string;
};

const LoginInput = () => {
  const { toast: loginToast } = useToast();
  const router = useRouter();
  const onLoginApiCall = useMutation({
    mutationFn: async (payload: LoginPayloadType) => {
      return await login(payload);
    },
    onSuccess: (data: LoginSuccessType) => {
      LocalStorage.setItem("authToken", data.payload.tokens.access_token);
      LocalStorage.setItem("refreshToken", data.payload.tokens.refresh_token);
      LocalStorage.setItem("user", JSON.stringify(data.payload.user_details));
      data.payload.user_details.user_role === "admin"
        ? (window.location.href = "/Admin/calendar")
        : (window.location.href = "/super-admin/dashboard");
    },
    onError: (error: any) => {
      if (error) {
        loginToast({
          variant: "destructive",
          title: "Login Failed!",
          description: error?.response?.data?.errorMessage,
        });
      }
    },
  });
  const {
    register,
    handleSubmit,
    formState: { errors, isLoading, isSubmitting, isValidating },
  } = useForm<Inputs>();

  const onSubmit: SubmitHandler<Inputs> = (data: any) => {
    onLoginApiCall.mutate(data);
  };

  const [viewPassword, setViewPassword] = useState(false);

  return (
    <div className="login-background w-full h-screen flex items-center justify-center p-20">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="  flex justify-center items-center w-[80%]"
      >
        <Toaster />
        <div className="w-[100%] bg-white p-7 rounded flex flex-col items-center justify-center gap-y-3">
          <h1 className=" text-[#2563EB] font-[700] text-[30px] ">Login</h1>
          {/* User name input field */}
          <div className="w-[100%]">
            <label
              className="block text-black  font-bold mb-2"
              htmlFor="username"
            >
              Username
            </label>
            <div className="flex relative items-center shadow ">
              <Input
                type="text"
                id="username"
                className="  h-[40px] border-[1px] border-[#EEF0F4] rounded-md pl-7 shadow appearance-none     text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="username"
                {...register("user_name", {
                  required: "User name is required",
                })}
              />
              <UserIcon className="w-[14px] h-[17px] text-[#445069] absolute left-2" />
            </div>
            {errors.user_name && (
              <span className="text-red-600 text-xs">
                {errors.user_name.message}
              </span>
            )}
          </div>
          {/* Password input field */}
          <div className="w-[100%] mb-8">
            <label
              className="block text-black  font-bold mb-2"
              htmlFor="password"
            >
              Password
            </label>
            <div className="flex relative items-center shadow ">
              <Input
                type={viewPassword ? "text" : "password"}
                className="  h-[40px] border-[1px] border-[#EEF0F4] rounded-md pl-7 shadow appearance-none     text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="password"
                placeholder="password"
                {...register("password", {
                  required: "Password is required",
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

              <LockClosedIcon className="w-[14px] h-[17px] text-[#445069] absolute left-2" />
            </div>
            {errors.password && (
              <span className="text-red-600 text-xs">
                {errors.password.message}
              </span>
            )}
          </div>
          {isLoading || isSubmitting || isValidating ? (
            <ButtonLoading />
          ) : (
            <Button className="w-[100%]" type="submit" variant={"violetFill"}>
              Login
            </Button>
          )}
        </div>
      </form>
    </div>
  );
};

export default LoginInput;
