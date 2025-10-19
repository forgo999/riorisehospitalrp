1.import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, Trash2, FileText } from "lucide-react";
import { type MeCommand } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface MeCommandCardProps {
  command: MeCommand;
  onDelete?: (id: string) => void;
  showActions?: boolean;
}

export function MeCommandCard({ command, onDelete, showActions = false }: MeCommandCardProps) {
  const { toast } = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(command.text);
      toast({
        title: "Copiado!",
        description: "Comando /me copiado para a área de transferência",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível copiar o comando",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="hover-elevate" data-testid={`card-me-command-${command.id}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <FileText className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1 space-y-2">
              <p className="text-sm font-medium leading-relaxed" data-testid="text-me-command">
                {command.text}
              </p>
              <Badge 
                variant={command.type === "general" ? "secondary" : "default"}
                data-testid="badge-command-type"
              >
                {command.type === "general" ? "Geral" : "Turno"}
              </Badge>
            </div>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <Button
              size="icon"
              variant="outline"
              onClick={handleCopy}
              data-testid="button-copy-command"
            >
              <Copy className="h-4 w-4" />
            </Button>
            {showActions && onDelete && (
              <Button
                size="icon"
                variant="destructive"
                onClick={() => onDelete(command.id)}
                data-testid="button-delete-command"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
