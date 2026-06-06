"use client";
import { getUserDetail } from "@/api/routeManagement";
import { Inter } from "@next/font/google";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { LocalStorage } from "./utility/localstorage";
import { Loader2 } from "lucide-react";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

const Home = () => {
  const route = useRouter();
  const UserToken = LocalStorage.getItem("authToken");
  const { isError, data, isLoading, isPending } = useQuery({
    queryKey: ["userdetail"],
    queryFn: async () => getUserDetail(),
    enabled: !!UserToken,
  });

  useEffect(() => {
    if (UserToken === "" || UserToken === null) {
      route.push(`/login`);
    } else if (isError) {
      route.push(`/login`);
    } else if (data?.userRole === "admin") {
      route.push(`/Admin/calendar`);
    } else if (data?.userRole === "superadmin") {
      route.push(`/super-admin/dashboard`);
    }
  }, [UserToken, isError, data, isLoading]);

  return (
    <main
      className={`${inter.variable} font-sans flex items-center justify-center  h-screen`}
    >
      {isLoading || isPending ? (
        <Loader2 className=" h-10 w-10 animate-spin" />
      ) : (
        <Loader2 className=" h-10 w-10 animate-spin" />
      )}
    </main>
  );
};

export default Home;
