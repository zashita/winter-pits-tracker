import { useMemo, useState } from 'react';
import type { WinterPit } from '@/entities/winter-pit';
import type { Coordinates } from '@/shared/model/coordinates';

const SEARCH_RADIUS_METERS = 5_000;
const EARTH_RADIUS_METERS = 6_371_000;
type LocationSource = 'browser' | 'ip';

function distanceInMeters(from: Coordinates, to: Coordinates): number {
    const radians = (degrees: number) => degrees * Math.PI / 180;
    const latitudeDelta = radians(to[0] - from[0]);
    const longitudeDelta = radians(to[1] - from[1]);
    const fromLatitude = radians(from[0]);
    const toLatitude = radians(to[0]);
    const haversine = Math.sin(latitudeDelta / 2) ** 2
        + Math.cos(fromLatitude) * Math.cos(toLatitude) * Math.sin(longitudeDelta / 2) ** 2;
    return EARTH_RADIUS_METERS * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}

function requestUserCoordinates(): Promise<Coordinates> {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Ваш браузер не поддерживает определение местоположения.'));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            position => resolve([position.coords.latitude, position.coords.longitude]),
            error => {
                const message = error.code === error.PERMISSION_DENIED
                    ? 'Разрешите доступ к местоположению в настройках браузера.'
                    : error.code === error.POSITION_UNAVAILABLE
                        ? 'Не удалось определить местоположение устройства.'
                        : 'Определение местоположения заняло слишком много времени. Попробуйте ещё раз.';
                reject(new Error(message));
            },
            { enableHighAccuracy: true, timeout: 15_000, maximumAge: 30_000 },
        );
    });
}

async function requestIpCoordinates(): Promise<Coordinates> {
    const response = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(8_000) });
    if (!response.ok) throw new Error(`IP-сервис вернул ошибку ${response.status}.`);

    const data = await response.json() as {
        latitude?: number | null;
        longitude?: number | null;
        error?: boolean;
        reason?: string;
        message?: string;
    };
    if (data.error || !Number.isFinite(data.latitude) || !Number.isFinite(data.longitude)) {
        throw new Error(data.message || data.reason || 'IP-сервис не вернул координаты.');
    }
    const latitude = data.latitude as number;
    const longitude = data.longitude as number;
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
        throw new Error('IP-сервис вернул некорректные координаты.');
    }
    return [latitude, longitude];
}

export function useNearbyWinterPits(pits: WinterPit[]) {
    const [userLocation, setUserLocation] = useState<Coordinates>();
    const [locationSource, setLocationSource] = useState<LocationSource>();
    const [isNearbyMode, setIsNearbyMode] = useState(false);
    const [isLocating, setIsLocating] = useState(false);
    const [error, setError] = useState('');

    const nearbyPits = useMemo(
        () => userLocation
            ? pits.filter(pit => distanceInMeters(userLocation, pit.starts) <= SEARCH_RADIUS_METERS)
            : [],
        [pits, userLocation],
    );

    const toggleNearbyMode = async () => {
        if (isNearbyMode) {
            setIsNearbyMode(false);
            setUserLocation(undefined);
            setLocationSource(undefined);
            setError('');
            return;
        }

        setIsLocating(true);
        setError('');
        try {
            let location: Coordinates;
            let source: LocationSource;
            try {
                location = await requestUserCoordinates();
                source = 'browser';
            } catch {
                location = await requestIpCoordinates();
                source = 'ip';
            }
            setUserLocation(location);
            setLocationSource(source);
            setIsNearbyMode(true);
        } catch (reason) {
            const detail = reason instanceof Error ? reason.message : 'IP-сервис недоступен.';
            setError(`Не удалось определить местоположение через браузер или по IP. ${detail}`);
        } finally {
            setIsLocating(false);
        }
    };

    return {
        nearbyPits,
        userLocation: isNearbyMode ? userLocation : undefined,
        locationSource: isNearbyMode ? locationSource : undefined,
        isNearbyMode,
        isLocating,
        error,
        toggleNearbyMode,
    };
}
