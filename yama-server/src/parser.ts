function stripHtml(html: string): string {
    return html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
}

export interface WinteringPit {
    id: number;
    starts: [number, number];
    ends?: [number, number];
    square: number;
    description: string;
}

function randomId(): number {
    return Math.floor(10000 + Math.random() * 90000);
}

export async function parseWinteringPits(url?: string): Promise<WinteringPit[]> {
    const target = url || "https://mshp.gov.by/ru/fishing-ru/view/perechen-zimovalnyx-jam-8851/";
    const res = await fetch(target);
    const text = await res.text();

    const pits: WinteringPit[] = [];

    const headerIndex = text.indexOf('Место расположения');
    if (headerIndex === -1) return pits;

    let tableStart = text.lastIndexOf('<table', headerIndex);
    if (tableStart === -1) return pits;

    let tableEnd = text.indexOf('</table>', headerIndex);
    if (tableEnd === -1) return pits;
    tableEnd += '</table>'.length;

    const tableHtml = text.substring(tableStart, tableEnd);

    const tbodyMatch = tableHtml.match(/<tbody[^>]*>([\s\S]*?)<\/tbody>/i);
    const tbodyHtml = tbodyMatch ? tbodyMatch[1] : tableHtml;

    const trRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
    let trMatch;

    while ((trMatch = trRegex.exec(tbodyHtml)) !== null) {
        const rowContent = trMatch[1];
        const tdRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi;
        const cells: string[] = [];
        let tdMatch;
        while ((tdMatch = tdRegex.exec(rowContent)) !== null) {
            const clean = stripHtml(tdMatch[1]).replace(/&nbsp;/g, ' ');
            cells.push(clean);
        }
        if (cells.length === 0) continue;
        const fullRowText = cells.join(' ');
        if (fullRowText.includes('Место расположения') || fullRowText.includes('Географические координаты')) {
            continue;
        }
        if (cells.length === 1) continue;
        if (cells.length >= 3) {
            const rawPlace = cells[0];
            const rawStarts = cells[1];
            let rawEnds = '';
            let rawSquare = '';
            if (cells.length === 4) {
                rawEnds = cells[2];
                rawSquare = cells[3];
            } else {
                rawSquare = cells[2];
            }
            const startsArr = rawStarts.split(',').map(s => parseFloat(s.trim())).filter(n => !isNaN(n));
            const endsArr = rawEnds ? rawEnds.split(',').map(s => parseFloat(s.trim())).filter(n => !isNaN(n)) : undefined;
            const squareVal = parseFloat(rawSquare.replace(',', '.'));
            const starts = startsArr.length === 2 ? [startsArr[0], startsArr[1]] as [number, number] : [0, 0] as [number, number];
            const ends = endsArr && endsArr.length === 2 ? [endsArr[0], endsArr[1]] as [number, number] : undefined;
            pits.push({
                id: randomId(),
                starts,
                ends,
                square: isNaN(squareVal) ? 0 : squareVal,
                description: rawPlace || 'Зимовальная яма'
            });
        }
    }

    return pits;
}
