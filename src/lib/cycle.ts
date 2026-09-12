export type CyclePhase = 'period' | 'follicular' | 'ovulation' | 'luteal';

export type CycleSnapshot = {
  cycleDay: number;
  cycleLength: number;
  periodLength: number;
  daysUntilPeriod: number;
  daysUntilOvulation: number;
  phase: CyclePhase;
  phaseLabel: string;
  fertilityLabel: string;
  nextPeriodDate: Date;
  ovulationDate: Date;
  isOnPeriod: boolean;
  periodDay: number | null;
  daysLeftInPeriod: number | null;
};

export const DEMO_CYCLE = {
  cycleLength: 28,
  periodLength: 5,
  /** Jour du cycle affiché aujourd’hui (données de démo, pas encore de saisie). */
  currentCycleDay: 20,
};

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function addDays(date: Date, amount: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

export function getDemoLastPeriodStart(today = new Date()): Date {
  return addDays(startOfDay(today), -(DEMO_CYCLE.currentCycleDay - 1));
}

function ovulationDay(cycleLength: number): number {
  return Math.max(1, cycleLength - 14);
}

function phaseForDay(cycleDay: number, cycleLength: number, periodLength: number): CyclePhase {
  if (cycleDay <= periodLength) return 'period';
  const ovulation = ovulationDay(cycleLength);
  if (cycleDay === ovulation) return 'ovulation';
  if (cycleDay < ovulation) return 'follicular';
  return 'luteal';
}

const PHASE_LABELS: Record<CyclePhase, string> = {
  period: 'Règles',
  follicular: 'Folliculaire',
  ovulation: 'Ovulation',
  luteal: 'Lutéale',
};

function fertilityLabel(cycleDay: number, cycleLength: number): string {
  const ovulation = ovulationDay(cycleLength);
  if (cycleDay >= ovulation - 5 && cycleDay <= ovulation + 1) return 'Élevée';
  if (cycleDay >= ovulation - 7 && cycleDay < ovulation - 5) return 'Moyenne';
  return 'Faible';
}

export function getCycleSnapshot(
  lastPeriodStart: Date,
  cycleLength = DEMO_CYCLE.cycleLength,
  periodLength = DEMO_CYCLE.periodLength,
  today = new Date(),
): CycleSnapshot {
  const start = startOfDay(lastPeriodStart);
  const now = startOfDay(today);
  const elapsed = Math.round((now.getTime() - start.getTime()) / 86_400_000);
  const cycleDay = ((elapsed % cycleLength) + cycleLength) % cycleLength + 1;
  const ovulation = ovulationDay(cycleLength);
  const isOnPeriod = cycleDay <= periodLength;
  const cycleStart = addDays(now, -(cycleDay - 1));
  const phase = phaseForDay(cycleDay, cycleLength, periodLength);

  return {
    cycleDay,
    cycleLength,
    periodLength,
    daysUntilPeriod: isOnPeriod ? 0 : cycleLength - cycleDay + 1,
    daysUntilOvulation: ovulation - cycleDay,
    phase,
    phaseLabel: PHASE_LABELS[phase],
    fertilityLabel: fertilityLabel(cycleDay, cycleLength),
    nextPeriodDate: addDays(cycleStart, cycleLength),
    ovulationDate: addDays(cycleStart, ovulation - 1),
    isOnPeriod,
    periodDay: isOnPeriod ? cycleDay : null,
    daysLeftInPeriod: isOnPeriod ? periodLength - cycleDay + 1 : null,
  };
}

export function formatLongDate(date: Date): string {
  const formatted = date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

export function formatShortDate(date: Date): string {
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
  });
}

export function weekdayLetter(date: Date): string {
  return date.toLocaleDateString('fr-FR', { weekday: 'narrow' });
}
