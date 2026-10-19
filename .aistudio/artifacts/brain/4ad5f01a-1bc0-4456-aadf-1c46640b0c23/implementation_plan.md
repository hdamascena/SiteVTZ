# Modernização UI/UX e Simplificação Arquitetural da Vitalizar

Transformação do portal da Associação Esportiva Vitalizar em uma experiência **Clean Editorial Esportiva**, eliminando redundâncias visuais, excesso de jargões jurídicos repetidos e componentes desnecessários para focar em navegação rápida, projetos sociais, eventos e transparência.

## User Review & Critical Decisions

> [!IMPORTANT]
> As decisões abaixo refletem exatamente as suas escolhas confirmadas e orientam toda a reestruturação visual e limpeza do projeto:

- **Decisão Confirmada 1 — Remoção de Excessos e Componentes Redundantes**: Exclusão da barra superior de avisos, da seção de vídeos do YouTube, da galeria duplicada na capa, do modal de alteração estatutária e da repetição constante de CNPJ e artigos jurídicos nos cabeçalhos e cartões.
- **Decisão Confirmada 2 — Estética Clean Editorial Esportiva**: Adoção de fundo claro predominante (`#FFFFFF` e `#F8FAFC`), tipografia editorial de alto contraste (`#0F172A`), divisórias sutis de `1px` (`border-slate-200`) e metadados em texto limpo separado por ponto médio (`·`), sem excesso de etiquetas coloridas.
- **Decisão Confirmada 3 — Página Inicial Enxuta em 4 Seções Diretas**: Organização do fluxo principal em apenas 4 blocos estratégicos de leitura e ação rápida, reduzindo a rolagem e melhorando a conversão de inscrições.

---

## 1. Overview & Core Concept

- **O que muda**: A interface deixa de parecer um portal burocrático carregado de avisos e passa a funcionar como uma plataforma esportiva moderna, leve e direta ao ponto.
- **Público-Alvo**: Moradores, jovens atletas, famílias de Cariacica/ES em busca de vagas em projetos esportivos e parceiros institucionais.
- **Valor Principal**: Redução drástica da poluição visual, carregamento mais ágil com menos componentes em memória e acesso em 1 clique às inscrições e eventos.

---

## 2. User Experience & Visual Design

- **Fluxo Principal na Página Inicial (4 Seções Diretas)**:
  1. **Hero Editorial Esportivo + Atalhos Rápidos**: Destaque visual limpo com chamada clara sobre a atuação em Cariacica/ES, botão primário de inscrição nas modalidades e indicadores essenciais de impacto.
  2. **Agenda de Eventos & Oficinas (Inscrição Rápida)**: Programação interativa com busca e filtro por modalidade, permitindo confirmar presença (RSVP) diretamente sem burocracia.
  3. **Galeria de Ações e Eventos (Lightbox)**: Vitrine fotográfica unificada dos projetos realizados, com filtro por categoria e visualização ampliada em tela cheia com navegação por teclado e zoom.
  4. **Notícias Recentes & Acesso à Transparência**: Destaques editoriais limpos com leitura em modal e atalho direto para o Portal da Transparência e Fale Conosco.
- **Identidade Visual & Tema**:
  - *Direção Estética*: Clean Editorial Esportivo — superfícies claras, respiro generoso (*whitespace*) e foco na fotografia dos projetos e na clareza tipográfica.
  - *Paleta de Cores (Regra 60-30-10)*:
    - **60% Superfície Dominante**: Branco Puro (`#FFFFFF`) e Cinza Alabastro Frio (`#F8FAFC`).
    - **30% Estrutura e Tipografia**: Azul-Noite Profundo (`#0F172A`) para títulos, Ardósia (`#475569`) para leitura confortável e bordas sutis (`#E2E8F0`).
    - **10% Acento de Ação**: Azul Celeste Esportivo (`#0284C7` / `#0EA5E9`) concentrado exclusivamente nos botões primários e abas ativas.
  - *Tipografia & Hierarquia*: Títulos com peso forte e contenção equilibrada (`text-wrap: balance`), corpo de texto legível e metadados (datas, locais e categorias) exibidos como texto corrido elegante (`Esporte Educacional · Agosto 2026 · Rio Marinho`) sem caixas ou pílulas decorativas.
  - *Cabeçalho em Linha Única (Top Bar Contract)*: Uma única barra superior limpa com 3 zonas bem definidas: Marca oficial (`/logo.png` + `VITALIZAR`), 5 links diretos de navegação em linha única e 1 botão primário (`Inscrever-se`), além de acesso discreto à busca e ao painel administrativo.
- **Feedback Interativo & Movimento**: Transições rápidas ($\le 200\text{ms}$), estados vazios claros nas buscas e notificações instantâneas (*toasts*) ao concluir uma inscrição ou mensagem.

---

## 3. Key Product Decisions & Trade-Offs

- **Decisão 1: Unificação das Galerias e Remoção de Componentes Supérfluos**
  - *Abordagem Escolhida*: Manter exclusivamente a Galeria com Lightbox (`PhotoGallerySection`) e remover os componentes duplicados de galeria, vídeos, cartões institucionais redundantes, barra superior de avisos e modal de destaque estatutário.
  - *Por quê*: Elimina a sensação de repetição ao rolar a página e mantém o repositório enxuto e fácil de manter.
- **Decisão 2: Centralização dos Dados Jurídicos no Rodapé e na Subpágina de Transparência**
  - *Abordagem Escolhida*: Retirar números de CNPJ, códigos CNAE e citações de artigos do cabeçalho e dos títulos das seções da capa, preservando-os de forma organizada apenas no rodapé institucional e na página dedicada de Transparência.
  - *Por quê*: Preserva 100% da conformidade institucional exigida para parcerias públicas (MROSC), mas liberta a interface principal para uma comunicação humana e acolhedora com a comunidade.

---

## 4. Technical Architecture & Data Strategy *(Technical Reference)*

- **Diagrama de Arquitetura e Componentes**:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    ClubDataContext (Estado & Persistência)              │
│   [Projetos, Eventos, Notícias, Documentos, Inscrições, Mensagens]      │
└───────────────────────────────────┬─────────────────────────────────────┘
                                    │
        ┌───────────────────────────┼───────────────────────────┐
        ▼                           ▼                           ▼
┌───────────────────┐     ┌───────────────────────┐   ┌───────────────────┐
│ Cabeçalho Único   │     │ Página Inicial (4x)   │   │ Subpáginas &      │
│ (3 Zonas Limpas)  │     │                       │   │ Painel Admin      │
├───────────────────┤     ├───────────────────────┤   ├───────────────────┤
│ • Logo Oficial    │     │ 1. Hero Editorial     │   │ • Quem Somos      │
│ • 5 Links Diretos │     │ 2. Eventos & RSVP     │   │ • Projetos        │
│ • CTA Inscrever   │     │ 3. Galeria Lightbox   │   │ • Transparência   │
│ • Busca & Admin   │     │ 4. Notícias & Apoio   │   │ • Notícias        │
└───────────────────┘     └───────────────────────┘   │ • Admin Completo  │
                                                      └───────────────────┘
```

- **Modelo de Dados & Estado**:
  - Os dados institucionais, projetos, eventos, notícias, documentos de transparência e inscrições permanecem gerenciados de forma reativa pelo contexto central com persistência local, permitindo que qualquer edição feita no Painel Administrativo reflita imediatamente na nova interface limpa.
- **Mapeamento de Interações**:
  - **Cabeçalho e Busca**: Navegação direta entre as 4 seções da capa ou abertura das subpáginas temáticas sem recarregar a aplicação.
  - **Inscrição em Modalidades e Eventos**: Formulários enxutos com validação imediata de capacidade, idade e contato, gerando protocolo de confirmação.
  - **Galeria Lightbox**: Filtragem instantânea por categoria, navegação por teclado (`ArrowLeft`, `ArrowRight`, `Escape`), controle de zoom e faixa de miniaturas.
