import { restClient } from "@polygon.io/client-js";
import { prisma } from "../../../../db/client";
import { format, sub, add, differenceInBusinessDays } from "date-fns";

type Prisma = typeof prisma;
type QueryOptions = {
  ticker: string;
  fromDate: string;
  toDate: string;
};
export const fillDbFromApi = async (prisma: Prisma, opts: QueryOptions) => {
  const { ticker, fromDate, toDate } = opts;
  const restApiClient = restClient(process.env.POLYGON_API_KEY);

  const newRows = await restApiClient.forex.aggregates(
    ticker.toUpperCase(),
    1,
    "day",
    fromDate,
    toDate
  );

  if (newRows.results) {
    const formatted = newRows.results.map((row) => ({
      stock: ticker.toUpperCase(),
      date: new Date(row.t!),
      open: row.o!,
      high: row.h!,
      average: row.vw!,
      low: row.l!,
      close: row.c!,
      volume: row.v!,
    }));

    await prisma.stockHistory.createMany({
      data: formatted,
    });
    return formatted;
  }
};

type PriorOptions = {
  ticker: string;
  firstDayFromDb: Date;
  startDate: Date;
};
export const getPriorData = async (prisma: Prisma, opts: PriorOptions) => {
  const { ticker, firstDayFromDb, startDate } = opts;

  if (
    firstDayFromDb <= startDate ||
    differenceInBusinessDays(firstDayFromDb, startDate) < 1
  ) {
    return null;
  }
  /** get rows [startDate, firstDayFromDb) */
  const fromDate = format(startDate, "yyyy-MM-dd");
  const toDate = format(sub(firstDayFromDb, { days: 1 }), "yyyy-MM-dd");

  const newRows = await fillDbFromApi(prisma, { ticker, fromDate, toDate });

  return newRows;
};

type LatterOptions = {
  ticker: string;
  lastDayFromDb: Date;
  endDate: Date;
};
export const getLatterData = async (prisma: Prisma, opts: LatterOptions) => {
  const { ticker, lastDayFromDb, endDate } = opts;

  if (
    lastDayFromDb >= endDate ||
    differenceInBusinessDays(endDate, lastDayFromDb) < 1
  ) {
    return null;
  }
  /** get rows (lastDayFromDb, endDate] */
  const fromDate = format(add(lastDayFromDb, { days: 1 }), "yyyy-MM-dd");
  const toDate = format(endDate, "yyyy-MM-dd");

  const newRows = await fillDbFromApi(prisma, { ticker, fromDate, toDate });

  return newRows;
};
