import type { inferProcedureOutput } from "@trpc/server";
import { format, isSameDay } from "date-fns";
import React from "react";
import { HiMinusCircle, HiPlusCircle } from "react-icons/hi";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { type AppRouter } from "~/server/trpc/router";

interface IProps {
  type: "BUY" | "SELL" | undefined;
  cx: number;
  cy: number;
  size: number;
}
const getIcon = (iconProps: IProps) => {
  const { type, cx, cy, size } = iconProps;
  const x = cx - size / 2;
  const y = cy - size / 2;

  if (type === "BUY")
    return (
      <HiPlusCircle
        className="fill-success stroke-primary"
        x={x}
        y={y}
        height={size}
        width={size}
      />
    );
  if (type === "SELL")
    return (
      <HiMinusCircle
        className="fill-error stroke-error"
        x={x}
        y={y}
        height={size}
        width={size}
      />
    );
  return null;
};

export const StockChart: React.FC<{
  stockHistory: inferProcedureOutput<AppRouter["stocks"]["getByAuthedUser"]>;
  transactions:
    | inferProcedureOutput<AppRouter["transactions"]["getByAuthedUser"]>
    | undefined;
}> = ({ stockHistory, transactions }) => {
  // FIXME: Look into proper types for this
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const CustomizedDot: React.FC<any> = (props: any) => {
    const isTransaction = transactions?.find((t) =>
      isSameDay(t.transactedAt, props.payload.date),
    );

    const size = props.strokeWidth * 4;
    return getIcon({
      type: isTransaction?.type,
      cx: props.cx,
      cy: props.cy,
      size,
    });
  };

  return (
    <div className="min-h-md h-full w-full text-primary">
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
