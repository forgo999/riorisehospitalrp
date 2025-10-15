import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MeCommandCard } from "@/components/MeCommandCard";
import { PasswordModal } from "@/components/PasswordModal";
import { Plus, MessageSquare, Globe } from "lucide-react";
import { type MeCommand, type InsertMeCommand, type Shift, UserRole } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function MeCommands() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [commandText, setCommandText] = useState("");
  const [commandType, setCommandType] = useState<"general" | "shift">("general");
  const [selectedShift, setSelectedShift] = useState<string>("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<{ type: "create" | "delete", data?: any }>({ type: "create" });

  const { data: commands = [], isLoading } = useQuery<MeCommand[]>({
    queryKey: ["/api/me-commands"],
  });

  const { data: shifts = [] } = useQuery<Shift[]>({
    queryKey: ["/api/shifts"],
  });

  const createMutation = useMutation({
    mutationFn: async (command: InsertMeCommand) => {
      return apiRequest("POST", "/api/me-commands", command);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/me-commands"] });
      toast({
        title: "Sucesso!",
        description: "Comando /me criado com sucesso",
      });
      resetForm();
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível criar o comando",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/me-commands/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/me-commands"] });
      toast({
        title: "Sucesso!",
        description: "Comando /me removido com sucesso",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível remover o comando",
        variant: "destructive",
      });
    },
  });

  const canManage = user?.role === UserRole.DIRETOR || user?.role === UserRole.VICE_DIRETOR;

  const resetForm = () => {
    setCommandText("");
    setCommandType("general");
    setSelectedShift("");
    setPendingAction({ type: "create" });
  };

  const handleSubmit = () => {
    if (!commandText.trim()) {
      toast({
        title: "Erro",
        description: "Digite o texto do comando",
        variant: "destructive",
      });
      return;
    }

    if (commandType === "shift" && !selectedShift) {
      toast({
        title: "Erro",
        description: "Selecione um turno",
        variant: "destructive",
      });
      return;
    }

    const commandData: InsertMeCommand = {
      text: commandText.trim(),
      type: commandType,
      shiftId: commandType === "shift" ? selectedShift : null,
    };

    setPendingAction({ type: "create", data: commandData });
    setShowPasswordModal(true);
  };

  const handleDelete = (id: string) => {
    setPendingAction({ type: "delete", data: id });
    setShowPasswordModal(true);
  };

  const handlePasswordConfirm = async (password: string) => {
    try {
      const shiftId = commandType === "shift" ? selectedShift : user?.shiftId || "general";
      await apiRequest("POST", "/api/auth/validate-password", {
        shiftId,
        password,
      });

      if (pendingAction.type === "create") {
        createMutation.mutate(pendingAction.data);
      } else if (pendingAction.type === "delete") {
        deleteMutation.mutate(pendingAction.data);
      }

      setShowPasswordModal(false);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Senha incorreta",
        variant: "destructive",
      });
    }
  };

  const generalCommands = commands.filter(c => c.type === "general");
  const shiftCommands = commands.filter(c => c.type === "shift");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2" data-testid="text-page-title">
          Comandos /me
        </h1>
        <p className="text-muted-foreground">
          Templates de ações para roleplay - copie e use no jogo
        </p>
      </div>

      {canManage && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Adicionar Comando /me
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="commandType">Tipo</Label>
                <Select value={commandType} onValueChange={(value: "general" | "shift") => setCommandType(value)}>
                  <SelectTrigger id="commandType" data-testid="select-command-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">Geral</SelectItem>
                    <SelectItem value="shift">Turno</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {commandType === "shift" && (
                <div className="space-y-2">
                  <Label htmlFor="shift">Turno</Label>
                  <Select value={selectedShift} onValueChange={setSelectedShift}>
                    <SelectTrigger id="shift" data-testid="select-shift">
                      <SelectValue placeholder="Selecione um turno" />
                    </SelectTrigger>
                    <SelectContent>
                      {shifts.map((shift) => (
                        <SelectItem key={shift.id} value={shift.id}>
                          {shift.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="commandText">Texto do Comando</Label>
              <Input
                id="commandText"
                value={commandText}
                onChange={(e) => setCommandText(e.target.value)}
                placeholder="Ex: /me analisando exame de sangue..."
                data-testid="input-command-text"
              />
            </div>

            <Button
              onClick={handleSubmit}
              disabled={createMutation.isPending}
              data-testid="button-add-command"
            >
              <Plus className="h-4 w-4 mr-2" />
              {createMutation.isPending ? "Adicionando..." : "Adicionar Comando"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* General Commands */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">
            Comandos Gerais ({generalCommands.length})
          </h2>
        </div>
        {isLoading ? (
          <p className="text-muted-foreground">Carregando...</p>
        ) : generalCommands.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhum comando geral cadastrado</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {generalCommands.map((command) => (
              <MeCommandCard
                key={command.id}
                command={command}
                onDelete={canManage ? handleDelete : undefined}
                showActions={canManage}
              />
            ))}
          </div>
        )}
      </section>

      {/* Shift Commands */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">
            Comandos por Turno ({shiftCommands.length})
          </h2>
        </div>
        {shiftCommands.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhum comando de turno cadastrado</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {shiftCommands.map((command) => (
              <MeCommandCard
                key={command.id}
                command={command}
                onDelete={canManage ? handleDelete : undefined}
                showActions={canManage}
              />
            ))}
          </div>
        )}
      </section>

      <PasswordModal
        isOpen={showPasswordModal}
        onClose={() => {
          setShowPasswordModal(false);
          setPendingAction({ type: "create" });
        }}
        onConfirm={handlePasswordConfirm}
      />
    </div>
  );
}
