import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  title: string;
  value: number | string;
  suffix?: string;
  icon?: React.ReactNode;
  details?: { label: string; value: string | number }[];
  trend?: {
    value: number;
    label: string;
    direction: "up" | "down";
  };
}

export default function StatCard({ title, value, suffix, icon, details, trend }: StatCardProps) {
  return (
    <Card className="glass-panel card-glow bg-background/70 backdrop-blur-sm border border-white/10 shadow-md transition-all">
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-muted-foreground font-medium">{title}</h3>
          <div className="text-primary">
            {icon}
          </div>
        </div>

        <div className="flex items-baseline">
          <span className="text-3xl font-bold">{value}</span>
          {suffix && <span className="text-sm text-muted-foreground ml-2">{suffix}</span>}
        </div>

        {trend && (
          <div className={`flex items-center mt-3 text-xs ${trend.direction === 'up' ? 'text-emerald-400' : 'text-rose-400'}`}>
            {trend.direction === 'up' ? (
              <TrendingUp className="h-3 w-3 mr-1" />
            ) : (
              <TrendingDown className="h-3 w-3 mr-1" />
            )}
            <span>
              {trend.direction === 'up' ? '+' : '-'}{trend.value}% {trend.label}
            </span>
          </div>
        )}

        {details && details.length > 0 && (
          <div className="flex justify-between mt-3 text-xs">
            {details.map((detail, index) => (
              <span key={index} className="text-muted-foreground">
                {detail.label}: <span className="font-medium text-foreground">{detail.value}</span>
              </span>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
