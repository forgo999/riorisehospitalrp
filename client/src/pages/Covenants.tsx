import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CovenantCard } from "@/components/CovenantCard";
import { PasswordModal } from "@/components/PasswordModal";
import { Plus, Building2 } from "lucide-react";
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

  const canManage = user?.role === UserRole.DIRETOR || user?.role === UserRole.VICE_DIRETOR;

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
      await apiRequest("POST", "/api/auth/validate-password", {
        shiftId: user?.shiftId || "general",
        password,
      });

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

  const handleDeleteConfirm = async (password: string) => {
    if (!deleteId) return;

    try {
      await apiRequest("POST", "/api/auth/validate-password", {
        shiftId: user?.shiftId || "general",
        password,
      });

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
                showActions={canManage}
              />
            ))}
          </div>
        </section>
      )}

      <PasswordModal
        isOpen={showPasswordModal}
        onClose={() => {
          setShowPasswordModal(false);
          setPendingCovenant(null);
          setDeleteId(null);
        }}
        onConfirm={deleteId ? handleDeleteConfirm : handlePasswordConfirm}
      />
    </div>
  );
}
