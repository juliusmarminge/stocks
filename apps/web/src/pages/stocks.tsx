import type { NextPage } from "next";
import { StockHistoryChart } from "../components/StockHistoryChart";

const StocksPage: NextPage = () => {
  return (
    <div className="flex flex-col w-4/5 mx-auto mt-10">
      <div className="grid card bg-base-200 rounded-box place-items-center">
        <h1>Stock History (AAPL)</h1>
        <StockHistoryChart />
      </div>
    </div>
  );
};

export default StocksPage;
