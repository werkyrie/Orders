// Status colors for dark mode
export const getStatusColor = (status: string) => {
  switch (status) {
    case "Active":
      return "bg-green-900/50 text-green-300 border-green-700"
    case "On Hold":
      return "bg-yellow-900/50 text-yellow-300 border-yellow-700"
    case "Inactive":
      return "bg-red-900/50 text-red-300 border-red-700"
    default:
      return "bg-gray-800/50 text-gray-300 border-gray-600"
  }
}

// Tag colors for dark mode
export const getTagColor = (tag: string) => {
  const colors = {
    "New Shop": "bg-blue-900/50 text-blue-300",
    "With Loan": "bg-purple-900/50 text-purple-300",
    Frozen: "bg-cyan-900/50 text-cyan-300",
    "Hold Withdrawal": "bg-orange-900/50 text-orange-300",
    "No Product": "bg-pink-900/50 text-pink-300",
    "Old Client": "bg-gray-800/50 text-gray-300",
    VIP: "bg-yellow-900/50 text-yellow-300",
  }
  return colors[tag as keyof typeof colors] || "bg-gray-800/50 text-gray-300"
}
