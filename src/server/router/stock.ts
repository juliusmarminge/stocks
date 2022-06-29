import { z } from "zod";
import { createRouter } from "./context";
import { restClient } from "@polygon.io/client-js";
import { format, add, sub, differenceInBusinessDays } from "date-fns";

const API_KEY = "my170JNBmDgxmIzx4fPmkj0RkbPWgoiQ";

export const stockRouter = createRouter().query("get", {
  input: z.object({
    ticker: z.string(),
    startDate: z.date(),
    endDate: z.date(),
  }),
  async resolve({ ctx, input: { ticker, startDate, endDate } }) {
    const dataFromDb = await ctx.prisma.stockHistory.findMany({
      where: {
        stock: {
          equals: ticker,
        },
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        date: "asc",
      },
      select: {
        stock: true,
        date: true,
        open: true,
        close: true,
        high: true,
        average: true,
        low: true,
        volume: true,
      },
    });

    const getAndInsertRows = async (
      apiKey: string,
      ticker: string,
      fromDate: string,
      toDate: string
    ) => {
      console.log("fetching");
      const restApiClient = restClient(apiKey);
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
        await ctx.prisma.stockHistory.createMany({
          data: formatted,
        });
        return formatted;
      }
    };

    const firstDayFromDb = dataFromDb[0]?.date ?? endDate;
    const lastDayFromDb = dataFromDb[dataFromDb.length - 1]?.date ?? startDate;

    if (
      firstDayFromDb > startDate &&
      differenceInBusinessDays(firstDayFromDb, startDate) > 1
    ) {
      /** get rows [startDate, firstDayFromDb) */
      const fromDate = format(startDate, "yyyy-MM-dd");
      const toDate = format(sub(firstDayFromDb, { days: 1 }), "yyyy-MM-dd");

      console.log("BEFORE: getAndInsertRows", ticker, fromDate, toDate);
      const newRows = await getAndInsertRows(API_KEY, ticker, fromDate, toDate);
      if (newRows) {
        dataFromDb.unshift(...newRows);
      }
    }

    if (
      lastDayFromDb < endDate &&
      differenceInBusinessDays(endDate, lastDayFromDb) > 1
    ) {
      /** get rows (lastDayFromDb, endDate] */
      const fromDate = format(add(lastDayFromDb, { days: 1 }), "yyyy-MM-dd");
      const toDate = format(endDate, "yyyy-MM-dd");

      console.log("AFTER: getAndInsertRows", ticker, fromDate, toDate);
      const newRows = await getAndInsertRows(API_KEY, ticker, fromDate, toDate);
      if (newRows) {
        dataFromDb.push(...newRows);
      }
    }

    return dataFromDb.map((row) => ({
      date: row.date,
      average: row.average,
      high: row.high,
    }));
  },
});
