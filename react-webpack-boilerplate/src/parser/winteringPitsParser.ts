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
    const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
    let descBuffer = "";
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const coordRegex = /(\d+\.\d+)\s*,\s*(\d+\.\d+)/g;
        const coords: string[] = [];
        let m;
        while ((m = coordRegex.exec(line)) !== null) {
            coords.push(`${m[1]},${m[2]}`);
        }
        const areaRegex = /(\d+[\.,]\d+)\s*,?\s*га/i;
        const areaMatch = line.match(areaRegex);
        const square = areaMatch ? parseFloat(areaMatch[1].replace(",", ".")) : 0;
        if (coords.length > 0) {
            const starts = coords[0].split(",").map(Number) as [number, number];
            const ends = coords.length > 1 ? (coords[1].split(",").map(Number) as [number, number]) : undefined;
            const description = descBuffer || line.replace(/\d+\.\d+.*$/, "").trim();
            pits.push({ id: randomId(), starts, ends, square, description: description || "Зимовальная яма" });
            descBuffer = "";
        } else {
            if (line.length > 3 && !line.match(/^[\*\-]/)) {
                descBuffer += (descBuffer ? " " : "") + line;
            }
        }
    }
    return pits;
}
