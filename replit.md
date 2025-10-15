# RioRise RP Hospital - Sistema de Gestão Hospitalar

## Visão Geral

Sistema completo de gerenciamento hospitalar para roleplay com controle de hierarquia, permissões, turnos, presença, advertências, promoções e logs completos. Desenvolvido com React + TypeScript + Express + MongoDB.

## Arquitetura do Projeto

### Stack Tecnológico

**Frontend:**
- React 18 + TypeScript + Vite
- Wouter (roteamento)
- TanStack Query (gerenciamento de estado servidor)
- Radix UI + Tailwind CSS (componentes e estilização)
- React Hook Form + Zod (formulários e validação)

**Backend:**
- Express.js + TypeScript
- MongoDB + Mongoose ODM
- Session-less authentication (código de acesso)
- Sistema de permissões baseado em roles

**Deploy:**
- Render (hosting web service)
- MongoDB Atlas (banco de dados cloud)

### Estrutura de Pastas

```
├── client/             # Frontend React
│   ├── src/
│   │   ├── pages/     # Páginas da aplicação
│   │   ├── components/ # Componentes reutilizáveis
│   │   └── lib/       # Utilitários
├── server/            # Backend Express
│   ├── db/
│   │   ├── models/    # Mongoose models
│   │   ├── connection.ts
│   │   └── mongoStorage.ts
│   ├── middleware/    # Auth e permissões
│   ├── routes.ts      # Endpoints API
│   └── index.ts       # Servidor principal
├── shared/            # Código compartilhado
│   └── schema.ts      # Zod schemas e tipos
└── data/              # Dados iniciais (opcional)
```

## Hierarquia e Permissões

### 7 Níveis Hierárquicos

1. **Estagiário** - Cargo inicial
2. **Paramédico** - Segundo nível
3. **Terapeuta** - Terceiro nível
4. **Cirurgião** - Quarto nível (pode ser Cirurgião Chefe)
5. **Vice Diretor** - Gerencia um turno específico
6. **Diretor** - Gerencia todos os turnos
7. **Administrador** - Acesso total + logs

### Sistema de Permissões

**Vice Diretor (apenas seu turno):**
- Criar usuários até Cirurgião (apenas no seu turno)
- Promover até Cirurgião (de qualquer cargo)
- Tornar Cirurgião em Cirurgião Chefe
- Dar advertências e exonerar membros do seu turno
- Gerenciar presença (chamada) do seu turno
- Criar/editar regras e comandos /me do turno
- Criar/editar categorias /me (gerais e do turno)

**Diretor (todos os turnos):**
- Todas as permissões do Vice Diretor em TODOS os turnos
- Criar usuários até Diretor (todos os turnos)
- Promover para qualquer cargo exceto Administrador
- Gerenciar recursos globais (turnos, convênios)

**Administrador (acesso total):**
- Todas as permissões do Diretor
- Criar e promover para qualquer cargo (incluindo Administrador)
- Visualizar logs completos do sistema

## Funcionalidades Principais

### 1. Gestão de Usuários
- Autenticação por código de acesso único
- 7 níveis de hierarquia
- Sistema de Cirurgião Chefe (1 por turno)
- Histórico completo de promoções

### 2. Sistema de Turnos
- Múltiplos turnos de trabalho
- Vice Diretor responsável por turno
- Senha de acesso por turno
- Regras e comandos específicos

### 3. Sistema de Promoções
- Promoção de qualquer cargo para qualquer cargo
- Cirurgião Chefe: rebaixamento automático do anterior
- Histórico completo preservado
- Logs de todas as promoções

### 4. Sistema de Advertências
- Contagem automática de advertências
- **3 advertências = exoneração automática**
- Histórico mantido após exoneração
- Vice Diretor pode advertir membros do seu turno

### 5. Sistema de Exoneração
- Exonerar = deletar usuário do sistema
- Histórico preservado (advertências, promoções, presença, logs)
- Permite auditoria completa

### 6. Sistema de Presença (Chamada)
- Registro diário por turno
- Status: Presente ou Faltou
- Notas opcionais
- Histórico completo

### 7. Comandos /me
- **Comandos Gerais**: para todos os turnos
- **Comandos por Turno**: específicos
- **Sistema de Categorias**: organizados por categoria
- Criação dinâmica por Vice Diretores+

### 8. Categorias /me
- **Categorias Gerais**: disponíveis para todos
- **Categorias por Turno**: específicas
- Exemplos: Recepção, Medicamentos, Cirurgia, SOS
- Vice Diretores, Diretores e Admins podem criar

### 9. Regras
- **Regras Gerais**: para todos os turnos
- **Regras por Turno**: específicas
- Sistema de versionamento (createdAt/updatedAt)

### 10. Convênios
- Organizações conveniadas
- Valor pago e período de validade
- Timer de expiração

### 11. Sistema de Logs (Admin Only)
- Registro completo de todas as ações
- Visível APENAS para Administradores
- Tipos de log: login, criação, edição, promoção, advertência, exoneração, etc.
- Timestamp completo e metadados

## Estrutura do Banco de Dados

### Collections MongoDB

1. **users** - Usuários e hierarquia
2. **shifts** - Turnos de trabalho
3. **covenants** - Convênios
4. **rules** - Regras (gerais e por turno)
5. **mecategories** - Categorias /me
6. **mecommands** - Comandos /me
7. **attendancerecords** - Presença
8. **warnings** - Advertências
9. **promotions** - Histórico de promoções
10. **logs** - Logs completos do sistema

## Configuração e Deploy

### Variáveis de Ambiente

```env
MONGODB_URI=mongodb+srv://usuario:senha@cluster.mongodb.net/database?retryWrites=true&w=majority
NODE_ENV=production
```

### Scripts Disponíveis

```bash
npm run dev        # Desenvolvimento local
npm run build      # Build produção
npm start          # Iniciar servidor produção
npm run db:push    # Sincronizar schema MongoDB
```

### Deploy no Render

1. Conecte o repositório GitHub ao Render
2. Configure Build Command: `npm install && npm run build`
3. Configure Start Command: `npm start`
4. Adicione variável `MONGODB_URI` no Environment
5. Deploy automático a cada push!

**Guia completo:** [RENDER_DEPLOY.md](./RENDER_DEPLOY.md)

## Documentação Adicional

- [FUNCIONALIDADES.md](./FUNCIONALIDADES.md) - Documentação completa das funcionalidades
- [RENDER_DEPLOY.md](./RENDER_DEPLOY.md) - Guia completo de deploy
- [MONGODB_SETUP.md](./MONGODB_SETUP.md) - Configuração do MongoDB
- [CONFIGURACAO.md](./CONFIGURACAO.md) - Configurações gerais
- [design_guidelines.md](./design_guidelines.md) - Guia de design

## API Endpoints

### Autenticação
- `POST /api/auth/login` - Login com código de acesso
- `POST /api/auth/validate-password` - Validar senha de turno

### Usuários
- `GET /api/users` - Listar todos
- `GET /api/users/shift/:shiftId` - Usuários por turno
- `POST /api/users` - Criar usuário
- `PATCH /api/users/:id` - Atualizar usuário
- `DELETE /api/users/:id` - Deletar usuário
- `POST /api/users/:id/exonerate` - Exonerar usuário

### Turnos
- `GET /api/shifts` - Listar turnos
- `POST /api/shifts` - Criar turno
- `PATCH /api/shifts/:id` - Atualizar turno
- `DELETE /api/shifts/:id` - Deletar turno

### Regras
- `GET /api/rules` - Todas as regras
- `GET /api/rules/general` - Regras gerais
- `GET /api/rules/shift/:shiftId` - Regras do turno
- `POST /api/rules` - Criar regra (requer auth)
- `PATCH /api/rules/:id` - Atualizar regra (requer auth)
- `DELETE /api/rules/:id` - Deletar regra (requer auth)

### Comandos /me
- `GET /api/me-commands` - Todos os comandos
- `GET /api/me-commands/general` - Comandos gerais
- `GET /api/me-commands/shift/:shiftId` - Comandos do turno
- `POST /api/me-commands` - Criar comando (requer auth)
- `PATCH /api/me-commands/:id` - Atualizar comando (requer auth)
- `DELETE /api/me-commands/:id` - Deletar comando (requer auth)

### Categorias /me
- `GET /api/me-categories` - Todas as categorias
- `GET /api/me-categories/general` - Categorias gerais
- `GET /api/me-categories/shift/:shiftId` - Categorias do turno
- `POST /api/me-categories` - Criar categoria (requer auth)
- `PATCH /api/me-categories/:id` - Atualizar categoria (requer auth)
- `DELETE /api/me-categories/:id` - Deletar categoria (requer auth)

### Presença
- `GET /api/attendance/shift/:shiftId` - Presença do turno
- `GET /api/attendance/shift/:shiftId/date/:date` - Presença por data
- `GET /api/attendance/user/:userId` - Presença do usuário
- `POST /api/attendance` - Registrar presença
- `PATCH /api/attendance/:id` - Atualizar presença
- `DELETE /api/attendance/:id` - Deletar registro

### Advertências
- `GET /api/warnings/user/:userId` - Advertências do usuário
- `GET /api/warnings/shift/:shiftId` - Advertências do turno
- `POST /api/warnings` - Criar advertência (requer auth)
- `DELETE /api/warnings/:id` - Deletar advertência

### Promoções
- `GET /api/promotions` - Todas as promoções
- `GET /api/promotions/user/:userId` - Promoções do usuário
- `POST /api/promotions` - Criar promoção (requer auth)

### Logs (Admin Only)
- `GET /api/logs` - Todos os logs
- `GET /api/logs/user/:userId` - Logs do usuário
- `GET /api/logs/action/:action` - Logs por ação

### Convênios
- `GET /api/covenants` - Listar convênios
- `POST /api/covenants` - Criar convênio
- `PATCH /api/covenants/:id` - Atualizar convênio
- `DELETE /api/covenants/:id` - Deletar convênio

## Segurança e Controle de Acesso

### Validação de Permissões

**Criação de Usuários:**
- Vice Diretor: pode criar apenas Estagiário, Paramédico, Terapeuta e Cirurgião (somente no seu turno)
- Diretor: pode criar qualquer cargo exceto Administrador (em todos os turnos)
- Administrador: pode criar qualquer cargo incluindo Administrador

**Gerenciamento de Recursos:**
- Vice Diretor: acesso restrito ao seu turno (presença, advertências, regras, categorias)
- Diretor e Admin: acesso a todos os turnos

**Logs de Auditoria:**
- Visível APENAS para Administradores
- Registro completo de todas as ações (criação, edição, promoção, advertência, exoneração)

### Proteção de Endpoints

Todas as rotas sensíveis estão protegidas com:
- Autenticação obrigatória (requireAuth)
- Validação de permissões por cargo (requireRole, requireAdminOrDirector)
- Validação de acesso a recursos (canManageResource, canManageUser)
- Validação de criação de cargos (canCreateUserWithRole)

## Mudanças Recentes (Outubro 2025)

### ✅ Implementado

1. **Sistema de permissões completo**
   - Vice Diretor pode gerenciar apenas seu turno
   - Diretor/Admin podem gerenciar tudo
   - Logs visíveis apenas para Admins
   - Proteção contra escalação de privilégios

2. **Categorias /me dinâmicas**
   - Categorias gerais e por turno
   - Vice Diretores+ podem criar

3. **Sistema de promoções aprimorado**
   - Rebaixamento automático de Cirurgião Chefe
   - Promoção de qualquer cargo para qualquer cargo (respeitando permissões)

4. **Sistema de advertências**
   - 3 advertências = exoneração automática
   - Histórico preservado

5. **Sistema de exoneração**
   - Mantém histórico completo
   - Permite auditoria

6. **Logs completos**
   - Visível apenas para Admins
   - Registra todas as ações

7. **Segurança robusta**
   - Todas as rotas protegidas com autenticação
   - Validação de permissões em todas as operações
   - Proteção contra escalação de privilégios
   - Sistema aprovado em auditoria de segurança

8. **MongoDB Atlas configurado**
   - Deploy pronto para Render
   - Guia completo de deploy criado

## Preferências do Usuário

- Linguagem: Português (BR)
- Comunicação: Simples e objetiva
- Deploy: Render + MongoDB Atlas
- Ambiente: Sem dependências do Replit

## Próximas Melhorias

- Dashboard com estatísticas e gráficos
- Notificações em tempo real
- Exportação de relatórios
- Sistema de mensagens internas
- Agendamento de cirurgias
- Gestão de estoque de medicamentos

---

**Última atualização:** Outubro 2025
**Versão:** 2.0
**Status:** ✅ Pronto para produção
