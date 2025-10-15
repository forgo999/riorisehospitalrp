# Guia de Deploy no Render

Este guia completo mostra como fazer deploy da aplicação RioRise RP Hospital no Render com MongoDB Atlas.

## Pré-requisitos

- Conta no [Render](https://render.com) (grátis)
- Conta no [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (grátis)
- Código do projeto no GitHub (ou GitLab/Bitbucket)

## Passo 1: Configurar MongoDB Atlas

### 1.1 Criar Cluster MongoDB

1. Acesse [MongoDB Atlas](https://cloud.mongodb.com)
2. Faça login ou crie uma conta gratuita
3. Clique em **"Create a New Cluster"**
4. Selecione **M0 Sandbox** (gratuito)
5. Escolha uma região próxima ao Brasil (ex: São Paulo - AWS)
6. Clique em **"Create Cluster"**
7. Aguarde 1-3 minutos para o cluster ser criado

### 1.2 Configurar Acesso ao Banco

1. No painel lateral, clique em **"Database Access"**
2. Clique em **"Add New Database User"**
3. Escolha:
   - **Username**: `seu-usuario` (ex: `riorise`)
   - **Password**: `sua-senha-forte` (guarde essa senha!)
   - **Database User Privileges**: Atlas admin
4. Clique em **"Add User"**

### 1.3 Configurar IP Whitelist

1. No painel lateral, clique em **"Network Access"**
2. Clique em **"Add IP Address"**
3. Escolha **"Allow Access from Anywhere"** (`0.0.0.0/0`)
   - ⚠️ Isso é necessário porque o IP do Render muda
4. Clique em **"Confirm"**

### 1.4 Obter String de Conexão

1. Volte para **"Database"** no painel lateral
2. Clique no botão **"Connect"** do seu cluster
3. Escolha **"Connect your application"**
4. Copie a string de conexão (formato: `mongodb+srv://...`)
5. Substitua `<password>` pela senha que você criou
6. Adicione o nome do banco antes de `?retryWrites`:
   ```
   mongodb+srv://usuario:senha@cluster.mongodb.net/riorise-hospital?retryWrites=true&w=majority
   ```

Exemplo final:
```
mongodb+srv://riorise:MinhaSenh@123@cluster0.abc12.mongodb.net/riorise-hospital?retryWrites=true&w=majority
```

## Passo 2: Deploy no Render

### 2.1 Criar Web Service

1. Acesse [Render Dashboard](https://dashboard.render.com)
2. Clique em **"New +"** → **"Web Service"**
3. Conecte seu repositório do GitHub
4. Selecione o repositório do projeto

### 2.2 Configurar o Serviço

Preencha os campos:

- **Name**: `riorise-hospital` (ou qualquer nome)
- **Region**: São Paulo (ou mais próximo)
- **Branch**: `main` (ou sua branch principal)
- **Root Directory**: (deixe em branco)
- **Runtime**: `Node`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`
- **Instance Type**: `Free`

### 2.3 Adicionar Variáveis de Ambiente

Na seção **"Environment Variables"**, adicione:

1. Clique em **"Add Environment Variable"**
2. Adicione:
   - **Key**: `MONGODB_URI`
   - **Value**: (cole a string de conexão do MongoDB Atlas)
3. Adicione outra variável:
   - **Key**: `NODE_ENV`
   - **Value**: `production`

### 2.4 Finalizar Deploy

1. Revise todas as configurações
2. Clique em **"Create Web Service"**
3. Aguarde o deploy (5-10 minutos na primeira vez)
4. Quando aparecer **"Live"**, seu site está no ar! 🎉

## Passo 3: Acessar sua Aplicação

1. No dashboard do Render, você verá a URL do seu site:
   ```
   https://riorise-hospital.onrender.com
   ```
2. Clique na URL para abrir sua aplicação
3. Teste o login com os usuários cadastrados

## Gerenciamento

### Ver Logs

1. No dashboard do Render, clique no seu serviço
2. Vá na aba **"Logs"**
3. Veja os logs em tempo real

### Redeploy Manual

1. No dashboard, clique em **"Manual Deploy"** → **"Deploy latest commit"**
2. Aguarde o novo deploy

### Auto Deploy

Por padrão, o Render faz deploy automático quando você faz push no GitHub!

### Atualizar Variáveis de Ambiente

1. Vá em **"Environment"**
2. Edite ou adicione variáveis
3. O serviço reinicia automaticamente

## Banco de Dados

### Visualizar Dados no MongoDB Atlas

1. No MongoDB Atlas, clique em **"Collections"**
2. Veja todas as collections:
   - users
   - shifts
   - covenants
   - rules
   - mecommands
   - mecategories
   - attendancerecords
   - warnings
   - promotions
   - logs

### Backup Automático

O MongoDB Atlas (free tier) faz backups automáticos por 2 dias.

## Domínio Personalizado (Opcional)

1. No Render, vá em **"Settings"**
2. Role até **"Custom Domain"**
3. Clique em **"Add Custom Domain"**
4. Siga as instruções para configurar seu domínio

## Troubleshooting

### Erro de Conexão com MongoDB

- Verifique se a string de conexão está correta
- Confirme que o IP `0.0.0.0/0` está na whitelist
- Verifique se o usuário e senha estão corretos

### Aplicação não inicia

- Veja os logs no Render
- Verifique se a variável `MONGODB_URI` está configurada
- Confirme que o build foi bem-sucedido

### Erro 503 Service Unavailable

- O Render Free tier "hiberna" após 15 minutos sem uso
- O primeiro acesso pode demorar 30-60 segundos para "acordar"
- Após acordar, funciona normalmente

## Custos

- **MongoDB Atlas M0**: Grátis (500MB de armazenamento)
- **Render Free**: Grátis (hiberna após inatividade)
- **Total**: R$ 0,00/mês 💚

## Próximos Passos

- Configure um domínio personalizado
- Configure notificações de deploy
- Monitore o uso do banco de dados
- Faça backups manuais periodicamente

## Suporte

- [Documentação Render](https://render.com/docs)
- [Documentação MongoDB Atlas](https://docs.atlas.mongodb.com)
- [Render Community](https://community.render.com)
