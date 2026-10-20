import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  CLUB_INFO,
  NEWS_ARTICLES,
  VITALIZAR_EVENTS,
  VITALIZAR_PROJECTS,
  TRANSPARENCY_DOCUMENTS,
  DEFAULT_SITE_SETTINGS,
} from '../data/clubeData.ts';
import { INITIAL_SPONSORS } from '../data/sponsorsData.ts';
import type {
  NewsArticle,
  VitalizarEvent,
  VitalizarProject,
  TransparencyDocument,
  PastEventPhoto,
  Sponsor,
  SiteSettings,
} from '../types/index.ts';
import {
  createAuditLogEntry,
  validateBackupSchema,
} from '../utils/adminAuth.ts';
import type { AuditLogEntry } from '../utils/adminAuth.ts';
import { db } from '../firebase.ts';
import { doc, getDoc, getDocs, collection, setDoc, deleteDoc } from 'firebase/firestore/lite';
import { withSpotsStatus } from '../utils/eventFilter.ts';

/** Completa dados da entidade salvos/importados sem algum campo (evita quebrar rodapé e cabeçalho). */
const normalizeClubInfo = (info: any): typeof CLUB_INFO => ({
  ...CLUB_INFO,
  ...(info && typeof info === 'object' ? info : {}),
  phones: Array.isArray(info?.phones) ? info.phones : CLUB_INFO.phones,
  hours: { ...CLUB_INFO.hours, ...(info?.hours || {}) },
  socials: { ...CLUB_INFO.socials, ...(info?.socials || {}) },
});

/** Garante que o conteúdo da notícia seja sempre uma lista de parágrafos. */
const normalizeNews = (articles: any[]): NewsArticle[] =>
  articles.map((a) => ({
    ...a,
    content: Array.isArray(a?.content)
      ? a.content
      : String(a?.content ?? '')
          .split(/\n\s*\n/)
          .map((p: string) => p.trim())
          .filter(Boolean),
  }));

export const INITIAL_GALLERY_ALBUMS: PastEventPhoto[] = [
  {
    id: 'gal-1',
    title: 'Festival Esportivo Comunitário de Rio Marinho',
    category: 'Festivais Esportivos',
    date: 'Agosto 2026',
    location: 'Quadra Poliesportiva de Rio Marinho · Cariacica/ES',
    coverUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1000&q=80',
    caption:
      'Mais de 250 crianças e adolescentes participaram dos torneios de integração em Rio Marinho.',
    albumPhotos: [
      {
        url: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1200&q=80',
        caption: 'Abertura oficial do Festival Esportivo Comunitário com as turmas Sub-11 e Sub-15.',
      },
      {
        url: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=1200&q=80',
        caption: 'Partidas decisivas de futsal e basquete educacional com presença das famílias.',
      },
      {
        url: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=1200&q=80',
        caption: 'Entrega de medalhas de participação e troféu Fair Play.',
      },
    ],
  },
  {
    id: 'gal-2',
    title: 'Copa Vitalizar de Futsal e Voleibol de Base',
    category: 'Categorias de Base',
    date: 'Julho 2026',
    location: 'Ginásio Poliesportivo · Cariacica/ES',
    coverUrl: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=1000&q=80',
    caption: 'Equipes femininas e masculinas Sub-14 e Sub-17 em competição pedagógica.',
    albumPhotos: [
      {
        url: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=1200&q=80',
        caption: 'Equipe feminina de voleibol Sub-15 durante a final municipal.',
      },
      {
        url: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=1200&q=80',
        caption: 'Aquecimento coletivo orientado pelos professores de educação física da Vitalizar.',
      },
      {
        url: 'https://images.unsplash.com/photo-1577471488278-16eec37ffcc2?w=1200&q=80',
        caption: 'Roda de conversa sobre disciplina esportiva e rendimento escolar.',
      },
    ],
  },
  {
    id: 'gal-3',
    title: 'Circuito Saúde & Movimento – Vida Ativa',
    category: 'Saúde & Vida Ativa',
    date: 'Junho 2026',
    location: 'Praça Principal de Rio Marinho · Cariacica/ES',
    coverUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1000&q=80',
    caption: 'Aulão funcional, alongamento e acompanhamento preventivo para adultos e idosos.',
    albumPhotos: [
      {
        url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&q=80',
        caption: 'Grupo da terceira idade em atividade de mobilidade articular e prevenção de quedas.',
      },
      {
        url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=1200&q=80',
        caption: 'Aula coletiva de ginástica funcional ao ar livre.',
      },
    ],
  },
  {
    id: 'gal-4',
    title: 'Colônia de Férias Campeões da Cidadania',
    category: 'Inclusão & Comunidade',
    date: 'Janeiro 2026',
    location: 'Polo Rio Marinho · Cariacica/ES',
    coverUrl: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=1000&q=80',
    caption: 'Semana recreativa com gincanas, oficinas culturais, capoeira e esporte adaptado.',
    albumPhotos: [
      {
        url: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=1200&q=80',
        caption: 'Atividades recreativas integradas para crianças da comunidade.',
      },
      {
        url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1200&q=80',
        caption: 'Brincadeiras cooperativas e circuitos psicomotores.',
      },
      {
        url: 'https://images.unsplash.com/photo-1472162072942-cd5147eb3902?w=1200&q=80',
        caption: 'Encerramento com apresentação cultural e integração comunitária.',
      },
    ],
  },
];

export interface EventRsvpRecord {
  id: string;
  eventId: string;
  eventTitle: string;
  name: string;
  phone: string;
  spots: number;
  date: string;
  confirmationCode: string;
}

export interface ContactMessageRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  date: string;
  read: boolean;
}

export interface ToastNotification {
  id: string;
  message: string;
  type: 'success' | 'info' | 'error';
}

interface ClubDataContextType {
  clubInfo: typeof CLUB_INFO;
  setClubInfo: (info: typeof CLUB_INFO) => void;
  siteSettings: SiteSettings;
  setSiteSettings: (settings: SiteSettings) => void;
  newsArticles: NewsArticle[];
  addNewsArticle: (article: Omit<NewsArticle, 'id'>) => void;
  updateNewsArticle: (article: NewsArticle) => void;
  deleteNewsArticle: (id: string) => void;
  events: VitalizarEvent[];
  addEvent: (event: Omit<VitalizarEvent, 'id'>) => void;
  updateEvent: (event: VitalizarEvent) => void;
  deleteEvent: (id: string) => void;
  rsvps: EventRsvpRecord[];
  addRsvp: (rsvp: Omit<EventRsvpRecord, 'id' | 'confirmationCode' | 'date'>) => string;
  deleteRsvp: (id: string) => void;
  projects: VitalizarProject[];
  addProject: (project: Omit<VitalizarProject, 'id'>) => void;
  updateProject: (project: VitalizarProject) => void;
  deleteProject: (id: string) => void;
  galleryAlbums: PastEventPhoto[];
  addGalleryAlbum: (album: Omit<PastEventPhoto, 'id'>) => void;
  updateGalleryAlbum: (album: PastEventPhoto) => void;
  deleteGalleryAlbum: (id: string) => void;
  transparencyDocs: TransparencyDocument[];
  addTransparencyDoc: (doc: Omit<TransparencyDocument, 'id'>) => void;
  updateTransparencyDoc: (doc: TransparencyDocument) => void;
  deleteTransparencyDoc: (id: string) => void;
  sponsors: Sponsor[];
  addSponsor: (sponsor: Omit<Sponsor, 'id'>) => void;
  updateSponsor: (sponsor: Sponsor) => void;
  deleteSponsor: (id: string) => void;
  contactMessages: ContactMessageRecord[];
  addContactMessage: (msg: Omit<ContactMessageRecord, 'id' | 'date' | 'read'>) => void;
  markContactMessageRead: (id: string) => void;
  deleteContactMessage: (id: string) => void;
  auditLogs: AuditLogEntry[];
  addAuditLog: (action: string, details?: string, adminEmail?: string) => void;
  clearAuditLogs: () => void;
  resetAllToDefaults: () => void;
  exportDatabaseJson: () => string;
  buildBackupJson: () => string;
  importDatabaseJson: (jsonString: string) => { success: boolean; message: string };
  saveAdminChanges: (payload: {
    clubInfo?: typeof CLUB_INFO;
    siteSettings?: SiteSettings;
    newsArticles?: NewsArticle[];
    sponsors?: Sponsor[];
    events?: VitalizarEvent[];
    projects?: VitalizarProject[];
    galleryAlbums?: PastEventPhoto[];
    transparencyDocs?: TransparencyDocument[];
    rsvps?: EventRsvpRecord[];
    contactMessages?: ContactMessageRecord[];
    logDetails?: string;
    toastMessage?: string;
  }) => boolean;
  toasts: ToastNotification[];
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  removeToast: (id: string) => void;
  isFirebaseActive: boolean;
}

const STORAGE_KEYS = {
  CLUB_INFO: 'vitalizar_db_club_info',
  SITE_SETTINGS: 'vitalizar_db_site_settings',
  NEWS: 'vitalizar_db_news',
  SPONSORS: 'vitalizar_db_sponsors',
  EVENTS: 'vitalizar_db_events',
  PROJECTS: 'vitalizar_db_projects',
  GALLERY: 'vitalizar_db_gallery',
  TRANSPARENCY: 'vitalizar_db_transparency',
  RSVPS: 'vitalizar_db_rsvps',
  MESSAGES: 'vitalizar_db_messages',
  LOGS: 'vitalizar_db_logs',
};

function normalizeSiteSettings(raw?: Partial<SiteSettings> | null): SiteSettings {
  if (!raw || typeof raw !== 'object') {
    return DEFAULT_SITE_SETTINGS;
  }
  return {
    ...DEFAULT_SITE_SETTINGS,
    ...raw,
    newsCategories: Array.isArray(raw.newsCategories)
      ? raw.newsCategories
      : DEFAULT_SITE_SETTINGS.newsCategories,
    eventCategories: Array.isArray(raw.eventCategories)
      ? raw.eventCategories
      : DEFAULT_SITE_SETTINGS.eventCategories,
    projectCategories: Array.isArray(raw.projectCategories)
      ? raw.projectCategories.map((item: any) =>
          typeof item === 'string' ? item : item?.label || item?.id || ''
        ).filter(Boolean)
      : DEFAULT_SITE_SETTINGS.projectCategories,
    galleryCategories: Array.isArray(raw.galleryCategories)
      ? raw.galleryCategories
      : DEFAULT_SITE_SETTINGS.galleryCategories,
    sponsorCategories: Array.isArray(raw.sponsorCategories)
      ? raw.sponsorCategories
      : DEFAULT_SITE_SETTINGS.sponsorCategories,
    contactSubjects: Array.isArray(raw.contactSubjects)
      ? raw.contactSubjects
      : DEFAULT_SITE_SETTINGS.contactSubjects,
    siteTags: Array.isArray(raw.siteTags)
      ? raw.siteTags
      : DEFAULT_SITE_SETTINGS.siteTags,
    searchSuggestions: Array.isArray(raw.searchSuggestions)
      ? raw.searchSuggestions
      : DEFAULT_SITE_SETTINGS.searchSuggestions,
    announcementBanner: {
      ...DEFAULT_SITE_SETTINGS.announcementBanner,
      ...(raw.announcementBanner || {}),
    },
  };
}

const ClubDataContext = createContext<ClubDataContextType | null>(null);

export const ClubDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Club Info
  const [clubInfo, setClubInfoState] = useState<typeof CLUB_INFO>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CLUB_INFO);
      return saved ? normalizeClubInfo(JSON.parse(saved)) : CLUB_INFO;
    } catch {
      return CLUB_INFO;
    }
  });

  // 1b. Site Settings
  const [siteSettings, setSiteSettingsState] = useState<SiteSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SITE_SETTINGS);
      return saved ? normalizeSiteSettings(JSON.parse(saved)) : DEFAULT_SITE_SETTINGS;
    } catch {
      return DEFAULT_SITE_SETTINGS;
    }
  });

  // 2. News
  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.NEWS);
      return saved ? normalizeNews(JSON.parse(saved)) : NEWS_ARTICLES;
    } catch {
      return NEWS_ARTICLES;
    }
  });

  // 3. Events
  const [events, setEvents] = useState<VitalizarEvent[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.EVENTS);
      return saved ? JSON.parse(saved) : VITALIZAR_EVENTS;
    } catch {
      return VITALIZAR_EVENTS;
    }
  });

  // 4. Projects
  const [projects, setProjects] = useState<VitalizarProject[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROJECTS);
      return saved ? JSON.parse(saved) : VITALIZAR_PROJECTS;
    } catch {
      return VITALIZAR_PROJECTS;
    }
  });

  // 4b. Gallery Albums
  const [galleryAlbums, setGalleryAlbums] = useState<PastEventPhoto[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.GALLERY);
      return saved ? JSON.parse(saved) : INITIAL_GALLERY_ALBUMS;
    } catch {
      return INITIAL_GALLERY_ALBUMS;
    }
  });

  // 5. Transparency Docs
  const [transparencyDocs, setTransparencyDocs] = useState<TransparencyDocument[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TRANSPARENCY);
      return saved ? JSON.parse(saved) : TRANSPARENCY_DOCUMENTS;
    } catch {
      return TRANSPARENCY_DOCUMENTS;
    }
  });

  // 5b. Sponsors & Partners
  const [sponsors, setSponsors] = useState<Sponsor[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SPONSORS);
      return saved ? JSON.parse(saved) : INITIAL_SPONSORS;
    } catch {
      return INITIAL_SPONSORS;
    }
  });

  // 6. RSVPs
  const [rsvps, setRsvps] = useState<EventRsvpRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.RSVPS);
      return saved
        ? JSON.parse(saved)
        : [
            {
              id: 'rsvp-seed-1',
              eventId: 'clinica-futsal-transicoes',
              eventTitle: 'Clínica de Futsal: Transições Rápidas',
              name: 'Marcos Vinicius Santos',
              phone: '(27) 99823-1144',
              spots: 2,
              date: new Date().toLocaleDateString('pt-BR'),
              confirmationCode: 'VTL-FUTSAL-8921',
            },
            {
              id: 'rsvp-seed-2',
              eventId: 'oficina-primeiros-socorros',
              eventTitle: 'Oficina de Primeiros Socorros & Prevenção no Esporte',
              name: 'Ana Cláudia Ribeiro',
              phone: '(27) 98112-4590',
              spots: 1,
              date: new Date().toLocaleDateString('pt-BR'),
              confirmationCode: 'VTL-SOCORR-3482',
            },
          ];
    } catch {
      return [];
    }
  });

  // 7. Contact Messages
  const [contactMessages, setContactMessages] = useState<ContactMessageRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MESSAGES);
      return saved
        ? JSON.parse(saved)
        : [
            {
              id: 'msg-seed-1',
              name: 'Carlos Eduardo Lima',
              email: 'carlos.lima@gmail.com',
              phone: '(27) 99765-4321',
              subject: 'Voluntariado',
              message:
                'Gostaria de me candidatar como voluntário para dar aulas de reforço escolar e apoio aos treinos de futsal nos finais de semana.',
              date: '14/10/2026 16:40',
              read: false,
            },
          ];
    } catch {
      return [];
    }
  });

  // 8. Audit Logs
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LOGS);
      return saved
        ? JSON.parse(saved)
        : [
            createAuditLogEntry(
              'SISTEMA_INICIALIZADO',
              'sistema@vitalizar.org.br',
              'Base de dados inicial da Associação Vitalizar carregada.'
            ),
          ];
    } catch {
      return [];
    }
  });

  const [isFirebaseActive, setIsFirebaseActive] = useState<boolean>(true);

  // Sync initial data from Firestore if available
  useEffect(() => {
    let isMounted = true;
    async function hydrateFromFirestore() {
      // Busca tudo em paralelo; uma coleção com erro não impede as demais.
      const [clubRes, settingsRes, newsRes, sponsorsRes, eventsRes, projectsRes, galleryRes, docsRes] =
        await Promise.allSettled([
          getDoc(doc(db, 'club_info', 'main')),
          getDoc(doc(db, 'site_settings', 'main')),
          getDocs(collection(db, 'news_articles')),
          getDocs(collection(db, 'sponsors')),
          getDocs(collection(db, 'events')),
          getDocs(collection(db, 'projects')),
          getDocs(collection(db, 'gallery_albums')),
          getDocs(collection(db, 'transparency_docs')),
        ]);
      if (!isMounted) return;

      const persist = (key: string, value: unknown) => {
        try {
          localStorage.setItem(key, JSON.stringify(value));
        } catch {
          // Cota do navegador cheia: mantém só em memória
        }
      };

      // Todas as atualizações no mesmo bloco síncrono → uma única renderização
      if (clubRes.status === 'fulfilled' && clubRes.value.exists()) {
        const remoteData = normalizeClubInfo(clubRes.value.data());
        setClubInfoState(remoteData);
        persist(STORAGE_KEYS.CLUB_INFO, remoteData);
      }
      if (settingsRes.status === 'fulfilled' && settingsRes.value.exists()) {
        const remoteSettings = normalizeSiteSettings(settingsRes.value.data() as Partial<SiteSettings>);
        setSiteSettingsState(remoteSettings);
        persist(STORAGE_KEYS.SITE_SETTINGS, remoteSettings);
      }
      if (newsRes.status === 'fulfilled' && !newsRes.value.empty) {
        const remoteNews = normalizeNews(newsRes.value.docs.map((d) => d.data()));
        setNewsArticles(remoteNews);
        persist(STORAGE_KEYS.NEWS, remoteNews);
      }
      if (sponsorsRes.status === 'fulfilled' && !sponsorsRes.value.empty) {
        const remoteSponsors = sponsorsRes.value.docs.map((d) => d.data() as Sponsor);
        remoteSponsors.sort((a, b) => (a.order || 0) - (b.order || 0));
        setSponsors(remoteSponsors);
        persist(STORAGE_KEYS.SPONSORS, remoteSponsors);
      }
      if (eventsRes.status === 'fulfilled' && !eventsRes.value.empty) {
        const remoteEvents = eventsRes.value.docs.map((d) => d.data() as VitalizarEvent);
        setEvents(remoteEvents);
        persist(STORAGE_KEYS.EVENTS, remoteEvents);
      }
      if (projectsRes.status === 'fulfilled' && !projectsRes.value.empty) {
        const remoteProjects = projectsRes.value.docs.map((d) => d.data() as VitalizarProject);
        setProjects(remoteProjects);
        persist(STORAGE_KEYS.PROJECTS, remoteProjects);
      }
      if (galleryRes.status === 'fulfilled' && !galleryRes.value.empty) {
        const remoteAlbums = galleryRes.value.docs.map((d) => d.data() as PastEventPhoto);
        setGalleryAlbums(remoteAlbums);
        persist(STORAGE_KEYS.GALLERY, remoteAlbums);
      }
      if (docsRes.status === 'fulfilled' && !docsRes.value.empty) {
        const remoteDocs = docsRes.value.docs.map((d) => d.data() as TransparencyDocument);
        setTransparencyDocs(remoteDocs);
        persist(STORAGE_KEYS.TRANSPARENCY, remoteDocs);
      }

      const failed = [clubRes, settingsRes, newsRes, sponsorsRes, eventsRes, projectsRes, galleryRes, docsRes]
        .filter((r): r is PromiseRejectedResult => r.status === 'rejected');
      if (failed.length > 0) {
        console.info('Firestore offline ou em fallback local:', failed[0].reason);
      } else {
        setIsFirebaseActive(true);
      }
    }
    hydrateFromFirestore();
    return () => {
      isMounted = false;
    };
  }, []);

  // 9. Toasts
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  // Sincroniza alterações feitas em outra aba (ex: painel aberto em uma aba e site em outra)
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (!e.key || e.newValue === null) return;
      try {
        const value = JSON.parse(e.newValue);
        switch (e.key) {
          case STORAGE_KEYS.CLUB_INFO:
            setClubInfoState(normalizeClubInfo(value));
            break;
          case STORAGE_KEYS.SITE_SETTINGS:
            setSiteSettingsState(normalizeSiteSettings(value));
            break;
          case STORAGE_KEYS.NEWS:
            setNewsArticles(normalizeNews(value));
            break;
          case STORAGE_KEYS.SPONSORS:
            setSponsors(value);
            break;
          case STORAGE_KEYS.EVENTS:
            setEvents(value);
            break;
          case STORAGE_KEYS.PROJECTS:
            setProjects(value);
            break;
          case STORAGE_KEYS.GALLERY:
            setGalleryAlbums(value);
            break;
          case STORAGE_KEYS.TRANSPARENCY:
            setTransparencyDocs(value);
            break;
          case STORAGE_KEYS.RSVPS:
            setRsvps(value);
            break;
          case STORAGE_KEYS.MESSAGES:
            setContactMessages(value);
            break;
          case STORAGE_KEYS.LOGS:
            setAuditLogs(value);
            break;
        }
      } catch {
        // ignora valores corrompidos
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Sync helpers to localStorage
  const setClubInfo = (info: typeof CLUB_INFO) => {
    setClubInfoState(info);
    localStorage.setItem(STORAGE_KEYS.CLUB_INFO, JSON.stringify(info));
    addAuditLog('DADOS_ENTIDADE_ALTERADOS', 'Informações institucionais da Vitalizar atualizadas.');
    showToast('Dados da entidade atualizados com sucesso!');
  };

  const setSiteSettings = (settings: SiteSettings) => {
    setSiteSettingsState(settings);
    localStorage.setItem(STORAGE_KEYS.SITE_SETTINGS, JSON.stringify(settings));
    try {
      setDoc(doc(db, 'site_settings', 'main'), settings).catch(console.warn);
    } catch (err) {
      console.warn('Erro ao salvar site_settings no Firestore:', err);
    }
    addAuditLog('CONFIGURACOES_ALTERADAS', 'Configurações de categorias, tags e parâmetros do portal atualizadas.');
    showToast('Configurações do site atualizadas com sucesso!');
  };

  const addAuditLog = (action: string, details?: string, adminEmail: string = 'admin@vitalizar.org.br') => {
    const entry = createAuditLogEntry(action, adminEmail, details);
    setAuditLogs((prev) => {
      const updated = [entry, ...prev].slice(0, 50);
      localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(updated));
      return updated;
    });
  };

  // News CRUD
  const addNewsArticle = (articleData: Omit<NewsArticle, 'id'>) => {
    const newArticle: NewsArticle = {
      ...articleData,
      id: `noticia-${Date.now()}`,
      views: 1,
    };
    setNewsArticles((prev) => {
      const updated = [newArticle, ...prev];
      localStorage.setItem(STORAGE_KEYS.NEWS, JSON.stringify(updated));
      return updated;
    });
    addAuditLog('NOTICIA_CRIADA', `Notícia "${newArticle.title}" publicada.`);
    showToast('Nova notícia publicada com sucesso!');
  };

  const updateNewsArticle = (article: NewsArticle) => {
    setNewsArticles((prev) => {
      const updated = prev.map((item) => (item.id === article.id ? article : item));
      localStorage.setItem(STORAGE_KEYS.NEWS, JSON.stringify(updated));
      return updated;
    });
    addAuditLog('NOTICIA_EDITADA', `Notícia "${article.title}" atualizada.`);
    showToast('Notícia atualizada com sucesso!');
  };

  const deleteNewsArticle = (id: string) => {
    setNewsArticles((prev) => {
      const article = prev.find((a) => a.id === id);
      const updated = prev.filter((item) => item.id !== id);
      localStorage.setItem(STORAGE_KEYS.NEWS, JSON.stringify(updated));
      if (article) {
        addAuditLog('NOTICIA_EXCLUIDA', `Notícia "${article.title}" removida.`);
      }
      return updated;
    });
    showToast('Notícia removida.');
  };

  // Events CRUD
  const addEvent = (eventData: Omit<VitalizarEvent, 'id'>) => {
    const newEvent: VitalizarEvent = {
      ...eventData,
      id: `evento-${Date.now()}`,
    };
    setEvents((prev) => {
      const updated = [newEvent, ...prev];
      localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(updated));
      return updated;
    });
    addAuditLog('EVENTO_CRIADO', `Atividade "${newEvent.title}" adicionada ao calendário.`);
    showToast('Evento adicionado ao calendário!');
  };

  const updateEvent = (event: VitalizarEvent) => {
    setEvents((prev) => {
      const updated = prev.map((e) => (e.id === event.id ? event : e));
      localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(updated));
      return updated;
    });
    addAuditLog('EVENTO_EDITADO', `Atividade "${event.title}" atualizada.`);
    showToast('Evento atualizado com sucesso!');
  };

  const deleteEvent = (id: string) => {
    setEvents((prev) => {
      const ev = prev.find((e) => e.id === id);
      const updated = prev.filter((e) => e.id !== id);
      localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(updated));
      if (ev) {
        addAuditLog('EVENTO_EXCLUIDO', `Atividade "${ev.title}" removida do calendário.`);
      }
      return updated;
    });
    showToast('Evento excluído.');
  };

  // RSVPs
  const addRsvp = (rsvpData: Omit<EventRsvpRecord, 'id' | 'confirmationCode' | 'date'>): string => {
    const confirmationCode = `VTL-${rsvpData.eventId.toUpperCase().slice(0, 6)}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newRsvp: EventRsvpRecord = {
      ...rsvpData,
      id: `rsvp-${Date.now()}`,
      confirmationCode,
      date: new Date().toLocaleString('pt-BR'),
    };

    setRsvps((prev) => {
      const updated = [newRsvp, ...prev];
      localStorage.setItem(STORAGE_KEYS.RSVPS, JSON.stringify(updated));
      return updated;
    });

    setEvents((prev) => {
      const updated = prev.map((ev) => {
        if (ev.id === rsvpData.eventId) {
          return withSpotsStatus(
            { ...ev, availableSpots: Math.max(0, ev.availableSpots - rsvpData.spots) },
            ev.availableSpots
          );
        }
        return ev;
      });
      localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(updated));
      return updated;
    });

    addAuditLog('RSVP_REGISTRADO', `Inscrição de ${rsvpData.name} no evento "${rsvpData.eventTitle}" (${rsvpData.spots} vaga(s)).`);
    
    // Asynchronous Firestore sync
    try {
      setDoc(doc(db, 'rsvps', newRsvp.id), newRsvp).catch((err) => {
        console.warn('Aviso: sync Firestore para RSVP falhou:', err);
      });
    } catch (err) {
      console.warn('Erro ao disparar setDoc para RSVP:', err);
    }

    return confirmationCode;
  };

  const deleteRsvp = (id: string) => {
    setRsvps((prev) => {
      const rsvp = prev.find((r) => r.id === id);
      const updated = prev.filter((r) => r.id !== id);
      localStorage.setItem(STORAGE_KEYS.RSVPS, JSON.stringify(updated));
      if (rsvp) {
        addAuditLog('RSVP_CANCELADO', `Inscrição de ${rsvp.name} para "${rsvp.eventTitle}" cancelada.`);
      }
      return updated;
    });
    showToast('Inscrição cancelada.');
  };

  // Projects CRUD
  const addProject = (projectData: Omit<VitalizarProject, 'id'>) => {
    const newProj: VitalizarProject = {
      ...projectData,
      id: `projeto-${Date.now()}`,
    };
    setProjects((prev) => {
      const updated = [newProj, ...prev];
      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(updated));
      return updated;
    });
    addAuditLog('PROJETO_CRIADO', `Novo projeto esportivo "${newProj.name}" cadastrado.`);
    showToast('Novo projeto esportivo cadastrado!');
  };

  const updateProject = (project: VitalizarProject) => {
    setProjects((prev) => {
      const updated = prev.map((p) => (p.id === project.id ? project : p));
      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(updated));
      return updated;
    });
    addAuditLog('PROJETO_ATUALIZADO', `Projeto esportivo "${project.name}" atualizado.`);
    showToast('Projeto esportivo atualizado!');
  };

  const deleteProject = (id: string) => {
    setProjects((prev) => {
      const proj = prev.find((p) => p.id === id);
      const updated = prev.filter((p) => p.id !== id);
      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(updated));
      if (proj) {
        addAuditLog('PROJETO_EXCLUIDO', `Projeto esportivo "${proj.name}" removido.`);
      }
      return updated;
    });
    showToast('Projeto removido.');
  };

  // Gallery Albums CRUD
  const addGalleryAlbum = (albumData: Omit<PastEventPhoto, 'id'>) => {
    const newAlbum: PastEventPhoto = {
      ...albumData,
      id: `album-${Date.now()}`,
    };
    setGalleryAlbums((prev) => {
      const updated = [newAlbum, ...prev];
      localStorage.setItem(STORAGE_KEYS.GALLERY, JSON.stringify(updated));
      return updated;
    });
    addAuditLog('ALBUM_CRIADO', `Álbum de fotos "${newAlbum.title}" adicionado à galeria.`);
    showToast('Álbum de fotos publicado na galeria!');
  };

  const updateGalleryAlbum = (album: PastEventPhoto) => {
    setGalleryAlbums((prev) => {
      const updated = prev.map((a) => (a.id === album.id ? album : a));
      localStorage.setItem(STORAGE_KEYS.GALLERY, JSON.stringify(updated));
      return updated;
    });
    addAuditLog('ALBUM_EDITADO', `Álbum de fotos "${album.title}" atualizado.`);
    showToast('Álbum de fotos atualizado!');
  };

  const deleteGalleryAlbum = (id: string) => {
    setGalleryAlbums((prev) => {
      const alb = prev.find((a) => a.id === id);
      const updated = prev.filter((a) => a.id !== id);
      localStorage.setItem(STORAGE_KEYS.GALLERY, JSON.stringify(updated));
      if (alb) {
        addAuditLog('ALBUM_EXCLUIDO', `Álbum de fotos "${alb.title}" removido.`);
      }
      return updated;
    });
    showToast('Álbum removido da galeria.');
  };

  // Transparency Docs CRUD
  const addTransparencyDoc = (docData: Omit<TransparencyDocument, 'id'>) => {
    const newDoc: TransparencyDocument = {
      ...docData,
      id: `doc-${Date.now()}`,
    };
    setTransparencyDocs((prev) => {
      const updated = [newDoc, ...prev];
      localStorage.setItem(STORAGE_KEYS.TRANSPARENCY, JSON.stringify(updated));
      return updated;
    });
    addAuditLog('DOCUMENTO_TRANSPARENCIA_CRIADO', `Documento MROSC "${newDoc.title}" publicado.`);
    showToast('Documento publicado no Portal da Transparência!');
  };

  const updateTransparencyDoc = (doc: TransparencyDocument) => {
    setTransparencyDocs((prev) => {
      const updated = prev.map((d) => (d.id === doc.id ? doc : d));
      localStorage.setItem(STORAGE_KEYS.TRANSPARENCY, JSON.stringify(updated));
      return updated;
    });
    addAuditLog('DOCUMENTO_TRANSPARENCIA_EDITADO', `Documento "${doc.title}" atualizado.`);
    showToast('Documento atualizado com sucesso!');
  };

  const deleteTransparencyDoc = (id: string) => {
    setTransparencyDocs((prev) => {
      const doc = prev.find((d) => d.id === id);
      const updated = prev.filter((d) => d.id !== id);
      localStorage.setItem(STORAGE_KEYS.TRANSPARENCY, JSON.stringify(updated));
      if (doc) {
        addAuditLog('DOCUMENTO_TRANSPARENCIA_REMOVIDO', `Documento "${doc.title}" removido.`);
      }
      return updated;
    });
    showToast('Documento removido da transparência.');
  };

  // Sponsors CRUD
  const addSponsor = (sponData: Omit<Sponsor, 'id'>) => {
    const newSponsor: Sponsor = {
      ...sponData,
      id: `patrocinador-${Date.now()}`,
    };
    setSponsors((prev) => {
      const updated = [...prev, newSponsor];
      updated.sort((a, b) => (a.order || 0) - (b.order || 0));
      localStorage.setItem(STORAGE_KEYS.SPONSORS, JSON.stringify(updated));
      return updated;
    });
    addAuditLog('PATROCINADOR_CRIADO', `Patrocinador "${newSponsor.name}" (${newSponsor.tierLabel}) adicionado.`);
    showToast('Patrocinador adicionado com sucesso!');
  };

  const updateSponsor = (sponsor: Sponsor) => {
    setSponsors((prev) => {
      const updated = prev.map((s) => (s.id === sponsor.id ? sponsor : s));
      updated.sort((a, b) => (a.order || 0) - (b.order || 0));
      localStorage.setItem(STORAGE_KEYS.SPONSORS, JSON.stringify(updated));
      return updated;
    });
    addAuditLog('PATROCINADOR_EDITADO', `Patrocinador "${sponsor.name}" atualizado.`);
    showToast('Patrocinador atualizado com sucesso!');
  };

  const deleteSponsor = (id: string) => {
    setSponsors((prev) => {
      const spon = prev.find((s) => s.id === id);
      const updated = prev.filter((s) => s.id !== id);
      localStorage.setItem(STORAGE_KEYS.SPONSORS, JSON.stringify(updated));
      if (spon) {
        addAuditLog('PATROCINADOR_REMOVIDO', `Patrocinador "${spon.name}" removido.`);
      }
      return updated;
    });
    // Remove from Firestore if online
    deleteDoc(doc(db, 'sponsors', id)).catch(console.warn);
    showToast('Patrocinador removido.');
  };

  // Contact Messages
  const addContactMessage = (msgData: Omit<ContactMessageRecord, 'id' | 'date' | 'read'>) => {
    const newMsg: ContactMessageRecord = {
      ...msgData,
      id: `msg-${Date.now()}`,
      date: new Date().toLocaleString('pt-BR'),
      read: false,
    };
    setContactMessages((prev) => {
      const updated = [newMsg, ...prev];
      localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(updated));
      return updated;
    });
    addAuditLog('MENSAGEM_RECEBIDA', `Contato recebido de ${msgData.name} - Assunto: ${msgData.subject}`);

    // Asynchronous Firestore sync
    try {
      setDoc(doc(db, 'contact_messages', newMsg.id), newMsg).catch((err) => {
        console.warn('Aviso: sync Firestore para mensagem falhou:', err);
      });
    } catch (err) {
      console.warn('Erro ao disparar setDoc para mensagem:', err);
    }
  };

  const markContactMessageRead = (id: string) => {
    setContactMessages((prev) => {
      const updated = prev.map((m) => (m.id === id ? { ...m, read: true } : m));
      localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(updated));
      return updated;
    });
  };

  const deleteContactMessage = (id: string) => {
    setContactMessages((prev) => {
      const updated = prev.filter((m) => m.id !== id);
      localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(updated));
      return updated;
    });
    showToast('Mensagem excluída.');
  };

  // Reset to Defaults
  const resetAllToDefaults = () => {
    localStorage.removeItem(STORAGE_KEYS.CLUB_INFO);
    localStorage.removeItem(STORAGE_KEYS.SITE_SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.NEWS);
    localStorage.removeItem(STORAGE_KEYS.SPONSORS);
    localStorage.removeItem(STORAGE_KEYS.EVENTS);
    localStorage.removeItem(STORAGE_KEYS.PROJECTS);
    localStorage.removeItem(STORAGE_KEYS.GALLERY);
    localStorage.removeItem(STORAGE_KEYS.TRANSPARENCY);
    // Grava listas vazias (remover a chave faria as inscrições/mensagens de exemplo voltarem ao recarregar)
    localStorage.setItem(STORAGE_KEYS.RSVPS, '[]');
    localStorage.setItem(STORAGE_KEYS.MESSAGES, '[]');

    setClubInfoState(CLUB_INFO);
    setSiteSettingsState(DEFAULT_SITE_SETTINGS);
    setNewsArticles(NEWS_ARTICLES);
    setSponsors(INITIAL_SPONSORS);
    setEvents(VITALIZAR_EVENTS);
    setProjects(VITALIZAR_PROJECTS);
    setGalleryAlbums(INITIAL_GALLERY_ALBUMS);
    setTransparencyDocs(TRANSPARENCY_DOCUMENTS);
    setRsvps([]);
    setContactMessages([]);

    addAuditLog('REDEFINICAO_COMPLETA', 'Todos os dados foram redefinidos para os padrões da Associação Vitalizar.');
    showToast('Dados restaurados para os padrões originais com sucesso!', 'info');
  };

  // Export / Import
  /** Monta o JSON de backup sem registrar auditoria (usado também para medir o tamanho). */
  const buildBackupJson = (): string => {
    const payload = {
      version: '1.3',
      exportDate: new Date().toISOString(),
      clubInfo,
      siteSettings,
      newsArticles,
      sponsors,
      events,
      projects,
      galleryAlbums,
      transparencyDocs,
      rsvps,
      contactMessages,
    };
    return JSON.stringify(payload, null, 2);
  };

  const exportDatabaseJson = (): string => {
    addAuditLog('BACKUP_EXPORTADO', 'Backup completo do site Vitalizar foi exportado.');
    return buildBackupJson();
  };

  const importDatabaseJson = (jsonString: string): { success: boolean; message: string } => {
    try {
      const parsed = JSON.parse(jsonString);
      const validation = validateBackupSchema(parsed);
      if (!validation.valid) {
        return { success: false, message: `Erro de formato: ${validation.errors.join(', ')}` };
      }

      if (parsed.clubInfo) {
        const info = normalizeClubInfo(parsed.clubInfo);
        setClubInfoState(info);
        localStorage.setItem(STORAGE_KEYS.CLUB_INFO, JSON.stringify(info));
      }
      if (parsed.siteSettings) {
        const mergedSettings = { ...DEFAULT_SITE_SETTINGS, ...parsed.siteSettings };
        setSiteSettingsState(mergedSettings);
        localStorage.setItem(STORAGE_KEYS.SITE_SETTINGS, JSON.stringify(mergedSettings));
      }
      if (Array.isArray(parsed.newsArticles)) {
        const news = normalizeNews(parsed.newsArticles);
        setNewsArticles(news);
        localStorage.setItem(STORAGE_KEYS.NEWS, JSON.stringify(news));
      }
      if (Array.isArray(parsed.sponsors)) {
        setSponsors(parsed.sponsors);
        localStorage.setItem(STORAGE_KEYS.SPONSORS, JSON.stringify(parsed.sponsors));
      }
      if (Array.isArray(parsed.events)) {
        setEvents(parsed.events);
        localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(parsed.events));
      }
      if (Array.isArray(parsed.projects)) {
        setProjects(parsed.projects);
        localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(parsed.projects));
      }
      if (Array.isArray(parsed.galleryAlbums)) {
        setGalleryAlbums(parsed.galleryAlbums);
        localStorage.setItem(STORAGE_KEYS.GALLERY, JSON.stringify(parsed.galleryAlbums));
      }
      if (Array.isArray(parsed.transparencyDocs)) {
        setTransparencyDocs(parsed.transparencyDocs);
        localStorage.setItem(STORAGE_KEYS.TRANSPARENCY, JSON.stringify(parsed.transparencyDocs));
      }
      if (Array.isArray(parsed.rsvps)) {
        setRsvps(parsed.rsvps);
        localStorage.setItem(STORAGE_KEYS.RSVPS, JSON.stringify(parsed.rsvps));
      }
      if (Array.isArray(parsed.contactMessages)) {
        setContactMessages(parsed.contactMessages);
        localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(parsed.contactMessages));
      }

      addAuditLog('BACKUP_RESTAURADO', 'Backup importado com sucesso.');
      showToast('Backup importado com sucesso!');
      return { success: true, message: 'Banco de dados restaurado com sucesso!' };
    } catch {
      return { success: false, message: 'Arquivo JSON inválido, corrompido ou excede o limite de memória do navegador.' };
    }
  };

  const clearAuditLogs = () => {
    const initial = [
      createAuditLogEntry(
        'LOGS_LIMPOS',
        'admin@vitalizar.org.br',
        'Histórico de auditoria reiniciado pelo administrador.'
      ),
    ];
    setAuditLogs(initial);
    try {
      localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(initial));
    } catch {
      // ignore quota error
    }
    showToast('Histórico de auditoria limpo com sucesso!', 'info');
  };

  const saveAdminChanges = (payload: {
    clubInfo?: typeof CLUB_INFO;
    siteSettings?: SiteSettings;
    newsArticles?: NewsArticle[];
    sponsors?: Sponsor[];
    events?: VitalizarEvent[];
    projects?: VitalizarProject[];
    galleryAlbums?: PastEventPhoto[];
    transparencyDocs?: TransparencyDocument[];
    rsvps?: EventRsvpRecord[];
    contactMessages?: ContactMessageRecord[];
    logDetails?: string;
    toastMessage?: string;
  }): boolean => {
    try {
      if (payload.clubInfo !== undefined) {
        localStorage.setItem(STORAGE_KEYS.CLUB_INFO, JSON.stringify(payload.clubInfo));
        setClubInfoState(payload.clubInfo);
      }
      if (payload.siteSettings !== undefined) {
        localStorage.setItem(STORAGE_KEYS.SITE_SETTINGS, JSON.stringify(payload.siteSettings));
        setSiteSettingsState(payload.siteSettings);
      }
      if (payload.newsArticles !== undefined) {
        localStorage.setItem(STORAGE_KEYS.NEWS, JSON.stringify(payload.newsArticles));
        setNewsArticles(payload.newsArticles);
      }
      if (payload.sponsors !== undefined) {
        localStorage.setItem(STORAGE_KEYS.SPONSORS, JSON.stringify(payload.sponsors));
        setSponsors(payload.sponsors);
      }
      if (payload.events !== undefined) {
        localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(payload.events));
        setEvents(payload.events);
      }
      if (payload.projects !== undefined) {
        localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(payload.projects));
        setProjects(payload.projects);
      }
      if (payload.galleryAlbums !== undefined) {
        localStorage.setItem(STORAGE_KEYS.GALLERY, JSON.stringify(payload.galleryAlbums));
        setGalleryAlbums(payload.galleryAlbums);
      }
      if (payload.transparencyDocs !== undefined) {
        localStorage.setItem(STORAGE_KEYS.TRANSPARENCY, JSON.stringify(payload.transparencyDocs));
        setTransparencyDocs(payload.transparencyDocs);
      }
      if (payload.rsvps !== undefined) {
        localStorage.setItem(STORAGE_KEYS.RSVPS, JSON.stringify(payload.rsvps));
        setRsvps(payload.rsvps);
      }
      if (payload.contactMessages !== undefined) {
        localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(payload.contactMessages));
        setContactMessages(payload.contactMessages);
      }

      // Asynchronous batch-like sync to Firestore
      try {
        if (payload.clubInfo) {
          setDoc(doc(db, 'club_info', 'main'), payload.clubInfo).catch(console.warn);
        }
        if (payload.siteSettings) {
          setDoc(doc(db, 'site_settings', 'main'), payload.siteSettings).catch(console.warn);
        }
        if (payload.newsArticles) {
          payload.newsArticles.forEach((art) => {
            setDoc(doc(db, 'news_articles', art.id), art).catch(console.warn);
          });
        }
        if (payload.sponsors) {
          payload.sponsors.forEach((spon) => {
            setDoc(doc(db, 'sponsors', spon.id), spon).catch(console.warn);
          });
        }
        if (payload.events) {
          payload.events.forEach((ev) => {
            setDoc(doc(db, 'events', ev.id), ev).catch(console.warn);
          });
        }
        if (payload.projects) {
          payload.projects.forEach((proj) => {
            setDoc(doc(db, 'projects', proj.id), proj).catch(console.warn);
          });
        }
        if (payload.galleryAlbums) {
          payload.galleryAlbums.forEach((alb) => {
            setDoc(doc(db, 'gallery_albums', alb.id), alb).catch(console.warn);
          });
        }
        if (payload.transparencyDocs) {
          payload.transparencyDocs.forEach((d) => {
            setDoc(doc(db, 'transparency_docs', d.id), d).catch(console.warn);
          });
        }
      } catch (firestoreErr) {
        console.warn('Aviso ao sincronizar com Firestore:', firestoreErr);
      }

      addAuditLog(
        'ALTERACOES_SALVAS',
        payload.logDetails || 'Alterações administrativas salvas no banco de dados e publicadas no site.'
      );
      showToast(payload.toastMessage || 'Alterações salvas no Firestore e publicadas!');
      return true;
    } catch {
      showToast(
        'Limite de armazenamento do navegador atingido. Remova anexos muito pesados ou use links externos.',
        'error'
      );
      return false;
    }
  };

  return (
    <ClubDataContext.Provider
      value={{
        clubInfo,
        setClubInfo,
        siteSettings,
        setSiteSettings,
        newsArticles,
        addNewsArticle,
        updateNewsArticle,
        deleteNewsArticle,
        sponsors,
        addSponsor,
        updateSponsor,
        deleteSponsor,
        events,
        addEvent,
        updateEvent,
        deleteEvent,
        rsvps,
        addRsvp,
        deleteRsvp,
        projects,
        addProject,
        updateProject,
        deleteProject,
        galleryAlbums,
        addGalleryAlbum,
        updateGalleryAlbum,
        deleteGalleryAlbum,
        transparencyDocs,
        addTransparencyDoc,
        updateTransparencyDoc,
        deleteTransparencyDoc,
        contactMessages,
        addContactMessage,
        markContactMessageRead,
        deleteContactMessage,
        auditLogs,
        addAuditLog,
        clearAuditLogs,
        resetAllToDefaults,
        exportDatabaseJson,
        buildBackupJson,
        importDatabaseJson,
        saveAdminChanges,
        toasts,
        showToast,
        removeToast,
        isFirebaseActive,
      }}
    >
      {children}

      {/* Floating Global Toasts for Instant UX Feedback (região sempre montada para leitores de tela anunciarem) */}
      <div
        role="status"
        aria-live="polite"
        className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 max-w-sm pointer-events-none"
      >
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`pointer-events-auto p-4 rounded-xl shadow-2xl text-xs font-semibold flex items-center justify-between gap-3 text-white border transition-opacity animate-in slide-in-from-bottom-3 duration-200 ${
                toast.type === 'error'
                  ? 'bg-rose-600 border-rose-700'
                  : toast.type === 'info'
                  ? 'bg-[#0a1e36] border-sky-400'
                  : 'bg-emerald-700 border-emerald-600'
              }`}
            >
              <span>{toast.message}</span>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="p-1 hover:bg-white/20 rounded-md transition-colors cursor-pointer"
                aria-label="Fechar notificação"
              >
                ✕
              </button>
            </div>
          ))}
      </div>
    </ClubDataContext.Provider>
  );
};

export const useClubData = () => {
  const context = useContext(ClubDataContext);
  if (!context) {
    throw new Error('useClubData must be used within a ClubDataProvider');
  }
  return context;
};
