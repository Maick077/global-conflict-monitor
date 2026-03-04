# Global Conflict Monitor

Plataforma de monitoramento geopolítico em tempo real mostrando eventos confirmados relacionados a tensões entre Irã e Israel.

## 🎯 Objetivo

Criar uma plataforma informativa, neutra e baseada apenas em eventos confirmados por fontes públicas confiáveis. O site não contém discurso político, propaganda ou incentivo à violência.

## ✨ Funcionalidades Principais

### 1. Mapa Interativo
- Mapa Leaflet com tema escuro (OpenStreetMap)
- Marcadores coloridos por tipo de evento:
  - 🔴 **Vermelho** - Eventos aéreos
  - 🟠 **Laranja** - Eventos terrestres
  - 🔵 **Azul** - Eventos marítimos
- Popups com informações completas ao clicar
- Animação de "ping" para novos eventos
- Zoom suave e controles intuitivos

### 2. Contadores em Tempo Real
- Total de eventos confirmados
- Eventos nas últimas 24 horas
- Contagem por tipo de evento
- Contagem por país de origem
- Indicador de "Atualizado há X segundos"

### 3. Sistema de Filtros
- Filtrar por tipo de evento (aéreo, terrestre, marítimo)
- Filtrar por país (Iran, Israel)
- Filtrar por intervalo de datas
- Limpar todos os filtros com um clique

### 4. Cards de Detalhes
- Card flutuante com informações completas do evento
- Exibição de: tipo, localização, data/hora, descrição, fonte
- Links diretos para fontes verificáveis
- Ações administrativas (editar, deletar) para admins

### 5. Painel Administrativo
- Autenticação baseada em roles (admin/user)
- Criar novos eventos com validação completa
- Editar eventos existentes
- Deletar eventos
- Confirmar eventos (apenas eventos confirmados aparecem no mapa público)
- Tabela com todas as ações disponíveis

### 6. Polling Automático
- Atualização automática a cada 30 segundos
- Sincronização de mapa e contadores
- Sem necessidade de refresh manual
- Tratamento de erros de conexão

### 7. Design Geopolítico
- Tema escuro com fundo preto/cinza escuro
- Acentos em vermelho/laranja para alertas
- Paleta de cores: vermelho (#EF4444), laranja (#F97316), azul (#3B82F6)
- Layout responsivo mobile-first
- Contraste adequado para acessibilidade

## 🏗️ Arquitetura

### Backend
- **Express.js** - Servidor web
- **tRPC** - API type-safe
- **PostgreSQL** - Banco de dados
- **Drizzle ORM** - Gerenciamento de schema e queries
- **Zod** - Validação de schemas

### Frontend
- **React 19** - Framework UI
- **Tailwind CSS 4** - Estilização
- **Leaflet.js** - Mapa interativo
- **Wouter** - Roteamento
- **shadcn/ui** - Componentes UI

### Autenticação
- **Manus OAuth** - Sistema de autenticação
- **Role-based access control** - Admin vs User

## 📊 Modelo de Dados

### Event
```typescript
{
  id: number;
  type: "aéreo" | "terrestre" | "marítimo";
  country: "iran" | "israel";
  description: string;
  sourceName: string;
  sourceUrl: string;
  latitude: string;
  longitude: string;
  locationName: string;
  confirmed: boolean;
  eventDate: Date;
  createdAt: Date;
  updatedAt: Date;
  confirmedBy?: number;
}
```

## 🔌 Endpoints tRPC

### Públicos
- `events.list` - Listar eventos confirmados com paginação
- `events.getById` - Obter detalhes de um evento
- `events.byCountry` - Filtrar por país
- `events.byType` - Filtrar por tipo
- `events.byDateRange` - Filtrar por intervalo de datas
- `events.stats` - Obter estatísticas

### Admin Only
- `events.create` - Criar novo evento
- `events.update` - Editar evento
- `events.delete` - Deletar evento
- `events.confirm` - Confirmar evento

## 🚀 Como Usar

### Acesso Público
1. Navegue para a página inicial
2. Visualize o mapa com eventos confirmados
3. Clique em marcadores para ver detalhes
4. Use filtros para refinar a busca
5. Observe atualizações automáticas a cada 30 segundos

### Painel Administrativo
1. Faça login como admin
2. Acesse `/admin`
3. Crie, edite ou confirme eventos
4. Apenas eventos confirmados aparecem no mapa público

## 🧪 Testes

Executar todos os testes:
```bash
pnpm test
```

Testes incluem:
- ✅ Criação de eventos (admin only)
- ✅ Listagem e filtros
- ✅ Validação de permissões
- ✅ Estatísticas
- ✅ Confirmação e deleção

## 📦 Dependências Principais

```json
{
  "@trpc/client": "^11.6.0",
  "@trpc/react-query": "^11.6.0",
  "@trpc/server": "^11.6.0",
  "drizzle-orm": "^0.44.5",
  "express": "^4.21.2",
  "leaflet": "^1.9.4",
  "react": "^19.2.1",
  "react-leaflet": "^5.0.0",
  "tailwindcss": "^4.1.14",
  "zod": "^4.1.12"
}
```

## 🔒 Segurança

- **CORS** configurado corretamente
- **Validação de inputs** com Zod em todos os endpoints
- **Sanitização** de dados
- **Autenticação obrigatória** para operações administrativas
- **Role-based access control** para proteção de recursos
- **HTTPS** em produção

## 📝 Disclaimer

Os dados exibidos são baseados em informações públicas confirmadas por fontes externas. A plataforma não faz afirmações sobre a precisão ou completude dos dados. Todos os eventos devem ser confirmados por administradores antes de aparecerem no mapa público.

## 🎨 Paleta de Cores

- **Fundo**: #0a0a0a (preto profundo)
- **Texto**: #f0f0f0 (branco)
- **Aéreo**: #ef4444 (vermelho)
- **Terrestre**: #f97316 (laranja)
- **Marítimo**: #3b82f6 (azul)
- **Acentos**: #ef4444 (vermelho para alertas)

## 🌍 Localização

- **Latitude**: 32.5°N (região do Oriente Médio)
- **Longitude**: 35.5°E (região do Oriente Médio)
- **Zoom padrão**: 6

## 📱 Responsividade

- ✅ Mobile-first design
- ✅ Funciona em smartphones, tablets e desktops
- ✅ Mapa adaptável para telas pequenas
- ✅ Filtros em menu responsivo
- ✅ Cards otimizados para todos os tamanhos

## 🔄 Polling

- Intervalo: 30 segundos
- Atualiza: Mapa, contadores e estatísticas
- Tratamento de erros: Mostra toast com mensagem de erro
- Sem bloqueio de UI durante atualização

## 📄 Licença

Projeto desenvolvido para fins educacionais e informativos.

## 🤝 Contribuições

Para reportar bugs ou sugerir melhorias, entre em contato através do painel administrativo.

---

**Desenvolvido com ❤️ para monitoramento geopolítico transparente e baseado em fatos.**
