export interface AttachedFile {
  id: string;
  name: string;
  size: string;
  type: string;
  mimeType: string;
  dataUrl: string;
  uploadedAt: string;
}

export interface NavSubItem {
  id: string;
  label: string;
  description?: string;
  isPdf?: boolean;
  pdfUrl?: string;
}

export interface NavItem {
  id: string;
  label: string;
  subItems?: NavSubItem[];
  highlight?: boolean;
}

export interface HeroBanner {
  id: string;
  title: string;
  subtitle: string;
  highlightText?: string;
  tag?: string;
  date?: string;
  location?: string;
  imageUrl: string;
  mobileImageUrl?: string;
  ctaText: string;
  actionId: string;
  badge?: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  date: string;
  category: string;
  summary: string;
  content: string[];
  imageUrl: string;
  author?: string;
  views?: number;
  tags?: string[];
  attachments?: AttachedFile[];
}

export interface GalleryItem {
  id: string;
  title: string;
  subtitle: string;
  coverImage: string;
  photosCount: number;
  description: string;
  images: { url: string; caption: string }[];
}

export interface PastEventPhoto {
  id: string;
  title: string;
  category:
    | 'Festivais Esportivos'
    | 'Categorias de Base'
    | 'Saúde & Vida Ativa'
    | 'Inclusão & Comunidade'
    | string;
  date: string;
  location: string;
  coverUrl: string;
  caption: string;
  albumPhotos: {
    url: string;
    caption: string;
  }[];
}

export interface ProjectStaffMember {
  id: string;
  name: string;
  role: string;
  cref?: string;
  photoUrl: string;
  bio: string;
  specialties: string[];
  contact?: string;
}

export interface PlayerAttributes {
  pace: number; // VEL (Velocidade)
  shooting: number; // FIN (Finalização)
  passing: number; // PAS (Passe)
  dribbling: number; // DRI (Drible)
  defending: number; // DEF (Defesa)
  physical: number; // FIS (Físico)
  overall: number; // OVR Geral
}

export interface PlayerHighlightVideo {
  id: string;
  title: string;
  duration: string;
  videoUrl?: string;
  youtubeId?: string;
  thumbnailUrl: string;
  description: string;
  categoryTag?: string;
}

export interface ProjectParticipant {
  id: string;
  name: string;
  nickname?: string;
  photoUrl: string;
  jerseyNumber: number;
  position: string;
  positionGroup: 'ataque' | 'meio' | 'defesa' | 'goleiro';
  preferredFoot: 'Destro' | 'Canhoto' | 'Ambidestro';
  age: number;
  birthDate: string;
  category: string;
  height: string;
  weight: string;
  cardTier: 'ouro' | 'diamante' | 'promessa' | 'destaque' | 'prata';
  stats: PlayerAttributes;
  schoolInfo: {
    schoolName: string;
    grade: string;
    turn: 'Matutino' | 'Vespertino' | 'Integral';
    attendanceRate: string;
  };
  highlights: string[];
  scoutReport: {
    summary: string;
    strengths: string[];
    developmentAreas: string[];
    scoutRating: string;
  };
  photos: string[];
  videos: PlayerHighlightVideo[];
}

export interface ProjectFunctioning {
  overview: string;
  methodology: string;
  requirements: string[];
  scheduleDetails: {
    day: string;
    hours: string;
    polo: string;
    modality: string;
  }[];
  benefits: string[];
}

export interface VitalizarProject {
  id: string;
  name: string;
  category:
    | 'esporte_educacional'
    | 'saude_qualidade_vida'
    | 'cultura_cidadania'
    | 'inclusao_pcd'
    | 'terceira_idade'
    | string;
  targetAudience: string;
  description: string;
  schedule: string;
  location: string;
  coordinator: string;
  fundingSource: string;
  imageUrl: string;
  shieldUrl?: string;
  motto?: string;
  totalSpots?: number;
  filledSpots?: number;
  availableSpots?: number;
  functioning?: ProjectFunctioning;
  staff?: ProjectStaffMember[];
  participants?: ProjectParticipant[];
  tags?: string[];
  attachments?: AttachedFile[];
}

export interface VideoShowcase {
  id: string;
  title: string;
  duration: string;
  category: string;
  youtubeId: string;
  thumbnail: string;
}

export interface FacilityPolo {
  id: string;
  name: string;
  type: 'polo_principal' | 'quadra_poliesportiva' | 'sala_atividades' | 'espaco_saude';
  capacity: string;
  maxGuests: number;
  address: string;
  description: string;
  includedItems: string[];
  imageUrl: string;
  rules: string[];
}

export interface TransparencyDocument {
  id: string;
  title: string;
  category:
    | 'estatuto'
    | 'cnpj'
    | 'governanca'
    | 'emendas'
    | 'fomento'
    | 'prestacao_contas'
    | 'certidoes';
  date: string;
  description: string;
  fileType: string;
  badge: string;
  downloadUrl?: string;
  fileName?: string;
  fileSize?: string;
  fileDataUrl?: string;
  period?: string;
  protocolNumber?: string;
  responsible?: string;
  financialValue?: string;
  summaryPoints?: string[];
}

export interface SocioTorcedorTier {
  id: string;
  name: string;
  count: number;
  monthlyContribution: string;
  benefitSummary: string;
}

export interface TransparencyDashboardConfig {
  socioTorcedoresTotal: number;
  socioTorcedoresGoal: number;
  socioTorcedoresNewMonth: number;
  socioTorcedoresRetentionRate: string;
  socioTorcedoresTiers: SocioTorcedorTier[];
  socioTorcedoresMonthlyGrowth: { month: string; count: number }[];
  fiscalYear: string;
  totalRevenue: number;
  totalInvested: number;
  directBeneficiaries: number;
  auditStatus: string;
  lastAuditDate: string;
  allocationBreakdown: {
    label: string;
    percentage: number;
    amount: number;
    description: string;
  }[];
  revenueSources: {
    label: string;
    percentage: number;
    amount: number;
  }[];
}

export type EventCategory = 'clinica_esportiva' | 'oficina_comunitaria' | 'reuniao_associacao';

export interface VitalizarEvent {
  id: string;
  title: string;
  category: EventCategory;
  categoryLabel: string;
  date: string; // YYYY-MM-DD
  formattedDate: string;
  dayNumber: string;
  monthShort: string;
  time: string;
  location: string;
  address: string;
  targetAudience: string;
  coordinator: string;
  capacity: number;
  availableSpots: number;
  isFree: boolean;
  description: string;
  prerequisites?: string[];
  scheduleHighlights?: string[];
  status: 'confirmado' | 'inscricoes_abertas' | 'vagas_limitadas' | 'em_breve';
  attachments?: AttachedFile[];
}

export type SponsorTier = 'master' | 'ouro' | 'prata' | 'bronze' | 'apoio';

export interface Sponsor {
  id: string;
  name: string;
  tier: SponsorTier;
  tierLabel: string;
  logoUrl: string;
  websiteUrl?: string;
  description: string;
  category: string;
  active: boolean;
  order: number;
}

export interface SiteSettings {
  newsCategories: string[];
  eventCategories: string[];
  projectCategories: string[];
  galleryCategories: string[];
  sponsorCategories: string[];
  contactSubjects: string[];
  siteTags: string[];
  searchSuggestions: string[];
  announcementBanner: {
    enabled: boolean;
    text: string;
    linkLabel: string;
    linkTarget: string;
  };
  seoTitle: string;
  seoDescription: string;
  whatsappNumber: string;
  enableRegistrations: boolean;
  enableSponsorsSection: boolean;
  enableFloatingWhatsapp: boolean;
  enableSearch: boolean;
  enableRsvpModal: boolean;
  transparencyDashboard?: TransparencyDashboardConfig;
}



