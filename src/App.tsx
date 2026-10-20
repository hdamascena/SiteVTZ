/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, lazy, Suspense } from 'react';
import { m, LazyMotion, MotionConfig } from 'motion/react';
import { ClubDataProvider, useClubData } from './context/ClubDataContext.tsx';
import { Header } from './components/Header.tsx';
import { HeroCarousel } from './components/HeroCarousel.tsx';
import { EventsCalendar } from './components/EventsCalendar.tsx';
import { PhotoGallerySection } from './components/PhotoGallerySection.tsx';
import { UltimasNoticias } from './components/UltimasNoticias.tsx';
import { Footer } from './components/Footer.tsx';
import { CookieBanner } from './components/CookieBanner.tsx';
import { SponsorsSection } from './components/SponsorsSection.tsx';
import { ArrowUp, Megaphone, ArrowRight } from 'lucide-react';
import type { EventCategory } from './types/index.ts';

// Recursos de animação do motion carregados sob demanda (fora do bundle inicial)
const loadFeatures = () => import('./motionFeatures.ts').then((mod) => mod.default);

// Carregados sob demanda: ficam fora do bundle inicial (o painel inclui Firebase Auth)
const SearchModal = lazy(() =>
  import('./components/SearchModal.tsx').then((m) => ({ default: m.SearchModal }))
);
const ReservationSimulatorModal = lazy(() =>
  import('./components/ReservationSimulatorModal.tsx').then((m) => ({
    default: m.ReservationSimulatorModal,
  }))
);
const SubpageView = lazy(() =>
  import('./components/SubpageView.tsx').then((m) => ({ default: m.SubpageView }))
);
const AdminPanel = lazy(() =>
  import('./components/AdminPanel.tsx').then((m) => ({ default: m.AdminPanel }))
);

const EASE_EDITORIAL: [number, number, number, number] = [0.16, 1, 0.3, 1];

// ============================================================================
// Rotas por hash: #/<pagina>/<item>  (ex.: #/noticias/<id>, #/eventos/<id>)
// Mantém Voltar/recarregar/compartilhar funcionando sem servidor de rotas.
// ============================================================================
type Route = { page: string | null; sub?: string };

const EVENT_CATEGORIES = ['clinica_esportiva', 'oficina_comunitaria', 'reuniao_associacao'];

function parseRoute(hash: string): Route | null {
  if (hash.startsWith('#/')) {
    const [page, sub] = hash.slice(2).split('/').map((p) => decodeURIComponent(p));
    return { page: page || null, sub: sub || undefined };
  }
  // Links antigos de compartilhamento de evento: #eventos-<id>
  const legacy = hash.match(/^#eventos-(.+)$/);
  if (legacy) return { page: 'eventos', sub: decodeURIComponent(legacy[1]) };
  if (hash === '' || hash === '#') return { page: null };
  return null; // #admin, #conteudo etc. não mudam a página
}

function routeToHash(page: string | null, sub?: string): string {
  if (!page) return '#/';
  return `#/${encodeURIComponent(page)}${sub ? `/${encodeURIComponent(sub)}` : ''}`;
}

function VitalizarMainApp() {
  const { siteSettings } = useClubData();
  const [searchOpen, setSearchOpen] = useState(false);
  const [inscricoesOpen, setInscricoesOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const [activeSubpage, setActiveSubpage] = useState<string | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<string | undefined>(undefined);
  const [homeEventCategory, setHomeEventCategory] = useState<EventCategory | 'all'>('all');
  const [homeEventId, setHomeEventId] = useState<string | undefined>(undefined);

  /** Aplica uma rota ao estado da tela (só usa setters, seguro dentro de listeners). */
  const applyRoute = (route: Route) => {
    const { page, sub } = route;
    if (!page || page === 'home') {
      setActiveSubpage(null);
      setActiveSubTab(undefined);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (page === 'eventos') {
      if (sub && EVENT_CATEGORIES.includes(sub)) {
        setHomeEventCategory(sub as EventCategory);
        setHomeEventId(undefined);
      } else {
        setHomeEventCategory('all');
        setHomeEventId(sub);
      }
      setActiveSubpage(null);
      setActiveSubTab(undefined);
      setTimeout(() => {
        const el = document.getElementById('eventos-calendario');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        } else {
          window.scrollTo({ top: 650, behavior: 'smooth' });
        }
      }, 100);
      return;
    }

    setActiveSubpage(page);
    setActiveSubTab(sub);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const checkHash = () => {
      if (window.location.hash === '#admin') {
        setAdminOpen(true);
        return;
      }
      const route = parseRoute(window.location.hash);
      if (route) applyRoute(route);
    };
    checkHash();
    window.addEventListener('hashchange', checkHash);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.altKey && e.key.toLowerCase() === 'a') ||
        (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a')
      ) {
        e.preventDefault();
        setAdminOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('hashchange', checkHash);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  /** Navega atualizando o hash (cria entrada no histórico → botão Voltar funciona). */
  const handleOpenSubpage = (pageId: string, subId?: string) => {
    if (pageId === 'inscricoes') {
      setInscricoesOpen(true);
      return;
    }

    let route: Route;
    if (pageId === 'home') {
      route = { page: null };
    } else if (pageId === 'eventos' || subId === 'eventos') {
      route = { page: 'eventos', sub: subId === 'eventos' ? undefined : subId };
    } else {
      route = { page: pageId, sub: subId };
    }

    const hash = routeToHash(route.page, route.sub);
    if (window.location.hash === hash) {
      applyRoute(route); // mesmo endereço: hashchange não dispara
    } else {
      window.location.hash = hash; // o listener de hashchange aplica a rota
    }
  };

  const handleSearchSelectAction = (actionType: string, id: string) => {
    if (actionType === 'eventos') {
      handleOpenSubpage('eventos', id);
    } else if (actionType === 'projetos') {
      handleOpenSubpage('projetos', id);
    } else if (actionType === 'transparencia') {
      handleOpenSubpage('transparencia', id);
    } else if (actionType === 'noticia') {
      handleOpenSubpage('noticias', id);
    } else if (actionType === 'patrocinadores') {
      handleOpenSubpage('patrocinadores', id);
    } else if (actionType === 'a-vitalizar') {
      handleOpenSubpage('a-vitalizar', id);
    } else {
      handleOpenSubpage(actionType, id);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-800">
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[200] focus:px-4 focus:py-2 focus:bg-white focus:text-[#061a38] focus:font-bold focus:rounded-md focus:shadow-lg"
      >
        Pular para o conteúdo
      </a>

      {/* Dynamic Institutional Announcement Bar (Configured in Admin Settings) */}
      {siteSettings.announcementBanner?.enabled && siteSettings.announcementBanner.text && (
        <div className="bg-[#0284c7] text-white px-4 py-2 text-xs font-medium border-b border-sky-400/30">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <Megaphone className="w-3.5 h-3.5 text-sky-200 shrink-0" aria-hidden="true" />
              <span>{siteSettings.announcementBanner.text}</span>
            </div>
            {siteSettings.announcementBanner.linkLabel && (
              <button
                type="button"
                onClick={() =>
                  handleOpenSubpage(siteSettings.announcementBanner.linkTarget || 'inscricoes')
                }
                className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-white text-[#061a38] hover:bg-sky-50 font-bold text-[11px] rounded-md transition-colors cursor-pointer shrink-0"
              >
                <span>{siteSettings.announcementBanner.linkLabel}</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Single-Line Editorial Header */}
      <Header
        onOpenSearch={() => setSearchOpen(true)}
        onOpenInscricoes={() => setInscricoesOpen(true)}
        onOpenSubpage={handleOpenSubpage}
        onOpenAdmin={() => setAdminOpen(true)}
        activePageId={activeSubpage || 'home'}
      />

      {/* Main Content */}
      <main id="conteudo" tabIndex={-1} className="flex-1 focus:outline-none">
        {activeSubpage ? (
          <Suspense fallback={<div className="min-h-[60vh]" />}>
            <SubpageView
              key={`${activeSubpage}-${activeSubTab ?? ''}`}
              pageId={activeSubpage}
              subId={activeSubTab}
              onBack={() => handleOpenSubpage('home')}
              onOpenInscricoes={() => setInscricoesOpen(true)}
            />
          </Suspense>
        ) : (
          <>
            {/* Section 1: Editorial Hero & Quick Pillars */}
            {/* Sem fade de entrada: o hero é o maior conteúdo visível (LCP) e deve aparecer de imediato */}
            <HeroCarousel
              onOpenInscricoes={() => setInscricoesOpen(true)}
              onOpenSubpage={handleOpenSubpage}
            />

            {/* Section 2: Agenda de Eventos & Oficinas (RSVP Rápido) */}
            <m.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.08 }}
              transition={{ duration: 0.6, ease: EASE_EDITORIAL }}
            >
              <EventsCalendar
                onOpenInscricoes={() => setInscricoesOpen(true)}
                initialCategory={homeEventCategory}
                initialEventId={homeEventId}
              />
            </m.div>

            {/* Section 3: Galeria de Projetos e Eventos com Lightbox */}
            <m.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.08 }}
              transition={{ duration: 0.6, ease: EASE_EDITORIAL }}
            >
              <PhotoGallerySection />
            </m.div>

            {/* Section 4: Notícias Recentes & Acesso Institucional */}
            <m.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.08 }}
              transition={{ duration: 0.6, ease: EASE_EDITORIAL }}
            >
              <UltimasNoticias
                onViewAllNews={() => handleOpenSubpage('noticias')}
                onOpenSubpage={handleOpenSubpage}
              />
            </m.div>

            {/* Section 5: Patrocinadores e Parceiros Oficiais */}
            {siteSettings.enableSponsorsSection !== false && (
              <m.div
                id="patrocinadores-oficiais"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.08 }}
                transition={{ duration: 0.6, ease: EASE_EDITORIAL }}
              >
                <SponsorsSection
                  onOpenContact={() => handleOpenSubpage('contato', 'parcerias')}
                />
              </m.div>
            )}
          </>
        )}
      </main>

      {/* Clean Institutional Footer */}
      <Footer
        onOpenContact={() => handleOpenSubpage('contato', 'fale-conosco')}
        onOpenPrivacy={() => handleOpenSubpage('transparencia')}
        onOpenSubpage={handleOpenSubpage}
        onOpenAdmin={() => setAdminOpen(true)}
      />

      {/* Cookie Consent Banner */}
      <CookieBanner onOpenPrivacy={() => handleOpenSubpage('transparencia')} />

      {/* Scroll to Top */}
      {showScrollTop && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-20 z-30 p-3 bg-slate-900 hover:bg-[#0284c7] text-white rounded-full shadow-lg border border-slate-700 transition-colors duration-200 cursor-pointer"
          title="Voltar ao Topo"
          aria-label="Voltar ao Topo"
        >
          <ArrowUp className="w-4 h-4" />
        </button>
      )}

      {/* Interactive Modals (montados só quando abertos) */}
      <Suspense fallback={null}>
        {searchOpen && (
          <SearchModal
            isOpen
            onClose={() => setSearchOpen(false)}
            onSelectAction={handleSearchSelectAction}
          />
        )}

        {inscricoesOpen && (
          <ReservationSimulatorModal isOpen onClose={() => setInscricoesOpen(false)} />
        )}
      </Suspense>

      {/* Admin Control Panel */}
      {adminOpen && (
        <Suspense fallback={<div className="fixed inset-0 z-50 bg-[#061a38]" />}>
          <AdminPanel
            onClose={() => {
              setAdminOpen(false);
              if (window.location.hash === '#admin') {
                window.history.pushState(null, '', window.location.pathname);
              }
            }}
          />
        </Suspense>
      )}
    </div>
  );
}

export default function App() {
  return (
    <ClubDataProvider>
      {/* Respeita "reduzir movimento" do sistema nas animações do motion */}
      <MotionConfig reducedMotion="user">
        <LazyMotion features={loadFeatures} strict>
          <VitalizarMainApp />
        </LazyMotion>
      </MotionConfig>
    </ClubDataProvider>
  );
}
