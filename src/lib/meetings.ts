import type { Meeting } from "@/types";
import { localDateKey } from "./date";

// Meetings that fall on `day`: a one-off on exactly that date, or a weekly
// one whose weekday matches and whose start date has already arrived.
export function meetingsOnDay(meetings: Meeting[], day: Date): Meeting[] {
  const key = localDateKey(day);
  return meetings
    .filter((m) => {
      if (!m.repeatsWeekly) return m.date === key;
      const [y, mo, d] = m.date.split("-").map(Number);
      return new Date(y, mo - 1, d).getDay() === day.getDay() && m.date <= key;
    })
    .sort((a, b) => a.start.localeCompare(b.start));
}
