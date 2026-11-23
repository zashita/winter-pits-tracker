function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&nbsp;|&#160;|&#xA0;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)))
    .replace(/&#x([\da-f]+);/gi, (_, code: string) => String.fromCodePoint(parseInt(code, 16)));
}

function stripHtml(value: string): string {
  return decodeHtmlEntities(value.replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]*>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim();
}

function parseCoordinates(value: string): [number, number][] {
  const coordinates: [number, number][] = [];
  const coordinatePattern = /(-?\d{1,2}\.\d+)\s*,\s*(-?\d{1,3}\.\d+)/g;
  const text = stripHtml(value);
  let match: RegExpExecArray | null;

  while ((match = coordinatePattern.exec(text)) !== null) {
    const latitude = Number(match[1]);
    const longitude = Number(match[2]);
    if (latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180) {
      coordinates.push([latitude, longitude]);
    }
  }

  return coordinates;
}

function parseSquare(value: string): number {
  const square = Number.parseFloat(stripHtml(value).replace(/\s/g, '').replace(',', '.'));
  return Number.isFinite(square) ? square : 0;
}

export interface WinteringPit {
  id: number;
  starts: [number, number];
  ends?: [number, number];
  shape?: [[number, number], [number, number], [number, number], [number, number]];
  square: number;
  description: string;
}

const OFFICIAL_SOURCE_URL = 'https://mshp.gov.by/ru/fishing-ru/view/perechen-zimovalnyx-jam-8851/';
const MIRROR_SOURCE_URL = 'https://platnik.by/zimovalnye-yamy';
const SOURCE_TIMEOUT_MS = 15_000;

function parseOfficialTable(html: string): WinteringPit[] {
  const tables = html.match(/<table\b[^>]*>[\s\S]*?<\/table>/gi) || [];
  const table = tables.find(candidate => {
    const text = stripHtml(candidate).toLocaleLowerCase('ru');
    return text.includes('место расположения') && text.includes('географические координаты');
  });
  if (!table) return [];

  const pits: WinteringPit[] = [];
  const rows = table.match(/<tr\b[^>]*>[\s\S]*?<\/tr>/gi) || [];

  for (const row of rows) {
    const cells = row.match(/<td\b[^>]*>[\s\S]*?<\/td>/gi) || [];
    if (cells.length < 3) continue;

    const hasSeparateEndCell = cells.length >= 4;
    const description = stripHtml(cells[0]);
    const startsCandidates = parseCoordinates(cells[1]);
    const endsCandidates = hasSeparateEndCell ? parseCoordinates(cells[2]) : [];
    const squareCell = cells[hasSeparateEndCell ? 3 : 2];
    if (!description || !startsCandidates.length || !squareCell) continue;

    const shape = startsCandidates.length >= 2 && endsCandidates.length >= 2
      ? [startsCandidates[0], startsCandidates[1], endsCandidates[1], endsCandidates[0]] as WinteringPit['shape']
      : undefined;

    pits.push({
      id: pits.length + 1,
      starts: startsCandidates[0],
      ...(endsCandidates.length ? { ends: endsCandidates[0] } : {}),
      ...(shape ? { shape } : {}),
      square: parseSquare(squareCell),
      description,
    });
  }

  return pits;
}

function parseMirrorData(html: string): WinteringPit[] {
  // The page includes its public records in a Next.js streaming payload.
  // Property quotes are escaped once by the payload's enclosing JSON string.
  const records = [...html.matchAll(/\\+"region\\+":/g)];
  const pits: WinteringPit[] = [];

  for (let index = 0; index < records.length; index += 1) {
    const propertyIndex = records[index].index;
    if (propertyIndex === undefined) continue;
    const objectStart = html.lastIndexOf('{', propertyIndex);
    const nextPropertyIndex = records[index + 1]?.index;
    const objectEnd = nextPropertyIndex === undefined
      ? html.indexOf('}', propertyIndex) + 1
      : html.lastIndexOf('}', nextPropertyIndex - 1) + 1;
    if (objectStart < 0 || objectEnd <= objectStart) continue;

    let record: {
      district?: string;
      water?: string;
      place?: string;
      areaHa?: number;
      upper?: [number, number][];
      lower?: [number, number][];
      at?: [number, number];
    };
    try {
      record = JSON.parse(html.slice(objectStart, objectEnd).replace(/\\"/g, '"'));
    } catch {
      continue;
    }

    const starts = record.upper?.[0] || record.at;
    if (!starts || !record.water || !record.place || !Number.isFinite(record.areaHa)) continue;
    const ends = record.lower?.[0];
    const shape = record.upper?.length === 2 && record.lower?.length === 2
      ? [record.upper[0], record.upper[1], record.lower[1], record.lower[0]] as WinteringPit['shape']
      : undefined;

    pits.push({
      id: pits.length + 1,
      starts,
      ...(ends ? { ends } : {}),
      ...(shape ? { shape } : {}),
      square: record.areaHa as number,
      description: `${record.water}: ${record.place}${record.district ? ` (${record.district})` : ''}`,
    });
  }

  return pits;
}

export async function parseWinteringPits(url?: string): Promise<WinteringPit[]> {
  const sources = url
    ? [url]
    : [process.env.PARSER_SOURCE_URL || OFFICIAL_SOURCE_URL, process.env.PARSER_FALLBACK_URL || MIRROR_SOURCE_URL];
  const errors: string[] = [];

  for (const source of [...new Set(sources)]) {
    try {
      const response = await fetch(source, {
        signal: AbortSignal.timeout(SOURCE_TIMEOUT_MS),
        headers: { 'User-Agent': 'WinterPitsTracker/1.0 (+https://winter-pits-tracker.onrender.com)' },
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const html = await response.text();
      const pits = parseOfficialTable(html);
      const parsed = pits.length ? pits : parseMirrorData(html);
      if (!parsed.length) throw new Error('В источнике не найден список с координатами');
      if (source !== sources[0]) console.warn(`Использован резервный источник зимовальных ям: ${source}`);
      return parsed;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      errors.push(`${source}: ${message}`);
      if (sources.length > 1) console.warn(`Источник зимовальных ям недоступен: ${source} (${message})`);
    }
  }

  throw new Error(`Не удалось получить список зимовальных ям. ${errors.join('; ')}`);
}
