import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Sector,
  Tooltip,
} from "recharts";

const renderActiveShape = (props: any) => {
  const RADIAN = Math.PI / 180;
  const {
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
    payload,
    percent,
    value,
  } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? "start" : "end";

  return (
    <g>
      <text x={cx} y={cy} dy={8} textAnchor="middle">
        {payload.name}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
      <path
        d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`}
        stroke={fill}
        fill="none"
      />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text
        x={ex + (cos >= 0 ? 1 : -1) * 12}
        y={ey}
        textAnchor={textAnchor}
        fill="#333"
      >{` ${percent * 100}%`}</text>
    </g>
  );
};
export interface RootObject {
  name: string;
  value: number;
}
type props = {
  data: RootObject[];
};
const COLORS = [
  "#5B2C6F",
  "#21618C",
  "#117864",
  "#B7950B",
  "#922B21",
  "#D32D41",
  // "#6AB187",
];
// const COLORS = [
//   "#800000",
//   "#1E5128",
//   "#0000FF",
//   "#FF0080",
//   "#4B0082",
//   "#FF5F00",
//   // "#AF8260",
//   // "#4B0082",
// ];

const EnquirypieChart = ({ data }: props) => {

  return (
    <div className="flex justify-center">
      {data.length > 0 ? (
        <ResponsiveContainer width="100%" height="100%">
          <div className="flex justify-center">
            <div className="text-base">
              <PieChart width={500} height={350}>
                <Pie
                  dataKey="value"
                  isAnimationActive={true}
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={120}
                  fill="#75172F"
                  label
                >
                  {data?.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Legend
                  iconSize={14}
                  fontSize={10}
                  textDecoration={"none"}
                  formatter={(value, entry, index) => (
                    <span style={{ color: "black", fontSize: "11px" }}>
                      {value}
                    </span>
                  )}
                />
                <Tooltip />
              </PieChart>
            </div>
          </div>
        </ResponsiveContainer>
      ) : (
        <div className="flex items-center justify-center text-sm text-gray-500 h-[380px]">
          No data.
        </div>
      )}
    </div>
  );
};

export default EnquirypieChart;
