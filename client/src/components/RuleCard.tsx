import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, FileCheck } from "lucide-react";
import { type Rule } from "@shared/schema";

interface RuleCardProps {
  rule: Rule;
  onEdit?: (rule: Rule) => void;
  onDelete?: (id: string) => void;
  showActions?: boolean;
}

export function RuleCard({ rule, onEdit, onDelete, showActions = false }: RuleCardProps) {
  const formattedDate = new Date(rule.updatedAt).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });

  return (
    <Card className="hover-elevate" data-testid={`card-rule-${rule.id}`}>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-3">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <FileCheck className="h-5 w-5 text-primary flex-shrink-0" />
          <CardTitle className="text-lg truncate" data-testid="text-rule-title">
            {rule.title}
          </CardTitle>
        </div>
        <Badge 
          variant={rule.type === "general" ? "secondary" : "default"}
          data-testid="badge-rule-type"
        >
          {rule.type === "general" ? "Geral" : "Turno"}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap" data-testid="text-rule-content">
          {rule.content}
        </p>
        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-muted-foreground" data-testid="text-rule-updated">
            Atualizado: {formattedDate}
          </span>
          {showActions && (
            <div className="flex gap-2">
              {onEdit && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onEdit(rule)}
                  data-testid="button-edit-rule"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
              )}
              {onDelete && (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => onDelete(rule.id)}
                  data-testid="button-delete-rule"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
