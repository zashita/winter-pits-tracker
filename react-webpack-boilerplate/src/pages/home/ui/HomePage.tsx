import React, { useEffect, useRef } from "react";

export const HomePage: React.FC = () => {
    const mapRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const key = (window as any).__YANDEX_MAPS_API_KEY__ || "0ef0e12b-eac8-439d-96da-4c4a61e8258c";
        const script = document.createElement("script");
        script.src = `https://api-maps.yandex.ru/2.1/?lang=ru_RU&apikey=${key}`;
        script.async = true;
        document.head.appendChild(script);

        script.onload = () => {
            const ymaps: any = (window as any).ymaps;
            if (ymaps && mapRef.current) {
                ymaps.ready(() => {
                    const map = new ymaps.Map(mapRef.current, {
                        center: [53.9, 27.56],
                        zoom: 7,
                        controls: ["zoomControl", "fullscreenControl"],
                    });

                    const pits = [
                        { coords: [52.08587, 23.74816], ends: [52.09062, 23.83485], name: "Брест, залив Мухавец", area: 21.6 },
                        { coords: [52.09380, 23.78080], ends: null, name: "Брест, карьер у ЦГБ", area: 22.0 },
                        { coords: [52.09694, 23.90190], ends: null, name: "Шебринский залив", area: 49.0 },
                        { coords: [52.21492, 24.36449], ends: [52.21521, 24.35950], name: "Кобрин, р. Мухавец", area: 2.15 },
                        { coords: [52.15676, 27.34035], ends: [52.15896, 27.34773], name: "Лунинец, р. Припять", area: 7.9 },
                        { coords: [55.17507, 29.89041], ends: [55.18024, 29.88008], name: "Бешенковичи, р. Зап. Двина", area: 8.8 },
                        { coords: [55.39178, 26.82553], ends: null, name: "Браслав, оз. Богинское", area: 2.8 },
                        { coords: [55.62118, 26.96536], ends: null, name: "Браслав, оз. Дривяты", area: 3.0 },
                        { coords: [51.332561, 30.616527], ends: [51.326901, 30.617458], name: "Брагин, р. Днепр", area: 15.0 },
                        { coords: [54.665906, 30.910841], ends: [54.667175, 30.915639], name: "Дубровно, р. Днепр", area: 1.7 },
                        { coords: [55.817692, 27.856815], ends: [55.818551, 27.823581], name: "Миорский р-н, р. Зап. Двина", area: 41.6 },
                    ];

                    pits.forEach((p: any) => {
                        const lat = p.coords[0];
                        const lng = p.coords[1];
                        const radius = Math.sqrt(p.area) * 0.01;
                        const polygonCoords = [
                            [lat - radius / 2, lng - radius / 2],
                            [lat - radius / 2, lng + radius / 2],
                            [lat + radius / 2, lng + radius / 2],
                            [lat + radius / 2, lng - radius / 2],
                        ];

                        const polygon = new ymaps.Polygon([polygonCoords], {
                            hintContent: p.name,
                        }, {
                            fillColor: "#ff000055",
                            strokeColor: "#ff0000",
                            strokeWidth: 2,
                            opacity: 0.7,
                        });
                        polygon.events.add("click", () => {
                            polygon.balloon.open(map.getCenter(), { content: `<b>${p.name}</b><br/>Площадь: ${p.area} га` });
                        });
                        map.geoObjects.add(polygon);

                        const pm = new ymaps.Placemark(p.coords, {
                            iconContent: p.name,
                            balloonContent: `<b>${p.name}</b><br/>Площадь: ${p.area} га`,
                        }, { preset: "islands#redDotIcon", iconColor: "#ff0000" });
                        map.geoObjects.add(pm);
                    });
                });
            }
        };

        return () => {
            try { document.head.removeChild(script); } catch (e) {}
        };
    }, []);

    return (
        <div style={{ width: "100vw", height: "100vh", overflow: "hidden", position: "relative" }}>
            <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
            <div style={{ position: "absolute", top: 12, left: 12, right: 12, background: "rgba(11,11,11,0.85)", padding: 12, borderRadius: 12, pointerEvents: "none" }}>
                <h1 style={{ margin: 0, fontSize: 18, color: "#fff" }}>Зимовальные ямы Беларуси</h1>
                <p style={{ margin: 4, fontSize: 12, color: "#aaa" }}>Полигоны на основе площади и координат</p>
            </div>
        </div>
    );
};
