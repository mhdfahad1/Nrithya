import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
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
            <strong>{payload[0].payload.month}</strong>
          </div>
          <div className="mt-2 text-[#75172f]">
            {nameKey}: {value}
          </div>
        </div>
      );
    }
  }

  return null;
};
const Linechart = ({
  data,
  LineDataKey,
  XDataKey,
}: {
  data: any;
  LineDataKey: string;
  XDataKey: string;
}) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart width={600} height={300} data={data}>
        <Line
          type="monotone"
          dataKey={LineDataKey}
          stroke="#aa2244"
          strokeWidth={4}
        />
        <CartesianGrid stroke="#ef93aa46" strokeDasharray="5 5" />
        <XAxis dataKey={XDataKey} className="font-semibold text-xs" />
        <YAxis className="font-semibold  text-xs" />
        <Tooltip content={<CustomTooltip nameKey={LineDataKey} />} />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default Linechart;
