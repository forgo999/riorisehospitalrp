import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Plus, MessageSquare, Folder, FolderPlus, Edit, Trash2, Copy, FileText } from "lucide-react";
import { type MeCommand, type MeCategory, type InsertMeCommand, type InsertMeCategory, UserRole } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function MeCommands() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<MeCategory | null>(null);
  const [commandText, setCommandText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("none");
  const [newCategory, setNewCategory] = useState<Partial<InsertMeCategory>>({
    name: "",
    description: ""
  });

  const { data: categories = [] } = useQuery<MeCategory[]>({
    queryKey: ["/api/me-categories"],
  });

  const { data: commands = [] } = useQuery<MeCommand[]>({
    queryKey: ["/api/me-commands"],
  });

  const canManage = user?.role === UserRole.DIRETOR || user?.role === UserRole.VICE_DIRETOR || user?.role === UserRole.ADMINISTRADOR;

  const createCategoryMutation = useMutation({
    mutationFn: async (categoryData: InsertMeCategory) => {
      return apiRequest("POST", "/api/me-categories", categoryData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/me-categories"] });
      toast({
        title: "Sucesso!",
        description: "Categoria criada com sucesso",
      });
      setIsCategoryDialogOpen(false);
      setNewCategory({ name: "", description: "" });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível criar a categoria",
        variant: "destructive",
      });
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: Partial<MeCategory> }) => {
      return apiRequest("PATCH", `/api/me-categories/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/me-categories"] });
      toast({
        title: "Sucesso!",
        description: "Categoria atualizada com sucesso",
      });
      setEditingCategory(null);
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a categoria",
        variant: "destructive",
      });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/me-categories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/me-categories"] });
      queryClient.invalidateQueries({ queryKey: ["/api/me-commands"] });
      toast({
        title: "Sucesso!",
        description: "Categoria removida com sucesso",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível remover a categoria",
        variant: "destructive",
      });
    },
  });

  const createCommandMutation = useMutation({
    mutationFn: async (commandData: InsertMeCommand) => {
      return apiRequest("POST", "/api/me-commands", commandData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/me-commands"] });
      toast({
        title: "Sucesso!",
        description: "Comando /me adicionado com sucesso",
      });
      setCommandText("");
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o comando",
        variant: "destructive",
      });
    },
  });

  const deleteCommandMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/me-commands/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/me-commands"] });
      toast({
        title: "Sucesso!",
        description: "Comando /me removido com sucesso",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível remover o comando",
        variant: "destructive",
      });
    },
  });

  const handleCreateCategory = () => {
    if (!newCategory.name?.trim()) {
      toast({
        title: "Erro",
        description: "Digite o nome da categoria",
        variant: "destructive",
      });
      return;
    }

    const categoryData: InsertMeCategory = {
      name: newCategory.name.trim(),
      description: newCategory.description?.trim() || undefined,
      type: user?.shiftId ? "shift" : "general",
      shiftId: user?.shiftId || null
    };

    createCategoryMutation.mutate(categoryData);
  };

  const handleEditCategory = () => {
    if (!editingCategory) return;

    updateCategoryMutation.mutate({
      id: editingCategory.id,
      data: {
        name: editingCategory.name,
        description: editingCategory.description
      }
    });
  };

  const handleDeleteCategory = (id: string) => {
    deleteCategoryMutation.mutate(id);
  };

  const handleCreateCommand = () => {
    if (!commandText.trim()) {
      toast({
        title: "Erro",
        description: "Digite o texto do comando",
        variant: "destructive",
      });
      return;
    }

    const commandData: InsertMeCommand = {
      text: commandText.trim(),
      categoryId: selectedCategory !== "none" ? selectedCategory : null,
      type: user?.shiftId ? "shift" : "general",
      shiftId: user?.shiftId || null
    };

    createCommandMutation.mutate(commandData);
  };

  const handleDeleteCommand = (id: string) => {
    deleteCommandMutation.mutate(id);
  };


  const openEditCategoryDialog = (category: MeCategory) => {
    setEditingCategory(category);
  };

  const handleCopyCommand = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copiado!",
        description: "Comando /me copiado",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível copiar",
        variant: "destructive",
      });
    }
  };

  const groupedByCategory = categories.map(category => ({
    category,
    commands: commands.filter(cmd => cmd.categoryId === category.id)
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3" data-testid="text-page-title">
          <MessageSquare className="h-8 w-8 text-primary" />
          Comandos /me
        </h1>
        <p className="text-muted-foreground">
          Esteja pronto para todas as possiveis situações do hp
        </p>
      </div>

      <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Folder className="h-5 w-5" />
                    Opções de /me
                  </CardTitle>
                  {canManage && (
                    <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm" className="gap-2" data-testid="button-add-category">
                          <FolderPlus className="h-4 w-4" />
                          Nova Categoria
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>Criar Nova Categoria</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="category-name">Nome da Categoria *</Label>
                            <Input
                              id="category-name"
                              value={newCategory.name}
                              onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                              placeholder="Ex: Recepção, Medicamentos, Cirurgia"
                              data-testid="input-category-name"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="category-desc">Descrição (opcional)</Label>
                            <Textarea
                              id="category-desc"
                              value={newCategory.description}
                              onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                              placeholder="Descreva o tipo de comandos desta categoria"
                              rows={3}
                              data-testid="textarea-category-desc"
                            />
                          </div>
                          <Button 
                            onClick={handleCreateCategory} 
                            className="w-full gap-2"
                            data-testid="button-create-category"
                          >
                            <FolderPlus className="h-4 w-4" />
                            Criar Categoria
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {groupedByCategory.length === 0 ? (
                  <div className="text-center py-12">
                    <Folder className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Nenhuma categoria criada ainda</p>
                  </div>
                ) : (
                  <Accordion type="multiple" className="w-full">
                    {groupedByCategory.map(({ category, commands: categoryCommands }) => (
                      <AccordionItem key={category.id} value={category.id}>
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex items-center justify-between w-full pr-4">
                            <div className="flex items-center gap-3">
                              <Folder className="h-5 w-5 text-primary" />
                              <div className="text-left">
                                <h3 className="font-semibold">{category.name}</h3>
                                {category.description && (
                                  <p className="text-sm text-muted-foreground">{category.description}</p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground">
                                {categoryCommands.length} {categoryCommands.length === 1 ? "comando" : "comandos"}
                              </span>
                              {canManage && (
                                <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => openEditCategoryDialog(category)}
                                    data-testid="button-edit-category"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => handleDeleteCategory(category.id)}
                                    data-testid="button-delete-category"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          {canManage && (
                            <div className="mb-4 flex gap-2">
                              <Input
                                placeholder="Digite um comando /me para esta categoria"
                                value={commandText}
                                onChange={(e) => setCommandText(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    setSelectedCategory(category.id);
                                    handleCreateCommand();
                                  }
                                }}
                                data-testid="input-command-text"
                              />
                              <Button 
                                onClick={() => {
                                  setSelectedCategory(category.id);
                                  handleCreateCommand();
                                }}
                                className="gap-2"
                                data-testid="button-add-command"
                              >
                                <Plus className="h-4 w-4" />
                                Adicionar
                              </Button>
                            </div>
                          )}
                          {categoryCommands.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4">
                              Nenhum comando nesta categoria
                            </p>
                          ) : (
                            <div className="space-y-2">
                              {categoryCommands.map((command) => (
                                <Card key={command.id} className="hover-elevate">
                                  <CardContent className="p-3">
                                    <div className="flex items-center justify-between gap-3">
                                      <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <FileText className="h-4 w-4 text-primary flex-shrink-0" />
                                        <p className="text-sm truncate">{command.text}</p>
                                      </div>
                                      <div className="flex gap-1 flex-shrink-0">
                                        <Button
                                          size="icon"
                                          variant="outline"
                                          onClick={() => handleCopyCommand(command.text)}
                                          data-testid="button-copy-command"
                                        >
                                          <Copy className="h-4 w-4" />
                                        </Button>
                                        {canManage && (
                                          <Button
                                            size="icon"
                                            variant="outline"
                                            onClick={() => handleDeleteCommand(command.id)}
                                            data-testid="button-delete-command"
                                          >
                                            <Trash2 className="h-4 w-4" />
                                          </Button>
                                        )}
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          )}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                )}
              </CardContent>
            </Card>
      </div>

      {/* Edit Category Dialog */}
      <Dialog open={!!editingCategory} onOpenChange={() => setEditingCategory(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Categoria</DialogTitle>
          </DialogHeader>
          {editingCategory && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nome da Categoria *</Label>
                <Input
                  id="edit-name"
                  value={editingCategory.name}
                  onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                  data-testid="input-edit-category-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-desc">Descrição (opcional)</Label>
                <Textarea
                  id="edit-desc"
                  value={editingCategory.description || ""}
                  onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                  rows={3}
                  data-testid="textarea-edit-category-desc"
                />
              </div>
              <Button onClick={handleEditCategory} className="w-full" data-testid="button-save-category">
                Salvar Alterações
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
