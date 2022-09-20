import { prisma } from "../../../../db/client";

type Prisma = typeof prisma;
interface QueryOptions {
  ticker: string;
  startDate: Date;
  endDate: Date;
}

export const getDataFromDb = async (prisma: Prisma, opts: QueryOptions) => {
  const { ticker, startDate, endDate } = opts;

  return await prisma.stockHistory.findMany({
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
};
