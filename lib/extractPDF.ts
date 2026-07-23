import pdfParse from 'pdf-parse';

export interface ExtractedPDFData {
  noHistoria?: string;
  pacienteNombre?: string;
  pacienteId?: string;
  pacienteFechaNac?: string;
  pacienteEdad?: string;
  pacienteSexo?: string;
  pacienteDireccion?: string;
  pacienteMunicipio?: string;
  pacienteTelefono?: string;
  contratante?: string;
  noAtencion?: string;
  tipoConsulta?: string;
  medicoResponsable?: string;
  fechaIngreso?: string;
  servicio?: string;
  especialidad?: string;
  causaExterna?: string;
  descripcion?: string;
}

function extractValue(text: string, patterns: RegExp[]): string | undefined {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  return undefined;
}

export async function extractPDFData(buffer: Buffer): Promise<ExtractedPDFData> {
  const data = await pdfParse(buffer);
  const text = data.text;

  const result: ExtractedPDFData = {
    noHistoria: extractValue(text, [
      /N[°º]?\s*Historia\s*Cl[ií]nica[:\s]+([^\n\r]+)/i,
      /Historia\s*Cl[ií]nica[:\s]+([^\n\r]+)/i,
      /HC[:\s]+([^\n\r]+)/i,
    ]),
    pacienteNombre: extractValue(text, [
      /Nombre\s*(?:del\s*)?Paciente[:\s]+([^\n\r]+)/i,
      /Paciente[:\s]+([^\n\r]+)/i,
      /Nombres?\s*y\s*Apellidos?[:\s]+([^\n\r]+)/i,
    ]),
    pacienteId: extractValue(text, [
      /(?:C\.?C\.?|C[eé]dula)[:\s]+([0-9\s.]+)/i,
      /Identificaci[oó]n[:\s]+(?:CC\s*)?([0-9\s.]+)/i,
      /No\.?\s*Documento[:\s]+([0-9\s.]+)/i,
    ]),
    pacienteFechaNac: extractValue(text, [
      /Fecha\s*(?:de\s*)?Nacimiento[:\s]+([^\n\r]+)/i,
      /F\.?\s*Nac\.?[:\s]+([^\n\r]+)/i,
    ]),
    pacienteEdad: extractValue(text, [
      /Edad[:\s]+([0-9]+\s*(?:a[ñn]os?)?)/i,
    ]),
    pacienteSexo: extractValue(text, [
      /Sexo[:\s]+([^\n\r,]+)/i,
      /G[eé]nero[:\s]+([^\n\r,]+)/i,
    ]),
    pacienteDireccion: extractValue(text, [
      /Direcci[oó]n[:\s]+([^\n\r]+)/i,
      /Domicilio[:\s]+([^\n\r]+)/i,
    ]),
    pacienteMunicipio: extractValue(text, [
      /Municipio[:\s]+([^\n\r]+)/i,
      /Ciudad[:\s]+([^\n\r]+)/i,
    ]),
    pacienteTelefono: extractValue(text, [
      /Tel[eé]fono[:\s]+([0-9\s\-+]+)/i,
      /Tel\.?[:\s]+([0-9\s\-+]+)/i,
      /Celular[:\s]+([0-9\s\-+]+)/i,
    ]),
    contratante: extractValue(text, [
      /Contratante[:\s]+([^\n\r]+)/i,
      /EPS[:\s]+([^\n\r]+)/i,
      /Aseguradora[:\s]+([^\n\r]+)/i,
      /Entidad[:\s]+([^\n\r]+)/i,
    ]),
    noAtencion: extractValue(text, [
      /N[°º]?\s*Atenci[oó]n[:\s]+([^\n\r]+)/i,
      /No\.?\s*Atenci[oó]n[:\s]+([^\n\r]+)/i,
    ]),
    tipoConsulta: extractValue(text, [
      /Tipo\s*(?:de\s*)?Consulta[:\s]+([^\n\r]+)/i,
      /Tipo\s*Servicio[:\s]+([^\n\r]+)/i,
    ]),
    medicoResponsable: extractValue(text, [
      /M[eé]dico\s*Responsable[:\s]+([^\n\r]+)/i,
      /M[eé]dico\s*Tratante[:\s]+([^\n\r]+)/i,
      /Dr\.?\s+([^\n\r]+)/i,
    ]),
    fechaIngreso: extractValue(text, [
      /Fecha\s*(?:y\s*Hora\s*)?(?:de\s*)?Ingreso[:\s]+([^\n\r]+)/i,
      /Fecha\s*Ingreso[:\s]+([^\n\r]+)/i,
    ]),
    servicio: extractValue(text, [
      /Servicio[:\s]+([^\n\r]+)/i,
    ]),
    especialidad: extractValue(text, [
      /Especialidad[:\s]+([^\n\r]+)/i,
    ]),
    causaExterna: extractValue(text, [
      /Causa\s*Externa[:\s]+([^\n\r]+)/i,
    ]),
    descripcion: extractValue(text, [
      /(?:Descripci[oó]n|Plan|Motivo\s*(?:de\s*)?Consulta|Diagn[oó]stico)[:\s]+([^\n\r]{10,})/i,
      /PLAN[:\s]+([^\n\r]{10,})/i,
    ]),
  };

  // Limpiar valores
  Object.keys(result).forEach((key) => {
    const k = key as keyof ExtractedPDFData;
    if (result[k]) {
      result[k] = result[k]!.replace(/\s+/g, ' ').trim();
      if (result[k]!.length > 255) {
        result[k] = result[k]!.substring(0, 255);
      }
    }
  });

  return result;
}
