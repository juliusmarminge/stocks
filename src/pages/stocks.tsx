import type { NextPage } from "next";
import dynamic from "next/dynamic";
import Image from "next/future/image";
import React from "react";

import loader from "~/assets/loader.svg";
import { protectPage } from "~/server/common/gSSPPageProtection";

import { trpc } from "../utils/trpc";

const LazyStockHistoryChart = dynamic(
  async () => (await import("../components/stockChart")).StockChart,
  {
    ssr: false, // chart is buggy when rendered on server
  },
);

const Spinner = () => (
  <Image src={loader} height={200} width={200} alt="Loading..." />
);

const PossesionView: React.FC<{
  // TODO: possesion router
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  possesion: any;
  startDate: Date;
  endDate: Date;
}> = ({ possesion, startDate, endDate }) => {
  const ticker = possesion.stock;
  const { data: stockHistory, isLoading: isLoadingStockHistory } =
    trpc.stocks.getByAuthedUser.useQuery({
      ticker,
      startDate,
      endDate,
    });

  const { data: transactions } = trpc.transactions.getByAuthedUser.useQuery({
    ticker,
  });

  if (isLoadingStockHistory) return <Spinner />;
  return (
    <React.Suspense fallback={<Spinner />}>
      <div className="card rounded-box h-[40vh] place-items-center bg-base-200">
        <h1 className="py-2">{ticker}</h1>
        {!stockHistory ? (
          <Spinner />
        ) : (
          <LazyStockHistoryChart
            stockHistory={stockHistory}
            transactions={transactions}
          />
        )}
      </div>
    </React.Suspense>
  );
};

const StocksPage: NextPage = () => {
  const startDate = new Date("2022-01-01");
  const endDate = React.useMemo(() => new Date(), []);

  const { data: userPossesion, isLoading: isLoadingPossesion } =
    trpc.possesion.getByAuthedUser.useQuery();

  if (isLoadingPossesion) return <Spinner />;

  return (
    <div className="mt-10 flex flex-col gap-10">
      {userPossesion?.map((possesion) => (
        <PossesionView
          key={possesion.id}
          possesion={possesion}
          startDate={startDate}
          endDate={endDate}
        />
      ))}
    </div>
  );
};

export const getServerSideProps = protectPage;
export default StocksPage;
