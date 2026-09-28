export function pad(n: number) {
  return n < 10 ? '0' + n : String(n);
}
export function dateStr(d: Date = new Date()) {
  return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
}
export function timeStr(d: Date = new Date()) {
  return pad(d.getHours()) + ':' + pad(d.getMinutes());
}
export function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return dateStr(d);
}
export function normDigits(v: string) {
  return v
    .replace(/[۰-۹]/g, (c) => String(c.charCodeAt(0) - 1776))
    .replace(/[٠-٩]/g, (c) => String(c.charCodeAt(0) - 1632))
    .replace(/[,٬،\s]/g, '');
}
export function toNum(v: string) {
  return Number(normDigits(v));
}
export function fmt(n: number | string) {
  return String(Math.round(Number(n))).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
export function sumBy(rows: any[], key: string) {
  return rows.reduce((s, r) => s + Number(r[key] || 0), 0);
}