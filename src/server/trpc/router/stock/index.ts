import { z } from "zod";

import { authedProcedure, t } from "../../utils";
import { getLatterData, getPriorData } from "./d/complementDbData";
import { getDataFromDb } from "./d/getDataFromDb";

export const getStockValidator = z.object({
  ticker: z.string(),
  startDate: z.date(),
  endDate: z.date(),
});

export const stockRouter = t.router({
  getByAuthedUser: authedProcedure
    .input(getStockValidator)
    .query(async ({ input, ctx }) => {
      const { startDate, endDate, ticker } = input;

      const dataFromDb = await getDataFromDb(ctx.prisma, { ...input });
      const firstDayFromDb = dataFromDb[0]?.date ?? endDate;
      const lastDayFromDb =
        dataFromDb[dataFromDb.length - 1]?.date ?? startDate;

      const priorData = await getPriorData(ctx.prisma, {
        ticker,
        firstDayFromDb,
        startDate,
      });

      if (priorData) dataFromDb.unshift(...priorData);

      const latterData = await getLatterData(ctx.prisma, {
        ticker,
        lastDayFromDb,
        endDate,
      });

      if (latterData) dataFromDb.push(...latterData);

      return dataFromDb;
    }),
});
