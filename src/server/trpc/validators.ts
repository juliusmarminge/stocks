import { isDate } from "date-fns";
import { z } from "zod";
import { getNextBusinessDay } from "~/utils/dateFnsHelpers";

export const createTransactionValidator = z.object({
  transactedAt: z.preprocess((dateString) => {
    const asDate = new Date(dateString as string);
    if (!isDate(asDate)) {
      return false;
    }
    return getNextBusinessDay(asDate);
  }, z.date()),
  stock: z.string().min(1).max(6),
  units: z.number().int().positive(),
  pricePerUnit: z.number().positive(),
  type: z.enum(["BUY", "SELL"]),
});
