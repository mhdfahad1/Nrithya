"use client";
import Image from "next/image";
import React, { useEffect } from "react";
import profile from "../images/profilepic.jpg";
import { usePathname, useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  CircleUser,
  CircleUserRound,
  EllipsisVertical,
  Pencil,
  RotateCcw,
  Settings,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { getUserDetail } from "@/api/routeManagement";
import { useQuery } from "@tanstack/react-query";

type Iprops = {
  name: string;
  setRole?: React.Dispatch<React.SetStateAction<string>>;
};

const Navbar = ({ name, setRole }: Iprops) => {
  const { isError, data, isLoading, isPending } = useQuery({
    queryKey: ["userdetail"],
    queryFn: async () => getUserDetail(),
  });
  const path = usePathname();
  const route = useRouter();
  useEffect(() => {
    if (data?.userRole) {
      if (setRole !== undefined) {
        setRole(data?.userRole);
      }
      if (path?.includes("/super-admin") && data?.userRole !== "superadmin") {
        route.push("/unAuth");
      }
      if (path?.includes("/Admin") && data?.userRole !== "admin") {
        route.push("/unAuth");
      }
    }
  }, [path, data?.userRole]);
  return (
    <div className="pl-[207px]">
      <div className="bg-white shadow-md  fixed w-[100%] pr-44 z-10 -ml-48 -mt-12">
        <nav className="container mx-auto flex justify-between items-center  py-2 pb-1  ">
          <div className="text-xl font-bold px-7 text-black ">{name}</div>
          <div className="flex items-center justify-end px-9 gap-3">
            <i className="fa-solid fa-user text-black text-2xl"></i>
            <div className="mr-4 flex flex-col gap-0">
              <h4 className="text-sm font-bold text-black">
                {" "}
                {data?.userName}
              </h4>
              <span className="text-xs text-black">
                {data?.userRole === "superadmin"
                  ? "Super Admin"
                  : data?.userRole === "admin" && "Admin"}
              </span>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button aria-haspopup="true" size="icon" variant="ghost">
                  <Settings className=" text-black" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <Link
                  href={
                    data?.userRole === "superadmin"
                      ? "/super-admin/reset-password"
                      : "/Admin/reset-password"
                  }
                >
                  <DropdownMenuItem className="text-black flex gap-2  hover:bg-[#DBEAFE] hover:text-black">
                    <i className="fa-solid fa-lock"></i>
                    Reset Password
                  </DropdownMenuItem>
                </Link>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </nav>
      </div>
    </div>
  );
};

export default Navbar;
