export function getPriorityLabel(priority) {
  const priorityMap = {
    1: "Lowest",
    2: "Low",
    3: "Medium",
    4: "High",
    5: "Highest",
  };

  return priorityMap[priority] || "Unknown";
}
