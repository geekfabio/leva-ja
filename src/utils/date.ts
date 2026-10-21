/** Datas mockadas são geradas relativamente ao momento actual para manter "Hoje"/"Ontem" coerentes. */
export function daysAgo(days: number, time = "10:00") {
  const [h, m] = time.split(":").map(Number);
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(h, m, 0, 0);
  return date.toISOString();
}

export function minutesFromNow(minutes: number) {
  return new Date(Date.now() + minutes * 60_000).toISOString();
}

const months = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];
const shortMonths = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
const weekdays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const pad = (value: number) => String(value).padStart(2, "0");

export const formatTime = (iso: string) => {
  const d = new Date(iso);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

/** "12 Ago 2026, 14:32" */
export const formatShortDateTime = (iso: string) => {
  const d = new Date(iso);
  return `${d.getDate()} ${shortMonths[d.getMonth()]} ${d.getFullYear()}, ${formatTime(iso)}`;
};

/** "12 de Abril de 2026 às 14:30" */
export const formatLongDateTime = (iso: string) => {
  const d = new Date(iso);
  return `${d.getDate()} de ${months[d.getMonth()]} de ${d.getFullYear()} às ${formatTime(iso)}`;
};

/** "12/08/2027" */
export const formatDate = (iso: string) => {
  const d = new Date(iso);
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
};

/** "Sáb, 24 Mai 2026" */
export const formatWeekdayDate = (iso: string) => {
  const d = new Date(iso);
  return `${weekdays[d.getDay()]}, ${d.getDate()} ${shortMonths[d.getMonth()]} ${d.getFullYear()}`;
};

export const formatMonthYear = (date: Date) => `${months[date.getMonth()]} ${date.getFullYear()}`;

const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

/** Cabeçalho de grupo: "Hoje, 14 de Março de 2026", "Ontem, …" ou "12 de Março de 2026". */
export function dayGroupLabel(iso: string, now = new Date()) {
  const d = new Date(iso);
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const long = `${d.getDate()} de ${months[d.getMonth()]} de ${d.getFullYear()}`;
  if (sameDay(d, now)) return `Hoje, ${long}`;
  if (sameDay(d, yesterday)) return `Ontem, ${long}`;
  return long;
}

export const weekdayShort = (date: Date) => weekdays[date.getDay()];
