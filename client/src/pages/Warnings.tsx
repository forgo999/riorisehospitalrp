import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Trash2, Eye } from "lucide-react";
import { type Warning, type User, type Shift, UserRole, WarningOccurrenceType, type InsertWarning } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";

export default function Warnings() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [viewWarning, setViewWarning] = useState<Warning | null>(null);
  const [newWarning, setNewWarning] = useState<Partial<InsertWarning>>({
    userId: "",
    issuedBy: user?.id || "",
    shiftId: null,
    reason: "",
    occurrenceType: WarningOccurrenceType.TURNO_PADRAO,
    occurrenceDate: format(new Date(), "yyyy-MM-dd"),
    notes: ""
  });

  const canIssueWarnings = user?.role === UserRole.VICE_DIRETOR || user?.role === UserRole.DIRETOR || user?.role === UserRole.ADMINISTRADOR;
  const canViewAll = user?.role === UserRole.DIRETOR || user?.role === UserRole.ADMINISTRADOR;

  const { data: warnings = [] } = useQuery<Warning[]>({
    queryKey: ["/api/warnings"],
  });

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const { data: shifts = [] } = useQuery<Shift[]>({
    queryKey: ["/api/shifts"],
  });

  const createWarningMutation = useMutation({
    mutationFn: async (warningData: InsertWarning) => {
      const res = await apiRequest("POST", "/api/warnings", warningData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/warnings"] });
      toast({
        title: "Sucesso!",
        description: "Advertência registrada",
      });
      setIsDialogOpen(false);
      setNewWarning({
        userId: "",
        issuedBy: user?.id || "",
        shiftId: null,
        reason: "",
        occurrenceType: WarningOccurrenceType.TURNO_PADRAO,
        occurrenceDate: format(new Date(), "yyyy-MM-dd"),
        notes: ""
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível registrar a advertência",
        variant: "destructive",
      });
    },
  });

  const deleteWarningMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/warnings/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/warnings"] });
      toast({
        title: "Sucesso!",
        description: "Advertência removida",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível remover a advertência",
        variant: "destructive",
      });
    },
  });

  const handleCreateWarning = () => {
    if (!newWarning.userId || !newWarning.reason || !newWarning.occurrenceDate) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    createWarningMutation.mutate({
      ...newWarning,
      issuedBy: user?.id || ""
    } as InsertWarning);
  };

  const getUserName = (userId: string) => {
    const u = users.find(us => us.id === userId);
    return u?.name || "Desconhecido";
  };

  const getShiftName = (shiftId: string | null) => {
    if (!shiftId) return "N/A";
    const s = shifts.find(sh => sh.id === shiftId);
    return s?.name || "Desconhecido";
  };

  const getOccurrenceTypeLabel = (type: WarningOccurrenceType) => {
    switch (type) {
      case WarningOccurrenceType.TURNO_PADRAO:
        return "Turno Padrão";
      case WarningOccurrenceType.TURNO_EXTRA:
        return "Turno Extra";
      case WarningOccurrenceType.FORA_TURNO:
        return "Fora de Turno";
      default:
        return type;
    }
  };

  const filteredWarnings = canViewAll 
    ? warnings 
    : warnings.filter(w => w.shiftId === user?.shiftId || w.issuedBy === user?.id);

  const warningsByUser = users.map(u => ({
    user: u,
    warnings: filteredWarnings.filter(w => w.userId === u.id)
  })).filter(item => item.warnings.length > 0);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Advertências</h1>
          <p className="text-muted-foreground">
            Gerencie as advertências dos membros
          </p>
        </div>

        {canIssueWarnings && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <AlertTriangle className="h-4 w-4 mr-2" />
                Registrar Advertência
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Nova Advertência</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="user">Membro *</Label>
                  <Select 
                    value={newWarning.userId} 
                    onValueChange={(value) => setNewWarning({ ...newWarning, userId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o membro" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((u) => (
                        <SelectItem key={u.id} value={u.id}>
                          {u.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reason">Motivo *</Label>
                  <Input
                    id="reason"
                    value={newWarning.reason}
                    onChange={(e) => setNewWarning({ ...newWarning, reason: e.target.value })}
                    placeholder="Descreva o motivo"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="occurrenceType">Tipo de Ocorrência *</Label>
                  <Select 
                    value={newWarning.occurrenceType} 
                    onValueChange={(value: WarningOccurrenceType) => setNewWarning({ ...newWarning, occurrenceType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={WarningOccurrenceType.TURNO_PADRAO}>Turno Padrão</SelectItem>
                      <SelectItem value={WarningOccurrenceType.TURNO_EXTRA}>Turno Extra</SelectItem>
                      <SelectItem value={WarningOccurrenceType.FORA_TURNO}>Fora de Turno</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shift">Turno</Label>
                  <Select 
                    value={newWarning.shiftId || "none"} 
                    onValueChange={(value) => setNewWarning({ ...newWarning, shiftId: value === "none" ? null : value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">N/A</SelectItem>
                      {shifts.map((shift) => (
                        <SelectItem key={shift.id} value={shift.id}>
                          {shift.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="occurrenceDate">Data da Ocorrência *</Label>
                  <Input
                    id="occurrenceDate"
                    type="date"
                    value={newWarning.occurrenceDate}
                    onChange={(e) => setNewWarning({ ...newWarning, occurrenceDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Observações Adicionais</Label>
                  <Textarea
                    id="notes"
                    value={newWarning.notes}
                    onChange={(e) => setNewWarning({ ...newWarning, notes: e.target.value })}
                    placeholder="Detalhes adicionais (opcional)"
                    rows={3}
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
                    onClick={handleCreateWarning}
                    disabled={createWarningMutation.isPending}
                  >
                    {createWarningMutation.isPending ? "Registrando..." : "Registrar"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Warnings by User */}
      {warningsByUser.map(({ user: member, warnings: userWarnings }) => (
        <Card key={member.id}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center font-semibold">
                  {member.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-lg">{member.name}</p>
                  <p className="text-sm font-normal text-muted-foreground">
                    {userWarnings.length} {userWarnings.length === 1 ? "advertência" : "advertências"}
                  </p>
                </div>
              </div>
              <Badge variant="destructive">{userWarnings.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {userWarnings.map((warning) => (
                <div key={warning.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="font-semibold">{warning.reason}</p>
                      <div className="flex gap-2 mt-2 flex-wrap">
                        <Badge variant="outline">
                          {getOccurrenceTypeLabel(warning.occurrenceType)}
                        </Badge>
                        <Badge variant="outline">
                          {format(new Date(warning.occurrenceDate), "dd/MM/yyyy")}
                        </Badge>
                        {warning.shiftId && (
                          <Badge variant="outline">
                            {getShiftName(warning.shiftId)}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setViewWarning(warning)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {(warning.issuedBy === user?.id || canViewAll) && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteWarningMutation.mutate(warning.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                  {warning.notes && (
                    <p className="text-sm text-muted-foreground mt-2">
                      {warning.notes}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">
                    Registrado por: {getUserName(warning.issuedBy)} em {format(new Date(warning.createdAt), "dd/MM/yyyy HH:mm")}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {filteredWarnings.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhuma advertência registrada</p>
          </CardContent>
        </Card>
      )}

      {/* View Warning Dialog */}
      <Dialog open={!!viewWarning} onOpenChange={() => setViewWarning(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Detalhes da Advertência</DialogTitle>
          </DialogHeader>
          {viewWarning && (
            <div className="space-y-4">
              <div>
                <Label>Membro</Label>
                <p className="font-medium">{getUserName(viewWarning.userId)}</p>
              </div>
              <div>
                <Label>Motivo</Label>
                <p className="font-medium">{viewWarning.reason}</p>
              </div>
              <div>
                <Label>Tipo de Ocorrência</Label>
                <p className="font-medium">{getOccurrenceTypeLabel(viewWarning.occurrenceType)}</p>
              </div>
              <div>
                <Label>Turno</Label>
                <p className="font-medium">{getShiftName(viewWarning.shiftId)}</p>
              </div>
              <div>
                <Label>Data da Ocorrência</Label>
                <p className="font-medium">{format(new Date(viewWarning.occurrenceDate), "dd/MM/yyyy")}</p>
              </div>
              {viewWarning.notes && (
                <div>
                  <Label>Observações</Label>
                  <p className="font-medium">{viewWarning.notes}</p>
                </div>
              )}
              <div>
                <Label>Registrado por</Label>
                <p className="font-medium">{getUserName(viewWarning.issuedBy)}</p>
              </div>
              <div>
                <Label>Data de Registro</Label>
                <p className="font-medium">{format(new Date(viewWarning.createdAt), "dd/MM/yyyy HH:mm")}</p>
              </div>
              <Button className="w-full" onClick={() => setViewWarning(null)}>
                Fechar
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
