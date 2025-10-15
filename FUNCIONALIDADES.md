# Funcionalidades do Sistema RioRise RP Hospital

Sistema completo de gerenciamento hospitalar para roleplay com controle de hierarquia, permissões, turnos e muito mais.

## 🎯 Visão Geral

O sistema permite gerenciar um hospital de roleplay com múltiplos turnos, hierarquia de cargos, sistema de presença, advertências, promoções e muito mais.

## 👥 Hierarquia de Cargos

O sistema possui 7 níveis hierárquicos:

1. **Estagiário** - Cargo inicial
2. **Paramédico** - Segundo nível
3. **Terapeuta** - Terceiro nível
4. **Cirurgião** - Quarto nível
   - Pode ter a tag especial de **Cirurgião Chefe** (1 por turno)
5. **Vice Diretor** - Gerencia um turno específico
6. **Diretor** - Gerencia todos os turnos
7. **Administrador** - Acesso total ao sistema

## 🔐 Sistema de Permissões

### Vice Diretor (Gerencia APENAS seu turno)

Pode fazer tudo dentro do seu turno:
- ✅ Criar, editar e deletar usuários do seu turno
- ✅ Promover membros até Cirurgião (de qualquer cargo para qualquer cargo)
- ✅ Tornar um Cirurgião em Cirurgião Chefe (rebaixa o atual automaticamente)
- ✅ Dar advertências aos membros
- ✅ Exonerar (deletar) membros do sistema
- ✅ Gerenciar presença (chamada) do seu turno
- ✅ Criar/editar/deletar regras do seu turno
- ✅ Criar/editar/deletar comandos /me do seu turno
- ✅ Criar/editar/deletar categorias /me (gerais e do turno)

### Diretor e Administrador (Acesso Total)

Podem fazer TUDO em TODOS os turnos:
- ✅ Gerenciar usuários de qualquer turno
- ✅ Promover para qualquer cargo (incluindo Vice Diretor, Diretor, Admin)
- ✅ Dar advertências em qualquer turno
- ✅ Exonerar membros de qualquer turno
- ✅ Gerenciar presença de todos os turnos
- ✅ Criar/editar/deletar regras (gerais e de qualquer turno)
- ✅ Criar/editar/deletar comandos /me (gerais e de qualquer turno)
- ✅ Criar/editar/deletar categorias /me (gerais e de qualquer turno)

### Administrador (Exclusivo)

- ✅ Visualizar todos os logs do sistema (APENAS Administradores podem ver logs)

## 🏥 Funcionalidades Principais

### 1. Gestão de Turnos

- Criar múltiplos turnos de trabalho
- Cada turno tem um Vice Diretor responsável
- Senha de acesso por turno
- Regras e comandos /me específicos por turno

### 2. Sistema de Promoções

- Promoções de qualquer cargo para qualquer cargo (dentro das permissões)
- Histórico completo de promoções registrado
- Sistema de Cirurgião Chefe:
  - Apenas 1 Cirurgião Chefe por turno
  - Ao promover novo Chefe, o atual é rebaixado automaticamente para Cirurgião
  - Log de rebaixamento gerado automaticamente

### 3. Sistema de Advertências

- Vice Diretores podem advertir membros do seu turno
- Diretores e Admins podem advertir qualquer membro
- Sistema de contagem automática:
  - **3 advertências = Exoneração automática**
- Histórico de advertências preservado mesmo após exoneração

### 4. Sistema de Exoneração

- Exonerar = deletar usuário do sistema
- **Histórico mantido:**
  - Advertências recebidas
  - Promoções realizadas
  - Presença registrada
  - Logs de ações
- Permite auditoria completa mesmo após exoneração

### 5. Sistema de Presença (Chamada)

- Registrar presença diária por turno
- Status: Presente ou Faltou
- Notas opcionais
- Histórico completo de presença
- Vice Diretor vê apenas seu turno
- Diretores/Admins veem todos os turnos

### 6. Comandos /me

Sistema dinâmico de comandos para roleplay:

- **Comandos Gerais**: Visíveis para todos os turnos
- **Comandos por Turno**: Específicos de cada turno
- **Categorias**: Organização por categorias

Exemplos de uso:
- `/me administra medicamento ao paciente`
- `/me realiza procedimento cirúrgico`
- `/me atende na recepção`

### 7. Categorias de /me

Sistema personalizável de categorias:

- **Categorias Gerais**: Disponíveis para todos
- **Categorias por Turno**: Específicas de cada turno

Exemplos de categorias:
- 🏥 Recepção
- 💊 Medicamentos
- 🔪 Cirurgia
- 🚨 SOS
- 🩺 Consulta

Vice Diretores, Diretores e Admins podem criar categorias.

### 8. Regras

- **Regras Gerais**: Aplicam-se a todos os turnos
- **Regras por Turno**: Específicas de cada turno
- Vice Diretor pode criar regras apenas do seu turno
- Diretores/Admins podem criar regras gerais e de qualquer turno

### 9. Convênios

- Gerenciar organizações conveniadas
- Valor pago
- Período de validade
- Timer em segundos (para acompanhamento)

### 10. Sistema de Logs

**Visível APENAS para Administradores**

Registra todas as ações do sistema:
- ✅ Login de usuários
- ✅ Criação de usuários
- ✅ Edição de usuários
- ✅ Promoções
- ✅ Rebaixamentos
- ✅ Advertências
- ✅ Exonerações
- ✅ Criação/edição/deleção de regras
- ✅ Criação/edição/deleção de comandos /me
- ✅ Criação/edição/deleção de categorias
- ✅ Gerenciamento de presença
- ✅ E muito mais...

Cada log contém:
- Ação realizada
- Usuário que realizou
- Usuário alvo (quando aplicável)
- Turno relacionado
- Detalhes da ação
- Timestamp completo

## 📊 Estrutura do Banco de Dados

### Collections MongoDB

1. **users** - Usuários do sistema
2. **shifts** - Turnos de trabalho
3. **covenants** - Convênios ativos
4. **rules** - Regras (gerais e por turno)
5. **mecategories** - Categorias de comandos /me
6. **mecommands** - Comandos /me
7. **attendancerecords** - Registros de presença
8. **warnings** - Advertências
9. **promotions** - Histórico de promoções
10. **logs** - Logs de todas as ações

## 🔒 Segurança

- Autenticação via código de acesso único por usuário
- Validação de permissões em todas as rotas
- Senhas de turno protegidas
- Logs completos de auditoria
- String de conexão MongoDB em variável de ambiente

## 🚀 Fluxo de Uso

### Para Vice Diretores

1. Login com código de acesso
2. Acessa dashboard do seu turno
3. Gerencia membros, presença, advertências
4. Cria regras e comandos /me do turno
5. Promove membros até Cirurgião

### Para Diretores/Admins

1. Login com código de acesso
2. Visão global de todos os turnos
3. Gerencia qualquer membro de qualquer turno
4. Cria regras e recursos globais
5. Promove para qualquer cargo
6. (Admin) Acessa logs do sistema

### Para Membros Comuns

1. Login com código de acesso
2. Visualiza suas informações
3. Vê regras do seu turno
4. Usa comandos /me disponíveis
5. Acompanha sua presença e promoções

## 📱 Interface

- Design moderno e responsivo
- Dark mode
- Componentes reutilizáveis (Radix UI + Tailwind)
- Feedback visual de ações
- Carregamento otimizado

## 🛠️ Tecnologias

- **Frontend**: React + TypeScript + Vite
- **Backend**: Express + TypeScript
- **Banco de Dados**: MongoDB (Mongoose)
- **UI**: Tailwind CSS + Radix UI
- **Validação**: Zod
- **Deploy**: Render + MongoDB Atlas

## 📈 Próximas Melhorias

- Dashboard com gráficos e estatísticas
- Notificações em tempo real
- Exportação de relatórios
- Sistema de mensagens internas
- Agendamento de cirurgias
- Gestão de estoque de medicamentos
