# 🚀 Guia de Deploy - Hospital Rio Rise

Este guia explica como fazer deploy da aplicação usando **Netlify (Frontend)** + **Render (Backend)**.

## 📋 Arquitetura de Deploy

| Componente | Serviço | URL |
|------------|---------|-----|
| **Frontend (React)** | Netlify | `https://seu-app.netlify.app` |
| **Backend (Express API)** | Render | `https://seu-app.onrender.com` |

---

## 🔧 Passo 1: Deploy do Backend no Render

### 1.1 - Criar conta no Render
1. Acesse [render.com](https://render.com)
2. Faça login com GitHub

### 1.2 - Criar novo Web Service
1. No dashboard do Render, clique em **"New +"** → **"Web Service"**
2. Conecte seu repositório do GitHub
3. Configure:
   - **Name**: `hospital-rio-rise-backend` (ou outro nome)
   - **Region**: `Oregon (US West)` ou mais próximo
   - **Branch**: `main`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start`
   - **Plan**: **Free**

### 1.3 - Variáveis de Ambiente (opcional)
Se precisar adicionar variáveis:
- Clique em **"Environment"** → **"Add Environment Variable"**
- Adicione: `NODE_ENV` = `production`

### 1.4 - Deploy Automático
- O Render vai fazer build e deploy automaticamente
- Aguarde 5-10 minutos
- Copie a URL do backend (algo como: `https://hospital-rio-rise-backend.onrender.com`)

⚠️ **Nota**: No plano Free, o backend "dorme" após 15 min sem uso. A primeira requisição pode demorar 30s.

---

## 🎨 Passo 2: Deploy do Frontend no Netlify

### 2.1 - Criar conta no Netlify
1. Acesse [netlify.com](https://netlify.com)
2. Faça login com GitHub

### 2.2 - Conectar Repositório
1. No dashboard, clique em **"Add new site"** → **"Import an existing project"**
2. Escolha **"Deploy with GitHub"**
3. Selecione seu repositório
4. Configure:
   - **Branch**: `main`
   - **Build command**: `npm run build`
   - **Publish directory**: `dist/public`

### 2.3 - Adicionar Variável de Ambiente
**MUITO IMPORTANTE** - Configure a URL do backend:

1. No painel do site, vá em **"Site settings"** → **"Environment variables"**
2. Clique em **"Add a variable"**
3. Adicione:
   - **Key**: `VITE_API_URL`
   - **Value**: Cole a URL do Render (ex: `https://hospital-rio-rise-backend.onrender.com`)
   - **Scopes**: Marque "Same value for all deploy contexts"

### 2.4 - Deploy
1. Clique em **"Deploy site"**
2. Aguarde o build (2-5 minutos)
3. Seu site estará no ar! 🎉

---

## 🔄 Passo 3: Verificar Código do Frontend

✅ **Boa notícia**: O código já está preparado!

A aplicação usa um sistema centralizado de requisições (`apiRequest` e `getQueryFn`) que automaticamente adiciona a URL da API configurada em `VITE_API_URL`. 

**Não é necessário alterar nenhum componente manualmente** - todas as requisições já funcionam tanto em desenvolvimento (localhost) quanto em produção (Render).

---

## 🔐 Passo 4: Configurar URL do Frontend no Backend

✅ **CORS já está configurado**, mas você precisa definir a URL do frontend:

### 4.1 - No Render, adicionar variável de ambiente:
1. No painel do seu Web Service no Render
2. Vá em **"Environment"** → **"Add Environment Variable"**
3. Adicione:
   - **Key**: `FRONTEND_URL`
   - **Value**: Sua URL do Netlify (ex: `https://hospital-rio-rise.netlify.app`)
4. Clique em **"Save Changes"**

O backend já aceita requisições de qualquer URL `*.netlify.app` + a URL específica em `FRONTEND_URL`.

---

## 📱 Passo 5: Testar a Aplicação

### Testes Locais
\`\`\`bash
# Terminal 1 - Backend
npm run dev

# Terminal 2 - Frontend (em outra aba)
cd client
npm run dev
\`\`\`

### Testes em Produção
1. Acesse sua URL do Netlify
2. Teste login, criação de convênios, etc.
3. Abra DevTools (F12) → Console para ver erros

---

## 🐛 Solução de Problemas Comuns

### ❌ Erro: "Failed to fetch" / CORS error
**Solução**: Verifique se configurou CORS no backend com a URL correta do Netlify

### ❌ Backend retorna 404
**Solução**: Confirme que `VITE_API_URL` está configurado no Netlify com a URL do Render

### ❌ Backend demora muito (timeout)
**Solução**: Plano Free do Render dorme após 15min. Primeira requisição demora ~30s.

### ❌ Build falha no Netlify
**Solução**: Verifique se `dist/public` existe após o build. Rode localmente: `npm run build`

---

## 🔄 Deploy Automático (CI/CD)

Após configuração inicial:

1. **Faça push para GitHub**:
   \`\`\`bash
   git add .
   git commit -m "Update deployment config"
   git push origin main
   \`\`\`

2. **Deploy automático acontece**:
   - Render rebuilda o backend automaticamente
   - Netlify rebuilda o frontend automaticamente

---

## 💰 Custos

| Serviço | Plano | Custo | Limitações |
|---------|-------|-------|------------|
| **Render** | Free | R$ 0 | Backend "dorme" após 15min sem uso |
| **Netlify** | Free | R$ 0 | 100GB bandwidth/mês, 300 min build/mês |

---

## 🆘 Precisa de Ajuda?

- **Documentação Render**: [docs.render.com](https://docs.render.com)
- **Documentação Netlify**: [docs.netlify.com](https://docs.netlify.com)
- **Comunidade Render**: [community.render.com](https://community.render.com)
- **Comunidade Netlify**: [answers.netlify.com](https://answers.netlify.com)

---

## 📝 Checklist Final

Antes de considerar o deploy completo:

- [ ] Backend deployado no Render e retornando dados
- [ ] Frontend deployado no Netlify
- [ ] Variável `VITE_API_URL` configurada no Netlify
- [ ] CORS configurado no backend
- [ ] Código do frontend atualizado para usar `API_URL`
- [ ] Testado login e funcionalidades principais
- [ ] Deploy automático funcionando (push → rebuild)

---

**🎉 Parabéns! Sua aplicação está no ar!**
