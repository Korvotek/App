import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDocument(document: string | null | undefined): string {
  if (!document) return "";
  
  const cleanDocument = document.replace(/\D/g, "");
  
  if (cleanDocument.length === 11) {
    return cleanDocument.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  }
  
  if (cleanDocument.length === 14) {
    return cleanDocument.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
  }
  
  return document;
}

export function getDocumentType(document: string | null | undefined): 'CPF' | 'CNPJ' | 'UNKNOWN' {
  if (!document) return 'UNKNOWN';
  
  const cleanDocument = document.replace(/\D/g, "");
  
  if (cleanDocument.length === 11) return 'CPF';
  if (cleanDocument.length === 14) return 'CNPJ';
  
  return 'UNKNOWN';
}

export function cleanCustomerName(name: string | null | undefined): string {
  if (!name) return "";
  
  const cleanName = name.replace(/[0-9]/g, '').replace(/[^\w\s]/g, '').trim();
  
  return cleanName || name;
}
