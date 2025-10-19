import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CovenantCard } from "@/components/CovenantCard";
import { RuleCard } from "@/components/RuleCard";
import { Cross, Activity, Users, LogIn } from "lucide-react";
import { type Covenant, type Rule, type AuthResponse } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function PublicHome() {
  const [accessCode, setAccessCode] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { login } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: covenants = [] } = useQuery<Covenant[]>({
    queryKey: ["/api/covenants"],
  });

  const { data: rules = [] } = useQuery<Rule[]>({
    queryKey: ["/api/rules/general"],
  });

  const handleLogin = async () => {
    if (!accessCode.trim()) {
      toast({
        title: "Erro",
        description: "Digite um código de acesso",
        variant: "destructive",
      });
      return;
    }

    setIsLoggingIn(true);
    try {
      const res = await apiRequest("POST", "/api/auth/login", {
        accessCode: accessCode.trim(),
      });
      
      const response: AuthResponse = await res.json();

      if (response.success && response.user) {
        login(response.user);
        toast({
          title: "Login realizado!",
          description: `Bem-vindo, ${response.user.name}`,
        });
        setLocation("/dashboard");
      } else {
        toast({
          title: "Erro",
          description: response.message || "Código de acesso inválido",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível realizar o login",
        variant: "destructive",
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  const activeCovenants = covenants.filter(c => {
    const end = new Date(c.endDate).getTime();
    const now = new Date().getTime();
    return end > now;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-b from-background via-background to-card border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                <Cross className="h-7 w-7 text-primary" />
              </div>
              <h1 className="text-4xl font-bold" data-testid="text-hospital-name">
                Hospital Rio Rise
              </h1>
            </div>
          </div>
          
          <p className="text-center text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
          </p>
          {/* Login Form */}
          <Card className="max-w-md mx-auto">
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="accessCode">Código de Acesso</Label>
                <Input
                  id="accessCode"
                  type="text"
                  placeholder="Digite seu código de acesso"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  data-testid="input-access-code"
                />
              </div>
              <Button
                className="w-full"
                onClick={handleLogin}
                disabled={isLoggingIn || !accessCode.trim()}
                data-testid="button-login"
              >
                <LogIn className="h-4 w-4 mr-2" />
                {isLoggingIn ? "Entrando..." : "Entrar"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Content Sections */}
      <div className="max-w-7xl mx-auto px-6 py-12 space-y-16">
        {/* Rules Section */}
        {rules.length > 0 && (
          <section className="space-y-6">
            <h2 className="text-2xl font-semibold flex items-center gap-3">
              Regras Gerais
            </h2>
            <div className="grid grid-cols-1 gap-4">
              {rules.map((rule) => (
                <RuleCard key={rule.id} rule={rule} />
              ))}
            </div>
          </section>
        )}

        {/* Covenants Section */}
        {activeCovenants.length > 0 && (
          <section className="space-y-6">
            <h2 className="text-2xl font-semibold flex items-center gap-3">
              Convênios Ativos
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeCovenants.map((covenant) => (
                <CovenantCard key={covenant.id} covenant={covenant} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
