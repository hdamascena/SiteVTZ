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
    | 'Inclusão & Comunidade';
  date: string;
  location: string;
  coverUrl: string;
  caption: string;
  albumPhotos: {
    url: string;
    caption: string;
  }[];
}

export interface VitalizarProject {
  id: string;
  name: string;
  category:
    | 'esporte_educacional'
    | 'saude_qualidade_vida'
    | 'cultura_cidadania'
    | 'inclusao_pcd'
    | 'terceira_idade';
  targetAudience: string;
  description: string;
  schedule: string;
  location: string;
  coordinator: string;
  fundingSource: string;
  imageUrl: string;
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
