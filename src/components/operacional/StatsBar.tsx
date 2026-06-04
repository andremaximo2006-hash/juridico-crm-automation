import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import type { StatsMetrics } from "@/types/operacional";

interface StatsBarProps {
  refreshTrigger?: number;
}

export function StatsBar({ refreshTrigger = 0 }: StatsBarProps) {
  const [stats, setStats] = useState<StatsMetrics | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/operacional/stats");
      const data = await res.json();
      setStats(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [refreshTrigger]);

  useEffect(() => {
    const interval = setInterval(fetchStats, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  if (!stats) return null;

  const metrics = [
    { label: "Total", value: stats.total, color: "bg-gray-100 text-gray-700" },
    { label: "Novos", value: stats.novo, color: "bg-blue-100 text-blue-700" },
    { label: "Em andamento", value: stats.andamento, color: "bg-green-100 text-green-700" },
    { label: "Urgentes 🔴", value: stats.urgentes, color: "bg-red-100 text-red-700" },
    { label: "Aguardando docs", value: stats.aguardandoDocs, color: "bg-orange-100 text-orange-700" },
    { label: "Concluídos", value: stats.concluido, color: "bg-purple-100 text-purple-700" },
    { label: "DPP próxima", value: stats.dppProxima, color: "bg-yellow-100 text-yellow-700" },
  ];

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 px-4">
      {metrics.map((metric) => (
        <div key={metric.label} className={`flex-shrink-0 ${metric.color} rounded-lg px-4 py-3 min-w-max`}>
          <p className="text-xs font-medium opacity-75">{metric.label}</p>
          <p className="text-2xl font-bold">{loading ? "..." : metric.value}</p>
        </div>
      ))}
    </div>
  );
}
