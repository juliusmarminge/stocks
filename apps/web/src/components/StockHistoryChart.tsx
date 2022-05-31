import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

import { trpc } from "../utils/trpc";

export const StockHistoryChart: React.FC = () => {
  const { data: stockHistory, isLoading } = trpc.useQuery([
    "stock.get",
    {
      ticker: "AAPL",
      startDate: new Date("2022-04-01"),
      endDate: new Date("2022-05-31"),
    },
  ]);
  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={stockHistory}>
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="average" stroke="#8884d8" />
      </LineChart>
    </ResponsiveContainer>
  );
};
