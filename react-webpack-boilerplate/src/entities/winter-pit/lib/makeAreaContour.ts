export function makeAreaContour(center: [number, number], areaHectares: number): [number, number][] | undefined {
    if (!Number.isFinite(areaHectares) || areaHectares <= 0) return undefined;

    const earthRadius = 6_378_137;
    const angularRadius = Math.sqrt(areaHectares * 10_000 / Math.PI) / earthRadius;
    const [latitude, longitude] = center.map(value => value * Math.PI / 180);
    const vertexCount = 48;
    const ring: [number, number][] = [];

    for (let index = 0; index < vertexCount; index += 1) {
        const bearing = index * 2 * Math.PI / vertexCount;
        const nextLatitude = Math.asin(
            Math.sin(latitude) * Math.cos(angularRadius)
            + Math.cos(latitude) * Math.sin(angularRadius) * Math.cos(bearing),
        );
        const nextLongitude = longitude + Math.atan2(
            Math.sin(bearing) * Math.sin(angularRadius) * Math.cos(latitude),
            Math.cos(angularRadius) - Math.sin(latitude) * Math.sin(nextLatitude),
        );
        ring.push([nextLatitude * 180 / Math.PI, nextLongitude * 180 / Math.PI]);
    }

    ring.push(ring[0]);
    return ring;
}
