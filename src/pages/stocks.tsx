import type { NextPage } from "next";
import dynamic from "next/dynamic";
import Image from "next/image";
import { trpc } from "../utils/trpc";
import React from "react";

const LazyStockHistoryChart = dynamic(
  async () => (await import("../components/StockHistoryChart")).StockHistoryChart,
  {
    ssr: false, // chart is buggy when rendered on server
  }
);

const StocksPage: NextPage = () => {
  const ticker = "TSLA";
  const startDate = new Date("2022-04-01");
  const endDate = React.useMemo(() => new Date(), []);

  const { data: stockHistory, isLoading: isLoadingStockHistory } = trpc.useQuery([
    "stocks.get",
    { ticker, startDate, endDate },
  ]);

  const { data: transactions, isLoading: isLoadingTransactions } = trpc.useQuery([
    "transactions.getByAuthedUser",
  ]);

  return (
    <>
      <div className="flex flex-col mt-10">
        <div className="card h-[40vh] bg-base-200 rounded-box place-items-center">
          <h1 className="py-2">{ticker}</h1>
          {isLoadingStockHistory || !stockHistory ? null : (
            <LazyStockHistoryChart
              stockHistory={stockHistory}
              transactions={transactions}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default StocksPage;
