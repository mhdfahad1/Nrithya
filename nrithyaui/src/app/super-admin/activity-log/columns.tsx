import { ColumnDef } from "@tanstack/react-table";

export interface Datum {
  id: number;
  action: string;
  date: string;
  relation: string;
  users: Users;
}

export interface Users {
  user_id: number;
  user_name: string;
  user_role: string;
  password: string;
  status: string;
}

const originalTime: string = "2024-05-10T11:43:46.482Z";


export const columns: ColumnDef<Datum>[] = [
  {
    accessorKey: "id",
    header: "Id",
  },
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => {
      const data = row.original;

      const date: Date = new Date(data.date);

      const options: Intl.DateTimeFormatOptions = {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      };

      const formattedTime: string = date.toLocaleString("en-US", options);
      return <>{formattedTime}</>;
    },
  },
  {
    accessorKey: "users.user_name",
    header: "User name",
  },
  {
    accessorKey: "action",
    header: "Action",
  },
  {
    accessorKey: "relation",
    header: "Type",
  },
];
