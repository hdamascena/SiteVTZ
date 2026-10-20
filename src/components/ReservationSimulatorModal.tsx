import React, { useId, useState } from 'react';
import {
  X,
  CalendarCheck,
  CheckCircle2,
  Users,
  AlertTriangle,
  Clock,
  Sparkles,
  HeartPulse,
} from 'lucide-react';
import { FACILITY_POLOS } from '../data/clubeData.ts';
import {
  validateActivityEnrollment,
  MODALITY_LIMITS,
  MODALITY_NAMES,
} from '../utils/feeCalculator.ts';
import { useClubData } from '../context/ClubDataContext.tsx';
import { useDialog } from '../hooks/useDialog.ts';

interface ReservationSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReservationSimulatorModal: React.FC<ReservationSimulatorModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { addRsvp } = useClubData();
  const [selectedPoloId, setSelectedPoloId] = useState<string>('polo-rio-marinho');
  const [modalityKey, setModalityKey] = useState<string>('iniciacao_esportiva');
  const [participantName, setParticipantName] = useState<string>('');
  const [participantAge, setParticipantAge] = useState<number>(12);
  const [responsibleName, setResponsibleName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [turn, setTurn] = useState<string>('matutino');
  const [schoolEnrollment, setSchoolEnrollment] = useState<string>('Sim, Rede Pública de Cariacica');
  const [isConfirmed, setIsConfirmed] = useState<boolean>(false);
  const [confirmationCode, setConfirmationCode] = useState<string>('');

  const turnLabel = turn === 'matutino' ? 'Manhã' : turn === 'vespertino' ? 'Tarde' : 'Noite';

  // O modal permanece montado: limpa o formulário ao fechar para não reabrir com dados antigos
  const handleClose = () => {
    setIsConfirmed(false);
    setConfirmationCode('');
    setParticipantName('');
    setResponsibleName('');
    setPhone('');
    setSchoolEnrollment('Sim, Rede Pública de Cariacica');
    onClose();
  };

  const dialogRef = useDialog(isOpen, handleClose);
  const uid = useId();
  const titleId = `${uid}-title`;
  const participantNameId = `${uid}-participant-name`;
  const participantAgeId = `${uid}-participant-age`;
  const turnId = `${uid}-turn`;
  const responsibleNameId = `${uid}-responsible-name`;
  const phoneId = `${uid}-phone`;
  const schoolId = `${uid}-school`;

  const selectedPolo = FACILITY_POLOS.find((p) => p.id === selectedPoloId) || FACILITY_POLOS[0];
  const validation = validateActivityEnrollment(modalityKey, participantAge, 18);

  const handleConfirmEnrollment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validation.valid) return;
    // Limite de 150 caracteres do campo "name" nas regras do Firestore (isValidRsvp)
    const fullNameInfo = (
      responsibleName.trim()
        ? `${participantName.trim()} (${participantAge} anos · Resp: ${responsibleName.trim()} · Escola: ${schoolEnrollment})`
        : `${participantName.trim()} (${participantAge} anos · Escola: ${schoolEnrollment})`
    ).slice(0, 150);
    const code = addRsvp({
      eventId: `modalidade-${modalityKey}`,
      eventTitle: `${MODALITY_NAMES[modalityKey] || modalityKey} — ${selectedPolo.name} (${turnLabel})`,
      name: fullNameInfo,
      phone: phone.trim(),
      spots: 1,
    });
    setConfirmationCode(code);
    setIsConfirmed(true);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 text-slate-800">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-[#0a1e36] text-white px-6 py-4 flex items-center justify-between border-b border-sky-950">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-[#0284c7] text-white rounded-lg border border-sky-400/40">
              <CalendarCheck className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h2 id={titleId} className="text-base font-bold uppercase tracking-wide text-white">
                Inscrição em Modalidades • Vitalizar
              </h2>
              <p className="text-xs text-sky-200">
                Pré-matrícula para escolinhas esportivas, condicionamento e projetos comunitários
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 text-sky-200 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Fechar inscrição"
          >
            <X className="w-6 h-6" aria-hidden="true" />
          </button>
        </div>

        {isConfirmed ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-sky-100 text-[#0284c7] rounded-full flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-10 h-10" aria-hidden="true" />
            </div>
            <h3 className="text-2xl font-black text-[#0a1e36]">
              Pré-Inscrição Confirmada com Sucesso!
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              O formulário de <strong>{participantName}</strong> para <strong>{MODALITY_NAMES[modalityKey] || modalityKey}</strong> no <strong>{selectedPolo.name}</strong> foi registrado. Nossa equipe entrará em contato via WhatsApp/Telefone para validação dos documentos comprobatórios.
            </p>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl max-w-md mx-auto text-left text-xs space-y-1">
              <p>• <strong>Polo:</strong> {selectedPolo.name}</p>
              <p>• <strong>Endereço:</strong> {selectedPolo.address}</p>
              <p>• <strong>Turno:</strong> {turnLabel}</p>
              <p>• <strong>Contato:</strong> {phone}</p>
              <p>• <strong>Matrícula escolar:</strong> {schoolEnrollment}</p>
              {confirmationCode && (
                <p>• <strong>Protocolo:</strong> <span className="font-mono">{confirmationCode}</span></p>
              )}
            </div>

            <div className="pt-4 flex justify-center gap-3">
              <button
                type="button"
                onClick={handleClose}
                className="px-6 py-2.5 bg-[#0a1e36] text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-[#061424] transition-colors cursor-pointer"
              >
                Concluir
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleConfirmEnrollment} className="p-6 space-y-6">
            {/* Step 1: Polo Selection */}
            <fieldset className="border-0 p-0 m-0 min-w-0">
              <legend className="w-full flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-[#0a1e36] uppercase tracking-wider">
                  1. Selecione o Polo de Atendimento em Cariacica:
                </span>
                <span className="text-[10px] text-sky-800 bg-sky-100 px-2 py-0.5 rounded font-bold">
                  {FACILITY_POLOS.length} Polos Disponíveis
                </span>
              </legend>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {FACILITY_POLOS.map((polo) => (
                  <button
                    type="button"
                    key={polo.id}
                    aria-pressed={selectedPoloId === polo.id}
                    onClick={() => setSelectedPoloId(polo.id)}
                    className={`text-left w-full p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedPoloId === polo.id
                        ? 'border-[#0284c7] bg-sky-50/70 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-[#0a1e36] leading-tight">
                        {polo.name}
                      </span>
                      {selectedPoloId === polo.id && (
                        <CheckCircle2 className="w-4 h-4 text-[#0284c7]" aria-hidden="true" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-2">{polo.address}</p>
                    <span className="mt-2 inline-block text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                      {polo.capacity}
                    </span>
                  </button>
                ))}
              </div>
            </fieldset>

            {/* Step 2: Modality Selection */}
            <fieldset className="border-0 p-0 m-0 min-w-0">
              <legend className="block text-xs font-bold text-[#0a1e36] uppercase tracking-wider mb-2">
                2. Selecione a Modalidade ou Projeto:
              </legend>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {Object.entries(MODALITY_LIMITS).map(([key, mod]) => (
                  <button
                    type="button"
                    key={key}
                    aria-pressed={modalityKey === key}
                    onClick={() => setModalityKey(key)}
                    className={`text-left w-full p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      modalityKey === key
                        ? 'border-[#0284c7] bg-sky-50/70 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-900 leading-snug">{MODALITY_NAMES[key] || key}</span>
                      {modalityKey === key && <CheckCircle2 className="w-4 h-4 text-[#0284c7]" aria-hidden="true" />}
                    </div>
                    <p className="text-[10px] text-slate-500">
                      Faixa etária: {mod.minAge} a {mod.maxAge} anos
                    </p>
                    <p className="text-[10px] text-slate-500 font-semibold mt-1">
                      Capacidade: {mod.maxClassCapacity} vagas/turma
                    </p>
                  </button>
                ))}
              </div>
            </fieldset>

            {/* Step 3: Participant details */}
            <div className="border-t border-slate-200 pt-5">
            <fieldset className="border-0 p-0 m-0 min-w-0">
              <legend className="block text-xs font-bold text-[#0a1e36] uppercase tracking-wider mb-3">
                3. Dados do Aluno / Participante:
              </legend>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor={participantNameId} className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Nome do Participante *
                  </label>
                  <input
                    id={participantNameId}
                    name="participantName"
                    type="text"
                    autoComplete="off"
                    required
                    value={participantName}
                    onChange={(e) => setParticipantName(e.target.value)}
                    placeholder="Nome completo do aluno"
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label htmlFor={participantAgeId} className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Idade do Aluno: <span className="text-[#0284c7] font-bold">{participantAge} anos</span>
                  </label>
                  <input
                    id={participantAgeId}
                    name="participantAge"
                    type="number"
                    inputMode="numeric"
                    autoComplete="off"
                    min="4"
                    max="99"
                    required
                    value={participantAge}
                    onChange={(e) => setParticipantAge(Number(e.target.value))}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label htmlFor={turnId} className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Turno de Preferência
                  </label>
                  <select
                    id={turnId}
                    name="turn"
                    value={turn}
                    onChange={(e) => setTurn(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  >
                    <option value="matutino">Matutino (Manhã)</option>
                    <option value="vespertino">Vespertino (Tarde)</option>
                    <option value="noturno">Noturno (Condicionamento)</option>
                  </select>
                </div>

                <div>
                  <label htmlFor={responsibleNameId} className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Nome do Responsável Legal (se menor de 18)
                  </label>
                  <input
                    id={responsibleNameId}
                    name="responsibleName"
                    type="text"
                    autoComplete="name"
                    value={responsibleName}
                    onChange={(e) => setResponsibleName(e.target.value)}
                    placeholder="Nome da mãe, pai ou tutor"
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label htmlFor={phoneId} className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Telefone de Contato / WhatsApp *
                  </label>
                  <input
                    id={phoneId}
                    name="phone"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(27) 90000-0000"
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label htmlFor={schoolId} className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Matrícula Escolar Ativa?
                  </label>
                  <select
                    id={schoolId}
                    name="schoolEnrollment"
                    value={schoolEnrollment}
                    onChange={(e) => setSchoolEnrollment(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  >
                    <option value="Sim, Rede Pública de Cariacica">Sim, Rede Pública de Cariacica</option>
                    <option value="Sim, Rede Estadual / Particular">Sim, Rede Estadual / Particular</option>
                    <option value="Não se aplica (Maior de idade)">Não se aplica (Maior de idade)</option>
                  </select>
                </div>
              </div>
            </fieldset>
            </div>

            {/* Validation Message Box */}
            <div aria-live="polite">
            {!validation.valid ? (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-xs text-rose-800">
                <AlertTriangle className="w-5 h-5 flex-shrink-0 text-rose-600" aria-hidden="true" />
                <span>{validation.reason}</span>
              </div>
            ) : (
              <div className="p-3 bg-sky-50 border border-sky-200 rounded-xl flex items-center gap-3 text-xs text-sky-900">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-[#0284c7]" aria-hidden="true" />
                <span>
                  <strong>Idade e modalidade compatíveis!</strong> As turmas da Vitalizar contam com uniformes e material esportivo fornecidos gratuitamente por meio de parcerias e recursos sociais.
                </span>
              </div>
            )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={!validation.valid}
                className={`px-6 py-3 font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all active:scale-95 cursor-pointer border ${
                  validation.valid
                    ? 'bg-[#0284c7] hover:bg-[#0369a1] text-white border-sky-300/40'
                    : 'bg-slate-300 text-slate-500 cursor-not-allowed border-transparent'
                }`}
              >
                Confirmar Pré-Inscrição
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
