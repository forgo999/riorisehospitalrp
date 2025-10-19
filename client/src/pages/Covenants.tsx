import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CovenantCard } from "@/components/CovenantCard";
import { PasswordModal } from "@/components/PasswordModal";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Building2, Clock } from "lucide-react";
import { type Covenant, type InsertCovenant, UserRole } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { calculateCovenantTime } from "@/lib/timeUtils";

export default function Covenants() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [organizationName, setOrganizationName] = useState("");
  const [amountPaid, setAmountPaid] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [pendingCovenant, setPendingCovenant] = useState<InsertCovenant | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingCovenant, setEditingCovenant] = useState<Covenant | null>(null);
  const [additionalAmount, setAdditionalAmount] = useState("");

  const { data: covenants = [], isLoading } = useQuery<Covenant[]>({
    queryKey: ["/api/covenants"],
  });

  const createMutation = useMutation({
    mutationFn: async (covenant: InsertCovenant) => {
      return apiRequest("POST", "/api/covenants", covenant);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/covenants"] });
      toast({
        title: "Sucesso!",
        description: "Convênio adicionado com sucesso",
      });
      setOrganizationName("");
      setAmountPaid("");
      setPendingCovenant(null);
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o convênio",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/covenants/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/covenants"] });
      toast({
        title: "Sucesso!",
        description: "Convênio removido com sucesso",
      });
      setDeleteId(null);
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível remover o convênio",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, additionalAmount }: { id: string; additionalAmount: number }) => {
      return apiRequest("PATCH", `/api/covenants/${id}`, { additionalAmount });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/covenants"] });
      toast({
        title: "Sucesso!",
        description: "Convênio estendido com sucesso",
      });
      setEditingCovenant(null);
      setAdditionalAmount("");
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível estender o convênio",
        variant: "destructive",
      });
    },
  });

  const canManage = user?.role === UserRole.DIRETOR || user?.role === UserRole.VICE_DIRETOR || user?.role === UserRole.ADMINISTRADOR;

  const handleAddCovenant = () => {
    const amount = parseFloat(amountPaid);
    if (!organizationName.trim() || isNaN(amount) || amount <= 0) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos corretamente",
        variant: "destructive",
      });
      return;
    }

    setPendingCovenant({
      organizationName: organizationName.trim(),
      amountPaid: amount,
    });
    setShowPasswordModal(true);
  };

  const handlePasswordConfirm = async (password: string) => {
    if (!pendingCovenant) return;

    try {
      const response = await apiRequest("POST", "/api/auth/validate-password", {
        shiftId: "general",
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

      createMutation.mutate(pendingCovenant);
      setShowPasswordModal(false);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Senha incorreta",
        variant: "destructive",
      });
    }
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
    setShowPasswordModal(true);
  };

  const handleEdit = (covenant: Covenant) => {
    setEditingCovenant(covenant);
  };

  const handleExtendCovenant = () => {
    const amount = parseFloat(additionalAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Erro",
        description: "Digite um valor válido",
        variant: "destructive",
      });
      return;
    }
    setShowPasswordModal(true);
  };

  const handleDeleteConfirm = async (password: string) => {
    if (!deleteId) return;

    try {
      const response = await apiRequest("POST", "/api/auth/validate-password", {
        shiftId: "general",
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

      deleteMutation.mutate(deleteId);
      setShowPasswordModal(false);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Senha incorreta",
        variant: "destructive",
      });
    }
  };

  const handleEditConfirm = async (password: string) => {
    if (!editingCovenant) return;

    const amount = parseFloat(additionalAmount);
    if (isNaN(amount) || amount <= 0) return;

    try {
      const response = await apiRequest("POST", "/api/auth/validate-password", {
        shiftId: "general",
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

      updateMutation.mutate({ id: editingCovenant.id, additionalAmount: amount });
      setShowPasswordModal(false);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Senha incorreta",
        variant: "destructive",
      });
    }
  };

  const activeCovenants = covenants.filter(c => {
    const end = new Date(c.endDate).getTime();
    return end > new Date().getTime();
  });

  const expiredCovenants = covenants.filter(c => {
    const end = new Date(c.endDate).getTime();
    return end <= new Date().getTime();
  });

  const calculatePreview = () => {
    const amount = parseFloat(amountPaid);
    if (isNaN(amount) || amount <= 0) return null;
    
    const totalSeconds = calculateCovenantTime(amount);
    const days = Math.floor(totalSeconds / (24 * 60 * 60));
    const hours = Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
    const seconds = totalSeconds % 60;
    
    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  };

  const calculateExtensionPreview = () => {
    if (!editingCovenant) return null;
    const amount = parseFloat(additionalAmount);
    if (isNaN(amount) || amount <= 0) return null;

    // Calcular dias restantes do convênio atual
    const now = new Date();
    const currentEndDate = new Date(editingCovenant.endDate);
    const remainingMs = Math.max(0, currentEndDate.getTime() - now.getTime());
    const remainingDays = Math.floor(remainingMs / (24 * 60 * 60 * 1000));

    // Calcular novos dias baseados no valor adicional
    const additionalSeconds = calculateCovenantTime(amount);
    const additionalDays = Math.floor(additionalSeconds / (24 * 60 * 60));

    const totalDays = remainingDays + additionalDays;
    
    return {
      remainingDays,
      additionalDays,
      totalDays
    };
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2" data-testid="text-page-title">
          Convênios
        </h1>
        <p className="text-muted-foreground">
          Gerencie os convênios hospitalares e acompanhe os prazos
        </p>
      </div>

      {canManage && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Adicionar Convênio
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="organizationName">Nome da Família/Organização</Label>
                <Input
                  id="organizationName"
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                  placeholder="Ex: Família Silva"
                  data-testid="input-organization-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amountPaid">Valor (R$)</Label>
                <Input
                  id="amountPaid"
                  type="number"
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                  placeholder="Ex: 4000"
                  data-testid="input-amount-paid"
                />
                <p className="text-xs text-muted-foreground">
                  R$ 1.000 = 1 semana • R$ 4.000 = 1 mês
                </p>
              </div>
            </div>
            
            {calculatePreview() && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Tempo calculado:</p>
                <p className="font-mono text-lg font-semibold text-primary" data-testid="text-time-preview">
                  {calculatePreview()}
                </p>
              </div>
            )}

            <Button
              onClick={handleAddCovenant}
              disabled={createMutation.isPending}
              data-testid="button-add-covenant"
            >
              <Plus className="h-4 w-4 mr-2" />
              {createMutation.isPending ? "Adicionando..." : "Adicionar Convênio"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Active Covenants */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">
            Convênios Ativos ({activeCovenants.length})
          </h2>
        </div>
        {isLoading ? (
          <p className="text-muted-foreground">Carregando...</p>
        ) : activeCovenants.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhum convênio ativo no momento</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeCovenants.map((covenant) => (
              <CovenantCard
                key={covenant.id}
                covenant={covenant}
                onDelete={canManage ? handleDelete : undefined}
                onEdit={canManage ? handleEdit : undefined}
                showActions={canManage}
              />
            ))}
          </div>
        )}
      </section>

      {/* Expired Covenants */}
      {expiredCovenants.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-muted-foreground">
            Convênios Expirados ({expiredCovenants.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {expiredCovenants.map((covenant) => (
              <CovenantCard
                key={covenant.id}
                covenant={covenant}
                onDelete={canManage ? handleDelete : undefined}
                onEdit={canManage ? handleEdit : undefined}
                showActions={canManage}
              />
            ))}
          </div>
        </section>
      )}

      <Dialog open={!!editingCovenant} onOpenChange={(open) => !open && setEditingCovenant(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Estender Convênio
            </DialogTitle>
            <DialogDescription>
              Adicione um valor para estender o prazo de validade do convênio
            </DialogDescription>
          </DialogHeader>
          
          {editingCovenant && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg space-y-2">
                <p className="text-sm font-medium">{editingCovenant.organizationName}</p>
                <p className="text-xs text-muted-foreground">
                  Valor atual: R$ {editingCovenant.amountPaid.toFixed(2)}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="additionalAmount">Valor Adicional (R$)</Label>
                <Input
                  id="additionalAmount"
                  type="number"
                  value={additionalAmount}
                  onChange={(e) => setAdditionalAmount(e.target.value)}
                  placeholder="Ex: 2000"
                  data-testid="input-additional-amount"
                />
                <p className="text-xs text-muted-foreground">
                  R$ 1.000 = 1 semana • R$ 4.000 = 1 mês
                </p>
              </div>

              {calculateExtensionPreview() && (
                <div className="p-4 bg-primary/10 rounded-lg space-y-2">
                  <p className="text-sm font-medium mb-2">Cálculo de Extensão:</p>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Dias restantes:</span>
                      <span className="font-semibold">{calculateExtensionPreview()!.remainingDays} dias</span>
                    </div>
                    <div className="flex justify-between text-primary">
                      <span>+ Dias adicionais:</span>
                      <span className="font-semibold">+{calculateExtensionPreview()!.additionalDays} dias</span>
                    </div>
                    <div className="border-t pt-1 mt-2 flex justify-between">
                      <span className="font-medium">Total:</span>
                      <span className="font-bold text-lg">{calculateExtensionPreview()!.totalDays} dias</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setEditingCovenant(null);
                    setAdditionalAmount("");
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleExtendCovenant}
                  disabled={updateMutation.isPending}
                  data-testid="button-confirm-extend"
                >
                  {updateMutation.isPending ? "Estendendo..." : "Confirmar"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <PasswordModal
        isOpen={showPasswordModal}
        onClose={() => {
          setShowPasswordModal(false);
          setPendingCovenant(null);
          setDeleteId(null);
          setAdditionalAmount("");
        }}
        onConfirm={
          editingCovenant 
            ? handleEditConfirm 
            : deleteId 
            ? handleDeleteConfirm 
            : handlePasswordConfirm
        }
      />
    </div>
  );
}
