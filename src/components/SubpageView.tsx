import React, { useState, useEffect, useId } from 'react';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Phone,
  Mail,
  Shield,
  Award,
  Trophy,
  CheckCircle2,
  Send,
  Scale,
  FileCheck2,
  Search,
  X,
  Share2,
  ArrowRight,
  Download,
  Paperclip,
  FileText,
  Tag,
} from 'lucide-react';
import { FACILITY_POLOS } from '../data/clubeData.ts';
import { useClubData } from '../context/ClubDataContext.tsx';
import { NewsArticle } from '../types/index.ts';
import { sortNewsByDate } from '../utils/newsSort.ts';
import { EventsCalendar } from './EventsCalendar.tsx';
import { SponsorsSection } from './SponsorsSection.tsx';
import { useDialog } from '../hooks/useDialog.ts';

interface SubpageViewProps {
  pageId: string;
  subId?: string;
  onBack: () => void;
  onOpenInscricoes: () => void;
}

export const SubpageView: React.FC<SubpageViewProps> = ({
  pageId,
  subId,
  onBack,
  onOpenInscricoes,
}) => {
  const {
    clubInfo,
    siteSettings,
    newsArticles,
    projects,
    transparencyDocs,
    addContactMessage,
    showToast,
  } = useClubData();
  const [activeTab, setActiveTab] = useState<string>(subId || 'quem-somos');
  const [contactSubject, setContactSubject] = useState(
    subId === 'parcerias' ? 'Parcerias' : 'Dúvidas Gerais'
  );
  const [contactSent, setContactSent] = useState(false);

  // News subpage state
  const [newsFilterCategory, setNewsFilterCategory] = useState<string>('all');
  const [newsSearch, setNewsSearch] = useState('');
  const [selectedNewsArticle, setSelectedNewsArticle] = useState<NewsArticle | null>(null);
  const newsDialogRef = useDialog(selectedNewsArticle !== null, () => setSelectedNewsArticle(null));
  const newsDialogTitleId = useId();

  // Ids para associar rótulos e campos do formulário de contato
  const fieldId = useId();
  const subjectId = `${fieldId}-assunto`;
  const nameId = `${fieldId}-nome`;
  const emailId = `${fieldId}-email`;
  const phoneId = `${fieldId}-telefone`;
  const messageId = `${fieldId}-mensagem`;

  // Sync subId changes when navigating across subpages
  useEffect(() => {
    const validInstitucionalTabs = [
      'quem-somos',
      'missao-valores',
      'diretoria-conselhos',
      'sede-polos',
      'estatuto-social',
    ];
    if (pageId === 'a-vitalizar') {
      if (subId && validInstitucionalTabs.includes(subId)) {
        setActiveTab(subId);
      } else {
        setActiveTab('quem-somos');
      }
    }
    if (pageId === 'contato') {
      if (subId === 'parcerias') {
        setContactSubject('Parcerias');
      } else if (subId === 'ouvidoria') {
        setContactSubject('Ouvidoria');
      }
    }
    if (pageId === 'noticias' && subId) {
      const found = newsArticles.find((a) => a.id === subId);
      if (found) {
        setSelectedNewsArticle(found);
      }
    }
  }, [pageId, subId, newsArticles]);

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    addContactMessage({
      name,
      email,
      phone,
      subject: contactSubject,
      message,
    });
    showToast('Mensagem enviada com sucesso!');
    setContactSent(true);
    // Limpa o formulário para evitar reenvio duplicado ao clicar em "Enviar Nova Mensagem"
    setName('');
    setPhone('');
    setMessage('');
  };

  // Abre a notícia indicada (ex: resultado de busca) e rola até o item indicado (projeto/documento)
  useEffect(() => {
    if (!subId) return;
    if (pageId === 'noticias') {
      const article = newsArticles.find((a) => a.id === subId);
      if (article) setSelectedNewsArticle(article);
      return;
    }
    const timer = setTimeout(() => {
      document.getElementById(subId)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 150);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageId, subId]);

  const renderVitalizarInstitucional = () => (
    <div className="space-y-8">
      {/* Clean Editorial Header */}
      <div className="bg-white p-8 rounded-2xl border border-slate-200/90">
        <p className="text-xs font-semibold text-[#0284c7] tracking-wide">
          Institucional · Rio Marinho, Cariacica/ES
        </p>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
          Associação Esportiva Vitalizar
        </h1>
        <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-3xl leading-relaxed">
          Entidade civil sem fins lucrativos dedicada ao desenvolvimento esportivo, promoção da saúde preventiva, cultura e inclusão comunitária em Cariacica/ES.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6 overflow-x-auto text-xs font-semibold">
        {[
          { id: 'quem-somos', label: 'Quem Somos' },
          { id: 'missao-valores', label: 'Missão e Valores' },
          { id: 'diretoria-conselhos', label: 'Diretoria e Governança' },
          { id: 'sede-polos', label: 'Polos de Atendimento' },
          { id: 'estatuto-social', label: 'Estatuto Social' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            aria-pressed={activeTab === tab.id}
            className={`pb-3 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === tab.id
                ? 'border-[#0284c7] text-slate-900 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      {activeTab === 'quem-somos' && (
        <div className="space-y-4 text-sm text-slate-700 leading-relaxed bg-white p-6 sm:p-8 rounded-2xl border border-slate-200">
          <h2 className="text-lg font-bold text-slate-900">Nossa Origem e Propósito</h2>
          <p>
            Sediada no bairro Rio Marinho, em Cariacica/ES, a{' '}
            <strong className="text-slate-900">Associação Esportiva Vitalizar</strong> atua como agente de transformação comunitária por meio do esporte educacional, lazer e saúde preventiva.
          </p>
          <p>
            Nossos programas atendem gratuitamente crianças, adolescentes, adultos, pessoas idosas e pessoas com deficiência, promovendo escolinhas de base, oficinas culturais e circuitos de qualidade de vida.
          </p>
        </div>
      )}

      {activeTab === 'missao-valores' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-3">
            <Trophy className="w-5 h-5 text-[#0284c7]" />
            <h3 className="text-base font-bold text-slate-900">Missão</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Fomentar a prática esportiva, a cultura, a promoção da saúde e o desenvolvimento humano, transformando a realidade de crianças, jovens e famílias em Cariacica.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-3">
            <Award className="w-5 h-5 text-[#0284c7]" />
            <h3 className="text-base font-bold text-slate-900">Visão</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Ser referência em gestão transparente e impacto comunitário na execução de projetos socioesportivos e de saúde preventiva no Espírito Santo.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-3">
            <Shield className="w-5 h-5 text-[#0284c7]" />
            <h3 className="text-base font-bold text-slate-900">Valores</h3>
            <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-4 leading-relaxed">
              <li>Ética e transparência ativa</li>
              <li>Inclusão social e respeito à diversidade</li>
              <li>Valorização comunitária e trabalho em equipe</li>
            </ul>
          </div>
        </div>
      )}

      {activeTab === 'diretoria-conselhos' && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 space-y-6">
          <h3 className="text-lg font-bold text-slate-900">Diretoria Executiva e Conselho Fiscal</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-600">
            <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span className="font-bold text-sm text-slate-900 block">
                Diretoria Executiva (Mandato 2026–2030)
              </span>
              <p>Presidente: <strong className="text-slate-900">{clubInfo.president}</strong></p>
              <p>Composição estatutária: Vice-Presidente, 1º e 2º Secretários e Tesoureiro.</p>
            </div>

            <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span className="font-bold text-sm text-slate-900 block">
                Conselho Fiscal & Assessoria
              </span>
              <p>Assessoria Jurídica: <strong className="text-slate-900">{clubInfo.legalCounsel}</strong></p>
              <p>Fiscalização contábil semestral e emissão de pareceres à Assembleia Geral.</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'sede-polos' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FACILITY_POLOS.map((polo) => (
            <div
              key={polo.id}
              className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col justify-between"
            >
              <img
                src={polo.imageUrl}
                alt={polo.name}
                referrerPolicy="no-referrer"
                className="h-44 w-full object-cover"
              />
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">{polo.name}</h3>
                  <p className="text-xs text-slate-500 mt-1">{polo.address}</p>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">{polo.description}</p>
                </div>
                <button
                  type="button"
                  onClick={onOpenInscricoes}
                  className="mt-4 w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  Inscrever-se neste Polo
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'estatuto-social' && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 space-y-6 text-xs text-slate-600 leading-relaxed">
          <div className="border-b border-slate-200 pb-4">
            <h3 className="text-base font-bold text-slate-900">
              Síntese do Estatuto Social Consolidado ({clubInfo.statuteDate})
            </h3>
            <p className="text-slate-500 mt-1">
              CNPJ {clubInfo.cnpj} · Sede: {clubInfo.address}, {clubInfo.municipality}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
              <span className="font-bold text-slate-900 block">Finalidade Social</span>
              <p>
                Promoção gratuita do esporte educacional, iniciação esportiva, saúde preventiva, cultura e inclusão social em Cariacica/ES.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
              <span className="font-bold text-slate-900 block">Governança e Transparência</span>
              <p>
                Prestação de contas ativa de parcerias e recursos públicos em conformidade com o Marco Regulatório das Organizações da Sociedade Civil (Lei 13.019/2014).
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderProjetos = () => (
    <div className="space-y-8">
      <div className="bg-white p-8 rounded-2xl border border-slate-200/90 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-[#0284c7] tracking-wide">
            Esporte, Saúde & Comunidade
          </p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Projetos e Modalidades
          </h1>
          <p className="mt-2 text-sm text-slate-600 max-w-2xl leading-relaxed">
            Turmas regulares gratuitas para crianças, adolescentes, adultos e idosos nos polos de Cariacica/ES.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenInscricoes}
          className="px-5 py-2.5 bg-[#0284c7] hover:bg-[#0369a1] text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer shrink-0 self-start sm:self-auto"
        >
          Inscrever-se em Turma
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((proj) => (
          <div
            key={proj.id}
            id={proj.id}
            className="bg-white rounded-xl border border-slate-200/90 overflow-hidden flex flex-col justify-between"
          >
            <div className="relative aspect-16/10 bg-slate-100">
              <img
                src={proj.imageUrl}
                alt={proj.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <div className="text-xs text-slate-500">
                  <span>{proj.targetAudience}</span>
                  <span aria-hidden="true"> · </span>
                  <span>{proj.location}</span>
                </div>
                <h3 className="font-bold text-base text-slate-900 mt-1">{proj.name}</h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{proj.description}</p>
              </div>

              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Clock className="w-3.5 h-3.5 text-[#0284c7]" />
                  <span>{proj.schedule}</span>
                </div>
                {(proj.coordinator || proj.fundingSource) && (
                  <div className="text-[11px] text-slate-500 space-y-0.5">
                    {proj.coordinator && <p>Coordenação: {proj.coordinator}</p>}
                    {proj.fundingSource && <p>Fomento: {proj.fundingSource}</p>}
                  </div>
                )}

                {proj.attachments && proj.attachments.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    {proj.attachments.map((att) => (
                      <a
                        key={att.id}
                        href={att.dataUrl}
                        download={att.name}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full px-3 py-1.5 bg-sky-50/80 hover:bg-sky-100 text-[#0284c7] rounded-lg border border-sky-200/80 text-[11px] font-semibold flex items-center justify-between gap-2 transition-colors"
                      >
                        <span className="truncate flex items-center gap-1.5">
                          <Paperclip className="w-3 h-3 shrink-0" />
                          {att.name}
                        </span>
                        <Download className="w-3 h-3 shrink-0" />
                      </a>
                    ))}
                  </div>
                )}

                <button
                  type="button"
                  onClick={onOpenInscricoes}
                  className="w-full py-2.5 bg-slate-100 hover:bg-[#0284c7] text-slate-800 hover:text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer"
                >
                  Solicitar Vaga
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTransparencia = () => (
    <div className="space-y-8">
      <div className="bg-white p-8 rounded-2xl border border-slate-200/90">
        <p className="text-xs font-semibold text-[#0284c7] tracking-wide">
          Acesso Público · Lei Federal nº 13.019/2014
        </p>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
          Portal da Transparência
        </h1>
        <p className="mt-2 text-sm text-slate-600 max-w-3xl leading-relaxed">
          Consulta pública aos documentos institucionais, certidões de regularidade, relatórios de atividades e prestação de contas da Associação Esportiva Vitalizar (CNPJ {clubInfo.cnpj}).
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-4">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
            <FileCheck2 className="w-5 h-5 text-[#0284c7]" />
            <h2>Documentos Oficiais e Certidões</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {transparencyDocs.map((doc) => {
              const fileHref = doc.fileDataUrl || doc.downloadUrl;
              return (
                <div key={doc.id} id={doc.id} className="py-3.5 first:pt-0 last:pb-0 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-xs text-slate-900">{doc.title}</span>
                    <span className="text-xs text-[#0284c7] font-semibold shrink-0">
                      {doc.fileType || 'PDF'} · {doc.badge}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">{doc.description}</p>
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <span className="text-[11px] text-slate-400">
                      Atualizado em {doc.date}
                      {doc.fileSize ? ` · ${doc.fileSize}` : ''}
                    </span>
                    {fileHref && (
                      <a
                        href={fileHref}
                        download={doc.fileName || `${doc.title}.${(doc.fileType || 'pdf').toLowerCase()}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-sky-50 hover:bg-[#0284c7] text-[#0284c7] hover:text-white rounded-md text-[11px] font-semibold transition-colors"
                      >
                        <Download className="w-3 h-3" />
                        <span>Baixar {doc.fileName ? `(${doc.fileName})` : 'Arquivo'}</span>
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-4">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
            <Scale className="w-5 h-5 text-[#0284c7]" />
            <h2>Governança e Controle Social</h2>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Todos os recursos provenientes de parcerias públicas e termos de fomento são geridos em contas bancárias específicas e auditados pelo Conselho Fiscal.
          </p>
          <ul className="space-y-2 list-disc pl-4 text-xs text-slate-600">
            <li>Divulgação de planos de trabalho e relatórios de execução</li>
            <li>Contabilidade individualizada por projeto socioesportivo</li>
            <li>Atendimento gratuito e universal à comunidade de Cariacica/ES</li>
          </ul>
        </div>
      </div>
    </div>
  );

  const renderContato = () => (
    <div className="space-y-8">
      <div className="bg-white p-8 rounded-2xl border border-slate-200/90">
        <p className="text-xs font-semibold text-[#0284c7] tracking-wide">
          Atendimento & Ouvidoria
        </p>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
          Fale com a Vitalizar
        </h1>
        <p className="mt-2 text-sm text-slate-600 max-w-2xl leading-relaxed">
          Tire dúvidas sobre inscrições, apresente propostas de parceria ou fale diretamente com a coordenação.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-xl border border-slate-200">
          {contactSent ? (
            <div className="py-10 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-[#0284c7] mx-auto" aria-hidden="true" />
              <h3 className="text-lg font-bold text-slate-900">Mensagem Enviada!</h3>
              <p className="text-xs text-slate-600 max-w-md mx-auto">
                Recebemos sua solicitação e responderemos pelo e-mail <strong>{email}</strong>.
              </p>
              <button
                type="button"
                onClick={() => setContactSent(false)}
                className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg cursor-pointer"
              >
                Enviar Nova Mensagem
              </button>
            </div>
          ) : (
            <form onSubmit={handleSendMessage} className="space-y-4">
              <div>
                <label htmlFor={subjectId} className="block text-xs font-semibold text-slate-700 mb-1">
                  Assunto *
                </label>
                <select
                  id={subjectId}
                  name="subject"
                  value={contactSubject}
                  onChange={(e) => setContactSubject(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-600"
                >
                  {(siteSettings.contactSubjects && siteSettings.contactSubjects.length > 0
                    ? siteSettings.contactSubjects
                    : [
                        'Dúvidas Gerais',
                        'Inscrição em Projetos',
                        'Voluntariado',
                        'Parcerias',
                        'Ouvidoria',
                      ]
                  ).map((subj) => (
                    <option key={subj} value={subj}>
                      {subj}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor={nameId} className="block text-xs font-semibold text-slate-700 mb-1">
                    Nome Completo *
                  </label>
                  <input
                    id={nameId}
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Seu nome"
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-600"
                  />
                </div>
                <div>
                  <label htmlFor={emailId} className="block text-xs font-semibold text-slate-700 mb-1">
                    E-mail *
                  </label>
                  <input
                    id={emailId}
                    name="email"
                    type="email"
                    autoComplete="email"
                    spellCheck={false}
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seuemail@exemplo.com"
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-600"
                  />
                </div>
              </div>

              <div>
                <label htmlFor={phoneId} className="block text-xs font-semibold text-slate-700 mb-1">
                  Telefone / WhatsApp *
                </label>
                <input
                  id={phoneId}
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  inputMode="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(27) 99999-9999"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-600"
                />
              </div>

              <div>
                <label htmlFor={messageId} className="block text-xs font-semibold text-slate-700 mb-1">
                  Mensagem *
                </label>
                <textarea
                  id={messageId}
                  name="message"
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Como podemos ajudar?"
                  className="w-full p-3.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-600"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#0284c7] hover:bg-[#0369a1] text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" aria-hidden="true" />
                <span>Enviar Mensagem</span>
              </button>
            </form>
          )}
        </div>

        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-4">
            <h3 className="font-bold text-sm text-slate-900">Canais de Atendimento</h3>
            <div className="space-y-3 text-xs text-slate-600">
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#0284c7]" />
                <span className="font-medium text-slate-900">{clubInfo.phones.join(' · ')}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#0284c7]" />
                <span>{clubInfo.email}</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-[#0284c7] shrink-0 mt-0.5" />
                <span>{clubInfo.hours.secretaria}</span>
              </div>
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#0284c7] shrink-0 mt-0.5" />
                <span>
                  {clubInfo.address} · CEP {clubInfo.cep} · {clubInfo.municipality}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Show Sponsors & Partnership showcase in Contact/Parcerias */}
      <div className="pt-4">
        <SponsorsSection />
      </div>
    </div>
  );

  const renderNoticias = () => {
    const dynamicCategories =
      siteSettings.newsCategories && siteSettings.newsCategories.length > 0
        ? siteSettings.newsCategories
        : ['Institucional', 'Esporte Educacional', 'Saúde & Qualidade de Vida', 'Transparência'];

    const categories = [
      { id: 'all', label: 'Todas' },
      ...dynamicCategories.map((cat) => ({ id: cat, label: cat })),
    ];

    const filteredArticles = sortNewsByDate(newsArticles).filter((art) => {
      const matchCat = newsFilterCategory === 'all' || art.category === newsFilterCategory;
      const matchSearch =
        !newsSearch.trim() ||
        art.title.toLowerCase().includes(newsSearch.toLowerCase()) ||
        art.summary.toLowerCase().includes(newsSearch.toLowerCase());
      return matchCat && matchSearch;
    });

    return (
      <div className="space-y-8">
        <div className="bg-white p-8 rounded-2xl border border-slate-200/90">
          <p className="text-xs font-semibold text-[#0284c7] tracking-wide">
            Comunicação Oficial
          </p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Notícias e Comunicados
          </h1>
          <p className="mt-2 text-sm text-slate-600 max-w-2xl leading-relaxed">
            Acompanhe as ações comunitárias, eventos realizados e novidades da Associação Esportiva Vitalizar.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="inline-flex flex-wrap items-center gap-1 p-1 bg-slate-200/70 rounded-xl self-start">
            {categories.map((cat) => {
              const isSelected = newsFilterCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setNewsFilterCategory(cat.id)}
                  aria-pressed={isSelected}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
            <input
              type="search"
              name="busca-noticias"
              aria-label="Buscar notícias"
              autoComplete="off"
              value={newsSearch}
              onChange={(e) => setNewsSearch(e.target.value)}
              placeholder="Buscar notícia…"
              className="w-full text-xs pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-600 focus:outline-none"
            />
            {newsSearch && (
              <button
                type="button"
                onClick={() => setNewsSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                aria-label="Limpar busca"
              >
                <X className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>

        {/* News Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map((article) => (
            <button
              key={article.id}
              type="button"
              onClick={() => setSelectedNewsArticle(article)}
              className="group text-left bg-white rounded-xl overflow-hidden border border-slate-200/90 hover:border-slate-300 transition-colors flex flex-col justify-between cursor-pointer"
            >
              <div className="relative aspect-16/10 w-full overflow-hidden bg-slate-100">
                <img
                  src={article.imageUrl}
                  alt={article.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4 w-full">
                <div>
                  <div className="text-xs text-slate-500">
                    <span>{article.category}</span>
                    <span aria-hidden="true"> · </span>
                    <span>{article.date}</span>
                  </div>

                  <h2 className="text-base font-bold text-slate-900 group-hover:text-[#0284c7] transition-colors leading-snug line-clamp-2 mt-1.5">
                    {article.title}
                  </h2>

                  <p className="mt-2 text-xs text-slate-600 line-clamp-3 leading-relaxed">
                    {article.summary}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-[#0284c7] w-full">
                  <span>Ler matéria</span>
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Article Reader Modal */}
        {selectedNewsArticle && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
            <div
              ref={newsDialogRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby={newsDialogTitleId}
              className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto overscroll-contain shadow-2xl border border-slate-200"
            >
              <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                <div className="text-xs text-slate-500 font-medium">
                  <span>{selectedNewsArticle.category}</span>
                  <span aria-hidden="true"> · </span>
                  <span>{selectedNewsArticle.date}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(window.location.href);
                        showToast('Link copiado!');
                      } catch {
                        showToast('Não foi possível copiar o link.');
                      }
                    }}
                    className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                    aria-label="Compartilhar notícia"
                  >
                    <Share2 className="w-4 h-4" aria-hidden="true" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedNewsArticle(null)}
                    className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                    aria-label="Fechar notícia"
                  >
                    <X className="w-5 h-5" aria-hidden="true" />
                  </button>
                </div>
              </div>

              <div className="relative aspect-16/9 bg-slate-100">
                <img
                  src={selectedNewsArticle.imageUrl}
                  alt={selectedNewsArticle.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="p-6 sm:p-8 space-y-4">
                <h2 id={newsDialogTitleId} className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-tight">
                  {selectedNewsArticle.title}
                </h2>

                {selectedNewsArticle.author && (
                  <p className="text-xs text-slate-500">Por {selectedNewsArticle.author}</p>
                )}

                <p className="text-sm font-medium text-slate-600 pb-4 border-b border-slate-200">
                  {selectedNewsArticle.summary}
                </p>

                <div className="space-y-3 text-sm text-slate-700 leading-relaxed">
                  {selectedNewsArticle.content && selectedNewsArticle.content.length > 0 ? (
                    selectedNewsArticle.content.map((p, idx) => <p key={idx}>{p}</p>)
                  ) : (
                    <p>{selectedNewsArticle.summary}</p>
                  )}
                </div>

                {selectedNewsArticle.attachments && selectedNewsArticle.attachments.length > 0 && (
                  <div className="pt-4 border-t border-slate-200 space-y-2.5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <Paperclip className="w-3.5 h-3.5 text-[#0284c7]" aria-hidden="true" />
                      <span>Arquivos Anexados ({selectedNewsArticle.attachments.length})</span>
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {selectedNewsArticle.attachments.map((att) => (
                        <a
                          key={att.id}
                          href={att.dataUrl}
                          download={att.name}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-3 bg-slate-50 hover:bg-sky-50 border border-slate-200 hover:border-sky-300 rounded-xl flex items-center justify-between gap-3 transition-colors group"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <FileText className="w-4 h-4 text-[#0284c7] shrink-0" aria-hidden="true" />
                            <div className="min-w-0">
                              <span className="text-xs font-bold text-slate-800 group-hover:text-[#0284c7] truncate block">
                                {att.name}
                              </span>
                              <span className="text-[11px] text-slate-500">
                                {att.type} · {att.size}
                              </span>
                            </div>
                          </div>
                          <Download className="w-4 h-4 text-slate-400 group-hover:text-[#0284c7] shrink-0" aria-hidden="true" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="py-10 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 hover:text-slate-950 transition-colors cursor-pointer bg-white px-3.5 py-2 rounded-lg border border-slate-200"
          >
            <ArrowLeft className="w-4 h-4 text-[#0284c7]" aria-hidden="true" />
            <span>Voltar ao Início</span>
          </button>
        </div>

        {pageId === 'a-vitalizar' && renderVitalizarInstitucional()}
        {pageId === 'projetos' && renderProjetos()}
        {pageId === 'transparencia' && renderTransparencia()}
        {pageId === 'contato' && renderContato()}
        {pageId === 'atividades' && renderProjetos()}
        {pageId === 'noticias' && renderNoticias()}
        {pageId === 'patrocinadores' && (
          <div className="space-y-8">
            <SponsorsSection
              title="Rede de Patrocinadores & Parceiros Institucionais"
              subtitle="Conheça as empresas, órgãos públicos e instituições que viabilizam o esporte gratuito e o impacto social da Associação Esportiva Vitalizar em Cariacica/ES."
            />
          </div>
        )}
        {pageId === 'eventos' && (
          <EventsCalendar
            onOpenInscricoes={onOpenInscricoes}
            initialCategory={
              subId === 'clinica_esportiva' ||
              subId === 'oficina_comunitaria' ||
              subId === 'reuniao_associacao'
                ? subId
                : 'all'
            }
          />
        )}
        {pageId !== 'a-vitalizar' &&
          pageId !== 'projetos' &&
          pageId !== 'transparencia' &&
          pageId !== 'contato' &&
          pageId !== 'atividades' &&
          pageId !== 'noticias' &&
          pageId !== 'patrocinadores' &&
          pageId !== 'eventos' &&
          renderVitalizarInstitucional()}
      </div>
    </div>
  );
};

