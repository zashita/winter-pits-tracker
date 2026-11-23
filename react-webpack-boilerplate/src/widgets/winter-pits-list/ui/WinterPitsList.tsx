import React from 'react';
import type { WinterPit } from '@/entities/winter-pit';
import styles from './WinterPitsList.module.scss';

interface WinterPitsListProps {
    pits: WinterPit[];
    loading: boolean;
    error: string;
    title?: string;
    emptyMessage?: string;
    onSelect: (pit: WinterPit) => void;
}

export const WinterPitsList: React.FC<WinterPitsListProps> = ({
    pits,
    loading,
    error,
    title = 'Перечень зимовальных ям',
    emptyMessage = 'Парсер не вернул записей.',
    onSelect,
}) => (
    <aside className={styles.panel} aria-label="Список зимовальных ям">
        <div className={styles.panelTitle}>
            <div className={styles.titleCopy}>
                <span className={styles.eyebrow}>КАТАЛОГ МЕСТ</span>
                <strong>{title}</strong>
            </div>
            <span className={styles.count} aria-label={`Найдено: ${pits.length}`}>{loading ? '…' : pits.length}</span>
        </div>
        {error && <p className={styles.notice}>{error}</p>}
        {!loading && !error && pits.length === 0 && <p className={styles.notice}>{emptyMessage}</p>}
        <div className={styles.items}>
            {pits.map(pit => (
                <button className={styles.item} key={pit.id} type="button" onClick={() => onSelect(pit)}>
                    <span className={styles.itemName}>{pit.description}</span>
                    <span className={styles.itemDescription}>
                        Начало: {pit.starts[0].toFixed(5)}, {pit.starts[1].toFixed(5)}
                        {pit.ends && ` · Конец: ${pit.ends[0].toFixed(5)}, ${pit.ends[1].toFixed(5)}`}
                    </span>
                    <span className={styles.itemMeta}>Площадь: {pit.square} га{pit.shape ? ' · створы начала и конца' : !pit.ends ? ' · примерный круг по площади' : ' · координаты начала и конца'}</span>
                </button>
            ))}
        </div>
    </aside>
);
