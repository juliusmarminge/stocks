import { createRouter } from "../context";
import { TRPCError } from "@trpc/server";
import { getStockValidator } from "../../../validators/stock";
import { getDataFromDb } from "./d/getDataFromDb";
import { getLatterData, getPriorData } from "./d/complementDbData";

export const stockRouter = createRouter()
  .middleware(async ({ ctx, next }) => {
    // Any queries or mutations after this middleware will
    // raise an error unless there is a current session
    if (!ctx.session) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    return next();
  })
  .query("get", {
    input: getStockValidator,
    async resolve({ ctx, input }) {
      const { startDate, endDate, ticker } = input;

      const dataFromDb = await getDataFromDb(ctx.prisma, { ...input });
      const firstDayFromDb = dataFromDb[0]?.date ?? endDate;
      const lastDayFromDb = dataFromDb[dataFromDb.length - 1]?.date ?? startDate;

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
    },
  });
