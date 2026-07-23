import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fs from 'fs';
import path from 'path';

export interface SelloData {
  hospitalizar: boolean;
  ponerEnRemision: boolean;
  cancelaCopago: boolean;
  autoriza: string;
  autorizaFecha: Date;
  recibidoFecha: Date;
  entrega: string;
}

function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat('es-CO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
}

export async function generarPDFConSello(
  pdfOriginalPath: string,
  selloData: SelloData,
  outputFileName: string
): Promise<string> {
  // Leer el PDF original
  const absolutePath = path.join(process.cwd(), 'public', pdfOriginalPath.replace(/^\//, ''));
  const pdfBuffer = fs.readFileSync(absolutePath);

  const pdfDoc = await PDFDocument.load(pdfBuffer);
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Obtener la última página
  const pages = pdfDoc.getPages();
  const lastPage = pages[pages.length - 1];
  const { width, height } = lastPage.getSize();

  // Dimensiones del sello
  const selloWidth = 280;
  const selloHeight = 130;
  const selloX = width - selloWidth - 20;
  const selloY = 20;

  // Colores
  const colorBorde = rgb(0.1, 0.1, 0.5);
  const colorTexto = rgb(0, 0, 0);
  const colorTitulo = rgb(0.1, 0.1, 0.5);

  // Dibujar fondo blanco del sello
  lastPage.drawRectangle({
    x: selloX,
    y: selloY,
    width: selloWidth,
    height: selloHeight,
    color: rgb(1, 1, 1),
    borderColor: colorBorde,
    borderWidth: 1.5,
  });

  // Título del sello
  lastPage.drawText('AUTORIZACIÓN MÉDICA', {
    x: selloX + 55,
    y: selloY + selloHeight - 14,
    size: 9,
    font: helveticaBold,
    color: colorTitulo,
  });

  // Línea divisoria
  lastPage.drawLine({
    start: { x: selloX, y: selloY + selloHeight - 18 },
    end: { x: selloX + selloWidth, y: selloY + selloHeight - 18 },
    thickness: 0.8,
    color: colorBorde,
  });

  let currentY = selloY + selloHeight - 32;
  const lineHeight = 13;
  const textSize = 7.5;
  const checkSize = 7;

  // HOSPITALIZAR
  const hospitalizarCheck = selloData.hospitalizar ? '☑' : '☐';
  lastPage.drawText(`${hospitalizarCheck} HOSPITALIZAR`, {
    x: selloX + 8,
    y: currentY,
    size: textSize,
    font: helveticaBold,
    color: colorTexto,
  });

  // PONER EN REMISIÓN
  const remisionCheck = selloData.ponerEnRemision ? '☑' : '☐';
  lastPage.drawText(`${remisionCheck} PONER EN REMISIÓN`, {
    x: selloX + 130,
    y: currentY,
    size: textSize,
    font: helveticaBold,
    color: colorTexto,
  });

  currentY -= lineHeight;

  // CANCELA COPAGO
  const copagoText = selloData.cancelaCopago ? 'SÍ' : 'NO';
  lastPage.drawText(`CANCELA COPAGO: ${copagoText}`, {
    x: selloX + 8,
    y: currentY,
    size: textSize,
    font: helveticaFont,
    color: colorTexto,
  });

  currentY -= lineHeight;

  // Línea divisoria
  lastPage.drawLine({
    start: { x: selloX + 5, y: currentY + 8 },
    end: { x: selloX + selloWidth - 5, y: currentY + 8 },
    thickness: 0.5,
    color: rgb(0.7, 0.7, 0.7),
  });

  currentY -= 5;

  // AUTORIZA
  lastPage.drawText('AUTORIZA:', {
    x: selloX + 8,
    y: currentY,
    size: textSize,
    font: helveticaBold,
    color: colorTexto,
  });
  lastPage.drawText(selloData.autoriza, {
    x: selloX + 60,
    y: currentY,
    size: textSize,
    font: helveticaFont,
    color: colorTexto,
  });

  currentY -= lineHeight - 2;

  lastPage.drawText(`Fecha: ${formatDateTime(selloData.autorizaFecha)}`, {
    x: selloX + 8,
    y: currentY,
    size: 7,
    font: helveticaFont,
    color: colorTexto,
  });

  currentY -= lineHeight;

  // Línea divisoria
  lastPage.drawLine({
    start: { x: selloX + 5, y: currentY + 8 },
    end: { x: selloX + selloWidth - 5, y: currentY + 8 },
    thickness: 0.5,
    color: rgb(0.7, 0.7, 0.7),
  });

  currentY -= 5;

  // RECIBIDO
  lastPage.drawText('RECIBIDO:', {
    x: selloX + 8,
    y: currentY,
    size: textSize,
    font: helveticaBold,
    color: colorTexto,
  });
  lastPage.drawText(formatDateTime(selloData.recibidoFecha), {
    x: selloX + 60,
    y: currentY,
    size: textSize,
    font: helveticaFont,
    color: colorTexto,
  });

  currentY -= lineHeight;

  // ENTREGA
  lastPage.drawText('ENTREGA:', {
    x: selloX + 8,
    y: currentY,
    size: textSize,
    font: helveticaBold,
    color: colorTexto,
  });
  lastPage.drawText(selloData.entrega, {
    x: selloX + 60,
    y: currentY,
    size: textSize,
    font: helveticaFont,
    color: colorTexto,
  });

  // Guardar el PDF modificado
  const pdfBytes = await pdfDoc.save();
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const outputPath = path.join(uploadsDir, outputFileName);
  fs.writeFileSync(outputPath, pdfBytes);

  return `/uploads/${outputFileName}`;
}
