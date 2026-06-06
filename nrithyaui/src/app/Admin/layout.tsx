"use client";
import React, { useEffect, useMemo, useState } from "react";
import Sidebar from "../Components/Sidebar";

import {
  BookMarked,
  BookOpenCheck,
  BotMessageSquare,
  CalendarCheck2,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  CircleDollarSign,
  CircleUser,
  ClipboardList,
  GaugeCircle,
  LogOut,
  NotebookPen,
  ReplaceAllIcon,
  User,
  Users,
  Wallet,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { LocalStorage } from "../utility/localstorage";
import { useToast } from "@/components/ui/use-toast";

const sidebarItems = [
  {
    path: "/Admin/calendar",
    icon: <CalendarDays className="h-4 w-4" />,
    label: "Calendar",
  },
  {
    path: "/Admin/students",
    icon: <User className="h-4 w-4" />,
    label: "Students",
  },
  {
    path: "/Admin/teachers",
    icon: <CircleUser className="h-4 w-4" />,
    label: "Teachers",
  },

  {
    path: "/Admin/batch",
    icon: <Users className="h-4 w-4" />,
    label: "Batches",
  },

  {
    path: "/Admin/attendance",
    icon: <CalendarCheck2 className="h-4 w-4" />,
    label: "Attendance",
  },
  {
    path: "/Admin/performance",
    icon: <GaugeCircle className="h-4 w-4" />,
    label: "Performance",
  },
  {
    path: "/Admin/topics-covered",
    icon: <ClipboardList className="h-4 w-4" />,
    label: "Topics Covered",
  },
  {
    path: "/Admin/compensation",
    icon: <ReplaceAllIcon className="h-4 w-4" />,
    label: "Compensation",
  },

  {
    path: "/Admin/feecollection",
    icon: <CircleDollarSign className="h-4 w-4" />,
    label: "Fee Collection",
  },
  {
    path: "/Admin/reportfeecollection",
    icon: <Wallet className="h-4 w-4" />,
    label: "Fee Collection Report",
  },
  {
    path: "/Admin/enquiry",
    icon: <BotMessageSquare className="h-4 w-4" />,
    label: "Enquiry",
  },
  {
    path: "/Admin/assignment",
    icon: <NotebookPen className="h-4 w-4" />,
    label: "Assignment",
  },
  {
    icon: <BookOpenCheck className="h-4 w-4" />,
    label: "Master Table",
    subItems: [
      {
        path: "/Admin/master/type/enquiry-type",
        icon: <BotMessageSquare className="h-4 w-4" />,
        label: "Enquiry Type",
      },
      {
        path: "/Admin/master/course",
        icon: <BookMarked className="h-4 w-4" />,
        label: "Course",
      },
    ],
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
  const [expanded, setExpanded] = useState(false);
  const isActive = useMemo(() => {
    return (path: string) => pathname.includes(path);
  }, [pathname]);

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
    if (pathname.includes("master")) {
      setExpanded(true);
    }
  }, [pathname]);

  return (
    <div className="flex ">
      <div className=" border-r-2  ">
        <Sidebar
          navItem={sidebarItems.map((items, index) => {
            return (
              <div key={index}>
                <nav
                  className=" px-1 flex flex-col 
        "
                >
                  <a
                    href={items?.path}
                    className={`flex items-center gap-2 cursor-pointer text-sm py-2 px-4 text-[#75172F] focus:text-[#75172F] hover:bg-[#f7cdd8] hover:text-[#75172F] focus:bg-[#f7cdd8] rounded ${
                      items.path
                        ? isActive(items.path || "")
                          ? "bg-[#f7cdd8] text-[#75172F]"
                          : ""
                        : ""
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

                  <div className="pl-3  flex  flex-col">
                    {expanded
                      ? items?.subItems?.map((item, index) => (
                          <a
                            key={index}
                            href={item?.path}
                            className={`flex items-center gap-2 text-xs py-3 px-3 mt-2 text-[#75172F] focus:text-[#75172F] hover:bg-[#f7cdd8] hover:text-[#75172F] focus:bg-[#f7cdd8] rounded ${
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
      <div className="w-full  ">
        <div className="pl-48 pt-12  bg-muted/40 min-h-screen">{children}</div>
      </div>
    </div>
  );
};

export default Layout;
