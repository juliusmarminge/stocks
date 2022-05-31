import { z } from "zod";
import { createRouter } from "../create-router";
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
        stock: ticker.toUpperCase(),
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
      ticker: string,
      fromDate: string,
      toDate: string
    ) => {
      const restApiClient = restClient(API_KEY);
      const newRows = await restApiClient.forex.aggregates(
        ticker,
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

    const firstDayFromDb = dataFromDb[0]?.date ?? startDate;
    const lastDayFromDb = dataFromDb[dataFromDb.length - 1]?.date ?? startDate;

    if (
      firstDayFromDb > startDate &&
      differenceInBusinessDays(startDate, firstDayFromDb) > 1
    ) {
      /** get rows [startDate, firstDayFromDb) */
      const fromDate = format(startDate, "yyyy-MM-dd");
      const toDate = format(sub(firstDayFromDb, { days: 1 }), "yyyy-MM-dd");

      console.log("PRE: getAndInsertRows", ticker, fromDate, toDate);
      const newRows = await getAndInsertRows(ticker, fromDate, toDate);
      if (newRows) {
        dataFromDb.unshift(...newRows);
      }
    }

    if (
      lastDayFromDb < endDate &&
      differenceInBusinessDays(lastDayFromDb, endDate) > 1
    ) {
      /** get rows (lastDayFromDb, endDate] */
      const fromDate = format(add(lastDayFromDb, { days: 1 }), "yyyy-MM-dd");
      const toDate = format(endDate, "yyyy-MM-dd");
      console.log("POST: getAndInsertRows", ticker, fromDate, toDate);
      const newRows = await getAndInsertRows(ticker, fromDate, toDate);
      if (newRows) {
        dataFromDb.push(...newRows);
      }
    }

    return dataFromDb;
  },
});
