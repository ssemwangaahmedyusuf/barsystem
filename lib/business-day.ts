/**
 * The bar's business day starts at 8:00 AM.
 * "Today" means from 8:00 AM this calendar day (or yesterday, if it's
 * currently before 8:00 AM) until 8:00 AM the next day.
 */
export function getBusinessDayStart(referenceDate: Date = new Date()): Date {
  const start = new Date(referenceDate);
  start.setHours(8, 0, 0, 0);

  if (referenceDate.getHours() < 8) {
    start.setDate(start.getDate() - 1);
  }

  return start;
}

export function getBusinessDayEnd(businessDayStart: Date): Date {
  const end = new Date(businessDayStart);
  end.setDate(end.getDate() + 1);
  return end;
}
