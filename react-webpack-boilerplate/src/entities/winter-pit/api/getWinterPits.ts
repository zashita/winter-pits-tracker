import { API_URL } from '@/shared/config/env';
import type { WinterPit } from '../model/types';

export async function getWinterPits(signal?: AbortSignal): Promise<WinterPit[]> {
    const response = await fetch(`${API_URL}/pits`, { signal });
    if (!response.ok) {
        throw new Error(`Сервер вернул ошибку ${response.status}`);
    }
    return response.json() as Promise<WinterPit[]>;
}
