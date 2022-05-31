import type { NextPage } from "next";
import { trpc } from "../utils/trpc";

const StocksPage: NextPage = () => {
  const { data: stockHistory, isLoading } = trpc.useQuery([
    "stock.get",
    {
      ticker: "AAPL",
      startDate: new Date("2022-04-01"),
      endDate: new Date("2022-05-31"),
    },
  ]);

  /** in stockHistory.results
   * vw: average price of day
   *
   */

  return <pre>{JSON.stringify(stockHistory, null, 2)}</pre>;
};

export default StocksPage;
