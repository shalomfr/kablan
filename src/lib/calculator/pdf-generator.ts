import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ProjectCalculation, formatCurrency, getUnitLabel } from './calculate';

interface QuoteDetails {
  quoteNumber: string;
  date: Date;
  validUntil: Date;
  projectName: string;
  clientName: string;
  clientPhone?: string;
  clientEmail?: string;
  clientAddress?: string;
  companyName: string;
  companyPhone?: string;
  companyEmail?: string;
  companyAddress?: string;
  companyLicense?: string;
  notes?: string;
  terms?: string;
  discount?: number;
  taxRate?: number;
}

/**
 * Generate a PDF quote document
 */
export async function generateQuotePDF(
  calculation: ProjectCalculation,
  details: QuoteDetails
): Promise<Blob> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Load Hebrew font support (would need to add actual font in production)
  // For now, using built-in font
  doc.setFont('helvetica');
  
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;

  let yPosition = margin;

  // Header
  doc.setFontSize(24);
  doc.setTextColor(6, 182, 212); // Cyan-500
  doc.text(details.companyName, pageWidth - margin, yPosition, { align: 'right' });
  
  yPosition += 10;
  doc.setFontSize(10);
  doc.setTextColor(100);
  if (details.companyPhone) {
    doc.text(`טלפון: ${details.companyPhone}`, pageWidth - margin, yPosition, { align: 'right' });
    yPosition += 5;
  }
  if (details.companyEmail) {
    doc.text(`אימייל: ${details.companyEmail}`, pageWidth - margin, yPosition, { align: 'right' });
    yPosition += 5;
  }
  if (details.companyAddress) {
    doc.text(`כתובת: ${details.companyAddress}`, pageWidth - margin, yPosition, { align: 'right' });
    yPosition += 5;
  }
  if (details.companyLicense) {
    doc.text(`רישיון קבלן: ${details.companyLicense}`, pageWidth - margin, yPosition, { align: 'right' });
  }

  yPosition += 15;

  // Quote Title
  doc.setFontSize(20);
  doc.setTextColor(0);
  doc.text('הצעת מחיר', pageWidth / 2, yPosition, { align: 'center' });
  
  yPosition += 10;
  doc.setFontSize(12);
  doc.setTextColor(100);
  doc.text(`מספר הצעה: ${details.quoteNumber}`, pageWidth / 2, yPosition, { align: 'center' });

  yPosition += 15;

  // Quote details box
  doc.setDrawColor(200);
  doc.setFillColor(249, 250, 251);
  doc.roundedRect(margin, yPosition, pageWidth - 2 * margin, 35, 3, 3, 'FD');

  yPosition += 8;
  doc.setFontSize(10);
  doc.setTextColor(0);
  
  // Left column - dates
  doc.text(`תאריך: ${details.date.toLocaleDateString('he-IL')}`, margin + 5, yPosition);
  doc.text(`בתוקף עד: ${details.validUntil.toLocaleDateString('he-IL')}`, margin + 5, yPosition + 7);
  doc.text(`פרויקט: ${details.projectName}`, margin + 5, yPosition + 14);

  // Right column - client
  doc.text(`לכבוד: ${details.clientName}`, pageWidth - margin - 5, yPosition, { align: 'right' });
  if (details.clientPhone) {
    doc.text(`טלפון: ${details.clientPhone}`, pageWidth - margin - 5, yPosition + 7, { align: 'right' });
  }
  if (details.clientAddress) {
    doc.text(`כתובת: ${details.clientAddress}`, pageWidth - margin - 5, yPosition + 14, { align: 'right' });
  }

  yPosition += 45;

  // Items table
  const tableData = calculation.items.map((item, index) => [
    formatCurrency(item.totalCost),
    formatCurrency(item.materialCostWithWaste),
    formatCurrency(item.laborCost),
    `${item.quantity} ${getUnitLabel(item.unit)}`,
    item.subcategoryName,
    (index + 1).toString(),
  ]);

  autoTable(doc, {
    startY: yPosition,
    head: [['סה"כ', 'חומרים', 'עבודה', 'כמות', 'תיאור', '#']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [6, 182, 212],
      textColor: 255,
      halign: 'right',
      fontSize: 10,
    },
    bodyStyles: {
      halign: 'right',
      fontSize: 9,
    },
    columnStyles: {
      0: { halign: 'left', cellWidth: 25 },
      1: { halign: 'left', cellWidth: 25 },
      2: { halign: 'left', cellWidth: 25 },
      3: { halign: 'center', cellWidth: 25 },
      4: { halign: 'right', cellWidth: 'auto' },
      5: { halign: 'center', cellWidth: 10 },
    },
    margin: { left: margin, right: margin },
    didDrawPage: (data) => {
      // Footer on each page
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(
        `עמוד ${data.pageNumber}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );
    },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 15;

  // Summary box
  const summaryWidth = 80;
  const summaryX = margin;

  doc.setDrawColor(200);
  doc.setFillColor(249, 250, 251);
  doc.roundedRect(summaryX, yPosition, summaryWidth, 50, 3, 3, 'FD');

  yPosition += 8;
  doc.setFontSize(10);
  doc.setTextColor(0);

  const { summary } = calculation;
  const discount = details.discount || 0;
  const taxRate = details.taxRate || 0.17;
  const afterDiscount = summary.grandTotal - discount;
  const tax = afterDiscount * taxRate;
  const finalTotal = afterDiscount + tax;

  doc.text(`סה"כ עבודה:`, summaryX + summaryWidth - 5, yPosition, { align: 'right' });
  doc.text(formatCurrency(summary.totalLabor), summaryX + 5, yPosition);
  yPosition += 6;

  doc.text(`סה"כ חומרים:`, summaryX + summaryWidth - 5, yPosition, { align: 'right' });
  doc.text(formatCurrency(summary.totalMaterials + summary.totalWaste), summaryX + 5, yPosition);
  yPosition += 6;

  doc.text(`רזרבה (10%):`, summaryX + summaryWidth - 5, yPosition, { align: 'right' });
  doc.text(formatCurrency(summary.totalContingency), summaryX + 5, yPosition);
  yPosition += 6;

  if (discount > 0) {
    doc.text(`הנחה:`, summaryX + summaryWidth - 5, yPosition, { align: 'right' });
    doc.setTextColor(220, 38, 38);
    doc.text(`-${formatCurrency(discount)}`, summaryX + 5, yPosition);
    doc.setTextColor(0);
    yPosition += 6;
  }

  doc.text(`מע"מ (${(taxRate * 100).toFixed(0)}%):`, summaryX + summaryWidth - 5, yPosition, { align: 'right' });
  doc.text(formatCurrency(tax), summaryX + 5, yPosition);
  yPosition += 8;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`סה"כ לתשלום:`, summaryX + summaryWidth - 5, yPosition, { align: 'right' });
  doc.setTextColor(6, 182, 212);
  doc.text(formatCurrency(finalTotal), summaryX + 5, yPosition);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0);

  yPosition = (doc as any).lastAutoTable.finalY + 70;

  // Notes
  if (details.notes) {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('הערות:', pageWidth - margin, yPosition, { align: 'right' });
    yPosition += 7;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    const noteLines = doc.splitTextToSize(details.notes, pageWidth - 2 * margin);
    noteLines.forEach((line: string) => {
      doc.text(line, pageWidth - margin, yPosition, { align: 'right' });
      yPosition += 5;
    });
    yPosition += 5;
  }

  // Terms
  if (details.terms) {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('תנאים:', pageWidth - margin, yPosition, { align: 'right' });
    yPosition += 7;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    const termLines = doc.splitTextToSize(details.terms, pageWidth - 2 * margin);
    termLines.forEach((line: string) => {
      doc.text(line, pageWidth - margin, yPosition, { align: 'right' });
      yPosition += 5;
    });
  }

  // Signature area
  if (yPosition < pageHeight - 50) {
    yPosition = pageHeight - 45;
  }

  doc.setDrawColor(200);
  doc.line(margin, yPosition, margin + 60, yPosition);
  doc.line(pageWidth - margin - 60, yPosition, pageWidth - margin, yPosition);

  yPosition += 5;
  doc.setFontSize(9);
  doc.text('חתימת הקבלן', margin + 30, yPosition, { align: 'center' });
  doc.text('חתימת הלקוח', pageWidth - margin - 30, yPosition, { align: 'center' });

  return doc.output('blob');
}

/**
 * Download the PDF
 */
export function downloadPDF(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}


