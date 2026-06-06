"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { LockClosedIcon, UserIcon } from "@heroicons/react/24/outline";
import { SubmitHandler, useForm } from "react-hook-form";

type Inputs = {
  username: string;
};

const ForgetPassword = () => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<Inputs>();
  const onSubmit: SubmitHandler<Inputs> = (data) => data;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex justify-center items-center flex-col gap-y-6 "
    >
      <div className="icon w-[268.16px] h-[71px]">NIRTHYA</div>
      <h1 className=" font-[700] text-[20px]">Forget Password</h1>
      <div>
        <label
          className="w-[74px] h-[17px] text-[14px] font-normal"
          htmlFor="username"
        >
          User Name
        </label>
        <div className="flex relative items-center ">
          <Input
            type="email"
            id="username"
            className="w-[322px]  h-[40px] border-[1px] border-[#EEF0F4] rounded-md pl-7"
            placeholder="username@gmail.com"
            {...register("username", {
              required: "User name is required",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Invalid email address",
              },
            })}
          />
          <UserIcon className="w-[14px] h-[17px] text-[#445069] absolute left-2" />
        </div>
        {errors.username && (
          <span className="text-red-600 text-xs">
            {errors.username.message}
          </span>
        )}
      </div>

      <Button type="submit" variant={"violetFill"}>
        Get Link
      </Button>
      <Link href="/login" className="underline text-[#75172f]">
        Back to Login
      </Link>
    </form>
  );
};

export default ForgetPassword;
