# Guia de Configuração - Hospital Rio Rise

## 🚀 Início Rápido

### 1. Configurar MongoDB URI

Você já configurou o `MONGODB_URI` nos secrets do Replit. ✅

### 2. Instalar Dependências

```bash
npm install
```

### 3. Importar Dados

Para importar TODOS os dados da pasta `data/` para o MongoDB:

```bash
npm run import-all
```

Este script importa:
- ✅ Todos os usuários com seus códigos de acesso
- ✅ Todos os turnos com senhas
- ✅ Convênios
- ✅ Regras, comandos /me, presença e advertências

### 4. Executar Aplicação

```bash
npm run dev
```

A aplicação estará rodando em: `http://localhost:5000`

## 🔑 Códigos de Acesso Importados

Após executar `npm run import-all`, você terá acesso com estes códigos:

| Código              | Usuário                  | Cargo          |
|---------------------|--------------------------|----------------|
| **3850**            | Administrador            | Administrador  |
| meiamolemeioduro    | Dr. Dawi_Negreiros       | Diretor        |
| teste123            | Dra. Karollaine_Souza    | Vice-Diretor   |
| CIR001              | n/a                      | Cirurgião      |
| TER001              | Dr. Morgan_Bevelaqua     | Cirurgião      |
| MEM001              | teste                    | Estagiário     |

## 📅 Turnos Importados

- **08:00 - 11:00** (Senha: manha123)
- **11:00 - 13:00** (Senha: 181023)
- **13:00 - 15:00** (Senha: 181023)
- **15:00 - 18:00** (Senha: 2106Si)
- **18:00 - 21:00** (Senha: teste123)
- **21:00 - 00:00** (Senha: noite123)

## 🛠️ Scripts Úteis

```bash
# Importar todos os dados
npm run import-all

# Verificar usuários no banco
npm run check-users

# Adicionar novo usuário
npm run add-user "Nome" "codigo" "cargo"

# Configurar banco do zero
npm run setup-db

# Build para produção
npm run build

# Iniciar produção
npm start
```

## 🚢 Deploy no Render

1. Conecte seu repositório GitHub ao Render
2. Configure:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
3. Adicione a variável de ambiente:
   - `MONGODB_URI`: sua string de conexão MongoDB Atlas
   - `NODE_ENV`: production
4. Importe os dados:
   - Após o deploy, execute: `npm run import-all`

## ❓ Problemas Comuns

### Código de acesso inválido
- Execute `npm run check-users` para ver todos os códigos disponíveis
- Execute `npm run import-all` para importar dados da pasta data/

### Banco de dados vazio
- Execute `npm run import-all` para importar todos os dados

### Porta 5000 em uso
- O Replit sempre usa a porta 5000
- Em produção, a variável PORT é configurada automaticamente

## 📝 Arquitetura

- **Frontend**: React + Vite + TypeScript (porta 5000)
- **Backend**: Express + TypeScript (integrado via Vite middleware)
- **Banco**: MongoDB + Mongoose
- **Autenticação**: Código de acesso único por usuário
