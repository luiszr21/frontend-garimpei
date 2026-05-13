# Backend API - Tipos e Estruturas de Resposta

Este arquivo documenta os tipos esperados nas respostas da API para o sistema de admin.

## DashboardStats

```typescript
interface DashboardStats {
  totalProdutos: number;           // Total de produtos no sistema
  totalInteracoes: number;         // Total de interações/propostas
  interacoesRespondidas: number;   // Quantas foram respondidas
  interacoesPendentes: number;     // Quantas estão pendentes
  totalUsuarios: number;           // Quantidade de usuários registrados
  taxaRespostaPorcentagem: number; // Percentual de resposta (0-100)
}
```

## ListarInteracoesResponse

```typescript
interface ListarInteracoesResponse {
  interacoes: InteracaoAdmin[];  // Array de interações
  total: number;                 // Total de registros
  pagina: number;                // Página atual
  porPagina: number;             // Registros por página
}

interface InteracaoAdmin {
  id: string;                    // ID da interação
  produtoId: string;             // ID do produto
  produtoNome: string;           // Nome do produto
  usuarioId: string;             // ID do usuário
  usuarioNome: string;           // Nome do usuário
  usuarioEmail: string;          // Email do usuário
  mensagem: string;              // Mensagem do cliente
  status: "pendente" | "respondida" | "confirmada" | "excluida";
  resposta?: string | null;      // Resposta do admin
  dataResposta?: string | null;  // Data ISO da resposta
  criadoEm: string;              // Data ISO de criação
  atualizadoEm: string;          // Data ISO da última atualização
}
```

## Produto

```typescript
interface Produto {
  id: string;
  nome: string;
  tamanho?: string | null;
  descricao: string | null;
  preco: number;
  imagemUrl: string | null;
  avaliacao?: number | null;
  criadoEm?: string | null;
}
```

## Endpoints Esperados

### GET /admin/dashboard/stats
Retorna estatísticas do dashboard.

**Response**: `DashboardStats`

---

### GET /produtos
Retorna lista de todos os produtos.

**Query Params**:
- `page`: número da página (opcional)
- `limit`: itens por página (opcional)

**Response**: `Produto[]`

---

### POST /admin/produtos
Criar novo produto.

**Body**:
```typescript
{
  nome: string;           // Obrigatório
  preco: number;          // Obrigatório
  descricao?: string;
  tamanho?: string;
  imagemUrl?: string;
}
```

**Response**: `Produto`

---

### PUT /admin/produtos/:id
Atualizar produto existente.

**Body**: Mesmo do POST

**Response**: `Produto`

---

### DELETE /admin/produtos/:id
Deletar produto.

**Response**: `{ success: true }`

---

### GET /admin/interacoes?status=:status
Listar interações com filtro de status.

**Query Params**:
- `status`: "pendente" | "respondida" | "confirmada" | "excluida" | "" (todas)
- `page`: página (opcional)
- `limit`: itens por página (opcional)

**Response**: `ListarInteracoesResponse`

---

### PATCH /admin/interacoes/:id/responder
Responder uma interação.

**Body**:
```typescript
{
  resposta: string;  // Obrigatório
}
```

**Response**:
```typescript
{
  success: true;
  interacao: InteracaoAdmin;
}
```

---

### POST /admin/interacoes/:id/enviar-email
Enviar email para o cliente.

**Body**:
```typescript
{
  email: string;  // Email do cliente
}
```

**Response**:
```typescript
{
  success: true;
  mensagem: string;
}
```

---

### PATCH /admin/interacoes/:id/confirmar
Confirmar uma interação.

**Response**:
```typescript
{
  success: true;
  interacao: InteracaoAdmin;
}
```

---

### DELETE /admin/interacoes/:id
Excluir uma interação.

**Response**:
```typescript
{
  success: true;
}
```

---

## Status HTTP Esperados

- `200` - OK
- `201` - Created (para POST)
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden (sem role admin)
- `404` - Not Found
- `500` - Internal Server Error

---

## Autenticação

Todos os endpoints `/admin/*` esperam o header:
```
Authorization: Bearer <token>
```

O token deve conter a informação de que o usuário é admin.
