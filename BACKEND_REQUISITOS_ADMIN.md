# 🔧 Requisitos de Implementação - Admin Area Backend

**Data**: 13 de maio de 2026  
**Status**: 🟡 Aguardando Implementação Backend  
**Frontend**: ✅ 100% Pronto (React + Tailwind CSS + Victory Charts)

---

## 📋 Resumo Executivo

A área de admin foi 100% implementada no frontend com:
- ✅ Dashboard com 6 métricas e 2 gráficos interativos (Victory)
- ✅ CRUD de Produtos
- ✅ Gerenciamento de Interações (Propostas) com resposta
- ✅ Sistema de rotas protegidas (apenas admin)
- ✅ Autenticação com Bearer Token

**Agora precisamos dos endpoints backend para ativar tudo isso!**

---

## 🔐 Autenticação e Autorização

### Requisitos Gerais
- Todos os endpoints `/admin/*` **PRECISAM** de autenticação Bearer Token
- O token deve estar no header: `Authorization: Bearer <token>`
- Apenas usuários com `role: "admin"` têm acesso aos endpoints admin
- Retornar `401 Unauthorized` se token inválido/ausente
- Retornar `403 Forbidden` se usuário não for admin

### Validação no Backend
```
- Token válido? ✓
- Usuário existe? ✓
- Usuário é admin? ✓ → Proceeder
- Falhar em qualquer uma? ✗ → Retornar erro apropriado
```

---

## 📊 1. DASHBOARD - GET /admin/dashboard/stats

### Descrição
Retorna estatísticas resumidas do sistema para o dashboard.

### Método & URL
```
GET /admin/dashboard/stats
Authorization: Bearer <token>
```

### Response (200 OK)
```json
{
  "totalProdutos": 42,
  "totalInteracoes": 156,
  "interacoesRespondidas": 134,
  "interacoesPendentes": 22,
  "totalUsuarios": 89,
  "taxaRespostaPorcentagem": 85.9
}
```

### Regras de Cálculo
- **totalProdutos**: Count de produtos ativos no banco
- **totalInteracoes**: Count de todas as propostas/interações
- **interacoesRespondidas**: Count de propostas com `status = "respondida"`
- **interacoesPendentes**: Count de propostas com `status = "pendente"`
- **totalUsuarios**: Count de usuários cadastrados (excluir admins de sistema)
- **taxaRespostaPorcentagem**: (interacoesRespondidas / totalInteracoes) * 100

### Errors
- `401`: Token inválido
- `403`: Usuário não é admin
- `500`: Erro ao buscar estatísticas

---

## 📦 2. PRODUTOS - CRUD

### 2.1 Listar Todos os Produtos - GET /produtos

**Nota**: Este endpoint é **PÚBLICO** (sem auth)

#### Método & URL
```
GET /produtos
```

#### Query Parameters (opcionais)
```
?page=1&limit=10
```

#### Response (200 OK)
```json
[
  {
    "id": "uuid-aqui",
    "nome": "Camiseta Branca",
    "preco": 49.90,
    "tamanho": "P",
    "descricao": "Camiseta de algodão 100%",
    "imagemUrl": "https://example.com/img.jpg",
    "avaliacao": 4.5,
    "criadoEm": "2026-05-10T10:30:00Z"
  }
]
```

---

### 2.2 Criar Produto - POST /admin/produtos

#### Método & URL
```
POST /admin/produtos
Authorization: Bearer <token>
Content-Type: application/json
```

#### Request Body
```json
{
  "nome": "Camiseta Azul",
  "preco": 59.90,
  "tamanho": "M",
  "descricao": "Camiseta de algodão premium",
  "imagemUrl": "https://example.com/camiseta-azul.jpg"
}
```

#### Validações
- `nome` (obrigatório, string, 3-100 caracteres)
- `preco` (obrigatório, number, > 0)
- `tamanho` (opcional, string, até 50 caracteres)
- `descricao` (opcional, string, até 1000 caracteres)
- `imagemUrl` (opcional, string URL válida)

#### Response (201 Created)
```json
{
  "id": "uuid-gerado",
  "nome": "Camiseta Azul",
  "preco": 59.90,
  "tamanho": "M",
  "descricao": "Camiseta de algodão premium",
  "imagemUrl": "https://example.com/camiseta-azul.jpg",
  "criadoEm": "2026-05-13T14:22:00Z"
}
```

#### Errors
- `400`: Dados inválidos/faltando campos obrigatórios
- `401`: Token inválido
- `403`: Usuário não é admin
- `409`: Produto com mesmo nome já existe (opcional)

---

### 2.3 Atualizar Produto - PUT /admin/produtos/:id

#### Método & URL
```
PUT /admin/produtos/:id
Authorization: Bearer <token>
Content-Type: application/json
```

#### URL Parameters
```
:id = UUID do produto (ex: 550e8400-e29b-41d4-a716-446655440000)
```

#### Request Body (mesmos campos de criação)
```json
{
  "nome": "Camiseta Azul Escuro",
  "preco": 64.90,
  "tamanho": "G",
  "descricao": "Camiseta de algodão premium - edição dark",
  "imagemUrl": "https://example.com/camiseta-azul-escuro.jpg"
}
```

#### Response (200 OK)
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "nome": "Camiseta Azul Escuro",
  "preco": 64.90,
  "tamanho": "G",
  "descricao": "Camiseta de algodão premium - edição dark",
  "imagemUrl": "https://example.com/camiseta-azul-escuro.jpg",
  "atualizadoEm": "2026-05-13T14:30:00Z"
}
```

#### Errors
- `400`: Dados inválidos
- `401`: Token inválido
- `403`: Usuário não é admin
- `404`: Produto não encontrado
- `500`: Erro ao atualizar

---

### 2.4 Deletar Produto - DELETE /admin/produtos/:id

#### Método & URL
```
DELETE /admin/produtos/:id
Authorization: Bearer <token>
```

#### URL Parameters
```
:id = UUID do produto
```

#### Response (204 No Content)
```
[Sem body]
```

#### Alternativa: Response (200 OK)
```json
{
  "message": "Produto deletado com sucesso",
  "id": "550e8400-e29b-41d4-a716-446655440000"
}
```

#### Errors
- `401`: Token inválido
- `403`: Usuário não é admin
- `404`: Produto não encontrado
- `409`: Produto possui interações vinculadas (decidir estratégia: soft delete ou error)

---

## 💬 3. INTERAÇÕES (PROPOSTAS) - GERENCIAMENTO

### 3.1 Listar Interações - GET /admin/interacoes

#### Método & URL
```
GET /admin/interacoes
Authorization: Bearer <token>
```

#### Query Parameters
```
?status=pendente    (filtrar por status: pendente, respondida, confirmada, excluida)
?page=1
?limit=20
```

#### Response (200 OK)
```json
{
  "interacoes": [
    {
      "id": "uuid-interacao",
      "produtoId": "uuid-produto",
      "produtoNome": "Camiseta Branca",
      "usuarioId": "uuid-usuario",
      "usuarioNome": "João Silva",
      "usuarioEmail": "joao@email.com",
      "mensagem": "Vocês têm essa camiseta em tamanho GG?",
      "status": "pendente",
      "resposta": null,
      "dataResponsta": null,
      "criadoEm": "2026-05-12T09:15:00Z",
      "atualizadoEm": "2026-05-12T09:15:00Z"
    },
    {
      "id": "uuid-interacao-2",
      "produtoId": "uuid-produto-2",
      "produtoNome": "Calça Jeans",
      "usuarioId": "uuid-usuario-2",
      "usuarioNome": "Maria Santos",
      "usuarioEmail": "maria@email.com",
      "mensagem": "Qual é o material dessa calça?",
      "status": "respondida",
      "resposta": "É 100% algodão, muito confortável!",
      "dataResponsta": "2026-05-13T10:30:00Z",
      "criadoEm": "2026-05-12T14:20:00Z",
      "atualizadoEm": "2026-05-13T10:30:00Z"
    }
  ],
  "total": 156,
  "pagina": 1,
  "porPagina": 20
}
```

#### Regras
- Sem filtro `status` → retornar todas (exceto excluídas)
- Com `status=excluida` → retornar apenas excluídas
- Ordenar por `criadoEm DESC` (mais recentes primeiro)

#### Errors
- `401`: Token inválido
- `403`: Usuário não é admin

---

### 3.2 Responder Interação - PATCH /admin/interacoes/:id/responder

#### Método & URL
```
PATCH /admin/interacoes/:id/responder
Authorization: Bearer <token>
Content-Type: application/json
```

#### URL Parameters
```
:id = UUID da interação
```

#### Request Body
```json
{
  "resposta": "Sim, temos em estoque! Frete grátis para essa região."
}
```

#### Validações
- `resposta` (obrigatório, string não vazia, 1-2000 caracteres)

#### Response (200 OK)
```json
{
  "id": "uuid-interacao",
  "status": "respondida",
  "resposta": "Sim, temos em estoque! Frete grátis para essa região.",
  "dataResponsta": "2026-05-13T15:45:00Z",
  "atualizadoEm": "2026-05-13T15:45:00Z"
}
```

#### Errors
- `400`: Resposta vazia ou inválida
- `401`: Token inválido
- `403`: Usuário não é admin
- `404`: Interação não encontrada
- `409`: Interação já foi respondida/deletada

---

### 3.3 Confirmar Interação - PATCH /admin/interacoes/:id/confirmar

#### Método & URL
```
PATCH /admin/interacoes/:id/confirmar
Authorization: Bearer <token>
```

#### URL Parameters
```
:id = UUID da interação
```

#### Request Body
```
[Sem body]
```

#### Response (200 OK)
```json
{
  "id": "uuid-interacao",
  "status": "confirmada",
  "atualizadoEm": "2026-05-13T16:00:00Z"
}
```

#### Regras
- Mudar status de `respondida` → `confirmada`
- Apenas interações com `status = "respondida"` podem ser confirmadas

#### Errors
- `401`: Token inválido
- `403`: Usuário não é admin
- `404`: Interação não encontrada
- `409`: Interação não está com status "respondida"

---

### 3.4 Enviar Email - POST /admin/interacoes/:id/enviar-email

#### Método & URL
```
POST /admin/interacoes/:id/enviar-email
Authorization: Bearer <token>
Content-Type: application/json
```

#### URL Parameters
```
:id = UUID da interação
```

#### Request Body
```json
{
  "email": "joao@email.com"
}
```

#### Validações
- `email` (obrigatório, deve ser email válido)

#### Response (200 OK)
```json
{
  "message": "Email enviado com sucesso",
  "id": "uuid-interacao",
  "emailEnviadoEm": "2026-05-13T16:10:00Z"
}
```

#### Comportamento
- Enviar email para o cliente com:
  - Assunto: "Resposta sobre sua interação - [NOME_DA_LOJA]"
  - Corpo com a resposta que o admin enviou
  - Link para visualizar a resposta no site
  - CTA para confirmar/fazer pedido

#### Errors
- `400`: Email inválido
- `401`: Token inválido
- `403`: Usuário não é admin
- `404`: Interação não encontrada
- `500`: Erro ao enviar email

---

### 3.5 Deletar/Marcar Interação como Excluída - DELETE /admin/interacoes/:id

#### Método & URL
```
DELETE /admin/interacoes/:id
Authorization: Bearer <token>
```

#### URL Parameters
```
:id = UUID da interação
```

#### Comportamento (IMPORTANTE)
- **Soft Delete**: Mudar `status` para `"excluida"` (não deletar do banco)
- Manter histórico completo
- Não listar por padrão em listagens (exceto com filtro)

#### Response (200 OK)
```json
{
  "message": "Interação marcada como excluída",
  "id": "uuid-interacao",
  "status": "excluida",
  "atualizadoEm": "2026-05-13T16:15:00Z"
}
```

#### Errors
- `401`: Token inválido
- `403`: Usuário não é admin
- `404`: Interação não encontrada

---

## 📝 Estrutura de Dados no Banco

### Tabela: `produtos`
```sql
CREATE TABLE produtos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(100) NOT NULL UNIQUE,
  preco DECIMAL(10, 2) NOT NULL,
  tamanho VARCHAR(50),
  descricao TEXT,
  imagemUrl VARCHAR(2048),
  avaliacao DECIMAL(3, 1),
  criadoEm TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizadoEm TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Tabela: `interacoes` (ou `propostas`)
```sql
CREATE TABLE interacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  produtoId UUID NOT NULL,
  usuarioId UUID NOT NULL,
  mensagem TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pendente' 
    -- CHECK (status IN ('pendente', 'respondida', 'confirmada', 'excluida')),
  resposta TEXT,
  dataResponsta TIMESTAMP,
  criadoEm TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizadoEm TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (produtoId) REFERENCES produtos(id),
  FOREIGN KEY (usuarioId) REFERENCES usuarios(id)
);
```

### Tabela: `usuarios`
```sql
-- Assumindo que já existe com campos:
-- id UUID PRIMARY KEY
-- nome VARCHAR(100)
-- email VARCHAR(100) UNIQUE
-- role VARCHAR(20) -- 'admin' ou 'user'
-- ... outros campos
```

---

## 🧪 Checklist de Implementação

- [ ] Endpoint GET /admin/dashboard/stats implementado
- [ ] Endpoint GET /produtos implementado (público)
- [ ] Endpoint POST /admin/produtos implementado
- [ ] Endpoint PUT /admin/produtos/:id implementado
- [ ] Endpoint DELETE /admin/produtos/:id implementado
- [ ] Endpoint GET /admin/interacoes implementado
- [ ] Endpoint PATCH /admin/interacoes/:id/responder implementado
- [ ] Endpoint PATCH /admin/interacoes/:id/confirmar implementado
- [ ] Endpoint POST /admin/interacoes/:id/enviar-email implementado
- [ ] Endpoint DELETE /admin/interacoes/:id implementado
- [ ] Autenticação Bearer Token verificada em todos os /admin/*
- [ ] Autorização de role "admin" verificada em todos os /admin/*
- [ ] Validações de entrada em todos os endpoints
- [ ] Tratamento de erros (400, 401, 403, 404, 500)
- [ ] Sistema de email configurado e testado
- [ ] Testes unitários dos endpoints
- [ ] Testes de integração com frontend
- [ ] Documentação em Swagger/OpenAPI (opcional)

---

## 🚀 Próximos Passos

1. **Backend Developer**: Implementar todos os endpoints conforme especificado
2. **QA**: Testar todos os endpoints com Postman/Insomnia
3. **DevOps**: Configurar variáveis de ambiente (API_URL, EMAIL_SERVICE, etc)
4. **Full Stack**: Testes E2E frontend + backend
5. **Deploy**: Colocar em produção

---

## 📞 Dúvidas/Clarificações

Caso tenha dúvidas sobre:
- Formato de resposta
- Regras de negócio
- Validações específicas
- Comportamento de erros
- Estrutura de dados

**Entre em contato antes de começar a implementação!**

---

**Gerado em**: 13 de maio de 2026  
**Status Frontend**: ✅ 100% Pronto e Testado
