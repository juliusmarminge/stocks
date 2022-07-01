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

import { PlusCircleIcon, MinusCircleIcon } from "@heroicons/react/solid";

import { inferQueryOutput } from "../utils/trpc";
import React from "react";
import { format, isSameDay } from "date-fns";

type IProps = { cx: number; cy: number; size: number };
const getIcon = (type: "BUY" | "SELL" | undefined, iconProps: IProps) => {
  const { cx, cy, size } = iconProps;
  const x = cx - size / 2;
  const y = cy - size / 2;

  switch (type) {
    case "BUY":
      return (
        <PlusCircleIcon
          className={"stroke-success fill-success"}
          x={x}
          y={y}
          height={size}
          width={size}
        />
      );
    case "SELL":
      return (
        <MinusCircleIcon
          className={"stroke-error fill-error"}
          x={x}
          y={y}
          height={size}
          width={size}
        />
      );
    default:
      return null;
  }
};

export const StockHistoryChart: React.FC<{
  stockHistory: inferQueryOutput<"stocks.get">;
  transactions: inferQueryOutput<"transactions.getByUserId"> | undefined;
}> = ({ stockHistory, transactions }) => {
  const CustomizedDot: React.FC<any> = (props: any) => {
    const isTransaction = transactions?.find((t) =>
      isSameDay(t.transactedAt, props.payload.date)
    );

    const size = props.strokeWidth * 4;
    return getIcon(isTransaction?.type, {
      cx: props.cx,
      cy: props.cy,
      size,
    });
  };

  return (
    <div className="w-full h-full min-h-md text-primary">
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
          <CartesianGrid
            strokeDasharray="4"
            vertical={false}
            className="stroke-gray-500"
          />

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
            axisLine={false}
          />
          <Tooltip />

          <Line
            type="monotone"
            dot={<CustomizedDot />}
            dataKey="average"
            stroke="currentColor"
            strokeWidth={5}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
