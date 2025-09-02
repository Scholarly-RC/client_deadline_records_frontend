export function getDaysRemaining(days: number): string {
  switch (days) {
    case 0:
      return "today";
    case 1:
      return "in 1 day";
    case -1:
      return "1 day ago";
    default:
      return days > 1 ? `in ${days} days` : `${Math.abs(days)} days ago`;
  }
}