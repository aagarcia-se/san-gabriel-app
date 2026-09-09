import { pdf, type DocumentProps } from '@react-pdf/renderer';
import type { ReactElement } from 'react';

export async function downloadPdf(
  pdfDocument: ReactElement<DocumentProps>,
  fileName: string,
): Promise<void> {
  const blob = await pdf(pdfDocument).toBlob();
  const url = URL.createObjectURL(blob);
  const link = window.document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}