# 🍕 Pizzaria — Frontend

Interface web desenvolvida com **React + TypeScript** para o sistema de gerenciamento de pizzaria. A aplicação consome a API REST do backend e oferece visões distintas conforme o papel do usuário autenticado.

---

## Visão Geral

O frontend é uma SPA (Single Page Application) que se adapta ao perfil do usuário logado. Cada role possui sua própria área com rotas e permissões separadas:

| Role | Acesso |
|---|---|
| `SUPER_ADMIN` | Gestão de pizzarias e criação de admins |
| `ADMIN` | Dashboard, cardápio, mesas, pedidos, funcionários e delivery |
| `EMPLOYEE` | Mesas, pedidos em aberto e delivery |

---

## Funcionalidades

**Autenticação**
- Login com e-mail e senha
- Token JWT armazenado no `localStorage` e injetado automaticamente em todas as requisições via interceptor do Axios
- Refresh automático de token em respostas 401, com fila para evitar múltiplas requisições simultâneas de refresh
- Redirecionamento para `/login` quando o refresh falha

**Gestão de Pizzarias** _(Super Admin)_
- Listagem e cadastro de novas filiais

**Cardápio** _(Admin)_
- Cadastro de produtos com tamanhos e preços
- Controle de disponibilidade

**Mesas** _(Admin e Employee)_
- Abertura e fechamento de mesas com registro de método de pagamento e desconto
- Status atualizado via TanStack Query (refetch ao montar o componente e ao focar a janela)

**Pedidos em Mesa** _(Admin e Employee)_
- Criação de pedido vinculado a uma mesa aberta
- Adição e remoção de itens com seleção de tamanho e sabor
- Acompanhamento do fluxo de status (`OPEN → IN_PROGRESS → READY → DELIVERED`)

**Delivery** _(Admin e Employee)_
- Registro de pedidos para entrega com nome do cliente
- Fluxo de status independente das mesas
- Registro de pagamento na entrega

**Funcionários** _(Admin)_
- Cadastro e listagem de employees vinculados à pizzaria

---

## Arquitetura

```
src/
├── contexts/
│   ├── AuthContext.tsx    # Estado global de autenticação
│   └── ModalContext.tsx   # Toast notifications centralizados
├── routes/
│   └── index.tsx          # Rotas protegidas por role
├── hooks/                 # Custom hooks por domínio
│   ├── products/
│   ├── tables/
│   ├── orders/
│   ├── delivery/
│   └── ...
├── services/
│   └── api.ts             # Instância Axios com interceptors
├── pages/                 # Páginas organizadas por role
│   ├── Login/
│   ├── Admin/
│   ├── Employee/
│   └── Pizzerias/
└── components/            # Componentes reutilizáveis (Button, Input, Sidebar...)
```

### Decisões de arquitetura

**Custom hooks com TanStack Query**
Cada operação de dados tem seu próprio hook (`useProducts`, `useCreateOrder`, `useCloseTable`...). As mutations invalidam automaticamente as queries relacionadas, mantendo a UI sempre sincronizada sem gerenciamento manual de estado.

**Interceptor de refresh token**
O Axios possui um interceptor de resposta que, ao receber 401, enfileira as requisições com falha, solicita um novo token e reexecuta todas elas. Se o refresh falhar, limpa o `localStorage` e redireciona para o login.

**Decodificação manual do JWT**
O `AuthContext` decodifica o payload do access token diretamente (sem biblioteca externa) para extrair `userId`, `role` e `pizzeriaId` do usuário logado.

**Roteamento por role**
Além do `PrivateRoute` (exige autenticação), existem wrappers `AdminRoute`, `SuperAdminRoute` e `EmployeeRoute` que verificam a role antes de renderizar a página, redirecionando para a rota correta caso o acesso não seja permitido.

---

## Tecnologias

| Tecnologia | Uso |
|---|---|
| React 18 + TypeScript 5.6 | Framework e tipagem |
| Vite 6 | Build tool e dev server |
| TanStack Query 5 | Cache, sincronização e estado de servidor |
| React Hook Form 7 | Formulários com validação performática |
| React Router DOM 7 | Roteamento client-side |
| Axios | HTTP client com interceptors |
| Tailwind CSS 3 | Estilização utilitária |
| Lucide React | Ícones |
| Sonner | Toast notifications |

---

## Como rodar

**Pré-requisito:** Node.js 18+ e o backend rodando

```bash
npm install
```

Crie um `.env` na raiz:

```env
VITE_API_URL="http://localhost:3000"
```

```bash
npm run dev
```

Acesse em `http://localhost:5173`
