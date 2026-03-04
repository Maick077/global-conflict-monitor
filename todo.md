# Global Conflict Monitor - TODO

## Fase 1: Arquitetura e Schema

- [x] Definir schema de dados Event com Drizzle ORM
- [x] Configurar PostgreSQL e migrações
- [x] Criar tipos TypeScript para Event

## Fase 2: Backend - Modelo e API

- [x] Schema Event criado com campos: tipo, localização, data/hora, descrição, fonte, confirmação, país
- [x] Endpoints tRPC para listar eventos (com paginação)
- [x] Endpoint tRPC para filtrar por tipo/data/país
- [x] Endpoint tRPC para obter detalhes de evento individual
- [x] Endpoint tRPC para criar evento (admin only)
- [x] Endpoint tRPC para editar evento (admin only)
- [x] Endpoint tRPC para deletar evento (admin only)
- [x] Endpoint tRPC para confirmar evento (admin only)
- [x] Endpoint tRPC para obter contadores (total, por tipo, últimas 24h)
- [x] Validação de inputs com Zod
- [ ] Testes unitários para endpoints críticos

## Fase 3: Painel Administrativo

- [x] Página admin com autenticação (role-based access control)
- [x] Formulário para criar novo evento
- [x] Tabela de eventos com ações (editar, deletar, confirmar)
- [x] Modal para editar evento
- [x] Modal para confirmar exclusão
- [x] Validação de formulários
- [x] Feedback visual (toast notifications)

## Fase 4: Frontend - Mapa Interativo

- [x] Instalar Leaflet.js e dependências
- [x] Componente Map com OpenStreetMap (dark theme)
- [x] Marcadores com cores por tipo: vermelho (aéreo), laranja (terrestre), azul (marítimo)
- [x] Popups ao clicar em marcador com informações do evento
- [x] Animação ao adicionar novo marcador
- [x] Efeito de "ping" para novos eventos
- [x] Zoom suave
- [x] Integração com dados da API

## Fase 5: Frontend - Contadores e Filtros

- [x] Componente de contadores: total, por tipo, últimas 24h
- [x] Botões de filtro por tipo de evento
- [x] Filtro por país de origem
- [x] Filtro por intervalo de datas
- [x] Indicador de "Atualizado há X segundos"
- [ ] Linha do tempo lateral (opcional)

## Fase 6: Frontend - Polling e Atualização

- [x] Sistema de polling a cada 30 segundos
- [x] Atualização automática do mapa sem refresh
- [x] Sincronização de contadores
- [x] Tratamento de erros de conexão
- [ ] Indicador de status de conexão

## Fase 7: Frontend - Cards de Detalhes

- [x] Card modal com informações completas do evento
- [x] Exibição de: tipo, localização, data/hora, descrição, fonte, link da fonte
- [x] Botões de ação (editar, deletar) para admins
- [x] Fechar modal ao clicar fora
- [x] Transições suaves

## Fase 8: Design - Dark Mode Geopolítico

- [x] Tema escuro com fundo preto/cinza escuro
- [x] Acentos em vermelho/laranja para alertas
- [x] Paleta de cores: vermelho (#EF4444), laranja (#F97316), azul (#3B82F6)
- [x] Fonte moderna (Inter ou Roboto)
- [x] Aplicar tema globalmente com Tailwind
- [x] Garantir contraste de texto adequado

## Fase 9: Responsividade Mobile

- [x] Layout mobile-first
- [x] Menu responsivo para filtros
- [x] Mapa adaptável para telas pequenas
- [x] Cards de eventos em mobile
- [ ] Testes em diferentes resoluções
- [ ] Otimização de performance

## Fase 10: Testes e Qualidade

- [ ] Testes unitários dos endpoints
- [ ] Testes de integração frontend-backend
- [ ] Validação de dados em diferentes cenários
- [ ] Testes de responsividade
- [ ] Teste de performance do mapa com muitos marcadores

## Fase 11: Deploy e Documentação

- [ ] Preparar para deploy (variáveis de ambiente)
- [ ] Documentação de uso
- [ ] Instruções de setup local
- [ ] Guia de administração
- [ ] README com features e screenshots

## Fase 12: Entrega

- [ ] Criar checkpoint final
- [ ] Validar todas as funcionalidades
- [ ] Entregar ao usuário com instruções
