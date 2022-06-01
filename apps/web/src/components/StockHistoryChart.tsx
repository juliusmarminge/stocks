import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Brush,
  CartesianGrid,
  Legend,
  Dot,
} from "recharts";

import { PlusCircleIcon } from "@heroicons/react/outline";

import { inferQueryOutput } from "../utils/trpc";
import React from "react";
import { format, isSameDay } from "date-fns";

type ITransactions = { date: Date; value: number; type: "BUY" | "SELL" }[];

const StockHistoryChart: React.FC<{
  stockHistory: inferQueryOutput<"stock.get">;
  transactions: ITransactions;
}> = ({ stockHistory, transactions }) => {
  const CustomizedDot: React.FC<any> = (props: any) => {
    const {
      cx,
      cy,
      strokeWidth,
      value,
      payload: { date },
    } = props;

    const isTransaction = transactions.find((t) => isSameDay(t.date, date));

    let colorClasses: string;
    switch (isTransaction?.type) {
      case "BUY":
        colorClasses = "stroke-success fill-success";
        break;
      case "SELL":
        colorClasses = "stroke-error fill-error";
        break;
      default:
        colorClasses = "stroke-primary fill-primary";
        break;
    }

    const size = strokeWidth * 4;
    return (
      <PlusCircleIcon
        x={cx - size / 2}
        y={cy - size / 2}
        height={size}
        width={size}
        className={`${colorClasses}`}
      />
    );
  };

  return (
    <div className="w-full h-full min-h-96 text-primary">
      <ResponsiveContainer>
        <LineChart
          key={Math.random()} // to keep dots rendering
          width={500}
          height={300}
          data={stockHistory}
          margin={{
            top: 10,
            right: 60,
            left: 0,
            bottom: 10,
          }}
        >
          <CartesianGrid strokeDasharray="5 5" />

          <XAxis
            dataKey="date"
            domain={["data-min", "data-max"]}
            tickFormatter={(value: Date) => format(value, "yyyy-MM-dd")}
          />
          <YAxis
            domain={[
              (dataMin: number) => Math.round(dataMin * 0.9),
              (dataMax: number) => Math.round(dataMax * 1.1),
            ]}
          />
          <Tooltip />
          <Legend />

          <Line
            type="monotone"
            dot={<CustomizedDot />}
            dataKey="average"
            stroke="currentColor"
            strokeWidth={5}
          />
          <Brush
            className="fill-base stroke-primary"
            fillOpacity={1}
            strokeOpacity={1}
            height={30}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StockHistoryChart;
