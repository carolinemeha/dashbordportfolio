export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} bytes`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

export function validatePDF(file: File): { valid: boolean; message?: string } {
  if (file.type !== 'application/pdf') {
    return { valid: false, message: 'Le fichier doit être un PDF' };
  }

  if (file.size > 5 * 1024 * 1024) { // 5MB
    return { valid: false, message: 'Le fichier ne doit pas dépasser 5MB' };
  }

  return { valid: true };
}