"use client";
import React, { useEffect, useMemo, useState } from "react";
import Sidebar from "../Components/Sidebar";
import {
  LogOut,
  Bell,
  LayoutDashboard,
  Users,
  Radio,
  Activity,
  ChevronLast,
  Check,
  ChevronDown,
  ChevronRight,
  User,
  UserRound,
  NotebookPen,
  CircleDollarSign,
  NotebookText,
  BotMessageSquare,
  BookOpenCheck,
  Landmark,
  CircleUser,
  CalendarCheck2,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { LocalStorage } from "../utility/localstorage";
import { useToast } from "@/components/ui/use-toast";

const sidebarItems = [
  {
    path: "/super-admin/dashboard",
    icon: <LayoutDashboard className="h-4 w-4" />,
    label: "Dashboard",
  },
  {
    path: "/super-admin/user",
    icon: <Users className="h-4 w-4" />,
    label: "Users",
  },
  {
    path: "/super-admin/bank-account",
    icon: <Landmark className="h-4 w-4" />,
    label: "Bank Account",
  },
  {
    icon: <BookOpenCheck className="h-4 w-4" />,
    label: "Reports",
    subItems: [
      {
        label: "Students",
        icon: <User className="h-4 w-4" />,
        path: "/super-admin/reports/students",
      },
      {
        label: "Teachers",
        icon: <CircleUser className="h-4 w-4" />,
        path: "/super-admin/reports/teachers",
      },
      {
        label: "Batches",
        icon: <Users className="h-4 w-4" />,
        path: "/super-admin/reports/batches",
      },
      {
        label: "Performance",
        icon: <NotebookPen className="h-4 w-4" />,
        path: "/super-admin/reports/performance",
      },
      {
        label: "Fee collection",
        icon: <CircleDollarSign className="h-4 w-4" />,
        path: "/super-admin/reports/feecollection",
      },
      {
        label: "Attendance",
        icon: <CalendarCheck2 className="h-4 w-4" />,

        path: "/super-admin/reports/attendance",
      },
      {
        label: "Enquiry",
        icon: <BotMessageSquare className="h-4 w-4" />,

        path: "/super-admin/reports/enquiry",
      },
    ],
  },
  {
    path: "/super-admin/frequency",
    icon: <Radio className="h-4 w-4" />,
    label: "Frequency",
  },
  {
    path: "/super-admin/activity-log",
    icon: <Activity className="h-4 w-4" />,
    label: "Activity",
  },
  {
    icon: <LogOut className="h-4 w-4" />,
    label: "Logout",
  },
];

const Layout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();

  const router = useRouter();
  const { toast } = useToast();

  const isActive = useMemo(() => {
    return (path: string) => path === pathname;
  }, [pathname]);

  const [expanded, setExpanded] = useState(false);

  const handleLogout = () => {
    try {
      LocalStorage.clear();
      window.history.replaceState(null, "", "/login");
      router.push("/login");
      toast({
        variant: "Success",
        title: " Logged out!",
        description: "You are logged out.",
      });
    } catch (error) {
      throw error;
    }
  };
  useEffect(() => {
    if (pathname.includes("reports")) {
      setExpanded(true);
    }
  }, [pathname]);
  return (
    <div className="flex">
      <div className=" border-r-2">
        <Sidebar
          navItem={sidebarItems.map((items, index) => {
            return (
              <div key={index}>
                <nav className=" px-1 flex flex-col gap-1 ">
                  <a
                    href={items?.path}
                    className={`flex items-center gap-12 text-sm py-2 px-4 text-[#75172F] cursor-pointer focus:text-[#75172F] hover:bg-[#f7cdd8] hover:text-[#75172F] focus:bg-[#f7cdd8] rounded ${
                      isActive(items.path || "") &&
                      "bg-[#f7cdd8] text-[#75172F]"
                    }`}
                    onClick={(event: React.MouseEvent<HTMLAnchorElement>) => {
                      event.preventDefault();
                      items.label === "Logout" ? handleLogout : undefined;
                      if (items.subItems) {
                        setExpanded(expanded === true ? false : true);
                      } else if (items.label === "Logout") {
                        handleLogout();
                      } else {
                        router.push(
                          items?.path !== undefined ? items?.path : ""
                        );
                      }
                    }}
                  >
                    <div className="flex gap-2 items-center">
                      {" "}
                      {items.icon}
                      {items.label}
                    </div>
                    {items.subItems && items.subItems.length > 0 ? (
                      expanded ? (
                        <button onClick={() => setExpanded(false)}>
                          {" "}
                          <ChevronDown size={18} />
                        </button>
                      ) : (
                        <button onClick={() => setExpanded(true)}>
                          {" "}
                          <ChevronRight size={18} className="" />
                        </button>
                      )
                    ) : (
                      ""
                    )}
                  </a>

                  <div className="pl-3  flex gap-2 flex-col">
                    {expanded
                      ? items?.subItems?.map((item, index) => (
                          <a
                            key={index}
                            href={item?.path}
                            className={`flex items-center gap-2 text-xs py-3 px-3 text-[#75172F] focus:text-[#75172F] hover:bg-[#f7cdd8] hover:text-[#75172F] focus:bg-[#f7cdd8] rounded ${
                              isActive(item.path || "") &&
                              "bg-[#f7cdd8] text-[#75172F]"
                            }`}
                            // onClick={() => {
                            //   if (items.subItems && items.subItems.length > 0) {
                            //     setExpanded(!expanded);
                            //   }
                            // }}
                          >
                            {item.icon}
                            {item.label}
                          </a>
                        ))
                      : ""}
                  </div>
                </nav>
              </div>
            );
          })}
        />
      </div>
      <div className="w-full h-full bg-muted/40 min-h-full">
        <div className="pl-48 pt-12">{children}</div>
      </div>
    </div>
  );
};

export default Layout;
