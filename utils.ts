export const getTodayStr = (): string => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const formatDateBr = (dateStr: string): string => {
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}`;
};

export const getPreviousDay = (dateStr: string): string => {
  const d = new Date(dateStr + 'T00:00:00'); // append time to avoid UTC shift
  d.setDate(d.getDate() - 1);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const dayOfWeek = (): number => {
  return new Date().getDay();
};

export const isHabitDueToday = (days: number[]): boolean => {
  return days.includes(dayOfWeek());
};