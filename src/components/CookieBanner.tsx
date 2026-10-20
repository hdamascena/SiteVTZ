import React, { useState } from 'react';
import { ShieldCheck, X } from 'lucide-react';

interface CookieBannerProps {
  onOpenPrivacy: () => void;
}

const CONSENT_KEY = 'vitalizar_cookie_consent';

const saveConsent = (value: string) => {
  try {
    localStorage.setItem(CONSENT_KEY, value);
  } catch {
    // Armazenamento bloqueado (ex: modo privado): vale só para esta visita
  }
};

export const CookieBanner: React.FC<CookieBannerProps> = ({ onOpenPrivacy }) => {
  // Lido na inicialização para o banner não "piscar" depois do primeiro paint
  const [accepted, setAccepted] = useState(() => {
    try {
      return !!localStorage.getItem(CONSENT_KEY);
    } catch {
      return false;
    }
  });

  const handleAccept = () => {
    saveConsent('true');
    setAccepted(true);
  };

  if (accepted) return null;

  return (
    <div
      role="region"
      aria-label="Aviso de cookies"
      className="fixed bottom-0 inset-x-0 z-40 bg-[#061424] text-white py-3.5 px-4 sm:px-6 shadow-2xl border-t border-sky-950 animate-in slide-in-from-bottom-5 duration-300"
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 text-slate-200">
          <ShieldCheck className="w-5 h-5 text-[#38bdf8] flex-shrink-0" aria-hidden="true" />
          <p className="leading-snug">
            Nós usamos cookies e outras tecnologias semelhantes para melhorar a sua experiência em nossa plataforma e garantir a transparência e segurança dos serviços da Associação Esportiva Vitalizar. Conheça nossa{' '}
            <button
              type="button"
              onClick={onOpenPrivacy}
              className="text-[#38bdf8] underline hover:text-white font-semibold cursor-pointer"
            >
              Política de Privacidade & LGPD
            </button>
            .
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            type="button"
            onClick={handleAccept}
            className="px-5 py-2 bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold text-xs uppercase tracking-wider rounded-md transition-[background-color,transform] active:scale-95 cursor-pointer shadow border border-sky-300/40"
          >
            Aceitar
          </button>
          <button
            type="button"
            onClick={() => {
              saveConsent('dismissed');
              setAccepted(true);
            }}
            className="p-1.5 text-slate-400 hover:text-white rounded-md cursor-pointer"
            aria-label="Dispensar aviso de cookies"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
