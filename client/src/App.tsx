import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import PublicHome from "@/pages/PublicHome";
import Dashboard from "@/pages/Dashboard";
import Covenants from "@/pages/Covenants";
import Rules from "@/pages/Rules";
import MeCommands from "@/pages/MeCommands";
import Members from "@/pages/Members";
import Shift from "@/pages/Shift";
import Attendance from "@/pages/Attendance";
import Warnings from "@/pages/Warnings";
import Admin from "@/pages/Admin";
import Promotions from "@/pages/Promotions";
import Logs from "@/pages/Logs";
import NotFound from "@/pages/not-found";

function ProtectedRoute({ component: Component }: { component: () => JSX.Element }) {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Redirect to="/" />;
  }

  return <Component />;
}

function Router() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <Switch>
        <Route path="/" component={PublicHome} />
        <Route path="/:rest*">
          <Redirect to="/" />
        </Route>
      </Switch>
    );
  }

  const sidebarStyle = {
    "--sidebar-width": "20rem",
    "--sidebar-width-icon": "4rem",
  };

  return (
    <SidebarProvider style={sidebarStyle as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="flex items-center justify-between p-4 border-b border-border bg-background">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
          </header>
          <main className="flex-1 overflow-auto">
            <div className="max-w-7xl mx-auto p-6 lg:p-12">
              <Switch>
                <Route path="/dashboard" component={Dashboard} />
                <Route path="/shift" component={Shift} />
                <Route path="/covenants" component={Covenants} />
                <Route path="/rules" component={Rules} />
                <Route path="/me-commands" component={MeCommands} />
                <Route path="/members" component={Members} />
                <Route path="/attendance" component={Attendance} />
                <Route path="/warnings" component={Warnings} />
                <Route path="/promotions" component={Promotions} />
                <Route path="/logs" component={Logs} />
                <Route path="/admin" component={Admin} />
                <Route path="/">
                  <Redirect to="/dashboard" />
                </Route>
                <Route component={NotFound} />
              </Switch>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Router />
          <Toaster />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
