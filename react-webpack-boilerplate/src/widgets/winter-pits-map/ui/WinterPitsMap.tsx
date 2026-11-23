import React, { useEffect, useRef, useState } from 'react';
import { makeAreaContour, type WinterPit } from '@/entities/winter-pit';
import { YANDEX_MAPS_CONFIG } from '@/shared/config/env';
import type { Coordinates } from '@/shared/model/coordinates';
import styles from './WinterPitsMap.module.scss';

interface WinterPitsMapProps {
    pits: WinterPit[];
    focusedPitId?: number;
    userLocation?: Coordinates;
}

type MapEntity = { marker: any; element: HTMLElement; popup?: HTMLElement };

// The API and our domain model store coordinates as [latitude, longitude]; Yandex v3 expects [longitude, latitude].
const toLngLat = ([latitude, longitude]: Coordinates): [number, number] => [longitude, latitude];

const getPitPoint = (pit: WinterPit): Coordinates => (pit.shape
    ? [(pit.shape[0][0] + pit.shape[1][0]) / 2, (pit.shape[0][1] + pit.shape[1][1]) / 2]
    : pit.starts);

export const WinterPitsMap: React.FC<WinterPitsMapProps> = ({ pits, focusedPitId, userLocation }) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapObjectRef = useRef<any>(null);
    const ymapsRef = useRef<any>(null);
    const entitiesRef = useRef<any[]>([]);
    const pitMarkersRef = useRef<Map<number, MapEntity>>(new Map());
    const [mapReady, setMapReady] = useState(false);
    const [mapError, setMapError] = useState(false);

    useEffect(() => {
        let cancelled = false;
        let script: HTMLScriptElement | undefined;

        const initializeMap = async () => {
            try {
                const ymaps3 = (window as any).ymaps3;
                if (!ymaps3 || !mapRef.current || cancelled) {
                    if (!cancelled) setMapError(true);
                    return;
                }

                await ymaps3.ready;
                if (cancelled || !mapRef.current) return;

                const { YMap, YMapDefaultSchemeLayer, YMapDefaultFeaturesLayer } = ymaps3;
                const map = new YMap(mapRef.current, {
                    location: { center: [27.56, 53.9], zoom: 7 },
                    theme: 'dark',
                    mode: 'vector',
                    behaviors: ['drag', 'pinchZoom', 'scrollZoom', 'dblClick'],
                });
                map.addChild(new YMapDefaultSchemeLayer());
                map.addChild(new YMapDefaultFeaturesLayer());

                mapObjectRef.current = map;
                ymapsRef.current = ymaps3;
                setMapReady(true);

                // YMapZoomControl is provided by the optional default UI package, not the core v3 namespace.
                try {
                    ymaps3.import.registerCdn('https://cdn.jsdelivr.net/npm/{package}', [
                        '@yandex/ymaps3-default-ui-theme@0.0',
                    ]);
                    const { YMapControls } = ymaps3;
                    const { YMapZoomControl } = await ymaps3.import('@yandex/ymaps3-default-ui-theme');
                    if (!cancelled && mapObjectRef.current === map && YMapZoomControl) {
                        const controls = new YMapControls({ position: 'right' });
                        controls.addChild(new YMapZoomControl({}));
                        map.addChild(controls);
                    }
                } catch (error) {
                    // A missing optional control must not prevent pits from being rendered on the map.
                    console.warn('Yandex Maps zoom controls could not be loaded', error);
                }
            } catch (error) {
                console.error('Failed to initialize Yandex Maps API v3', error);
                if (!cancelled) setMapError(true);
            }
        };

        const currentYmaps = (window as any).ymaps3;
        if (currentYmaps) {
            void initializeMap();
        } else {
            script = document.createElement('script');
            script.src = `${YANDEX_MAPS_CONFIG.apiUrl}?apikey=${encodeURIComponent(YANDEX_MAPS_CONFIG.apiKey)}&lang=${encodeURIComponent(YANDEX_MAPS_CONFIG.language)}`;
            script.async = true;
            script.onload = () => { void initializeMap(); };
            script.onerror = () => setMapError(true);
            document.head.appendChild(script);
        }

        return () => {
            cancelled = true;
            if (script) {
                script.onload = null;
                script.onerror = null;
                script.parentNode?.removeChild(script);
            }
            mapObjectRef.current?.destroy();
            mapObjectRef.current = null;
            ymapsRef.current = null;
            setMapReady(false);
        };
    }, []);

    useEffect(() => {
        const map = mapObjectRef.current;
        const ymaps3 = ymapsRef.current;
        if (!mapReady || !map || !ymaps3) return;

        for (const entity of entitiesRef.current) map.removeChild(entity);
        entitiesRef.current = [];
        pitMarkersRef.current.clear();

        const { YMapFeature, YMapMarker } = ymaps3;
        const addFeature = (geometry: any, style: any) => {
            const feature = new YMapFeature({ geometry, style });
            map.addChild(feature);
            entitiesRef.current.push(feature);
        };

        const closePopups = () => {
            pitMarkersRef.current.forEach((marker) => marker.popup?.classList.remove(styles.popupVisible));
        };

        for (const pit of pits) {
            if (pit.shape) {
                addFeature({ type: 'LineString', coordinates: [toLngLat(pit.shape[0]), toLngLat(pit.shape[1])] }, {
                    stroke: [{ color: '#f04444', width: 5 }],
                });
                addFeature({ type: 'LineString', coordinates: [toLngLat(pit.shape[3]), toLngLat(pit.shape[2])] }, {
                    stroke: [{ color: '#f04444', width: 5 }],
                });
            } else if (!pit.ends) {
                const contour = makeAreaContour(pit.starts, pit.square);
                if (contour) {
                    addFeature({ type: 'Polygon', coordinates: [contour.map(toLngLat)] }, {
                        fill: 'rgba(230, 57, 57, 0.2)',
                        stroke: [{ color: '#f04444', width: 2 }],
                    });
                }
            }

            const point = getPitPoint(pit);
            const element = document.createElement('button');
            element.type = 'button';
            element.className = styles.pitMarker;
            element.setAttribute('aria-label', pit.description);
            element.title = pit.description;

            const popup = document.createElement('span');
            popup.className = styles.pitPopup;
            const title = document.createElement('strong');
            title.textContent = pit.description;
            const details = document.createElement('span');
            details.textContent = `Начало: ${point[0].toFixed(5)}, ${point[1].toFixed(5)} · Площадь: ${pit.square} га`;
            popup.append(title, details);
            element.append(popup);
            element.addEventListener('click', (event) => {
                event.stopPropagation();
                const willOpen = !popup.classList.contains(styles.popupVisible);
                closePopups();
                if (willOpen) popup.classList.add(styles.popupVisible);
            });

            const marker = new YMapMarker({ coordinates: toLngLat(point), zIndex: 100 }, element);
            map.addChild(marker);
            entitiesRef.current.push(marker);
            pitMarkersRef.current.set(pit.id, { marker, element, popup });
        }

        if (userLocation) {
            const userMarker = document.createElement('div');
            userMarker.className = styles.userMarker;
            userMarker.setAttribute('role', 'img');
            userMarker.setAttribute('aria-label', 'Ваше местоположение');
            const marker = new YMapMarker({ coordinates: toLngLat(userLocation), zIndex: 200 }, userMarker);
            map.addChild(marker);
            entitiesRef.current.push(marker);
        }

        const points = pits.flatMap((pit) => [
            pit.starts,
            ...(pit.ends ? [pit.ends] : []),
            ...(pit.shape ?? []),
        ]);
        if (userLocation) points.push(userLocation);

        if (points.length === 0) {
            map.setLocation({ center: [27.56, 53.9], zoom: 7 });
        } else if (userLocation && pits.length === 0) {
            map.setLocation({ center: toLngLat(userLocation), zoom: 13, duration: 250 });
        } else {
            const lngLatPoints = points.map(toLngLat);
            const longitudes = lngLatPoints.map(([longitude]) => longitude);
            const latitudes = lngLatPoints.map(([, latitude]) => latitude);
            map.setLocation({
                bounds: [
                    [Math.min(...longitudes), Math.min(...latitudes)],
                    [Math.max(...longitudes), Math.max(...latitudes)],
                ],
                duration: 250,
            });
        }
    }, [pits, mapReady, userLocation]);

    useEffect(() => {
        if (focusedPitId === undefined) return;
        const pit = pits.find((item) => item.id === focusedPitId);
        const map = mapObjectRef.current;
        const marker = pitMarkersRef.current.get(focusedPitId);
        if (!pit || !map || !marker) return;

        map.setLocation({ center: toLngLat(getPitPoint(pit)), zoom: 12, duration: 250 });
        pitMarkersRef.current.forEach((item) => item.popup?.classList.remove(styles.popupVisible));
        marker.popup?.classList.add(styles.popupVisible);
    }, [focusedPitId, pits, mapReady]);

    return (
        <>
            <div ref={mapRef} className={styles.map} />
            {mapError && <div className={styles.mapNotice}>Не загрузилась карта Yandex Maps API v3. Проверьте, что ключ подключён к JavaScript API 3.0 и разрешает адрес сайта в настройках HTTP Referer. Список и данные доступны.</div>}
        </>
    );
};
