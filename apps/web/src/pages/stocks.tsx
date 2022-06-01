import type { NextPage } from "next";
import dynamic from "next/dynamic";
import Image from "next/image";
import { trpc } from "../utils/trpc";

const LazyStockHistoryChart = dynamic(
  () => import("../components/StockHistoryChart"),
  {
    ssr: false,
  }
);

const mockTransactions = [
  { date: new Date("2022-04-08"), value: 100, type: "BUY" as const },
  { date: new Date("2022-04-21"), value: 140, type: "SELL" as const },
];

const StocksPage: NextPage = () => {
  const ticker = "TSLA";
  const startDate = new Date("2022-04-01");
  const endDate = new Date("2022-04-30");

  const { data: stockHistory, isLoading } = trpc.useQuery([
    "stock.get",
    { ticker, startDate, endDate },
  ]);

  return (
    <>
      <div className="fixed w-screen h-screen">
        <Image
          alt="Stock chart"
          src="/stock-bg.jpg"
          layout="fill"
          className="opacity-20"
        />
      </div>
      <div className="flex flex-col w-4/5 mx-auto mt-10">
        <div className="card h-[500px] bg-base-200 rounded-box place-items-center">
          <h1>Stock History ({ticker})</h1>
          {isLoading || !stockHistory ? null : (
            <LazyStockHistoryChart
              stockHistory={stockHistory}
              transactions={mockTransactions}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default StocksPage;
