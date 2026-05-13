# 🔥 PROMPT PARA O BACKEND - ADMIN AREA

Cole isso no Slack/Email para o time de backend:

---

**Pessoal, aqui está tudo que precisamos para a admin area funcionar perfeitamente:**

## 📌 Resumo

A área de admin foi 100% desenvolvida no frontend. Agora precisamos de **10 endpoints backend** para tudo funcionar sem erros. Todos com autenticação Bearer Token e verificação de role "admin".

## 🔐 Autenticação Obrigatória

Todos os endpoints `/admin/*` devem:
1. Verificar se o token Bearer é válido
2. Confirmar se o usuário tem `role = "admin"`
3. Retornar `401 Unauthorized` se sem token
4. Retornar `403 Forbidden` se não é admin

---

## 📊 ENDPOINTS NECESSÁRIOS

### 1️⃣ Dashboard Stats
```
GET /admin/dashboard/stats
Response: {
  totalProdutos: number,
  totalInteracoes: number,
  interacoesRespondidas: number,
  interacoesPendentes: number,
  totalUsuarios: number,
  taxaRespostaPorcentagem: number (0-100)
}
```

### 2️⃣ Listar Produtos (PÚBLICO - SEM AUTH)
```
GET /produtos
Response: Array de {
  id, nome, preco, tamanho, descricao, imagemUrl, avaliacao, criadoEm
}
```

### 3️⃣ Criar Produto
```
POST /admin/produtos
Body: { nome, preco, tamanho?, descricao?, imagemUrl? }
Response: Produto criado com id
```

### 4️⃣ Atualizar Produto
```
PUT /admin/produtos/:id
Body: { nome, preco, tamanho?, descricao?, imagemUrl? }
Response: Produto atualizado
```

### 5️⃣ Deletar Produto
```
DELETE /admin/produtos/:id
Response: 200 OK (soft delete - marcar como excluído)
```

### 6️⃣ Listar Interações
```
GET /admin/interacoes?status=pendente
Response: {
  interacoes: Array de {
    id, produtoId, produtoNome, usuarioId, usuarioNome, 
    usuarioEmail, mensagem, status, resposta, dataResponsta, criadoEm
  },
  total: number,
  pagina: number,
  porPagina: number
}
```

### 7️⃣ Responder Interação
```
PATCH /admin/interacoes/:id/responder
Body: { resposta: string }
Response: Interação com status="respondida" e dataResponsta preenchido
```

### 8️⃣ Confirmar Interação
```
PATCH /admin/interacoes/:id/confirmar
Response: Interação com status="confirmada"
```

### 9️⃣ Enviar Email
```
POST /admin/interacoes/:id/enviar-email
Body: { email: string }
Response: { message: "Email enviado com sucesso" }
```

### 🔟 Deletar/Marcar Interação como Excluída
```
DELETE /admin/interacoes/:id
Response: Interação com status="excluida" (soft delete)
```

---

## 🎯 Status dos Interações

As interações têm 4 status possíveis:
- `pendente` → Nova interação, sem resposta
- `respondida` → Admin respondeu
- `confirmada` → Cliente confirmou (após resposta)
- `excluida` → Marcada como excluída (soft delete)

---

## ✅ Checklist Rápido

- [ ] 10 endpoints acima implementados
- [ ] Autenticação Bearer Token em todos `/admin/*`
- [ ] Autorização de role "admin" verificada
- [ ] Validações de entrada
- [ ] Tratamento de erros (400, 401, 403, 404, 500)
- [ ] Email enviando corretamente
- [ ] Testes com Postman/Insomnia

---

## 📎 Documentação Completa

Para detalhes completos (validações, exemplos, estrutura do banco de dados, etc), ver:
**`BACKEND_REQUISITOS_ADMIN.md`** no repositório

---

**Status**: 🟡 Aguardando implementação  
**Frontend**: ✅ Pronto para testar assim que os endpoints estiverem live
