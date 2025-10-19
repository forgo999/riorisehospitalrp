import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, Building2, Edit } from "lucide-react";
import { type Covenant } from "@shared/schema";
import { calculateTimeRemaining, formatTimeRemaining } from "@/lib/timeUtils";

interface CovenantCardProps {
  covenant: Covenant;
  onDelete?: (id: string) => void;
  onEdit?: (covenant: Covenant) => void;
  showActions?: boolean;
}

export function CovenantCard({ covenant, onDelete, onEdit, showActions = false }: CovenantCardProps) {
  const [timeRemaining, setTimeRemaining] = useState(calculateTimeRemaining(covenant.endDate));

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining(covenant.endDate));
    }, 1000);

    return () => clearInterval(interval);
  }, [covenant.endDate]);

  const getStatusBadge = () => {
    if (timeRemaining.isExpired) {
      return <Badge variant="destructive" data-testid="badge-status-expired">Expirado</Badge>;
    }
    if (timeRemaining.isExpiringSoonMedium) {
      return <Badge className="bg-chart-3 text-black" data-testid="badge-status-expiring-soon">Expirando</Badge>;
    }
    if (timeRemaining.isExpiringSoon) {
      return <Badge className="bg-chart-3/60 text-black" data-testid="badge-status-expiring">Atenção</Badge>;
    }
    return <Badge className="bg-chart-2" data-testid="badge-status-active">Ativo</Badge>;
  };

  const getTimerColor = () => {
    if (timeRemaining.isExpired) return "text-destructive";
    if (timeRemaining.isExpiringSoonMedium) return "text-chart-3";
    if (timeRemaining.isExpiringSoon) return "text-chart-3/80";
    return "text-chart-2";
  };

  const progressPercentage = Math.min(
    100,
    (timeRemaining.totalSeconds / covenant.totalSeconds) * 100
  );

  return (
    <Card className="hover-elevate" data-testid={`card-covenant-${covenant.id}`}>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-3">
        <div className="flex items-center gap-2 min-w-0">
          <Building2 className="h-5 w-5 text-primary flex-shrink-0" />
          <CardTitle className="text-lg truncate" data-testid="text-organization-name">
            {covenant.organizationName}
          </CardTitle>
        </div>
        {getStatusBadge()}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className={`font-mono text-3xl font-bold ${getTimerColor()}`} data-testid="text-timer">
            {formatTimeRemaining(timeRemaining)}
          </div>
          <div className="text-sm text-muted-foreground">
            <span data-testid="text-amount-paid">R$ {covenant.amountPaid.toFixed(2)}</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                timeRemaining.isExpired
                  ? "bg-destructive"
                  : timeRemaining.isExpiringSoonMedium
                  ? "bg-chart-3"
                  : timeRemaining.isExpiringSoon
                  ? "bg-chart-3/80"
                  : "bg-chart-2"
              }`}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span data-testid="text-days-remaining">{timeRemaining.days} dias restantes</span>
            <span data-testid="text-total-time">
              {Math.floor(covenant.totalSeconds / (24 * 60 * 60))} dias total
            </span>
          </div>
        </div>

        {showActions && (onDelete || onEdit) && (
          <div className="flex gap-2">
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => onEdit(covenant)}
                data-testid="button-edit-covenant"
              >
                <Edit className="h-4 w-4 mr-2" />
                Estender
              </Button>
            )}
            {onDelete && (
              <Button
                variant="destructive"
                size="sm"
                className="flex-1"
                onClick={() => onDelete(covenant.id)}
                data-testid="button-delete-covenant"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Remover
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
