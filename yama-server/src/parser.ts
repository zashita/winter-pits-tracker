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

export async function parseWinteringPits(url?: string): Promise<WinteringPit[]> {
  const target = url || 'https://mshp.gov.by/ru/fishing-ru/view/perechen-zimovalnyx-jam-8851/';
  const response = await fetch(target);
  if (!response.ok) {
    throw new Error(`Не удалось загрузить список зимовальных ям: HTTP ${response.status}`);
  }

  const html = await response.text();
  const tables = html.match(/<table\b[^>]*>[\s\S]*?<\/table>/gi) || [];
  const table = tables.find(candidate => {
    const text = stripHtml(candidate).toLocaleLowerCase('ru');
    return text.includes('место расположения') && text.includes('географические координаты');
  });
  if (!table) {
    throw new Error('В загруженной странице не найдена таблица зимовальных ям');
  }

  const pits: WinteringPit[] = [];
  const rows = table.match(/<tr\b[^>]*>[\s\S]*?<\/tr>/gi) || [];

  for (const row of rows) {
    const cells = row.match(/<td\b[^>]*>[\s\S]*?<\/td>/gi) || [];
    if (cells.length < 3) continue;

    const descriptionCell = cells[0];
    const startsCell = cells[1];
    if (!descriptionCell || !startsCell) continue;

    const description = stripHtml(descriptionCell);
    const startsCandidates = parseCoordinates(startsCell);
    if (!description || startsCandidates.length === 0) continue;

    const hasSeparateEndCell = cells.length >= 4;
    const endsCandidates = hasSeparateEndCell && cells[2] ? parseCoordinates(cells[2]) : [];
    const squareCell = cells[hasSeparateEndCell ? 3 : 2];
    if (!squareCell) continue;

    const shape = startsCandidates.length >= 2 && endsCandidates.length >= 2
      ? [startsCandidates[0], startsCandidates[1], endsCandidates[1], endsCandidates[0]] as WinteringPit['shape']
      : undefined;

    pits.push({
      id: pits.length + 1,
      starts: startsCandidates[0],
      ...(endsCandidates.length > 0 ? { ends: endsCandidates[0] } : {}),
      ...(shape ? { shape } : {}),
      square: parseSquare(squareCell),
      description,
    });
  }

  return pits;
}
