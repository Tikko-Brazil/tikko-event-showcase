import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format UTC date string to local time
export function formatEventDate(dateString: string, formatStr: string = "dd/MM/yyyy"): string {
  if (!dateString) return "";
  const date = parseISO(dateString);
  return format(date, formatStr, { locale: ptBR });
}

// Format UTC date string to local time with time
export function formatEventDateTime(dateString: string, formatStr: string = "dd/MM/yyyy 'às' HH:mm"): string {
  if (!dateString) return "";
  const date = parseISO(dateString);
  return format(date, formatStr, { locale: ptBR });
}

// Format just the time from UTC date string to local time
export function formatEventTime(dateString: string, formatStr: string = "HH:mm"): string {
  if (!dateString) return "";
  const date = parseISO(dateString.replace("T", " ").replace("Z", ""));
  return format(date, formatStr, { locale: ptBR });
}
