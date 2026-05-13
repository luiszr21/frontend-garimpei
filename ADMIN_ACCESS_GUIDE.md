# 🔐 Guia Completo: Como Acessar e Criar um Admin

## 📌 Índice
1. Como acessar a área de admin
2. Como criar um novo usuário admin
3. O que o backend precisa fazer
4. Endpoints necessários
5. Troubleshooting

---

## 🚀 1. Como Acessar a Área de Admin

### Pré-requisitos:
- ✅ Estar registrado no sistema
- ✅ Ter a role "admin" atribuída pelo backend
- ✅ Possuir token de autenticação válido

### Passo 1: Login
```
URL: http://localhost:5173/login
1. Digite seu email
2. Digite sua senha
3. Clique em "Entrar"
```

### Passo 2: Acesso ao Dashboard
Se seu usuário é admin, após o login:
```
URL: http://localhost:5173/admin
```

Você será automaticamente redirecionado se:
- ❌ Não estiver autenticado → vai para `/login`
- ❌ Não for admin → vai para `/` (home)

### Navegação no Admin

#### Sidebar (Menu Esquerdo):
```
🏪 Admin (Logo)
  │
  ├─ 📊 Dashboard  → /admin
  ├─ 📦 Produtos   → /admin/produtos
  └─ 💬 Interações → /admin/interacoes

  🚪 Sair
```

#### Páginas:

**📊 Dashboard** (`/admin`)
- Visão geral do sistema
- 6 cards com estatísticas
- 2 gráficos de pizza (distribuição)
- Resumo rápido

**📦 Produtos** (`/admin/produtos`)
- Lista de produtos em cards com imagem
- Botão "+ Novo Produto"
- Editar/Deletar cada produto
- Formulário inline para criar/editar

**💬 Interações** (`/admin/interacoes`)
- Filtro por status
- Cards com informações do cliente
- Responder interações
- Enviar emails
- Confirmar/Excluir

---

## 👤 2. Como Criar um Novo Usuário Admin

### ⚠️ IMPORTANTE: Quem pode criar admins?
- Apenas o **banco de dados** ou **admin** pode criar novos admins
- **Não existe interface frontend** para isso

### Opção 1: Via Backend API (SQL Direct)

O backend precisa inserir diretamente no banco:

```sql
-- Adicionar novo admin no banco de dados
INSERT INTO usuarios (
  id,
  email,
  nome,
  senha_hash,
  role,
  criado_em,
  atualizado_em
) VALUES (
  'uuid-aleatorio',
  'admin@email.com',
  'Nome Admin',
  'hash-da-senha', -- usar bcrypt
  'admin',
  NOW(),
  NOW()
);
```

### Opção 2: Via Endpoint de Cadastro Admin

O backend deve criar um endpoint especial (protegido):

```
POST /admin/usuarios
Authorization: Bearer <token-admin>
Content-Type: application/json

{
  "email": "novo.admin@email.com",
  "nome": "Novo Admin",
  "senha": "senha-segura-123",
  "role": "admin"
}

Response: 200 OK
{
  "id": "uuid",
  "email": "novo.admin@email.com",
  "nome": "Novo Admin",
  "role": "admin"
}
```

### Opção 3: Via Login Admin Especial

Se quiser um endpoint para o primeiro admin:

```
POST /auth/admin/login
Content-Type: application/json

{
  "email": "admin@localhost",
  "senha": "admin123",
  "secreta": "chave-secreta-do-backend"
}

Response: 200 OK
{
  "token": "jwt-token",
  "role": "admin",
  "userId": "uuid"
}
```

---

## 🔌 3. O Que o Backend Precisa Fazer

### ✅ Implementações Obrigatórias:

#### 1. **Modelo de Dados - Usuários**
```typescript
interface Usuario {
  id: string;              // UUID
  email: string;           // Único
  nome: string;
  senhaHash: string;       // Nunca armazenar senha em texto
  role: 'user' | 'admin'; // Novo campo!
  criadoEm: Date;
  atualizadoEm: Date;
}
```

#### 2. **Autenticação com Role**

No login, retornar:
```typescript
{
  token: string;      // JWT com payload contendo role
  role: 'user' | 'admin';
  userId: string;
}
```

O JWT deve conter:
```typescript
{
  payload: {
    userId: "uuid",
    email: "user@example.com",
    role: "admin",  // ← IMPORTANTE!
    exp: 1234567890
  }
}
```

#### 3. **Middleware de Autenticação**

Verificar em TODAS as rotas `/admin/*`:
```typescript
// Pseudocódigo
middleware.protegidoAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ erro: 'Token inválido' });
  }
  
  const decoded = jwt.verify(token, SECRET);
  
  if (decoded.role !== 'admin') {
    return res.status(403).json({ erro: 'Acesso negado' });
  }
  
  next();
};
```

---

## 📋 4. Endpoints Necessários

### Authentication

```
POST /auth/login
Body: { email, senha }
Response: { token, role, userId }
```

### Admin Dashboard

```
GET /admin/dashboard/stats
Headers: Authorization: Bearer <token>
Response: DashboardStats
```

### Admin Users (para criar novos admins)

```
POST /admin/usuarios
Headers: Authorization: Bearer <token>
Body: { email, nome, senha, role }
Response: { id, email, nome, role }

GET /admin/usuarios
Headers: Authorization: Bearer <token>
Response: Usuario[]

DELETE /admin/usuarios/:id
Headers: Authorization: Bearer <token>
Response: { success: true }
```

### Produtos (já listados antes)

```
GET /produtos
POST /admin/produtos
PUT /admin/produtos/:id
DELETE /admin/produtos/:id
```

### Interações (já listados antes)

```
GET /admin/interacoes?status=:status
PATCH /admin/interacoes/:id/responder
POST /admin/interacoes/:id/enviar-email
PATCH /admin/interacoes/:id/confirmar
DELETE /admin/interacoes/:id
```

---

## 🛠️ 5. Passo a Passo: Criar Primeiro Admin

### No Backend (desenvolvimento):

**Opção A: Seed no banco**
```sql
-- File: src/database/seeds/admin.seed.sql
INSERT INTO usuarios (id, email, nome, senha_hash, role, criado_em, atualizado_em)
VALUES (
  'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  'admin@test.com',
  'Admin Principal',
  '$2b$10$...hash-bcrypt...',  -- Usar bcrypt para hashear
  'admin',
  NOW(),
  NOW()
);
```

**Opção B: Endpoint de seed**
```typescript
// Endpoint do backend (protegido)
POST /init/create-admin
Body: { email, nome, senha, chave_secreta }

// Validar chave_secreta antes de permitir
if (req.body.chave_secreta !== process.env.ADMIN_SECRET_KEY) {
  return res.status(401).json({ erro: 'Chave inválida' });
}

// Criar admin...
```

### No Frontend (depois):

1. **Acesse o login**
   ```
   http://localhost:5173/login
   ```

2. **Faça login com as credenciais do admin**
   ```
   Email: admin@test.com
   Senha: (a senha que foi definida)
   ```

3. **Serão armazenados no localStorage**
   ```javascript
   localStorage.getItem('token')     // JWT
   localStorage.getItem('role')      // 'admin'
   localStorage.getItem('userId')    // UUID
   ```

4. **Acesse o dashboard**
   ```
   http://localhost:5173/admin
   ```

---

## 🐛 6. Troubleshooting

### Problema: "Acesso negado" ao entrar em `/admin`

**Causa**: Role não é 'admin'

**Solução**:
1. Verificar no banco se `role = 'admin'`
2. Verificar se o JWT contém `role: 'admin'`
3. Fazer logout e login novamente
4. Verificar localStorage: `console.log(localStorage.getItem('role'))`

---

### Problema: Token vencido

**Resposta do servidor**: 401 Unauthorized

**Solução**:
1. Fazer logout (`/logout`)
2. Fazer login novamente
3. Frontend limpa localStorage automaticamente

---

### Problema: "Produto não encontrado" ao deletar

**Causa**: ID inválido ou produto já deletado

**Solução**:
1. Recarregar página
2. Tentar novamente
3. Verificar console para erro exato

---

### Problema: Imagens não aparecem nos produtos

**Causa**: URL inválida ou servidor de imagens não responde

**Solução**:
1. Usar URLs válidas (HTTPS se possível)
2. Verificar CORS do servidor de imagens
3. Usar placeholder se URL falhar

---

## 📞 Suporte

Se tiver dúvidas:

1. **Verificar console** (F12 → Console)
2. **Verificar network** (F12 → Network)
3. **Verificar localStorage**
   ```javascript
   console.log(localStorage)
   ```

---

## ✅ Checklist Final

- [ ] Backend retorna `role` no login
- [ ] JWT contém `role` no payload
- [ ] Middleware `/admin/*` valida role
- [ ] Todos os endpoints têm autenticação
- [ ] Frontend guarda token, role e userId
- [ ] ProtectedRoute valida corretamente
- [ ] Dashboard carrega estatísticas
- [ ] Gráficos aparecem com dados corretos
- [ ] CRUD de produtos funciona
- [ ] Filtro de interações funciona

---

**Pronto! Você tem tudo o que precisa para usar o admin! 🎉**
