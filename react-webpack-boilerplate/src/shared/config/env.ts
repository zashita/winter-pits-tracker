const defaultApiUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:4000'
    : '';

export const API_URL = (window as any).__API_URL__ || defaultApiUrl;

export const YANDEX_MAPS_CONFIG = {
    apiUrl: __YANDEX_MAPS_API_URL__,
    apiKey: __YANDEX_MAPS_API_KEY__,
    language: __YANDEX_MAPS_LANGUAGE__,
};
