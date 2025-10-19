import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { TrendingUp, User, Calendar, Award, ArrowUp, ArrowDown, ArrowRight } from "lucide-react";
import { type Promotion, type User as UserType, type Shift, UserRole, type InsertPromotion } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";

export default function Promotions() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [toRole, setToRole] = useState<UserRole>(UserRole.PARAMEDICO);
  const [makeChiefSurgeon, setMakeChiefSurgeon] = useState(false);
  const [notes, setNotes] = useState("");
  const [viewingUserId, setViewingUserId] = useState<string | null>(null);

  const canPromote = user?.role === UserRole.VICE_DIRETOR || user?.role === UserRole.DIRETOR || user?.role === UserRole.ADMINISTRADOR;

  const { data: promotions = [] } = useQuery<Promotion[]>({
    queryKey: ["/api/promotions"],
  });

  const { data: users = [] } = useQuery<UserType[]>({
    queryKey: ["/api/users"],
  });

  const { data: shifts = [] } = useQuery<Shift[]>({
    queryKey: ["/api/shifts"],
  });

  const createPromotionMutation = useMutation({
    mutationFn: async (promotionData: any) => {
      const res = await apiRequest("POST", "/api/promotions", promotionData);
      return res.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/promotions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      
      const actionType = isPromotion(variables.fromRole, variables.toRole) 
        ? "Promoção realizada" 
        : isDemotion(variables.fromRole, variables.toRole) 
          ? "Rebaixamento realizado" 
          : "Cargo alterado";
      
      toast({
        title: "Sucesso!",
        description: `${actionType} com sucesso`,
      });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível realizar a promoção",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setSelectedUser("");
    setToRole(UserRole.PARAMEDICO);
    setMakeChiefSurgeon(false);
    setNotes("");
  };

  const roleHierarchy: Record<UserRole, number> = {
    [UserRole.ESTAGIARIO]: 1,
    [UserRole.PARAMEDICO]: 2,
    [UserRole.TERAPEUTA]: 3,
    [UserRole.CIRURGIAO]: 4,
    [UserRole.VICE_DIRETOR]: 5,
    [UserRole.DIRETOR]: 6,
    [UserRole.ADMINISTRADOR]: 7,
  };

  const isPromotion = (fromRole: UserRole, toRole: UserRole) => {
    return roleHierarchy[toRole] > roleHierarchy[fromRole];
  };

  const isDemotion = (fromRole: UserRole, toRole: UserRole) => {
    return roleHierarchy[toRole] < roleHierarchy[fromRole];
  };

  const handleSubmit = () => {
    const selectedUserData = users.find(u => u.id === selectedUser);
    
    if (!selectedUserData) {
      toast({
        title: "Erro",
        description: "Selecione um usuário",
        variant: "destructive",
      });
      return;
    }

    const promotionData = {
      userId: selectedUser,
      fromRole: selectedUserData.role,
      toRole: toRole,
      shiftId: selectedUserData.shiftId,
      notes: notes.trim() || undefined,
      makeChiefSurgeon: makeChiefSurgeon
    };

    createPromotionMutation.mutate(promotionData);
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMINISTRADOR:
        return "bg-red-600 text-white";
      case UserRole.DIRETOR:
        return "bg-primary text-primary-foreground";
      case UserRole.VICE_DIRETOR:
        return "bg-chart-1 text-white";
      case UserRole.CIRURGIAO:
        return "bg-chart-2 text-white";
      case UserRole.TERAPEUTA:
        return "bg-chart-3 text-black";
      case UserRole.PARAMEDICO:
        return "bg-chart-4 text-white";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  const getRoleLabel = (role: UserRole, isChiefSurgeon?: boolean) => {
    if (role === UserRole.CIRURGIAO && isChiefSurgeon) {
      return "Cirurgião Chefe";
    }
    
    switch (role) {
      case UserRole.ADMINISTRADOR:
        return "Desenvolvedor";
      case UserRole.DIRETOR:
        return "Diretor";
      case UserRole.VICE_DIRETOR:
        return "Vice-Diretor";
      case UserRole.CIRURGIAO:
        return "Cirurgião";
      case UserRole.TERAPEUTA:
        return "Terapeuta";
      case UserRole.PARAMEDICO:
        return "Paramédico";
      case UserRole.ESTAGIARIO:
        return "Estagiário";
      default:
        return role;
    }
  };

  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user?.name || "Usuário não encontrado";
  };

  const getShiftName = (shiftId: string | null) => {
    if (!shiftId) return "-";
    const shift = shifts.find(s => s.id === shiftId);
    return shift?.name || "Turno desconhecido";
  };

  const getAvailableRoles = (currentRole: UserRole): UserRole[] => {
    if (user?.role === UserRole.ADMINISTRADOR || user?.role === UserRole.DIRETOR) {
      return Object.values(UserRole);
    }
    
    if (user?.role === UserRole.VICE_DIRETOR) {
      return [
        UserRole.ESTAGIARIO,
        UserRole.PARAMEDICO,
        UserRole.TERAPEUTA,
        UserRole.CIRURGIAO
      ];
    }

    return [];
  };

  const filteredUsers = users.filter(u => {
    if (user?.role === UserRole.VICE_DIRETOR) {
      return u.shiftId === user.shiftId;
    }
    return true;
  });

  const filteredPromotions = promotions
    .filter(p => {
      if (viewingUserId) {
        return p.userId === viewingUserId;
      }
      if (user?.role === UserRole.VICE_DIRETOR) {
        return p.shiftId === user.shiftId;
      }
      return true;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const selectedUserData = users.find(u => u.id === selectedUser);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold mb-2" data-testid="text-page-title">
            Promoções
          </h1>
          <p className="text-muted-foreground">
            Gerencie promoções e histórico de membros
          </p>
        </div>

        {canPromote && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2" data-testid="button-add-promotion">
                <TrendingUp className="h-4 w-4" />
                Alterar Cargo
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {selectedUserData && toRole ? (
                    isPromotion(selectedUserData.role, toRole) ? "Promover Membro" :
                    isDemotion(selectedUserData.role, toRole) ? "Rebaixar Membro" :
                    "Alterar Cargo"
                  ) : "Alterar Cargo do Membro"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="user">Selecione o Membro</Label>
                  <Select value={selectedUser} onValueChange={setSelectedUser}>
                    <SelectTrigger id="user" data-testid="select-user">
                      <SelectValue placeholder="Escolha um membro" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredUsers.map((u) => (
                        <SelectItem key={u.id} value={u.id}>
                          {u.name} - {getRoleLabel(u.role, u.isChiefSurgeon)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedUserData && (
                  <>
                    <div className="p-3 bg-muted rounded-lg space-y-1">
                      <p className="text-sm font-medium">Cargo Atual</p>
                      <Badge className={getRoleBadgeColor(selectedUserData.role)}>
                        {getRoleLabel(selectedUserData.role, selectedUserData.isChiefSurgeon)}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="toRole">
                        {selectedUserData && toRole ? (
                          isPromotion(selectedUserData.role, toRole) ? "Promover para" :
                          isDemotion(selectedUserData.role, toRole) ? "Rebaixar para" :
                          "Alterar para"
                        ) : "Novo cargo"}
                      </Label>
                      <Select value={toRole} onValueChange={(value) => setToRole(value as UserRole)}>
                        <SelectTrigger id="toRole" data-testid="select-to-role">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {getAvailableRoles(selectedUserData.role).map((role) => (
                            <SelectItem key={role} value={role}>
                              {getRoleLabel(role)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {toRole === UserRole.CIRURGIAO && (
                      <div className="flex items-center space-x-2 p-3 bg-muted rounded-lg">
                        <Checkbox
                          id="chiefSurgeon"
                          checked={makeChiefSurgeon}
                          onCheckedChange={(checked) => setMakeChiefSurgeon(checked as boolean)}
                          data-testid="checkbox-chief-surgeon"
                        />
                        <Label htmlFor="chiefSurgeon" className="cursor-pointer">
                          Tornar Cirurgião Chefe (rebaixa o atual)
                        </Label>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="notes">Observações (opcional)</Label>
                      <Textarea
                        id="notes"
                        placeholder={
                          isPromotion(selectedUserData.role, toRole) 
                            ? "Motivo da promoção, desempenho, etc..." 
                            : isDemotion(selectedUserData.role, toRole)
                              ? "Motivo do rebaixamento..."
                              : "Observações sobre a alteração..."
                        }
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={3}
                        data-testid="textarea-notes"
                      />
                    </div>

                    <Button 
                      onClick={handleSubmit} 
                      className="w-full gap-2"
                      disabled={createPromotionMutation.isPending}
                      data-testid="button-confirm-promotion"
                    >
                      {isPromotion(selectedUserData.role, toRole) ? (
                        <>
                          <ArrowUp className="h-4 w-4" />
                          Confirmar Promoção
                        </>
                      ) : isDemotion(selectedUserData.role, toRole) ? (
                        <>
                          <ArrowDown className="h-4 w-4" />
                          Confirmar Rebaixamento
                        </>
                      ) : (
                        <>
                          <ArrowRight className="h-4 w-4" />
                          Confirmar Alteração
                        </>
                      )}
                    </Button>
                  </>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Histórico de Promoções
          </h2>
          <Select value={viewingUserId || "all"} onValueChange={(value) => setViewingUserId(value === "all" ? null : value)}>
            <SelectTrigger className="w-[250px]" data-testid="select-filter-user">
              <SelectValue placeholder="Filtrar por membro" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os membros</SelectItem>
              {filteredUsers.map((u) => (
                <SelectItem key={u.id} value={u.id}>
                  {u.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {filteredPromotions.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhuma promoção encontrada</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredPromotions.map((promotion) => (
              <Card key={promotion.id} className="hover-elevate" data-testid={`card-promotion-${promotion.id}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <User className="h-5 w-5 text-primary" />
                        {getUserName(promotion.userId)}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(promotion.createdAt), "dd/MM/yyyy 'às' HH:mm")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getRoleBadgeColor(promotion.fromRole)}>
                        {getRoleLabel(promotion.fromRole, promotion.wasChiefSurgeon)}
                      </Badge>
                      {isPromotion(promotion.fromRole, promotion.toRole) ? (
                        <ArrowUp className="h-4 w-4 text-green-600" />
                      ) : isDemotion(promotion.fromRole, promotion.toRole) ? (
                        <ArrowDown className="h-4 w-4 text-red-600" />
                      ) : (
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      )}
                      <Badge className={getRoleBadgeColor(promotion.toRole)}>
                        {getRoleLabel(promotion.toRole, promotion.madeChiefSurgeon)}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">
                        {isPromotion(promotion.fromRole, promotion.toRole) 
                          ? "Promovido por:" 
                          : isDemotion(promotion.fromRole, promotion.toRole)
                            ? "Rebaixado por:"
                            : "Alterado por:"}
                      </span>{" "}
                      <span className="font-medium">{getUserName(promotion.promotedBy)}</span>
                    </div>
                    {promotion.shiftId && (
                      <div>
                        <span className="text-muted-foreground">Turno:</span>{" "}
                        <span className="font-medium">{getShiftName(promotion.shiftId)}</span>
                      </div>
                    )}
                  </div>
                  {promotion.notes && (
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm">{promotion.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
