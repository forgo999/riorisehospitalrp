# Configuração do MongoDB

Este projeto usa MongoDB como banco de dados. Siga os passos abaixo para configurar:

## Variável de Ambiente Necessária

### No Replit:
1. Clique em **"Secrets"** no painel esquerdo (ícone de chave 🔐)
2. Adicione uma nova variável:
   - **Key**: `MONGODB_URI`
   - **Value**: `mongodb+srv://Forgotten:Nakatozinho@riorise-rp-hospital.ivuk8b2.mongodb.net/?retryWrites=true&w=majority&appName=riorise-rp-hospital`
3. Clique em "Add new secret"
4. Reinicie o servidor (clique em "Stop" e depois "Run")

### No Render (para deploy):
1. No dashboard do Render, vá em "Environment"
2. Adicione a variável de ambiente:
   - **Key**: `MONGODB_URI`
   - **Value**: (sua string de conexão MongoDB)
3. Salve as alterações
4. O Render reiniciará automaticamente

### Localmente (.env):
1. Crie um arquivo `.env` na raiz do projeto
2. Adicione a linha:
   ```
   MONGODB_URI=mongodb+srv://Forgotten:Nakatozinho@riorise-rp-hospital.ivuk8b2.mongodb.net/?retryWrites=true&w=majority&appName=riorise-rp-hospital
   ```
3. Reinicie o servidor com `npm run dev`

## Estrutura do Banco de Dados

O sistema usa as seguintes collections no MongoDB:

### Collections Principais:
- **users** - Usuários do sistema (com isChiefSurgeon para Cirurgião Chefe)
- **shifts** - Turnos de trabalho
- **covenants** - Convênios ativos
- **rules** - Regras gerais e por turno
- **mecategories** - Categorias de comandos /me
- **mecommands** - Comandos /me com categoria
- **attendancerecords** - Registros de presença
- **warnings** - Advertências (3 = exoneração automática)
- **promotions** - Histórico de promoções
- **logs** - Logs de todas as ações do sistema

## Novas Funcionalidades

### Hierarquia de Cargos
1. Estagiário
2. Paramédico
3. Terapeuta
4. Cirurgião (pode ser Cirurgião Chefe - 1 por turno)
5. Vice Diretor
6. Diretor
7. Administrador

### Sistema de Promoções
- Vice diretores podem promover até Cirurgião
- Diretores e Administradores podem promover para qualquer cargo
- Cirurgião Chefe: apenas 1 por turno (rebaixa o atual ao promover novo)

### Sistema de Advertências
- 3 advertências = exoneração automática
- Exonerar = deletar usuário do sistema

### Sistema de Logs
- Registra todas as ações: login, criação, edição, promoções, exonerações
- Visível apenas para Administradores

### Categorias de /me
- Sistema dinâmico de categorias
- Criar, editar e deletar categorias
- Vincular comandos /me a categorias

## Verificar Conexão

Após configurar, você verá no console:
```
✅ Connected to MongoDB
serving on port 5000
```

Se aparecer erro, verifique:
1. Se a variável MONGODB_URI está configurada corretamente
2. Se o IP do Replit/Render está na whitelist do MongoDB Atlas
3. Se as credenciais estão corretas
