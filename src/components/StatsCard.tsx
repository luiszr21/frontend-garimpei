interface StatsCardProps {
  title: string;
  value: number | string;
  icon: string;
  color?: "blue" | "green" | "red" | "yellow" | "purple";
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const colorClasses = {
  blue: "from-blue-500 to-blue-600",
  green: "from-green-500 to-green-600",
  red: "from-red-500 to-red-600",
  yellow: "from-yellow-500 to-yellow-600",
  purple: "from-purple-500 to-purple-600",
};

export function StatsCard({
  title,
  value,
  icon,
  color = "blue",
  trend,
}: StatsCardProps) {
  return (
    <div className={`bg-linear-to-br ${colorClasses[color]} rounded-xl p-5 text-white shadow-lg hover:shadow-xl transition-shadow`}>
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-sm font-semibold opacity-95">{title}</h3>
        <span className="text-2xl">{icon}</span>
      </div>

      <div>
        <p className="text-3xl font-bold leading-none mb-2">{value}</p>
        {trend && (
          <p className={`text-sm font-medium ${trend.isPositive ? "text-green-200" : "text-red-200"}`}>
            {trend.isPositive ? "📈" : "📉"} {Math.abs(trend.value)}%
          </p>
        )}
      </div>
    </div>
  );
}
