// Default name for a `listas` row when user leaves nome blank (RF-PLAN-01).
// Format anchored to pt-BR locale per Constitution C-9.
const pad2 = (n: number): string => String(n).padStart(2, '0');

export const defaultListaNome = (date: Date = new Date()): string => {
  const day = pad2(date.getDate());
  const month = pad2(date.getMonth() + 1);
  const year = date.getFullYear();
  return `Lista de ${day}/${month}/${year}`;
};

export const pendentesListaNome = (date: Date = new Date()): string => {
  const day = pad2(date.getDate());
  const month = pad2(date.getMonth() + 1);
  const year = date.getFullYear();
  return `Pendências de ${day}/${month}/${year}`;
};
