import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface FinancialCardProps {
  title: string;
  amount: number;
  currency?: string;
  trend?: "up" | "down" | "neutral";
  trendPercentage?: number;
  subtitle?: string;
  variant?: "default" | "success" | "warning" | "danger";
  icon?: React.ReactNode;
}

export function FinancialCard({
  title,
  amount,
  currency = "₹",
  trend,
  trendPercentage,
  subtitle,
  variant = "default",
  icon
}: FinancialCardProps) {
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN').format(amount);
  };

  const getTrendIcon = () => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4" />;
      case "down":
        return <TrendingDown className="h-4 w-4" />;
      default:
        return <Minus className="h-4 w-4" />;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case "up":
        return "text-driver-success";
      case "down":
        return "text-driver-danger";
      default:
        return "text-muted-foreground";
    }
  };

  const getCardVariant = () => {
    switch (variant) {
      case "success":
        return "border-driver-success/20 bg-gradient-to-br from-driver-success/5 to-transparent";
      case "warning":
        return "border-driver-warning/20 bg-gradient-to-br from-driver-warning/5 to-transparent";
      case "danger":
        return "border-driver-danger/20 bg-gradient-to-br from-driver-danger/5 to-transparent";
      default:
        return "border-driver-primary/20 bg-gradient-to-br from-driver-primary/5 to-transparent";
    }
  };

  return (
    <Card className={cn("transition-all duration-200 hover:shadow-lg", getCardVariant())}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon && (
          <div className={cn(
            "p-2 rounded-lg",
            variant === "success" && "bg-driver-success/10 text-driver-success",
            variant === "warning" && "bg-driver-warning/10 text-driver-warning",
            variant === "danger" && "bg-driver-danger/10 text-driver-danger",
            variant === "default" && "bg-driver-primary/10 text-driver-primary"
          )}>
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline justify-between">
          <div>
            <div className="text-2xl font-bold text-foreground">
              {currency}{formatAmount(amount)}
            </div>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-1">
                {subtitle}
              </p>
            )}
          </div>
          {trend && trendPercentage && (
            <Badge variant="outline" className={cn("gap-1", getTrendColor())}>
              {getTrendIcon()}
              {trendPercentage}%
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}