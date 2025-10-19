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
import { ClipboardCheck, UserCheck, UserX, Calendar, Trash2 } from "lucide-react";
import { type AttendanceRecord, type User, type Shift, UserRole, type InsertAttendanceRecord } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";

export default function Attendance() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedShift, setSelectedShift] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
  const [newRecord, setNewRecord] = useState<Partial<InsertAttendanceRecord>>({
    userId: "",
    shiftId: "",
    date: format(new Date(), "yyyy-MM-dd"),
    status: "presente",
    notes: "",
    createdBy: user?.id || ""
  });

  const canManageAttendance = user?.role === UserRole.VICE_DIRETOR || user?.role === UserRole.DIRETOR || user?.role === UserRole.ADMINISTRADOR;

  const { data: shifts = [] } = useQuery<Shift[]>({
    queryKey: ["/api/shifts"],
  });

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const { data: attendanceRecords = [] } = useQuery<AttendanceRecord[]>({
    queryKey: selectedShift && selectedDate 
      ? [`/api/attendance/shift/${selectedShift}/date/${selectedDate}`]
      : ["/api/attendance"],
    enabled: !!(selectedShift && selectedDate),
  });

  const createRecordMutation = useMutation({
    mutationFn: async (recordData: InsertAttendanceRecord) => {
      const res = await apiRequest("POST", "/api/attendance", recordData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        predicate: (query) => query.queryKey[0] === "/api/attendance" || 
                               (typeof query.queryKey[0] === "string" && query.queryKey[0].startsWith("/api/attendance/"))
      });
      toast({
        title: "Sucesso!",
        description: "Registro de chamada criado",
      });
      setIsDialogOpen(false);
      setNewRecord({
        userId: "",
        shiftId: selectedShift,
        date: selectedDate,
        status: "presente",
        notes: "",
        createdBy: user?.id || ""
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível criar o registro",
        variant: "destructive",
      });
    },
  });

  const updateRecordMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<AttendanceRecord> }) => {
      const res = await apiRequest("PATCH", `/api/attendance/${id}`, updates);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        predicate: (query) => query.queryKey[0] === "/api/attendance" || 
                               (typeof query.queryKey[0] === "string" && query.queryKey[0].startsWith("/api/attendance/"))
      });
      toast({
        title: "Sucesso!",
        description: "Registro atualizado",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o registro",
        variant: "destructive",
      });
    },
  });

  const deleteRecordMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/attendance/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        predicate: (query) => query.queryKey[0] === "/api/attendance" || 
                               (typeof query.queryKey[0] === "string" && query.queryKey[0].startsWith("/api/attendance/"))
      });
      toast({
        title: "Sucesso!",
        description: "Registro removido",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível remover o registro",
        variant: "destructive",
      });
    },
  });

  const handleCreateRecord = () => {
    if (!newRecord.userId || !newRecord.shiftId || !newRecord.date) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    createRecordMutation.mutate({
      ...newRecord,
      createdBy: user?.id || ""
    } as InsertAttendanceRecord);
  };

  const handleQuickMark = (userId: string, status: "presente" | "faltou") => {
    if (!selectedShift || !selectedDate) {
      toast({
        title: "Atenção",
        description: "Selecione um turno e uma data primeiro",
        variant: "destructive",
      });
      return;
    }

    const existingRecord = attendanceRecords.find(r => r.userId === userId);
    
    if (existingRecord) {
      updateRecordMutation.mutate({
        id: existingRecord.id,
        updates: { status }
      });
    } else {
      createRecordMutation.mutate({
        userId,
        shiftId: selectedShift,
        date: selectedDate,
        status,
        createdBy: user?.id || ""
      });
    }
  };

  const getUserName = (userId: string) => {
    const u = users.find(us => us.id === userId);
    return u?.name || "Desconhecido";
  };

  const getShiftName = (shiftId: string) => {
    const s = shifts.find(sh => sh.id === shiftId);
    return s?.name || "Desconhecido";
  };

  const shiftMembers = selectedShift 
    ? users.filter(u => u.shiftId === selectedShift)
    : [];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Chamada</h1>
          <p className="text-muted-foreground">
            Gerencie a presença dos membros por turno
          </p>
        </div>

        {canManageAttendance && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <ClipboardCheck className="h-4 w-4 mr-2" />
                Adicionar Registro
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Novo Registro de Chamada</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="shift">Turno *</Label>
                  <Select 
                    value={newRecord.shiftId} 
                    onValueChange={(value) => setNewRecord({ ...newRecord, shiftId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o turno" />
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
                <div className="space-y-2">
                  <Label htmlFor="user">Membro *</Label>
                  <Select 
                    value={newRecord.userId} 
                    onValueChange={(value) => setNewRecord({ ...newRecord, userId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o membro" />
                    </SelectTrigger>
                    <SelectContent>
                      {users
                        .filter(u => !newRecord.shiftId || u.shiftId === newRecord.shiftId)
                        .map((u) => (
                          <SelectItem key={u.id} value={u.id}>
                            {u.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Data *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newRecord.date}
                    onChange={(e) => setNewRecord({ ...newRecord, date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status *</Label>
                  <Select 
                    value={newRecord.status} 
                    onValueChange={(value: "presente" | "faltou") => setNewRecord({ ...newRecord, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="presente">Presente</SelectItem>
                      <SelectItem value="faltou">Faltou</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Observações</Label>
                  <Textarea
                    id="notes"
                    value={newRecord.notes}
                    onChange={(e) => setNewRecord({ ...newRecord, notes: e.target.value })}
                    placeholder="Observações opcionais"
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
                    onClick={handleCreateRecord}
                    disabled={createRecordMutation.isPending}
                  >
                    {createRecordMutation.isPending ? "Salvando..." : "Salvar"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Turno</Label>
              <Select value={selectedShift} onValueChange={setSelectedShift}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o turno" />
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
            <div className="space-y-2">
              <Label>Data</Label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Attendance */}
      {selectedShift && selectedDate && canManageAttendance && (
        <Card>
          <CardHeader>
            <CardTitle>Chamada Rápida - {getShiftName(selectedShift)}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {format(new Date(selectedDate), "dd/MM/yyyy")}
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {shiftMembers.map((member) => {
                const record = attendanceRecords.find(r => r.userId === member.id);
                return (
                  <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center font-semibold">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium">{member.name}</p>
                        {record && record.notes && (
                          <p className="text-sm text-muted-foreground">{record.notes}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {record && (
                        <Badge variant={record.status === "presente" ? "default" : "destructive"}>
                          {record.status === "presente" ? "Presente" : "Faltou"}
                        </Badge>
                      )}
                      <Button
                        size="sm"
                        variant={record?.status === "presente" ? "default" : "outline"}
                        onClick={() => handleQuickMark(member.id, "presente")}
                      >
                        <UserCheck className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant={record?.status === "faltou" ? "destructive" : "outline"}
                        onClick={() => handleQuickMark(member.id, "faltou")}
                      >
                        <UserX className="h-4 w-4" />
                      </Button>
                      {record && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteRecordMutation.mutate(record.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
              {shiftMembers.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  Nenhum membro neste turno
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Records */}
      {!selectedShift && (
        <Card>
          <CardContent className="p-12 text-center">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Selecione um turno e uma data para ver os registros de chamada
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
