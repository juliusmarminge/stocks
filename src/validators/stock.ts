import { z} from "zod";

export const getStockValidator =  z.object({
    ticker: z.string(),
    startDate: z.date(),
    endDate: z.date()
  });