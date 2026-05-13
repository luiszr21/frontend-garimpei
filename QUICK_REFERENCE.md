# 📊 QUICK REFERENCE - ENDPOINTS ADMIN

## 🚀 Todos os 10 Endpoints em Uma Página

| # | Método | URL | Auth | Descrição |
|---|--------|-----|------|-----------|
| 1 | GET | `/admin/dashboard/stats` | ✅ | Estatísticas do dashboard |
| 2 | GET | `/produtos` | ❌ | Listar todos produtos (público) |
| 3 | POST | `/admin/produtos` | ✅ | Criar novo produto |
| 4 | PUT | `/admin/produtos/:id` | ✅ | Atualizar produto |
| 5 | DELETE | `/admin/produtos/:id` | ✅ | Deletar produto |
| 6 | GET | `/admin/interacoes` | ✅ | Listar interações |
| 7 | PATCH | `/admin/interacoes/:id/responder` | ✅ | Responder interação |
| 8 | PATCH | `/admin/interacoes/:id/confirmar` | ✅ | Confirmar interação |
| 9 | POST | `/admin/interacoes/:id/enviar-email` | ✅ | Enviar email ao cliente |
| 10 | DELETE | `/admin/interacoes/:id` | ✅ | Deletar/Marcar interação como excluída |

✅ = Requer Bearer Token + role "admin"  
❌ = Público (sem autenticação)

---

## 📦 Request/Response Rápido

### 1️⃣ GET /admin/dashboard/stats
```
REQUEST: { Authorization: Bearer <token> }
RESPONSE: {
  totalProdutos, totalInteracoes, interacoesRespondidas,
  interacoesPendentes, totalUsuarios, taxaRespostaPorcentagem
}
```

### 2️⃣ GET /produtos
```
REQUEST: (sem headers)
RESPONSE: [{ id, nome, preco, tamanho, descricao, imagemUrl, avaliacao, criadoEm }, ...]
```

### 3️⃣ POST /admin/produtos
```
REQUEST: { nome, preco, tamanho?, descricao?, imagemUrl? }
RESPONSE: { id, nome, preco, tamanho, descricao, imagemUrl, criadoEm }
```

### 4️⃣ PUT /admin/produtos/:id
```
REQUEST: { nome, preco, tamanho?, descricao?, imagemUrl? }
RESPONSE: { id, nome, preco, tamanho, descricao, imagemUrl, atualizadoEm }
```

### 5️⃣ DELETE /admin/produtos/:id
```
REQUEST: (sem body)
RESPONSE: 200 OK ou { message: "Produto deletado" }
```

### 6️⃣ GET /admin/interacoes?status=pendente
```
REQUEST: (query: status, page, limit)
RESPONSE: {
  interacoes: [{
    id, produtoId, produtoNome, usuarioId, usuarioNome,
    usuarioEmail, mensagem, status, resposta, dataResponsta, criadoEm
  }, ...],
  total, pagina, porPagina
}
```

### 7️⃣ PATCH /admin/interacoes/:id/responder
```
REQUEST: { resposta: string (1-2000 chars) }
RESPONSE: { id, status: "respondida", resposta, dataResponsta, atualizadoEm }
```

### 8️⃣ PATCH /admin/interacoes/:id/confirmar
```
REQUEST: (sem body)
RESPONSE: { id, status: "confirmada", atualizadoEm }
```

### 9️⃣ POST /admin/interacoes/:id/enviar-email
```
REQUEST: { email: string (email válido) }
RESPONSE: { message: "Email enviado com sucesso", emailEnviadoEm }
```

### 🔟 DELETE /admin/interacoes/:id
```
REQUEST: (sem body)
RESPONSE: { message: "Interação marcada como excluída", status: "excluida" }
```

---

## 🔐 Autenticação

Todos os endpoints com ✅ requerem:

```
Header: Authorization: Bearer <token>
```

Onde `<token>` é obtido no login e armazenado em `localStorage`.

O backend deve:
1. Extrair o token do header
2. Validar se é um JWT válido
3. Verificar se `user.role === "admin"`
4. Retornar 401 se token inválido
5. Retornar 403 se usuário não é admin

---

## 📝 Status das Interações

| Status | Descrição | Transições Permitidas |
|--------|-----------|----------------------|
| `pendente` | Interação nova, sem resposta | → `respondida` \| → `excluida` |
| `respondida` | Admin respondeu | → `confirmada` \| → `excluida` |
| `confirmada` | Cliente confirmou | → `excluida` |
| `excluida` | Marcada como excluída (soft delete) | Apenas leitura |

---

## ✅ Validações Obrigatórias

### Produto
- `nome`: string 3-100 chars, único no banco
- `preco`: number > 0
- `tamanho`: string até 50 chars (opcional)
- `descricao`: string até 1000 chars (opcional)
- `imagemUrl`: URL válida (opcional)

### Interação
- `resposta`: string 1-2000 chars (não vazia)
- `email`: email válido

---

## 🚨 Tratamento de Erros

| Código | Mensagem | Quando Retornar |
|--------|----------|-----------------|
| 200 | OK | Sucesso em GET, PUT, PATCH |
| 201 | Created | Sucesso em POST |
| 204 | No Content | Sucesso em DELETE (opcional) |
| 400 | Bad Request | Dados inválidos ou faltando |
| 401 | Unauthorized | Token inválido/ausente |
| 403 | Forbidden | Usuário não é admin |
| 404 | Not Found | Recurso não encontrado |
| 409 | Conflict | Conflito (ex: produto duplicado) |
| 500 | Server Error | Erro no servidor |

**Formato de erro recomendado:**
```json
{
  "error": "Bad Request",
  "message": "Campo 'nome' é obrigatório"
}
```

---

## 🧪 Testes Essenciais

- [ ] GET /produtos retorna lista
- [ ] POST /admin/produtos cria com sucesso
- [ ] PUT /admin/produtos/:id atualiza
- [ ] DELETE /admin/produtos/:id marca como excluído
- [ ] GET /admin/dashboard/stats retorna números corretos
- [ ] GET /admin/interacoes filtra por status
- [ ] PATCH /admin/interacoes/:id/responder muda status
- [ ] PATCH /admin/interacoes/:id/confirmar muda status
- [ ] POST /admin/interacoes/:id/enviar-email envia email
- [ ] DELETE /admin/interacoes/:id marca como excluída
- [ ] 401 sem token em `/admin/*`
- [ ] 403 com usuário não-admin em `/admin/*`
- [ ] Validações de entrada funcionam

---

## 🛠️ Stack Tecnológico Frontend

- React 19.2.4
- React Router 7.14.1
- Tailwind CSS 4.2.2
- Zustand 5.0.12 (auth store)
- Axios 1.15.0 (HTTP client com interceptor)
- Victory 36.0.0 (charts)
- TypeScript

**Base URL**: `http://localhost:3001`

---

## 📞 Documentação Detalhada

Para informações completas, ver:
- `BACKEND_REQUISITOS_ADMIN.md` - Especificação completa
- `PROMPT_BACKEND_RESUMIDO.md` - Resumo executivo
- `EXEMPLOS_REQUISICOES.md` - Exemplos com cURL/JavaScript

---

## 🎯 Prioridade de Implementação

1. **Alta** (Dia 1)
   - GET /produtos
   - POST/PUT/DELETE /admin/produtos
   - GET /admin/dashboard/stats

2. **Alta** (Dia 1-2)
   - GET /admin/interacoes
   - PATCH /admin/interacoes/:id/responder

3. **Média** (Dia 2-3)
   - PATCH /admin/interacoes/:id/confirmar
   - DELETE /admin/interacoes/:id
   - POST /admin/interacoes/:id/enviar-email

---

**Última atualização**: 13 de maio de 2026  
**Status**: 🟡 Aguardando Backend  
**Frontend**: ✅ 100% Pronto
