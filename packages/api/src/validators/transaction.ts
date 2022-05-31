import { z } from "zod";

export const createTransactionValidator = z.object({
  transactedAt: z.date().default(new Date()),
  transactedBy: z.string().uuid(),
  stock: z.string().min(1).max(6),
  units: z.number().int().positive(),
  pricePerUnit: z.number().positive(),
  type: z.enum(["BUY", "SELL"]),
});
