# 🔧 Guia Completo: O Que o Backend Deve Implementar

## 📋 Índice

1. [Estrutura de Dados](#estrutura-de-dados)
2. [Autenticação e Roles](#autenticação-e-roles)
3. [Endpoints Necessários](#endpoints-necessários)
4. [Implementações de Exemplo](#implementações-de-exemplo)
5. [Validações e Segurança](#validações-e-segurança)

---

## 🗄️ Estrutura de Dados

### 1. Tabela `usuarios` (Atualizar)

**Campos necessários:**
```sql
CREATE TABLE usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  nome VARCHAR(255) NOT NULL,
  senha_hash VARCHAR(255) NOT NULL,
  
  -- ✅ NOVO CAMPO
  role VARCHAR(50) NOT NULL DEFAULT 'user',
  -- Valores: 'user' ou 'admin'
  
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2. Tabela `produtos` (Validar)

```sql
CREATE TABLE produtos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(255) NOT NULL,
  preco DECIMAL(10, 2) NOT NULL,
  tamanho VARCHAR(100),
  descricao TEXT,
  imagem_url VARCHAR(500),
  avaliacao DECIMAL(3, 2),
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3. Tabela `propostas` (Renomear para interacoes)

```sql
-- Pode renomear a tabela ou criar uma nova
CREATE TABLE interacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  produto_id UUID NOT NULL REFERENCES produtos(id),
  usuario_id UUID NOT NULL REFERENCES usuarios(id),
  
  mensagem TEXT NOT NULL,
  resposta TEXT,
  
  status VARCHAR(50) NOT NULL DEFAULT 'pendente',
  -- Valores: 'pendente', 'respondida', 'confirmada', 'excluida'
  
  data_resposta TIMESTAMP,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🔐 Autenticação e Roles

### 1. JWT Payload (Importante!)

Ao fazer login, gerar JWT com role:

```typescript
// JWT Payload
{
  "userId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "email": "admin@email.com",
  "role": "admin",  // ← ADICIONAR ISSO!
  "iat": 1234567890,
  "exp": 1234571490
}
```

### 2. Middleware de Autenticação

```typescript
// authenticateToken.ts
import jwt from 'jsonwebtoken';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ erro: 'Token não fornecido' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ erro: 'Token inválido' });
    }
    req.user = decoded; // Agora contém: userId, email, role
    next();
  });
};
```

### 3. Middleware de Admin (NOVO)

```typescript
// authorizeAdmin.ts
export const authorizeAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ erro: 'Acesso negado. Requer role admin.' });
  }
  next();
};
```

**Uso:**
```typescript
app.get('/admin/dashboard/stats', authenticateToken, authorizeAdmin, controller);
```

---

## 📡 Endpoints Necessários

### AUTH: Login

```
POST /auth/login
```

**Body:**
```json
{
  "email": "admin@email.com",
  "senha": "123456"
}
```

**Response: 200 OK**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "role": "admin",
  "userId": "f47ac10b-58cc-4372-a567-0e02b2c3d479"
}
```

**Response: 401 Unauthorized**
```json
{
  "erro": "Email ou senha inválidos"
}
```

---

### DASHBOARD: Estatísticas

```
GET /admin/dashboard/stats
Authorization: Bearer <token>
```

**Response: 200 OK**
```json
{
  "totalProdutos": 15,
  "totalInteracoes": 42,
  "interacoesRespondidas": 28,
  "interacoesPendentes": 14,
  "totalUsuarios": 150,
  "taxaRespostaPorcentagem": 66.67
}
```

**Cálculos:**
- `totalProdutos`: COUNT(*) FROM produtos
- `totalInteracoes`: COUNT(*) FROM interacoes
- `interacoesRespondidas`: COUNT(*) FROM interacoes WHERE status IN ('respondida', 'confirmada')
- `interacoesPendentes`: COUNT(*) FROM interacoes WHERE status = 'pendente'
- `totalUsuarios`: COUNT(*) FROM usuarios WHERE role = 'user'
- `taxaRespostaPorcentagem`: (interacoesRespondidas / totalInteracoes) * 100

---

### PRODUTOS: CRUD

#### 1. Listar Produtos

```
GET /produtos
```

**Query Params:**
- `page`: número da página (padrão: 1)
- `limit`: itens por página (padrão: 20)

**Response: 200 OK**
```json
[
  {
    "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "nome": "Camiseta Azul",
    "preco": 49.90,
    "tamanho": "M",
    "descricao": "Camiseta de algodão 100%",
    "imagemUrl": "https://example.com/camiseta.jpg",
    "avaliacao": 4.5,
    "criadoEm": "2024-05-10T15:30:00Z"
  }
]
```

#### 2. Criar Produto

```
POST /admin/produtos
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "nome": "Camiseta Vermelha",
  "preco": 59.90,
  "tamanho": "G",
  "descricao": "Camiseta premium",
  "imagemUrl": "https://example.com/img.jpg"
}
```

**Response: 201 Created**
```json
{
  "id": "novo-uuid",
  "nome": "Camiseta Vermelha",
  "preco": 59.90,
  "tamanho": "G",
  "descricao": "Camiseta premium",
  "imagemUrl": "https://example.com/img.jpg",
  "criadoEm": "2024-05-13T10:00:00Z"
}
```

#### 3. Atualizar Produto

```
PUT /admin/produtos/:id
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:** (mesmo do POST)

**Response: 200 OK** (mesmo do POST)

#### 4. Deletar Produto

```
DELETE /admin/produtos/:id
Authorization: Bearer <token>
```

**Response: 200 OK**
```json
{
  "success": true,
  "mensagem": "Produto deletado com sucesso"
}
```

---

### INTERAÇÕES: Gerenciamento

#### 1. Listar Interações

```
GET /admin/interacoes?status=:status
Authorization: Bearer <token>
```

**Query Params:**
- `status`: "pendente", "respondida", "confirmada", "excluida", ou vazio para todas
- `page`: número (padrão: 1)
- `limit`: itens (padrão: 20)

**Response: 200 OK**
```json
{
  "interacoes": [
    {
      "id": "uuid",
      "produtoId": "uuid",
      "produtoNome": "Camiseta Azul",
      "usuarioId": "uuid",
      "usuarioNome": "João Silva",
      "usuarioEmail": "joao@email.com",
      "mensagem": "Quanto sai no atacado?",
      "status": "pendente",
      "resposta": null,
      "dataResposta": null,
      "criadoEm": "2024-05-12T14:30:00Z",
      "atualizadoEm": "2024-05-12T14:30:00Z"
    }
  ],
  "total": 42,
  "pagina": 1,
  "porPagina": 20
}
```

#### 2. Responder Interação

```
PATCH /admin/interacoes/:id/responder
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "resposta": "Ótimo preço para atacado! Entre em contato."
}
```

**Response: 200 OK**
```json
{
  "success": true,
  "interacao": {
    "id": "uuid",
    "status": "respondida",
    "resposta": "Ótimo preço para atacado! Entre em contato.",
    "dataResposta": "2024-05-13T10:15:00Z"
  }
}
```

**Ação:**
- Atualizar `status` para 'respondida'
- Adicionar `resposta`
- Adicionar `data_resposta` = NOW()

#### 3. Enviar Email

```
POST /admin/interacoes/:id/enviar-email
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "email": "joao@email.com"
}
```

**Response: 200 OK**
```json
{
  "success": true,
  "mensagem": "Email enviado com sucesso para joao@email.com"
}
```

**Ação:**
- Enviar email com a resposta do admin
- Usar template HTML bonito
- Incluir link para voltar ao site

**Email Template Sugerido:**
```html
<h2>Resposta sobre seu produto</h2>
<p>Olá [NOME_CLIENTE],</p>
<p>Sua pergunta sobre <strong>[NOME_PRODUTO]</strong> foi respondida:</p>
<blockquote>
  [RESPOSTA_ADMIN]
</blockquote>
<p>Obrigado por seu interesse!</p>
<p><a href="[LINK_SITE]">Voltar ao site</a></p>
```

#### 4. Confirmar Interação

```
PATCH /admin/interacoes/:id/confirmar
Authorization: Bearer <token>
```

**Response: 200 OK**
```json
{
  "success": true,
  "interacao": {
    "id": "uuid",
    "status": "confirmada"
  }
}
```

**Ação:**
- Atualizar `status` para 'confirmada'
- Significa que o cliente confirmou a compra/proposta

#### 5. Excluir Interação

```
DELETE /admin/interacoes/:id
Authorization: Bearer <token>
```

**Response: 200 OK**
```json
{
  "success": true,
  "mensagem": "Interação deletada com sucesso"
}
```

**Ação:**
- Pode deletar do banco ou apenas marcar como 'excluida'
- Recomenda-se marcar como 'excluida' para manter histórico

---

## 💻 Implementações de Exemplo

### Node.js + Express

```typescript
// routes/admin.routes.ts
import express from 'express';
import { authenticateToken, authorizeAdmin } from '../middleware';

const router = express.Router();

// Dashboard
router.get('/dashboard/stats', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const stats = {
      totalProdutos: await produto.count(),
      totalInteracoes: await interacao.count(),
      interacoesRespondidas: await interacao.count({ 
        where: { status: ['respondida', 'confirmada'] } 
      }),
      interacoesPendentes: await interacao.count({ 
        where: { status: 'pendente' } 
      }),
      totalUsuarios: await usuario.count({ where: { role: 'user' } }),
      taxaRespostaPorcentagem: calculaTaxa()
    };
    res.json(stats);
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

// Produtos
router.get('/produtos', authenticateToken, authorizeAdmin, async (req, res) => {
  // Listar produtos...
});

router.post('/produtos', authenticateToken, authorizeAdmin, async (req, res) => {
  // Criar produto...
});

router.put('/produtos/:id', authenticateToken, authorizeAdmin, async (req, res) => {
  // Atualizar produto...
});

router.delete('/produtos/:id', authenticateToken, authorizeAdmin, async (req, res) => {
  // Deletar produto...
});

// Interações
router.get('/interacoes', authenticateToken, authorizeAdmin, async (req, res) => {
  // Listar interações...
});

router.patch('/interacoes/:id/responder', authenticateToken, authorizeAdmin, async (req, res) => {
  // Responder interação...
});

router.post('/interacoes/:id/enviar-email', authenticateToken, authorizeAdmin, async (req, res) => {
  // Enviar email...
});

router.patch('/interacoes/:id/confirmar', authenticateToken, authorizeAdmin, async (req, res) => {
  // Confirmar interação...
});

router.delete('/interacoes/:id', authenticateToken, authorizeAdmin, async (req, res) => {
  // Deletar interação...
});

export default router;
```

---

## 🔒 Validações e Segurança

### 1. Validações Obrigatórias

```typescript
// Produtos
✓ nome: não vazio, máx 255 caracteres
✓ preco: número positivo, máx 2 casas decimais
✓ tamanho: máx 100 caracteres (opcional)
✓ descricao: máx 5000 caracteres (opcional)
✓ imagemUrl: URL válida (opcional)

// Interações
✓ resposta: não vazio, máx 5000 caracteres
✓ email: email válido
✓ status: apenas valores permitidos
```

### 2. Autorização

- ✅ Apenas admins podem acessar `/admin/*`
- ✅ Verificar token em cada request
- ✅ Verificar role no JWT

### 3. Rate Limiting

Sugerido para evitar spam:
```typescript
// Limitar requisições por IP
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100 // 100 requisições por 15 minutos
}));
```

### 4. CORS (Se necessário)

```typescript
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
```

---

## ✅ Checklist de Implementação

- [ ] Adicionar campo `role` na tabela usuarios
- [ ] Adicionar role no JWT ao fazer login
- [ ] Criar middleware `authorizeAdmin`
- [ ] Implementar endpoint GET `/admin/dashboard/stats`
- [ ] Implementar CRUD de produtos (/admin/produtos)
- [ ] Implementar endpoints de interações
- [ ] Implementar envio de email
- [ ] Adicionar validações em todos os endpoints
- [ ] Adicionar tratamento de erros
- [ ] Testar todos os endpoints com Postman/Insomnia
- [ ] Adicionar logs de ações admin
- [ ] Adicionar rate limiting

---

**Pronto! Com isso seu backend estará 100% preparado! 🚀**
