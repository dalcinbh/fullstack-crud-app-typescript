# Backend API - TypeScript ESM

API backend moderna desenvolvida com TypeScript, Express e Prisma usando ESM (ES Modules).

## 🚀 Tecnologias

- **Node.js 18.20.8**
- **TypeScript 5.4.2** com ESM
- **Express 4.18.2**
- **Prisma 5.12.0** (ORM)
- **MySQL** (Database)
- **Multer** (File Upload)

## 📋 Pré-requisitos

- Node.js 18.20.8 ou superior
- MySQL 8.0 ou superior
- npm ou yarn

## 🔧 Configuração

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar banco de dados

```bash
# Copiar arquivo de exemplo
cp .env.example .env

# Editar as variáveis no arquivo .env
DATABASE_URL="mysql://user:password@localhost:3306/database_name"
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### 3. Executar migrações

```bash
# Gerar cliente Prisma
npm run db:generate

# Executar migrações
npm run db:migrate
```

## 🎯 Scripts Disponíveis

```bash
# Desenvolvimento com hot reload
npm run dev

# Build para produção
npm run build

# Executar versão buildada
npm run start

# Limpar pasta dist
npm run clean

# Comandos do Prisma
npm run db:generate  # Gerar cliente Prisma
npm run db:migrate   # Executar migrações
npm run db:push      # Push schema para banco
npm run db:studio    # Abrir Prisma Studio
```

## 📁 Estrutura do Projeto

```
backend/
├── classes/           # Classes do domínio
├── config/           # Configurações (Prisma, etc.)
├── controllers/      # Controllers das rotas
├── interfaces/       # Interfaces TypeScript
├── middlewares/      # Middlewares personalizados
├── prisma/          # Schema e migrações
├── routes/          # Definição das rotas
├── uploads/         # Arquivos enviados
├── app.ts           # Aplicação principal
├── package.json     # Dependências e scripts
└── tsconfig.json    # Configuração TypeScript
```

## 🔗 Endpoints da API

### Projetos

```
GET    /api/projects           # Listar todos os projetos
GET    /api/projects/:id       # Buscar projeto por ID
POST   /api/projects           # Criar novo projeto
PUT    /api/projects/:id       # Atualizar projeto
DELETE /api/projects/:id       # Deletar projeto
```

### Exemplos de Uso

#### Criar Projeto

```bash
curl -X POST http://localhost:5000/api/projects \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Projeto Teste",
    "description": "Descrição do projeto",
    "startDate": "2024-01-01",
    "tasks": [
      {
        "title": "Tarefa 1",
        "description": "Descrição da tarefa",
        "dueDate": "2024-01-15"
      }
    ]
  }'
```

#### Listar Projetos com Paginação

```bash
curl "http://localhost:5000/api/projects?page=1&limit=10&search=teste"
```

## 🛠️ Desenvolvimento

### Configuração do TypeScript

O projeto usa configuração moderna do TypeScript com:

- **ESM (ES Modules)** nativo
- **Node.js 18** target
- **Strict mode** habilitado
- **Path mapping** configurado

### Estrutura de Classes

```typescript
// Exemplo de uso da classe Project
import { Project } from './classes/project.class.js';

const projects = await Project.getAllProjects({
  page: 1,
  limit: 10,
  search: 'termo'
});
```

### Upload de Arquivos

```typescript
// Middleware para upload múltiplo
import { sendToFileProjectStorage } from './middlewares/send-file-project.middleware.js';

// Uso nas rotas
router.post('/', sendToFileProjectStorage, createProject);
```

## 🔒 Variáveis de Ambiente

```env
# Database
DATABASE_URL="mysql://user:password@localhost:3306/database_name"

# Server
PORT=5000
NODE_ENV=development

# Frontend
FRONTEND_URL=http://localhost:3000
```

## 🐛 Troubleshooting

### Erro de Módulo ESM

Se encontrar erros relacionados a ESM, verifique:

1. `"type": "module"` no `package.json`
2. Extensões `.js` nas importações locais
3. Uso de `import` em vez de `require`

### Erro de Prisma

```bash
# Regenerar cliente Prisma
npm run db:generate

# Reset do banco (cuidado!)
npx prisma migrate reset
```

## 📦 Build e Deploy

```bash
# Build para produção
npm run build

# Executar em produção
npm start
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.
