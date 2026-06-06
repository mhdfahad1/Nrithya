"use client";

import { Tabs, TabsContent } from "@/components/ui/tabs";
import { ColumnDef } from "@tanstack/react-table";
import { ListFilter, Loader2, RotateCcw } from "lucide-react";

import { ActivitylogList, UsersList } from "@/api/activity-log";
import { CourseType } from "@/app/Admin/batch/Add-batch/page";
import { DataTable } from "@/app/table/data-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
// import { Datum } from "@/Interfaces/activityLog";
import { useQuery } from "@tanstack/react-query";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import ComboboxDemo from "../../table/combox";
import PaginationDemo from "../../table/Pagination";
import { UserDatum } from "@/Interfaces/AuditUser";
import { columns } from "./columns";
import Navbar from "@/app/Components/Navbar";
import ErrorHandling from "@/app/Components/ErrorHandling";

export type FrameworkType = {
  value: string;
  label: string;
};
type FilterType = {
  date: string;
  userName: string;
};

export default function TableList() {
  const [filter, setFilter] = useState({
    date: "",
    userId: "",
  });
  const [pageNum, setPageNum] = React.useState(1);
  const [resetFilter, setResetFilter] = useState<boolean>(false);
  const form = useForm<FilterType>({
    defaultValues: {
      date: "",
      userName: "",
    },
  });
  const { register, handleSubmit, reset, formState, setValue } = form;
  const { errors, isDirty } = formState;

  const {
    data: listActivyLog,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["activity-log", filter, pageNum],
    queryFn: async () => ActivitylogList(filter.date, filter.userId, pageNum),
  });
  const [User, setUser] = useState<CourseType[]>([]);
  const { data: userlist } = useQuery<UserDatum[]>({
    queryKey: ["userList"],
    queryFn: async () => UsersList(),
  });
  const OnFilter = (data: FilterType) => {
    setPageNum(1);
    setFilter({ ...filter, date: data.date, userId: data.userName });
  };

  useEffect(() => {
    if (userlist) {
      const User: CourseType[] = userlist
        ? userlist.map((item) => ({
            value: String(item?.user_id),
            label: item?.user_name.trim(),
          }))
        : [];
      setUser(User);
    }
  }, [userlist]);
  const handleReset = () => {
    setResetFilter(true);
    reset();
  };
  if (error) {
    return (
      <div>
        <ErrorHandling error={error} />
      </div>
    );
  }
  return (
    <>
      <Navbar name="Activity Logs" />
      <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <div className="flex flex-col sm:gap-4 sm:py-4 ">
          <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 relative">
            <Tabs defaultValue="all">
              <div className="flex justify-start pt-5">
                <form onSubmit={handleSubmit(OnFilter)}>
                  <div className="flex items-center gap-3">
                    <Input type="date" {...register("date")} />
                    <div className="w-[250px]">
                      <ComboboxDemo
                        frameworks={User}
                        name="user"
                        setValue={setValue}
                        field="userName"
                        resetFilter={resetFilter}
                        setResetFilter={setResetFilter}
                      />
                    </div>

                    <Button
                      type="submit"
                      size="sm"
                      className="h-9 gap-1 "
                      style={{ backgroundColor: " #75172F" }}
                      disabled={!isDirty && resetFilter}
                    >
                      <ListFilter className="h-3.5 w-3.5" />

                      <span>Filter</span>
                    </Button>
                    <Button
                      size="sm"
                      className="h-9 gap-1 "
                      style={{ backgroundColor: "lightgray" }}
                      onClick={() => handleReset()}
                    >
                      <RotateCcw className="h-4 w-4" color="#75172F" />
                      <span style={{ color: "#75172F" }}>Reset</span>
                    </Button>
                  </div>
                </form>
              </div>

              {!isLoading ? (
                <TabsContent value="all">
                  <Card className="p-4 mt-4 min-w-[100%]">
                    <CardContent>
                      {listActivyLog && (
                        <DataTable
                          columns={columns}
                          data={listActivyLog.data}
                        />
                      )}
                    </CardContent>
                    <CardFooter className="flex justify-center mt-2">
                      {listActivyLog !== undefined ? (
                        <PaginationDemo
                          pageNum={pageNum}
                          setPageNum={setPageNum}
                          pageCount={listActivyLog?.metadata.total_count}
                        />
                      ) : (
                        ""
                      )}
                    </CardFooter>
                  </Card>
                </TabsContent>
              ) : (
                <div className="flex items-center justify-center h-[100vh]">
                  <Loader2 className="  animate-spin " />
                </div>
              )}
            </Tabs>
          </main>
        </div>
      </div>
    </>
  );
}
