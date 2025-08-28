export function getPriorityLabel(priority: number): string {
  const priorityMap: Record<number, string> = {
    1: "Lowest",
    2: "Low",
    3: "Medium",
    4: "High",
    5: "Highest",
  };

  return priorityMap[priority] || "Unknown";
}