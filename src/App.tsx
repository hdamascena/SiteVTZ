/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ClubDataProvider } from './context/ClubDataContext.tsx';
import { Header } from './components/Header.tsx';
import { HeroCarousel } from './components/HeroCarousel.tsx';
import { EventsCalendar } from './components/EventsCalendar.tsx';
import { PhotoGallerySection } from './components/PhotoGallerySection.tsx';
import { UltimasNoticias } from './components/UltimasNoticias.tsx';
import { Footer } from './components/Footer.tsx';
import { SearchModal } from './components/SearchModal.tsx';
import { ReservationSimulatorModal } from './components/ReservationSimulatorModal.tsx';
import { CookieBanner } from './components/CookieBanner.tsx';
import { SubpageView } from './components/SubpageView.tsx';
import { AdminPanel } from './components/AdminPanel.tsx';
import { ArrowUp } from 'lucide-react';

const EASE_EDITORIAL: [number, number, number, number] = [0.16, 1, 0.3, 1];

function VitalizarMainApp() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [inscricoesOpen, setInscricoesOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const [activeSubpage, setActiveSubpage] = useState<string | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<string | undefined>(undefined);

  useEffect(() => {
    const checkHash = () => {
      if (window.location.hash === '#admin') {
        setAdminOpen(true);
      }
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

  const handleOpenSubpage = (pageId: string, subId?: string) => {
    if (pageId === 'home') {
      setActiveSubpage(null);
      setActiveSubTab(undefined);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (pageId === 'eventos' || subId === 'eventos') {
      if (activeSubpage) {
        setActiveSubpage(null);
        setActiveSubTab(undefined);
      }
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

    setActiveSubpage(pageId);
    setActiveSubTab(subId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchSelectAction = (actionType: string, id: string) => {
    if (actionType === 'eventos') {
      handleOpenSubpage('eventos');
    } else if (actionType === 'projetos') {
      handleOpenSubpage('projetos', id);
    } else if (actionType === 'transparencia') {
      handleOpenSubpage('transparencia', id);
    } else if (actionType === 'noticia') {
      handleOpenSubpage('noticias', id);
    } else if (actionType === 'a-vitalizar') {
      handleOpenSubpage('a-vitalizar', id);
    } else {
      handleOpenSubpage(actionType, id);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-800">
      {/* Single-Line Editorial Header */}
      <Header
        onOpenSearch={() => setSearchOpen(true)}
        onOpenInscricoes={() => setInscricoesOpen(true)}
        onOpenSubpage={handleOpenSubpage}
        onOpenAdmin={() => setAdminOpen(true)}
      />

      {/* Main Content */}
      <main className="flex-1">
        {activeSubpage ? (
          <SubpageView
            key={`${activeSubpage}-${activeSubTab ?? ''}`}
            pageId={activeSubpage}
            subId={activeSubTab}
            onBack={() => setActiveSubpage(null)}
            onOpenInscricoes={() => setInscricoesOpen(true)}
          />
        ) : (
          <>
            {/* Section 1: Editorial Hero & Quick Pillars */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.08 }}
              transition={{ duration: 0.55, ease: EASE_EDITORIAL }}
            >
              <HeroCarousel
                onOpenInscricoes={() => setInscricoesOpen(true)}
                onOpenSubpage={handleOpenSubpage}
              />
            </motion.div>

            {/* Section 2: Agenda de Eventos & Oficinas (RSVP Rápido) */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.08 }}
              transition={{ duration: 0.6, ease: EASE_EDITORIAL }}
            >
              <EventsCalendar onOpenInscricoes={() => setInscricoesOpen(true)} />
            </motion.div>

            {/* Section 3: Galeria de Projetos e Eventos com Lightbox */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.08 }}
              transition={{ duration: 0.6, ease: EASE_EDITORIAL }}
            >
              <PhotoGallerySection />
            </motion.div>

            {/* Section 4: Notícias Recentes & Acesso Institucional */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.08 }}
              transition={{ duration: 0.6, ease: EASE_EDITORIAL }}
            >
              <UltimasNoticias
                onViewAllNews={() => handleOpenSubpage('noticias')}
                onOpenSubpage={handleOpenSubpage}
              />
            </motion.div>
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
          className="fixed bottom-6 right-20 z-30 p-3 bg-slate-900 hover:bg-[#0284c7] text-white rounded-full shadow-lg border border-slate-700 transition-all duration-200 cursor-pointer"
          title="Voltar ao Topo"
          aria-label="Voltar ao Topo"
        >
          <ArrowUp className="w-4 h-4" />
        </button>
      )}

      {/* Interactive Modals */}
      <SearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelectAction={handleSearchSelectAction}
      />

      <ReservationSimulatorModal
        isOpen={inscricoesOpen}
        onClose={() => setInscricoesOpen(false)}
      />

      {/* Admin Control Panel */}
      {adminOpen && (
        <AdminPanel
          onClose={() => {
            setAdminOpen(false);
            if (window.location.hash === '#admin') {
              window.history.pushState(null, '', window.location.pathname);
            }
          }}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <ClubDataProvider>
      <VitalizarMainApp />
    </ClubDataProvider>
  );
}
