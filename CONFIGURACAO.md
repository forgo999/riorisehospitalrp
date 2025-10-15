# Hospital Rio Rise - Guia de Configuração

## Como Editar Usuários e Turnos

Todos os dados do sistema são armazenados em arquivos JSON na pasta `data/`. Para adicionar ou modificar usuários, turnos, regras, etc., basta editar os arquivos correspondentes.

### Estrutura de Pastas

```
data/
├── users.json          # Usuários do sistema
├── shifts.json         # Turnos
├── covenants.json      # Convênios
├── rules.json          # Regras
└── me-commands.json    # Comandos /me
```

---

## 1. Gerenciar Usuários

**Arquivo:** `data/users.json`

### Estrutura de um Usuário:

```json
{
  "id": "identificador-unico",
  "accessCode": "CODIGO_ACESSO",
  "name": "Nome do Usuário",
  "role": "cargo",
  "shiftId": "id-do-turno-ou-null",
  "narniaName": "Nome em Nárnia",
  "phone": "(11) 98765-4321"
}
```

### Cargos Disponíveis:

- `"diretor"` - Diretor (acesso total a todos os turnos)
- `"vice_diretor"` - Vice-Diretor (controle total do seu turno)
- `"cirurgiao"` - Cirurgião (apenas visualização)
- `"terapeuta"` - Terapeuta (apenas visualização)
- `"membro"` - Membro (apenas visualização)

### Exemplo - Adicionar Novo Usuário:

```json
{
  "id": "6",
  "accessCode": "MED001",
  "name": "Dr. Pedro Alves",
  "role": "cirurgiao",
  "shiftId": "shift-2",
  "narniaName": "Pedro Henrique",
  "phone": "(11) 99999-8888"
}
```

---

## 2. Gerenciar Turnos

**Arquivo:** `data/shifts.json`

### Estrutura de um Turno:

```json
{
  "id": "shift-id",
  "name": "Nome do Turno",
  "viceDirectorId": "id-do-vice-diretor",
  "password": "senha-do-turno",
  "createdAt": "2025-01-01T08:00:00.000Z"
}
```

### Exemplo - Criar Novo Turno:

```json
{
  "id": "shift-4",
  "name": "Turno Madrugada",
  "viceDirectorId": "2",
  "password": "madrugada123",
  "createdAt": "2025-01-07T02:00:00.000Z"
}
```

### ⚠️ Importante sobre Senhas:

- Cada turno tem sua própria senha
- A senha é usada para autorizar alterações (adicionar convênios, regras, etc.)
- Anote a senha de cada turno em local seguro
- A senha geral do sistema (para ações globais) é: `admin123`

---

## 3. Códigos de Acesso de Login

Cada usuário tem um `accessCode` único que é usado para fazer login no sistema.

### Códigos Padrão do Sistema:

| Código    | Usuário           | Cargo        | Turno        |
|-----------|-------------------|--------------|--------------|
| DIR001    | Dr. Carlos Silva  | Diretor      | -            |
| VICE001   | Dra. Ana Santos   | Vice-Diretor | Turno Manhã  |
| CIR001    | Dr. Roberto Lima  | Cirurgião    | Turno Manhã  |
| TER001    | Dra. Maria Oliveira| Terapeuta   | Turno Manhã  |
| MEM001    | João Costa        | Membro       | Turno Manhã  |

---

## 4. Senhas dos Turnos

### Senhas Padrão:

| Turno         | ID       | Senha        |
|---------------|----------|--------------|
| Turno Manhã   | shift-1  | manha123     |
| Turno Tarde   | shift-2  | tarde123     |
| Turno Noite   | shift-3  | noite123     |

### Senha Geral (Admin):
- Senha: `admin123`
- Usada para ações que não são específicas de um turno

---

## 5. Como Adicionar Convênios Manualmente

**Arquivo:** `data/covenants.json`

### Cálculo do Tempo:
- R$ 1.000 = 1 semana (604.800 segundos)
- Exemplo: R$ 2.000 = 2 semanas

### Estrutura:

```json
{
  "id": "cov-novo",
  "organizationName": "Nome da Família/Organização",
  "amountPaid": 1000,
  "startDate": "2025-01-07T10:00:00.000Z",
  "endDate": "2025-01-14T10:00:00.000Z",
  "totalSeconds": 604800,
  "createdAt": "2025-01-07T10:00:00.000Z"
}
```

---

## 6. Permissões por Cargo

### Diretor:
- ✅ Acesso a TODOS os turnos
- ✅ Criar/editar/deletar convênios, regras, comandos /me
- ✅ Visualizar todos os membros de todos os turnos

### Vice-Diretor:
- ✅ Controle total do SEU turno
- ✅ Criar/editar/deletar convênios, regras, comandos /me
- ✅ Visualizar membros do seu turno

### Cirurgião, Terapeuta, Membro:
- ❌ Apenas visualização
- ❌ Não podem fazer alterações

---

## 7. Hospedagem no GitHub Pages

### Preparação:

1. Todo o código já está pronto para deploy estático
2. Os dados ficam nos arquivos JSON na pasta `data/`
3. Para hospedar no GitHub Pages:

```bash
# 1. Build do projeto
npm run build

# 2. A pasta 'dist' conterá os arquivos estáticos
# 3. Faça upload da pasta 'dist' para o branch gh-pages
```

### ⚠️ Importante:
- GitHub Pages serve apenas arquivos estáticos
- O backend Express não funcionará no GitHub Pages
- Considere usar Vercel, Netlify ou Render para hospedar com backend

---

## 8. Atualizar o Sistema

Para adicionar novos recursos ou fazer alterações:

### Adicionar Novo Usuário:
1. Abra `data/users.json`
2. Adicione o objeto do usuário
3. Reinicie o servidor (se necessário)

### Modificar Turno:
1. Abra `data/shifts.json`
2. Edite os dados desejados
3. Salve o arquivo

### Backup dos Dados:
- Faça backup regular da pasta `data/`
- Todos os dados estão nos arquivos JSON

---

## 9. Solução de Problemas

### Login não funciona:
- Verifique se o `accessCode` existe em `data/users.json`
- Certifique-se que o código está exatamente como cadastrado

### Senha incorreta ao adicionar convênio:
- Para turnos: use a senha do turno em `data/shifts.json`
- Para ações gerais: use `admin123`

### Dados não aparecem:
- Verifique se o arquivo JSON está com sintaxe correta
- Use um validador JSON online se necessário

---

## Contato

Para dúvidas sobre o sistema, consulte este guia ou revise os arquivos JSON na pasta `data/`.
