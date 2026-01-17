'use client';

import { Loader2, ChevronDown, AlertTriangle } from 'lucide-react';
import { useState } from 'react';

import { cn } from '@/lib/utils';

export type IstStatusType = 'in_produktion' | 'fertig' | 'problem' | null;
export type VersandStatusType = 'offen' | 'versandbereit' | 'versendet' | null;

export type PipelineStage =
  | 'offen'
  | 'in_produktion'
  | 'fertig'
  | 'versandbereit'
  | 'versendet'
  | 'problem';

interface OrderStageSelectorProps {
  orderId: string;
  istStatus: IstStatusType;
  versandStatus: VersandStatusType;
  onStatusUpdate?: () => void;
  className?: string;
}

// Stage definitions with colors and labels
const STAGES: Record<
  PipelineStage,
  { label: string; bgClass: string; textClass: string; icon?: string }
> = {
  offen: {
    label: 'Offen',
    bgClass: 'bg-neutral-100',
    textClass: 'text-neutral-600',
  },
  in_produktion: {
    label: 'In Produktion',
    bgClass: 'bg-amber-100',
    textClass: 'text-amber-700',
  },
  fertig: {
    label: 'Fertig',
    bgClass: 'bg-capacity-green/10',
    textClass: 'text-capacity-green',
  },
  versandbereit: {
    label: 'Versandbereit',
    bgClass: 'bg-purple-100',
    textClass: 'text-purple-700',
  },
  versendet: {
    label: 'Versendet',
    bgClass: 'bg-blue-100',
    textClass: 'text-blue-700',
    icon: '✓',
  },
  problem: {
    label: 'Problem',
    bgClass: 'bg-capacity-red/10',
    textClass: 'text-capacity-red',
    icon: '⚠',
  },
};

// Calculate current pipeline stage from istStatus and versandStatus
function getCurrentStage(
  istStatus: IstStatusType,
  versandStatus: VersandStatusType
): PipelineStage {
  // Problem overrides everything
  if (istStatus === 'problem') return 'problem';

  // Versand stages (later pipeline stages)
  if (versandStatus === 'versendet') return 'versendet';
  if (versandStatus === 'versandbereit') return 'versandbereit';

  // Production stages
  if (istStatus === 'fertig') return 'fertig';
  if (istStatus === 'in_produktion') return 'in_produktion';

  // Default: Offen
  return 'offen';
}

export function OrderStageSelector({
  orderId,
  istStatus,
  versandStatus,
  onStatusUpdate,
  className,
}: OrderStageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState<PipelineStage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [comment, setComment] = useState('');
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [pendingStage, setPendingStage] = useState<PipelineStage | null>(null);

  const [currentIstStatus, setCurrentIstStatus] = useState(istStatus);
  const [currentVersandStatus, setCurrentVersandStatus] = useState(versandStatus);

  const currentStage = getCurrentStage(currentIstStatus, currentVersandStatus);
  const stageInfo = STAGES[currentStage];

  const handleStageSelect = async (stage: PipelineStage) => {
    if (loading) return;

    // Problem requires comment
    if (stage === 'problem' && !comment.trim()) {
      setPendingStage('problem');
      setShowCommentInput(true);
      setError('Bitte beschreiben Sie das Problem');
      return;
    }

    setError(null);
    setLoading(stage);

    try {
      // Determine which API to call based on stage
      if (
        stage === 'offen' ||
        stage === 'in_produktion' ||
        stage === 'fertig' ||
        stage === 'problem'
      ) {
        // Update istStatus
        const newIstStatus = stage === 'offen' ? null : stage;

        const response = await fetch(`/api/orders/${orderId}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            istStatus: newIstStatus,
            statusKommentar: comment.trim() || undefined,
          }),
        });

        if (!response.ok) {
          throw new Error('Fehler beim Aktualisieren des Status');
        }

        setCurrentIstStatus(newIstStatus as IstStatusType);

        // If moving back to production stages, reset versand status
        if (
          stage !== 'problem' &&
          (currentVersandStatus === 'versandbereit' || currentVersandStatus === 'versendet')
        ) {
          await fetch(`/api/orders/${orderId}/versand`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ versandStatus: 'offen' }),
          });
          setCurrentVersandStatus('offen');
        }
      } else if (stage === 'versandbereit' || stage === 'versendet') {
        // Update versandStatus
        const response = await fetch(`/api/orders/${orderId}/versand`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            versandStatus: stage,
            versandKommentar: comment.trim() || undefined,
          }),
        });

        if (!response.ok) {
          throw new Error('Fehler beim Aktualisieren des Versandstatus');
        }

        setCurrentVersandStatus(stage);

        // Ensure istStatus is fertig when moving to versand stages
        if (currentIstStatus !== 'fertig') {
          await fetch(`/api/orders/${orderId}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ istStatus: 'fertig' }),
          });
          setCurrentIstStatus('fertig');
        }
      }

      setComment('');
      setShowCommentInput(false);
      setPendingStage(null);
      setIsOpen(false);
      onStatusUpdate?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
    } finally {
      setLoading(null);
    }
  };

  const stageOrder: PipelineStage[] = [
    'offen',
    'in_produktion',
    'fertig',
    'versandbereit',
    'versendet',
    'problem',
  ];

  return (
    <div className={cn('relative', className)}>
      {/* Current stage button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={loading !== null}
        className={cn(
          'inline-flex items-center gap-2 px-4 py-2 rounded-lg border transition-all',
          'hover:shadow-md focus:outline-none focus:ring-2 focus:ring-ghl-blue/50',
          stageInfo.bgClass,
          'border-current/20'
        )}
      >
        <span className={cn('font-medium', stageInfo.textClass)}>
          {stageInfo.icon && <span className="mr-1">{stageInfo.icon}</span>}
          {stageInfo.label}
        </span>
        <ChevronDown
          className={cn(
            'h-4 w-4 transition-transform',
            stageInfo.textClass,
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => {
              setIsOpen(false);
              setShowCommentInput(false);
              setPendingStage(null);
              setError(null);
            }}
          />

          {/* Menu */}
          <div className="absolute top-full left-0 mt-2 z-20 w-64 bg-white rounded-lg border border-neutral-200 shadow-lg overflow-hidden">
            <div className="p-2">
              <p className="text-xs text-neutral-500 px-2 py-1 mb-1">Pipeline-Stage ändern</p>

              {stageOrder.map((stage) => {
                const info = STAGES[stage];
                const isCurrentStage = stage === currentStage;
                const isLoading = loading === stage;

                return (
                  <button
                    key={stage}
                    onClick={() => handleStageSelect(stage)}
                    disabled={loading !== null}
                    className={cn(
                      'w-full flex items-center gap-2 px-3 py-2.5 rounded-md text-left transition-colors',
                      'hover:bg-neutral-50',
                      isCurrentStage && 'bg-neutral-100',
                      loading !== null && 'opacity-50 cursor-not-allowed'
                    )}
                  >
                    <span
                      className={cn(
                        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                        info.bgClass,
                        info.textClass
                      )}
                    >
                      {info.icon && <span className="mr-1">{info.icon}</span>}
                      {info.label}
                    </span>

                    {isLoading && (
                      <Loader2 className="h-4 w-4 animate-spin text-neutral-400 ml-auto" />
                    )}
                    {isCurrentStage && !isLoading && (
                      <span className="ml-auto text-xs text-neutral-400">Aktuell</span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Comment input for Problem status */}
            {showCommentInput && (
              <div className="border-t border-neutral-200 p-3">
                {error && (
                  <div className="flex items-center gap-2 mb-2 text-capacity-red text-sm">
                    <AlertTriangle className="h-4 w-4" />
                    {error}
                  </div>
                )}
                <textarea
                  value={comment}
                  onChange={(e) => {
                    setComment(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="Problembeschreibung..."
                  className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-ghl-blue/50"
                  rows={2}
                  autoFocus
                />
                <button
                  onClick={() => pendingStage && handleStageSelect(pendingStage)}
                  disabled={!comment.trim() || loading !== null}
                  className={cn(
                    'mt-2 w-full py-2 rounded-md text-sm font-medium transition-colors',
                    'bg-capacity-red text-white hover:bg-capacity-red/90',
                    'disabled:opacity-50 disabled:cursor-not-allowed'
                  )}
                >
                  {loading === 'problem' ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Wird gespeichert...
                    </span>
                  ) : (
                    'Problem melden'
                  )}
                </button>
              </div>
            )}

            {/* General error display */}
            {error && !showCommentInput && (
              <div className="border-t border-neutral-200 p-3">
                <div className="flex items-center gap-2 text-capacity-red text-sm">
                  <AlertTriangle className="h-4 w-4" />
                  {error}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
