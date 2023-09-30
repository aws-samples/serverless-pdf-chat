import { format } from "date-fns";

export function getDateTime(date: string): string {
  return format(new Date(date), "MMMM d, yyyy - H:mm");
}
