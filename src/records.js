export const courses = ['Backend', 'Web', 'SQL', 'Mobil'];

export const statuses = {
  planned: 'Planlandı',
  active: 'Devam ediyor',
  completed: 'Tamamlandı',
};

export const sampleRecords = [
  { id: 'taskflow', title: 'TaskFlow API taslağı', course: 'Backend', date: '2026-11-15', status: 'active' },
  { id: 'sql', title: 'NovaStore veri modeli', course: 'SQL', date: '2026-11-15', status: 'completed' },
  { id: 'web', title: 'React kayıt formu', course: 'Web', date: '2026-11-16', status: 'planned' },
  { id: 'flutter', title: 'Mini katalog ekran akışı', course: 'Mobil', date: '2026-11-16', status: 'active' },
  { id: 'http', title: 'HTTP ve REST tekrarı', course: 'Backend', date: '2026-11-14', status: 'completed' },
];

const key = 'staj-calisma-panosu.records.v1';

function isDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(value);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function isRecord(record) {
  return record && typeof record.id === 'string' &&
    typeof record.title === 'string' &&
    courses.includes(record.course) &&
    isDate(record.date) &&
    Object.hasOwn(statuses, record.status);
}

export function loadRecords() {
  try {
    const stored = localStorage.getItem(key);
    if (stored === null) return sampleRecords;
    const records = JSON.parse(stored);
    return Array.isArray(records) && records.every(isRecord) ? records : sampleRecords;
  } catch {
    return sampleRecords;
  }
}

export function saveRecords(records) {
  localStorage.setItem(key, JSON.stringify(records));
}

const displayDate = new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' });
const todayFormatter = new Intl.DateTimeFormat('sv-SE', {
  year: 'numeric', month: '2-digit', day: '2-digit',
});

export function formatDate(date) {
  return displayDate.format(new Date(date + 'T12:00:00'));
}

export function blankRecord() {
  return { title: '', course: courses[0], date: todayFormatter.format(new Date()), status: 'planned' };
}
