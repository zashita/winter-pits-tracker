const text = `БРЕСТСКАЯ ОБЛАСТЬ.
Г. Брест, залив по левому берегу... 52.08587, 23.74816 21,6
Г. Брест, карьер... 52.078982, 23.715168 18,0`;

const pits = [];
const lines = text.split(/\n/).map(l => l.trim()).filter(Boolean);
let currentDesc = "";

for (const line of lines) {
    const coordMatch = line.match(/(\d+\.\d+),\s*(\d+\.\d+)/);
    const areaMatch = line.match(/(\d+[\.,]\d+)\s*га/);
    if (coordMatch) {
        const desc = currentDesc || line.substring(0, line.indexOf(coordMatch[0])).trim();
        pits.push({
            id: Math.floor(10000 + Math.random() * 90000),
            starts: [parseFloat(coordMatch[1]), parseFloat(coordMatch[2])],
            square: areaMatch ? parseFloat(areaMatch[1].replace(",",".")) : 0,
            description: desc || "Зимовальная яма"
        });
        currentDesc = "";
    } else {
        currentDesc = line;
    }
}
console.log(JSON.stringify(pits, null, 2));
