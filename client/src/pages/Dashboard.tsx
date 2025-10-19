import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CovenantCard } from "@/components/CovenantCard";
import { RuleCard } from "@/components/RuleCard";
import { Activity, Clock, FileText, Users, Calendar } from "lucide-react";
import { type Covenant, type Rule, type User, type Shift, UserRole } from "@shared/schema";

export default function Dashboard() {
  const { user } = useAuth();

  const { data: covenants = [] } = useQuery<Covenant[]>({
    queryKey: ["/api/covenants"],
  });

  const { data: shifts = [] } = useQuery<Shift[]>({
    queryKey: ["/api/shifts"],
  });

  const { data: rules = [] } = useQuery<Rule[]>({
    queryKey: user?.shiftId ? [`/api/rules/shift/${user.shiftId}`] : ["/api/rules/general"],
  });

  const { data: shiftMembers = [] } = useQuery<User[]>({
    queryKey: user?.shiftId ? [`/api/users/shift/${user.shiftId}`] : ["/api/users"],
    enabled: !!user?.shiftId,
  });

  const activeCovenants = covenants.filter(c => {
    const end = new Date(c.endDate).getTime();
    const now = new Date().getTime();
    return end > now;
  });

  const userShift = shifts.find(s => s.id === user?.shiftId);

  const canManage = user?.role === UserRole.DIRETOR || user?.role === UserRole.VICE_DIRETOR;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2" data-testid="text-page-title">
          Dashboard
        </h1>
        <p className="text-muted-foreground">
          Bem-vindo ao sistema de gestão do Hospital Rio Rise
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Convênios Ativos</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-stat-covenants">
              {activeCovenants.length}
            </div>
            <p className="text-xs text-muted-foreground">
              {covenants.length} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Meu Turno</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold truncate" data-testid="text-stat-shift">
              {userShift?.name || "Nenhum"}
            </div>
            <p className="text-xs text-muted-foreground">
              {shiftMembers.length} membros
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Regras</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-stat-rules">
              {rules.length}
            </div>
            <p className="text-xs text-muted-foreground">
              {user?.shiftId ? "Do seu turno" : "Gerais"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Seu Cargo</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold truncate" data-testid="text-stat-role">
              {user?.role === UserRole.DIRETOR ? "Diretor" :
               user?.role === UserRole.VICE_DIRETOR ? "Vice-Diretor" :
               user?.role === UserRole.CIRURGIAO ? "Cirurgião" :
               user?.role === UserRole.TERAPEUTA ? "Terapeuta" : "Membro"}
            </div>
            <p className="text-xs text-muted-foreground">
              {canManage ? "Com permissões" : "Visualização"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Covenants */}
      {activeCovenants.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Convênios Recentes</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeCovenants.slice(0, 6).map((covenant) => (
              <CovenantCard key={covenant.id} covenant={covenant} />
            ))}
          </div>
        </section>
      )}

      {/* Rules Preview */}
      {rules.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">
              {user?.shiftId ? "Regras do Turno" : "Regras Gerais"}
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {rules.slice(0, 3).map((rule) => (
              <RuleCard key={rule.id} rule={rule} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
