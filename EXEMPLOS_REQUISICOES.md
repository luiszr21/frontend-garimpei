# 🧪 EXEMPLOS DE REQUISIÇÕES PARA TESTAR

Use esses exemplos com Postman, Insomnia ou curl para testar os endpoints.

---

## 🔑 TOKEN DE TESTE

Substitua `YOUR_ADMIN_TOKEN_HERE` pelo seu token de admin gerado no login.

```bash
# Exemplo de Token (normalmente vem do endpoint de login)
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 1️⃣ DASHBOARD STATS

### cURL
```bash
curl --request GET \
  --url http://localhost:3001/admin/dashboard/stats \
  --header 'Authorization: Bearer YOUR_ADMIN_TOKEN_HERE'
```

### JavaScript/Fetch
```javascript
fetch('http://localhost:3001/admin/dashboard/stats', {
  headers: {
    'Authorization': 'Bearer YOUR_ADMIN_TOKEN_HERE'
  }
})
.then(res => res.json())
.then(data => console.log(data))
```

### Response Esperado
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

---

## 2️⃣ LISTAR PRODUTOS (SEM AUTH)

### cURL
```bash
curl --request GET \
  --url 'http://localhost:3001/produtos?limit=10'
```

### JavaScript/Fetch
```javascript
fetch('http://localhost:3001/produtos')
  .then(res => res.json())
  .then(data => console.log(data))
```

### Response Esperado
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "nome": "Camiseta Branca",
    "preco": 49.90,
    "tamanho": "M",
    "descricao": "Camiseta de algodão 100%",
    "imagemUrl": "https://example.com/img.jpg",
    "avaliacao": 4.5,
    "criadoEm": "2026-05-10T10:30:00Z"
  }
]
```

---

## 3️⃣ CRIAR PRODUTO

### cURL
```bash
curl --request POST \
  --url http://localhost:3001/admin/produtos \
  --header 'Authorization: Bearer YOUR_ADMIN_TOKEN_HERE' \
  --header 'Content-Type: application/json' \
  --data '{
    "nome": "Camiseta Azul",
    "preco": 59.90,
    "tamanho": "G",
    "descricao": "Camiseta de algodão premium",
    "imagemUrl": "https://example.com/azul.jpg"
  }'
```

### JavaScript/Fetch
```javascript
fetch('http://localhost:3001/admin/produtos', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_ADMIN_TOKEN_HERE',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    nome: "Camiseta Azul",
    preco: 59.90,
    tamanho: "G",
    descricao: "Camiseta de algodão premium",
    imagemUrl: "https://example.com/azul.jpg"
  })
})
.then(res => res.json())
.then(data => console.log(data))
```

### Response Esperado (201 Created)
```json
{
  "id": "650e8400-e29b-41d4-a716-446655440001",
  "nome": "Camiseta Azul",
  "preco": 59.90,
  "tamanho": "G",
  "descricao": "Camiseta de algodão premium",
  "imagemUrl": "https://example.com/azul.jpg",
  "criadoEm": "2026-05-13T14:22:00Z"
}
```

---

## 4️⃣ ATUALIZAR PRODUTO

### cURL
```bash
curl --request PUT \
  --url http://localhost:3001/admin/produtos/650e8400-e29b-41d4-a716-446655440001 \
  --header 'Authorization: Bearer YOUR_ADMIN_TOKEN_HERE' \
  --header 'Content-Type: application/json' \
  --data '{
    "nome": "Camiseta Azul Premium",
    "preco": 69.90,
    "tamanho": "GG",
    "descricao": "Camiseta de algodão premium - tamanho grande",
    "imagemUrl": "https://example.com/azul-premium.jpg"
  }'
```

### JavaScript/Fetch
```javascript
fetch('http://localhost:3001/admin/produtos/650e8400-e29b-41d4-a716-446655440001', {
  method: 'PUT',
  headers: {
    'Authorization': 'Bearer YOUR_ADMIN_TOKEN_HERE',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    nome: "Camiseta Azul Premium",
    preco: 69.90,
    tamanho: "GG",
    descricao: "Camiseta de algodão premium - tamanho grande",
    imagemUrl: "https://example.com/azul-premium.jpg"
  })
})
.then(res => res.json())
.then(data => console.log(data))
```

---

## 5️⃣ DELETAR PRODUTO

### cURL
```bash
curl --request DELETE \
  --url http://localhost:3001/admin/produtos/650e8400-e29b-41d4-a716-446655440001 \
  --header 'Authorization: Bearer YOUR_ADMIN_TOKEN_HERE'
```

### JavaScript/Fetch
```javascript
fetch('http://localhost:3001/admin/produtos/650e8400-e29b-41d4-a716-446655440001', {
  method: 'DELETE',
  headers: {
    'Authorization': 'Bearer YOUR_ADMIN_TOKEN_HERE'
  }
})
.then(res => console.log(res.status))
```

---

## 6️⃣ LISTAR INTERAÇÕES

### cURL
```bash
curl --request GET \
  --url 'http://localhost:3001/admin/interacoes?status=pendente&page=1' \
  --header 'Authorization: Bearer YOUR_ADMIN_TOKEN_HERE'
```

### JavaScript/Fetch
```javascript
fetch('http://localhost:3001/admin/interacoes?status=pendente', {
  headers: {
    'Authorization': 'Bearer YOUR_ADMIN_TOKEN_HERE'
  }
})
.then(res => res.json())
.then(data => console.log(data))
```

### Response Esperado
```json
{
  "interacoes": [
    {
      "id": "760e8400-e29b-41d4-a716-446655440002",
      "produtoId": "550e8400-e29b-41d4-a716-446655440000",
      "produtoNome": "Camiseta Branca",
      "usuarioId": "870e8400-e29b-41d4-a716-446655440003",
      "usuarioNome": "João Silva",
      "usuarioEmail": "joao@email.com",
      "mensagem": "Vocês têm essa camiseta em tamanho GG?",
      "status": "pendente",
      "resposta": null,
      "dataResponsta": null,
      "criadoEm": "2026-05-12T09:15:00Z",
      "atualizadoEm": "2026-05-12T09:15:00Z"
    }
  ],
  "total": 156,
  "pagina": 1,
  "porPagina": 20
}
```

---

## 7️⃣ RESPONDER INTERAÇÃO

### cURL
```bash
curl --request PATCH \
  --url http://localhost:3001/admin/interacoes/760e8400-e29b-41d4-a716-446655440002/responder \
  --header 'Authorization: Bearer YOUR_ADMIN_TOKEN_HERE' \
  --header 'Content-Type: application/json' \
  --data '{
    "resposta": "Sim! Temos em estoque com frete grátis para sua região."
  }'
```

### JavaScript/Fetch
```javascript
fetch('http://localhost:3001/admin/interacoes/760e8400-e29b-41d4-a716-446655440002/responder', {
  method: 'PATCH',
  headers: {
    'Authorization': 'Bearer YOUR_ADMIN_TOKEN_HERE',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    resposta: "Sim! Temos em estoque com frete grátis para sua região."
  })
})
.then(res => res.json())
.then(data => console.log(data))
```

### Response Esperado
```json
{
  "id": "760e8400-e29b-41d4-a716-446655440002",
  "status": "respondida",
  "resposta": "Sim! Temos em estoque com frete grátis para sua região.",
  "dataResponsta": "2026-05-13T15:45:00Z",
  "atualizadoEm": "2026-05-13T15:45:00Z"
}
```

---

## 8️⃣ CONFIRMAR INTERAÇÃO

### cURL
```bash
curl --request PATCH \
  --url http://localhost:3001/admin/interacoes/760e8400-e29b-41d4-a716-446655440002/confirmar \
  --header 'Authorization: Bearer YOUR_ADMIN_TOKEN_HERE'
```

### JavaScript/Fetch
```javascript
fetch('http://localhost:3001/admin/interacoes/760e8400-e29b-41d4-a716-446655440002/confirmar', {
  method: 'PATCH',
  headers: {
    'Authorization': 'Bearer YOUR_ADMIN_TOKEN_HERE'
  }
})
.then(res => res.json())
.then(data => console.log(data))
```

---

## 9️⃣ ENVIAR EMAIL

### cURL
```bash
curl --request POST \
  --url http://localhost:3001/admin/interacoes/760e8400-e29b-41d4-a716-446655440002/enviar-email \
  --header 'Authorization: Bearer YOUR_ADMIN_TOKEN_HERE' \
  --header 'Content-Type: application/json' \
  --data '{
    "email": "joao@email.com"
  }'
```

### JavaScript/Fetch
```javascript
fetch('http://localhost:3001/admin/interacoes/760e8400-e29b-41d4-a716-446655440002/enviar-email', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_ADMIN_TOKEN_HERE',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: "joao@email.com"
  })
})
.then(res => res.json())
.then(data => console.log(data))
```

---

## 🔟 DELETAR INTERAÇÃO

### cURL
```bash
curl --request DELETE \
  --url http://localhost:3001/admin/interacoes/760e8400-e29b-41d4-a716-446655440002 \
  --header 'Authorization: Bearer YOUR_ADMIN_TOKEN_HERE'
```

### JavaScript/Fetch
```javascript
fetch('http://localhost:3001/admin/interacoes/760e8400-e29b-41d4-a716-446655440002', {
  method: 'DELETE',
  headers: {
    'Authorization': 'Bearer YOUR_ADMIN_TOKEN_HERE'
  }
})
.then(res => console.log(res.status))
```

---

## ❌ ERROS COMUNS

### 401 - Unauthorized (Token inválido/faltando)
```json
{
  "error": "Unauthorized",
  "message": "Invalid or missing token"
}
```

### 403 - Forbidden (Usuário não é admin)
```json
{
  "error": "Forbidden",
  "message": "User is not an admin"
}
```

### 400 - Bad Request (Dados inválidos)
```json
{
  "error": "Bad Request",
  "message": "Campo 'nome' é obrigatório"
}
```

### 404 - Not Found
```json
{
  "error": "Not Found",
  "message": "Produto não encontrado"
}
```

---

## 📋 POSTMAN COLLECTION

Para facilitar, você pode importar essa coleção no Postman:

1. Abra Postman
2. Clique em "Import"
3. Cole o JSON abaixo ou salve como arquivo .json

```json
{
  "info": {
    "name": "Admin Area API",
    "version": "1.0.0"
  },
  "item": [
    {
      "name": "Dashboard",
      "request": {
        "method": "GET",
        "url": "{{baseUrl}}/admin/dashboard/stats",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          }
        ]
      }
    },
    {
      "name": "Listar Produtos",
      "request": {
        "method": "GET",
        "url": "{{baseUrl}}/produtos"
      }
    },
    {
      "name": "Criar Produto",
      "request": {
        "method": "POST",
        "url": "{{baseUrl}}/admin/produtos",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          },
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\"nome\": \"Produto Teste\", \"preco\": 99.99}"
        }
      }
    }
  ],
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:3001"
    },
    {
      "key": "token",
      "value": "YOUR_TOKEN_HERE"
    }
  ]
}
```

---

## 🚀 COMO USAR

1. Substitua `YOUR_ADMIN_TOKEN_HERE` pelo seu token real
2. Substitua `YOUR_PRODUCT_ID` e `YOUR_INTERACTION_ID` pelos IDs reais
3. Copie o comando cURL ou o código JavaScript
4. Execute e veja a resposta
5. Compare com o "Response Esperado"

Good luck! 🎉
