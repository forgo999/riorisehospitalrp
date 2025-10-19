import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RuleCard } from "@/components/RuleCard";
import { Calendar, Users, FileText, User } from "lucide-react";
import { type Shift as ShiftType, type Rule, type User as UserType, UserRole } from "@shared/schema";

export default function Shift() {
  const { user } = useAuth();

  const { data: shifts = [] } = useQuery<ShiftType[]>({
    queryKey: ["/api/shifts"],
  });

  const { data: rules = [] } = useQuery<Rule[]>({
    queryKey: user?.shiftId ? [`/api/rules/shift/${user.shiftId}`] : ["/api/rules"],
  });

  const { data: members = [] } = useQuery<UserType[]>({
    queryKey: user?.shiftId ? [`/api/users/shift/${user.shiftId}`] : ["/api/users"],
    enabled: !!user?.shiftId,
  });

  const userShift = shifts.find(s => s.id === user?.shiftId);
  const shiftRules = rules.filter(r => r.shiftId === user?.shiftId);

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
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

  if (!user?.shiftId) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2" data-testid="text-page-title">
            Meu Turno
          </h1>
          <p className="text-muted-foreground">
            Visualize as informações do seu turno
          </p>
        </div>

        <Card>
          <CardContent className="p-12 text-center">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Você não está associado a nenhum turno</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2" data-testid="text-page-title">
          Meu Turno
        </h1>
        <p className="text-muted-foreground">
          Informações do {userShift?.name}
        </p>
      </div>

      {/* Shift Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Informações do Turno
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div>
              <span className="text-sm text-muted-foreground">Nome:</span>
              <p className="font-semibold" data-testid="text-shift-name">{userShift?.name}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Total de Membros:</span>
              <p className="font-semibold" data-testid="text-shift-members">{members.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Shift Members */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">
            Membros do Turno ({members.length})
          </h2>
        </div>
        {members.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhum membro neste turno</p>
            </CardContent>
          </Card>
        ) : (
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
        )}
      </section>

      {/* Shift Rules */}
      {shiftRules.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">
              Regras do Turno ({shiftRules.length})
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {shiftRules.map((rule) => (
              <RuleCard key={rule.id} rule={rule} />
            ))}
          </div>
        </section>
      )}

    </div>
  );
}
