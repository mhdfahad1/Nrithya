"use client";
import React from "react";
import {
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
  Cell,
  Label,
} from "recharts";

export const colors = {
  Theme: [
    "#551122",
    "#75172f",
    "#aa2244",
    "#d93f66",
    "#e26a88",
    "#ea95aa",
    "#f2bfcc",
    "#fbeaee",
  ],
};
type HorizontalBarProps = {
  data: {
    name: string;
    value: number;
  }[];
  nameKey: string;
};
type CustomTooltipProps = {
  active?: boolean;
  payload?: { name: string; value: number; payload: any }[];
  nameKey: string;
};

const CustomTooltip: React.FC<CustomTooltipProps> = ({
  active,
  payload,
  nameKey,
}) => {
  if (active && payload && payload.length) {
    if (payload !== undefined) {
      const { name, value } = payload[0];

      return (
        <div className="bg-white p-4 rounded-md shadow-md">
          <div>
            <strong>{payload[0].payload.name}</strong>
          </div>
          <div className="mt-2 text-[#75172F]">
            {nameKey}: {value}
          </div>
        </div>
      );
    }
  }

  return null;
};

function HorizontalBar({
  data,

  nameKey,
}: HorizontalBarProps) {
  return (
    <div className=" w-full h-[400px]   text-sm ">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart layout="vertical" data={data} margin={{ left: 56 }}>
          <CartesianGrid stroke="#ea95aa" strokeDasharray="5 5" />
          <XAxis type="number" />
          <YAxis type="category" scale="auto" dataKey="name" />
          <Tooltip content={<CustomTooltip nameKey={nameKey} />} />

          <Bar dataKey="value" barSize={30} fill="#75172F">
            <LabelList
              position="insideLeft"
              offset={10}
              fill="white"
              className="text-sm"
            />
            {colors.Theme.map((entry, index) => (
              <Cell key={`cell`} fill={colors.Theme[index % 10]} />
            ))}
          </Bar>
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

export default HorizontalBar;
