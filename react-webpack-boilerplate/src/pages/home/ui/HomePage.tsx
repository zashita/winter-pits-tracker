import React, { useEffect, useState } from 'react';
import { getWinterPits, type WinterPit } from '@/entities/winter-pit';
import { NearbyWinterPitsButton, useNearbyWinterPits } from '@/features/find-nearby-winter-pits';
import { WinterPitsList } from '@/widgets/winter-pits-list';
import { WinterPitsMap } from '@/widgets/winter-pits-map';
import styles from './HomePage.module.scss';

export const HomePage: React.FC = () => {
    const [pits, setPits] = useState<WinterPit[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [listOpen, setListOpen] = useState(false);
    const [focusedPitId, setFocusedPitId] = useState<number>();
    const nearby = useNearbyWinterPits(pits);
    const visiblePits = nearby.isNearbyMode ? nearby.nearbyPits : pits;

    useEffect(() => {
        const controller = new AbortController();
        getWinterPits(controller.signal)
            .then(setPits)
            .catch(reason => {
                if (!(reason instanceof Error) || reason.name !== 'AbortError') {
                    setError('Не удалось загрузить данные. Проверьте, что сервер запущен на порту 4000.');
                }
            })
            .finally(() => {
                if (!controller.signal.aborted) setLoading(false);
            });
        return () => controller.abort();
    }, []);

    const selectPit = (pit: WinterPit) => {
        setFocusedPitId(pit.id);
        if (window.matchMedia('(max-width: 600px)').matches) setListOpen(false);
    };

    return (
        <main className={`${styles.page}${listOpen ? ` ${styles.listOpen}` : ''}`}>
            <WinterPitsMap pits={visiblePits} focusedPitId={focusedPitId} userLocation={nearby.userLocation} />

            <header className={styles.header}>
                <div className={styles.brand}>
                    <div className={styles.brandMark} aria-hidden="true">
                        <svg viewBox="0 0 24 24" fill="none">
                            <path d="M12 2.8v18.4M4.02 7.4l15.96 9.2M4.02 16.6l15.96-9.2M8.2 5l3.8 2.2L15.8 5M8.2 19l3.8-2.2 3.8 2.2M4.1 11.2l3.8 2.2-.1 4.4m12-9-3.8 2.2.1 4.4M4.1 12.8l3.8-2.2-.1-4.4m12 9-3.8-2.2.1-4.4" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                    <div className={styles.brandCopy}>
                        <span className={styles.eyebrow}>АТЛАС ВОДОЁМОВ БЕЛАРУСИ</span>
                        <h1>Зимовальные ямы</h1>
                        <p>Поперечные створы отмечают границы ям</p>
                    </div>
                </div>

                <div className={styles.headerActions}>
                    <NearbyWinterPitsButton isActive={nearby.isNearbyMode} isLoading={nearby.isLocating} onClick={nearby.toggleNearbyMode} />
                    <button className={styles.listToggle} type="button" onClick={() => setListOpen(open => !open)}>
                        <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                            <path d="M7 5h9M7 10h9M7 15h9M3.5 5h.01M3.5 10h.01M3.5 15h.01" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                        </svg>
                        {listOpen ? 'Скрыть список' : 'Показать список'}
                    </button>
                </div>
            </header>

            {(nearby.error || nearby.isNearbyMode) && (
                <div className={`${styles.nearbyFeedback}${nearby.error ? ` ${styles.isError}` : ''}`} role={nearby.error ? 'alert' : 'status'} aria-live="polite">
                    {nearby.error || `${nearby.locationSource === 'ip' ? 'Местоположение определено приблизительно по IP. ' : ''}В радиусе 5 км: ${nearby.nearbyPits.length}. Нажмите кнопку, чтобы показать все ямы.`}
                </div>
            )}

            {listOpen && (
                <WinterPitsList
                    pits={visiblePits}
                    loading={loading}
                    error={error}
                    title={nearby.isNearbyMode ? 'Зимовальные ямы поблизости' : undefined}
                    emptyMessage={nearby.isNearbyMode ? 'В радиусе 5 км ям не найдено.' : undefined}
                    onSelect={selectPit}
                />
            )}
        </main>
    );
};
