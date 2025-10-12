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
import { Users as UsersIcon, User, UserPlus } from "lucide-react";
import { type User as UserType, type Shift, UserRole, type InsertUser } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function Members() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState<Partial<InsertUser>>({
    accessCode: "",
    name: "",
    role: UserRole.MEMBRO,
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

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMINISTRADOR:
        return "Administrador";
      case UserRole.DIRETOR:
        return "Diretor";
      case UserRole.VICE_DIRETOR:
        return "Vice-Diretor";
      case UserRole.CIRURGIAO:
        return "Cirurgião";
      case UserRole.TERAPEUTA:
        return "Terapeuta";
      default:
        return "Membro";
    }
  };

  const getShiftName = (shiftId: string | null) => {
    if (!shiftId) return "Sem turno";
    const shift = shifts.find(s => s.id === shiftId);
    return shift?.name || "Desconhecido";
  };

  const canSeeDetails = user?.role === UserRole.ADMINISTRADOR || user?.role === UserRole.DIRETOR || user?.role === UserRole.VICE_DIRETOR;
  const canAddUsers = user?.role === UserRole.ADMINISTRADOR || user?.role === UserRole.DIRETOR || user?.role === UserRole.VICE_DIRETOR;

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
        role: UserRole.MEMBRO,
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
                      <SelectItem value={UserRole.MEMBRO}>Membro</SelectItem>
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
                  <Label htmlFor="narniaName">Nome Verdadeiro</Label>
                  <Input
                    id="narniaName"
                    value={newUser.narniaName}
                    onChange={(e) => setNewUser({ ...newUser, narniaName: e.target.value })}
                    placeholder="Nome na vida real"
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
                        {getRoleLabel(member.role)}
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
                        {getRoleLabel(member.role)}
                      </Badge>
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
    </div>
  );
}
