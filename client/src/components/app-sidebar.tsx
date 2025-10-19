import { Home, Clock, FileText, MessageSquare, Users, Calendar, LogOut, ClipboardCheck, AlertTriangle, Settings, TrendingUp, FileSearch } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { Cross } from "lucide-react";
import { UserRole } from "@shared/schema";

const menuItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Meu Turno",
    url: "/shift",
    icon: Calendar,
  },
  {
    title: "Convênios",
    url: "/covenants",
    icon: Clock,
  },
  {
    title: "Regras",
    url: "/rules",
    icon: FileText,
  },
  {
    title: "Comandos /me",
    url: "/me-commands",
    icon: MessageSquare,
  },
  {
    title: "Membros",
    url: "/members",
    icon: Users,
  },
  {
    title: "Chamada",
    url: "/attendance",
    icon: ClipboardCheck,
    requireRole: [UserRole.VICE_DIRETOR, UserRole.DIRETOR, UserRole.ADMINISTRADOR],
  },
  {
    title: "Advertências",
    url: "/warnings",
    icon: AlertTriangle,
    requireRole: [UserRole.VICE_DIRETOR, UserRole.DIRETOR, UserRole.ADMINISTRADOR],
  },
  {
    title: "Promoções",
    url: "/promotions",
    icon: TrendingUp,
    requireRole: [UserRole.VICE_DIRETOR, UserRole.DIRETOR, UserRole.ADMINISTRADOR],
  },
  {
    title: "Logs",
    url: "/logs",
    icon: FileSearch,
    requireRole: [UserRole.ADMINISTRADOR],
  },
  {
    title: "Administração",
    url: "/admin",
    icon: Settings,
    requireRole: [UserRole.DIRETOR, UserRole.ADMINISTRADOR],
  },
];

export function AppSidebar() {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();

  const handleLogout = () => {
    logout();
    setLocation("/");
  };

  const getRoleBadgeColor = () => {
    switch (user?.role) {
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

  const getRoleLabel = () => {
    switch (user?.role) {
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
        return user?.role || "";
    }
  };

  return (
    <Sidebar data-testid="sidebar-main">
      <SidebarHeader className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
            <Cross className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold truncate" data-testid="text-hospital-name-sidebar">
              Hospital Rio Rise
            </p>
            <p className="text-xs text-muted-foreground truncate">Sistema de Gestão</p>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.filter(item => {
                if (!item.requireRole) return true;
                return item.requireRole.includes(user?.role as UserRole);
              }).map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.url}
                    data-testid={`link-${item.url.slice(1)}`}
                  >
                    <a href={item.url} onClick={(e) => {
                      e.preventDefault();
                      setLocation(item.url);
                    }}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border">
        <div className="space-y-3">
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center font-semibold">
              {user?.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate" data-testid="text-user-name">
                {user?.name}
              </p>
              <p className={`text-xs px-2 py-0.5 rounded-full inline-block ${getRoleBadgeColor()}`} data-testid="badge-user-role">
                {getRoleLabel()}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            className="w-full"
            onClick={handleLogout}
            data-testid="button-logout"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
