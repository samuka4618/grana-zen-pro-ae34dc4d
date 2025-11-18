import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend?: string;
  variant?: "default" | "success" | "danger";
}

export function StatCard({ title, value, icon: Icon, trend, variant = "default" }: StatCardProps) {
  return (
    <Card className={cn(
      "p-6 transition-all duration-300 hover:shadow-lg",
      "bg-gradient-to-br from-card to-card/50",
      variant === "success" && "border-success/20 hover:border-success/40",
      variant === "danger" && "border-danger/20 hover:border-danger/40"
    )}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className={cn(
            "text-3xl font-bold tracking-tight",
            variant === "success" && "text-success",
            variant === "danger" && "text-danger"
          )}>
            {value}
          </p>
          {trend && (
            <p className="text-xs text-muted-foreground">{trend}</p>
          )}
        </div>
        <div className={cn(
          "rounded-lg p-3",
          variant === "success" && "bg-success-light",
          variant === "danger" && "bg-danger-light",
          variant === "default" && "bg-muted"
        )}>
          <Icon className={cn(
            "h-5 w-5",
            variant === "success" && "text-success",
            variant === "danger" && "text-danger",
            variant === "default" && "text-muted-foreground"
          )} />
        </div>
      </div>
    </Card>
  );
}
