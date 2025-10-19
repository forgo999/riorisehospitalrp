import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users as UsersIcon, User, UserPlus, Trash2, Edit } from "lucide-react";
import { type User as UserType, type Shift, UserRole, type InsertUser } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function Members() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  const [newUser, setNewUser] = useState<Partial<InsertUser>>({
    accessCode: "",
    name: "",
    role: UserRole.ESTAGIARIO,
    shiftId: null,
    narniaName: "",
    phone: ""
  });

  const { data: allUsers = [], isLoading } = useQuery<UserType[]>({
    queryKey: ["/api/users"],
  });

  const { data: shifts = [] } = useQuery<Shift[]>({
    queryKey: ["/api/shifts"],
  });

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

  const getShiftName = (shiftId: string | null) => {
    if (!shiftId) return "-";
    const shift = shifts.find(s => s.id === shiftId);
    return shift?.name || "Desconhecido";
  };

  const canSeeDetails = user?.role === UserRole.ADMINISTRADOR || user?.role === UserRole.DIRETOR || user?.role === UserRole.VICE_DIRETOR;
  const canAddUsers = user?.role === UserRole.ADMINISTRADOR || user?.role === UserRole.DIRETOR || user?.role === UserRole.VICE_DIRETOR;
  const canDeleteUsers = user?.role === UserRole.ADMINISTRADOR || user?.role === UserRole.DIRETOR;

  const canEditUser = (targetUser: UserType): boolean => {
    if (!user) return false;
    
    if (user.role === UserRole.ADMINISTRADOR || user.role === UserRole.DIRETOR) {
      return true;
    }

    if (user.role === UserRole.VICE_DIRETOR) {
      if (user.shiftId !== targetUser.shiftId) {
        return false;
      }

      const roleHierarchy = [
        UserRole.ESTAGIARIO,
        UserRole.PARAMEDICO,
        UserRole.TERAPEUTA,
        UserRole.CIRURGIAO,
        UserRole.VICE_DIRETOR,
        UserRole.DIRETOR,
        UserRole.ADMINISTRADOR
      ];

      const targetRoleIndex = roleHierarchy.indexOf(targetUser.role);
      const viceDirectorIndex = roleHierarchy.indexOf(UserRole.VICE_DIRETOR);

      if (targetRoleIndex >= viceDirectorIndex) {
        return false;
      }

      return true;
    }

    return false;
  };

  const createUserMutation = useMutation({
    mutationFn: async (userData: InsertUser) => {
      const res = await apiRequest("POST", "/api/users", userData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "Sucesso!",
        description: "Usuário cadastrado com sucesso",
      });
      setIsDialogOpen(false);
      setNewUser({
        accessCode: "",
        name: "",
        role: UserRole.ESTAGIARIO,
        shiftId: null,
        narniaName: "",
        phone: ""
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível cadastrar o usuário",
        variant: "destructive",
      });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<UserType> }) => {
      const res = await apiRequest("PATCH", `/api/users/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "Sucesso!",
        description: "Informações atualizadas com sucesso",
      });
      setIsEditDialogOpen(false);
      setEditingUser(null);
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o usuário",
        variant: "destructive",
      });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "Sucesso!",
        description: "Usuário removido com sucesso",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível remover o usuário",
        variant: "destructive",
      });
    },
  });

  const handleCreateUser = () => {
    if (!newUser.accessCode || !newUser.name || !newUser.role) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    createUserMutation.mutate(newUser as InsertUser);
  };

  const handleEditUser = () => {
    if (!editingUser) return;

    if (!editingUser.accessCode || !editingUser.name) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    updateUserMutation.mutate({
      id: editingUser.id,
      data: {
        accessCode: editingUser.accessCode,
        name: editingUser.name,
        shiftId: editingUser.shiftId,
        narniaName: editingUser.narniaName,
        phone: editingUser.phone
      }
    });
  };

  const openEditDialog = (member: UserType) => {
    setEditingUser(member);
    setIsEditDialogOpen(true);
  };

  const filteredUsers = canSeeDetails
    ? allUsers
    : allUsers.filter(u => u.shiftId === user?.shiftId);

  const groupedByShift = shifts.map(shift => ({
    shift,
    members: filteredUsers.filter(u => u.shiftId === shift.id)
  })).filter(group => group.members.length > 0);

  const membersWithoutShift = filteredUsers.filter(u => !u.shiftId);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2" data-testid="text-page-title">
            Membros
          </h1>
          <p className="text-muted-foreground">
            {canSeeDetails
              ? "Visualize todos os membros do hospital"
              : "Visualize os membros do seu turno"}
          </p>
        </div>
        
        {canAddUsers && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Adicionar Membro
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Cadastrar Novo Membro</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="accessCode">Código de Acesso *</Label>
                  <Input
                    id="accessCode"
                    value={newUser.accessCode}
                    onChange={(e) => setNewUser({ ...newUser, accessCode: e.target.value })}
                    placeholder="Ex: MEM001"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Nome *</Label>
                  <Input
                    id="name"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    placeholder="Nome completo"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Cargo *</Label>
                  <Select 
                    value={newUser.role} 
                    onValueChange={(value) => setNewUser({ ...newUser, role: value as UserRole })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={UserRole.ESTAGIARIO}>Estagiário</SelectItem>
                      <SelectItem value={UserRole.PARAMEDICO}>Paramédico</SelectItem>
                      <SelectItem value={UserRole.TERAPEUTA}>Terapeuta</SelectItem>
                      <SelectItem value={UserRole.CIRURGIAO}>Cirurgião</SelectItem>
                      <SelectItem value={UserRole.VICE_DIRETOR}>Vice-Diretor</SelectItem>
                      {(user?.role === UserRole.ADMINISTRADOR || user?.role === UserRole.DIRETOR) && (
                        <SelectItem value={UserRole.DIRETOR}>Diretor</SelectItem>
                      )}
                      {user?.role === UserRole.ADMINISTRADOR && (
                        <SelectItem value={UserRole.ADMINISTRADOR}>Administrador</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shift">Turno</Label>
                  <Select 
                    value={newUser.shiftId || "none"} 
                    onValueChange={(value) => setNewUser({ ...newUser, shiftId: value === "none" ? null : value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nenhum</SelectItem>
                      {shifts.map((shift) => (
                        <SelectItem key={shift.id} value={shift.id}>
                          {shift.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="narniaName">Nome Verdadeiro</Label>
                  <Input
                    id="narniaName"
                    value={newUser.narniaName}
                    onChange={(e) => setNewUser({ ...newUser, narniaName: e.target.value })}
                    placeholder="Nome fora do jogo"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={newUser.phone}
                    onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                    placeholder="(11) 99999-9999"
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    className="flex-1"
                    onClick={handleCreateUser}
                    disabled={createUserMutation.isPending}
                  >
                    {createUserMutation.isPending ? "Cadastrando..." : "Cadastrar"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Members by Shift */}
      {groupedByShift.map(({ shift, members }) => (
        <section key={shift.id} className="space-y-4">
          <div className="flex items-center gap-2">
            <UsersIcon className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">
              {shift.name} ({members.length} {members.length === 1 ? "membro" : "membros"})
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {members.map((member) => (
              <Card key={member.id} className="hover-elevate" data-testid={`card-member-${member.id}`}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center font-semibold flex-shrink-0">
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0 space-y-2">
                      <div>
                        <h3 className="font-semibold truncate" data-testid="text-member-name">
                          {member.name}
                        </h3>
                        <p className="text-sm text-muted-foreground font-mono" data-testid="text-member-code">
                        </p>
                      </div>
                      <Badge className={getRoleBadgeColor(member.role)} data-testid="badge-member-role">
                        {getRoleLabel(member.role, member.isChiefSurgeon)}
                      </Badge>
                      {canSeeDetails && member.narniaName && (
                        <div className="pt-2 border-t border-border space-y-1">
                          <p className="text-sm">
                            <span className="text-muted-foreground">Nárnia:</span>{" "}
                            <span data-testid="text-member-narnia">{member.narniaName}</span>
                          </p>
                          {member.phone && (
                            <p className="text-sm">
                              <span className="text-muted-foreground">Tel:</span>{" "}
                              <span data-testid="text-member-phone">{member.phone}</span>
                            </p>
                          )}
                        </div>
                      )}
                      <div className="flex gap-2 mt-2">
                        {canEditUser(member) && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openEditDialog(member)}
                            data-testid="button-edit-member"
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Editar
                          </Button>
                        )}
                        {canDeleteUsers && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              if (confirm(`Tem certeza que deseja remover ${member.name}?`)) {
                                deleteUserMutation.mutate(member.id);
                              }
                            }}
                            data-testid="button-delete-member"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Remover
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      ))}

      {/* Members without shift */}
      {membersWithoutShift.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-xl font-semibold text-muted-foreground">
              Sem Turno ({membersWithoutShift.length})
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {membersWithoutShift.map((member) => (
              <Card key={member.id} className="hover-elevate" data-testid={`card-member-${member.id}`}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center font-semibold flex-shrink-0">
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0 space-y-2">
                      <div>
                        <h3 className="font-semibold truncate" data-testid="text-member-name">
                          {member.name}
                        </h3>
                        <p className="text-sm text-muted-foreground font-mono" data-testid="text-member-code">
                        </p>
                      </div>
                      <Badge className={getRoleBadgeColor(member.role)} data-testid="badge-member-role">
                        {getRoleLabel(member.role, member.isChiefSurgeon)}
                      </Badge>
                      <div className="flex gap-2 mt-2">
                        {canEditUser(member) && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openEditDialog(member)}
                            data-testid="button-edit-member"
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Editar
                          </Button>
                        )}
                        {canDeleteUsers && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              if (confirm(`Tem certeza que deseja remover ${member.name}?`)) {
                                deleteUserMutation.mutate(member.id);
                              }
                            }}
                            data-testid="button-delete-member"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Remover
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* All Hospital Members */}
      {canSeeDetails && allUsers.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <UsersIcon className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">
              Todos os Membros do Hospital ({allUsers.length} {allUsers.length === 1 ? "membro" : "membros"})
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allUsers.map((member) => (
              <Card key={member.id} className="hover-elevate" data-testid={`card-all-member-${member.id}`}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center font-semibold flex-shrink-0">
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0 space-y-2">
                      <div>
                        <h3 className="font-semibold truncate" data-testid="text-member-name">
                          {member.name}
                        </h3>
                      </div>
                      <Badge className={getRoleBadgeColor(member.role)} data-testid="badge-member-role">
                        {getRoleLabel(member.role, member.isChiefSurgeon)}
                      </Badge>
                      {member.shiftId && (
                        <div className="text-sm">
                          <span className="text-muted-foreground">Turno:</span>{" "}
                          <span data-testid="text-member-shift">{getShiftName(member.shiftId)}</span>
                        </div>
                      )}
                      {member.narniaName && (
                        <div className="pt-2 border-t border-border space-y-1">
                          <p className="text-sm">
                            <span className="text-muted-foreground">Nárnia:</span>{" "}
                            <span data-testid="text-member-narnia">{member.narniaName}</span>
                          </p>
                          {member.phone && (
                            <p className="text-sm">
                              <span className="text-muted-foreground">Tel:</span>{" "}
                              <span data-testid="text-member-phone">{member.phone}</span>
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {isLoading && (
        <p className="text-muted-foreground">Carregando membros...</p>
      )}

      {!isLoading && filteredUsers.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <UsersIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhum membro encontrado</p>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Informações do Membro</DialogTitle>
          </DialogHeader>
          {editingUser && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-accessCode">Código de Acesso *</Label>
                <Input
                  id="edit-accessCode"
                  value={editingUser.accessCode}
                  onChange={(e) => setEditingUser({ ...editingUser, accessCode: e.target.value })}
                  placeholder="Ex: MEM001"
                  data-testid="input-edit-access-code"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nome *</Label>
                <Input
                  id="edit-name"
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  placeholder="Nome completo"
                  data-testid="input-edit-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-shift">Turno</Label>
                <Select 
                  value={editingUser.shiftId || "none"} 
                  onValueChange={(value) => setEditingUser({ ...editingUser, shiftId: value === "none" ? null : value })}
                >
                  <SelectTrigger id="edit-shift" data-testid="select-edit-shift">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sem turno</SelectItem>
                    {shifts.map((shift) => (
                      <SelectItem key={shift.id} value={shift.id}>
                        {shift.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-narniaName">Nome Verdadeiro</Label>
                <Input
                  id="edit-narniaName"
                  value={editingUser.narniaName || ""}
                  onChange={(e) => setEditingUser({ ...editingUser, narniaName: e.target.value })}
                  placeholder="Nome fora do jogo"
                  data-testid="input-edit-narnia-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-phone">Telefone</Label>
                <Input
                  id="edit-phone"
                  value={editingUser.phone || ""}
                  onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                  placeholder="(11) 99999-9999"
                  data-testid="input-edit-phone"
                />
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Nota:</strong> O cargo não pode ser alterado aqui. Use a página de Promoções para isso.
                </p>
              </div>
              <div className="flex gap-2 pt-4">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => {
                    setIsEditDialogOpen(false);
                    setEditingUser(null);
                  }}
                >
                  Cancelar
                </Button>
                <Button 
                  className="flex-1"
                  onClick={handleEditUser}
                  disabled={updateUserMutation.isPending}
                  data-testid="button-save-edit"
                >
                  {updateUserMutation.isPending ? "Salvando..." : "Salvar Alterações"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
