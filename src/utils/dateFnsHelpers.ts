import { add, differenceInBusinessDays } from "date-fns";

/** add one day until we're on a business day */
export const getNextBusinessDay = (date: Date) => {
  const nextDay = add(date, { days: 1 });
  if (differenceInBusinessDays(date, nextDay) > 0) {
    return nextDay;
  }
  return date;
};
