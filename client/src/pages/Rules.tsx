import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RuleCard } from "@/components/RuleCard";
import { PasswordModal } from "@/components/PasswordModal";
import { Plus, FileText, Globe } from "lucide-react";
import { type Rule, type InsertRule, type Shift, UserRole } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function Rules() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [ruleType, setRuleType] = useState<"general" | "shift">("general");
  const [selectedShift, setSelectedShift] = useState<string>("");
  const [editingRule, setEditingRule] = useState<Rule | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<{ type: "create" | "update" | "delete", data?: any }>({ type: "create" });

  const { data: rules = [], isLoading } = useQuery<Rule[]>({
    queryKey: ["/api/rules"],
  });

  const { data: shifts = [] } = useQuery<Shift[]>({
    queryKey: ["/api/shifts"],
  });

  const createMutation = useMutation({
    mutationFn: async (rule: InsertRule) => {
      return apiRequest("POST", "/api/rules", rule);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rules"] });
      toast({
        title: "Sucesso!",
        description: "Regra criada com sucesso",
      });
      resetForm();
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível criar a regra",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: Partial<Rule> }) => {
      return apiRequest("PATCH", `/api/rules/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rules"] });
      toast({
        title: "Sucesso!",
        description: "Regra atualizada com sucesso",
      });
      resetForm();
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a regra",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/rules/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rules"] });
      toast({
        title: "Sucesso!",
        description: "Regra removida com sucesso",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível remover a regra",
        variant: "destructive",
      });
    },
  });

  const canManage = user?.role === UserRole.DIRETOR || user?.role === UserRole.VICE_DIRETOR;

  const resetForm = () => {
    setTitle("");
    setContent("");
    setRuleType("general");
    setSelectedShift("");
    setEditingRule(null);
    setPendingAction({ type: "create" });
  };

  const handleSubmit = () => {
    if (!title.trim() || !content.trim()) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos",
        variant: "destructive",
      });
      return;
    }

    if (ruleType === "shift" && !selectedShift) {
      toast({
        title: "Erro",
        description: "Selecione um turno",
        variant: "destructive",
      });
      return;
    }

    const ruleData: InsertRule = {
      title: title.trim(),
      content: content.trim(),
      type: ruleType,
      shiftId: ruleType === "shift" ? selectedShift : null,
    };

    if (editingRule) {
      setPendingAction({ type: "update", data: { id: editingRule.id, ...ruleData } });
    } else {
      setPendingAction({ type: "create", data: ruleData });
    }
    setShowPasswordModal(true);
  };

  const handleEdit = (rule: Rule) => {
    setEditingRule(rule);
    setTitle(rule.title);
    setContent(rule.content);
    setRuleType(rule.type);
    setSelectedShift(rule.shiftId || "");
  };

  const handleDelete = (id: string) => {
    setPendingAction({ type: "delete", data: id });
    setShowPasswordModal(true);
  };

  const handlePasswordConfirm = async (password: string) => {
    try {
      let shiftId: string;
      if (ruleType === "shift") {
        shiftId = selectedShift;
      } else {
        shiftId = user?.shiftId && user.shiftId.trim() !== "" ? user.shiftId : "general";
      }
      const response = await apiRequest("POST", "/api/auth/validate-password", {
        shiftId,
        password,
      });

      const result = await response.json();
      
      if (!result.valid) {
        toast({
          title: "Erro",
          description: "Senha incorreta",
          variant: "destructive",
        });
        return;
      }

      if (pendingAction.type === "create") {
        createMutation.mutate(pendingAction.data);
      } else if (pendingAction.type === "update") {
        updateMutation.mutate({ id: pendingAction.data.id, data: pendingAction.data });
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

  const generalRules = rules.filter(r => r.type === "general");
  const shiftRules = rules.filter(r => r.type === "shift");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2" data-testid="text-page-title">
          Regras
        </h1>
        <p className="text-muted-foreground">
          Gerencie as regras gerais e específicas por turno
        </p>
      </div>

      {canManage && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              {editingRule ? "Editar Regra" : "Adicionar Regra"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Horário de funcionamento"
                  data-testid="input-rule-title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ruleType">Tipo</Label>
                <Select value={ruleType} onValueChange={(value: "general" | "shift") => setRuleType(value)}>
                  <SelectTrigger id="ruleType" data-testid="select-rule-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">Geral</SelectItem>
                    <SelectItem value="shift">Turno</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {ruleType === "shift" && (
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

            <div className="space-y-2">
              <Label htmlFor="content">Conteúdo</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Descreva a regra..."
                className="min-h-[120px]"
                data-testid="textarea-rule-content"
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleSubmit}
                disabled={createMutation.isPending || updateMutation.isPending}
                data-testid="button-save-rule"
              >
                <Plus className="h-4 w-4 mr-2" />
                {editingRule ? "Atualizar" : "Adicionar"}
              </Button>
              {editingRule && (
                <Button
                  variant="outline"
                  onClick={resetForm}
                  data-testid="button-cancel-edit"
                >
                  Cancelar
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* General Rules */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">
            Regras Gerais ({generalRules.length})
          </h2>
        </div>
        {isLoading ? (
          <p className="text-muted-foreground">Carregando...</p>
        ) : generalRules.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhuma regra geral cadastrada</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {generalRules.map((rule) => (
              <RuleCard
                key={rule.id}
                rule={rule}
                onEdit={canManage ? handleEdit : undefined}
                onDelete={canManage ? handleDelete : undefined}
                showActions={canManage}
              />
            ))}
          </div>
        )}
      </section>

      {/* Shift Rules */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">
            Regras por Turno ({shiftRules.length})
          </h2>
        </div>
        {shiftRules.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhuma regra de turno cadastrada</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {shiftRules.map((rule) => (
              <RuleCard
                key={rule.id}
                rule={rule}
                onEdit={canManage ? handleEdit : undefined}
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
