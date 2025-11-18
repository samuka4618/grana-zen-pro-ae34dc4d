import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/currency";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  variant?: "default" | "success" | "danger";
}

export function StatCard({ title, value, icon: Icon, trend, variant = "default" }: StatCardProps) {
  // Formata o valor se for número
  const displayValue = typeof value === 'number' ? formatCurrency(value) : value;
  
  return (
    <Card className={cn(
      "p-4 sm:p-6 transition-all duration-300 hover:shadow-lg hover-lift",
      "bg-gradient-to-br from-card to-card/50",
      variant === "success" && "border-success/20 hover:border-success/40",
      variant === "danger" && "border-danger/20 hover:border-danger/40"
    )}>
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1 min-w-0 flex-1">
          <p className="text-xs sm:text-sm font-medium text-muted-foreground uppercase tracking-wide">{title}</p>
          <p className={cn(
            "text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight truncate",
            variant === "success" && "text-success",
            variant === "danger" && "text-danger"
          )}>
            {displayValue}
          </p>
          {trend && (
            <p className="text-xs text-muted-foreground truncate">{trend}</p>
          )}
        </div>
        <div className={cn(
          "rounded-xl p-2 sm:p-3 flex-shrink-0",
          variant === "success" && "bg-success-light",
          variant === "danger" && "bg-danger-light",
          variant === "default" && "bg-muted"
        )}>
          <Icon className={cn(
            "h-4 w-4 sm:h-5 sm:w-5",
            variant === "success" && "text-success",
            variant === "danger" && "text-danger",
            variant === "default" && "text-muted-foreground"
          )} />
        </div>
      </div>
    </Card>
  );
}
