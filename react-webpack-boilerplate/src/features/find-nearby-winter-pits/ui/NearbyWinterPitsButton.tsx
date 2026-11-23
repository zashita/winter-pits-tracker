import React from 'react';
import styles from './NearbyWinterPitsButton.module.scss';

interface NearbyWinterPitsButtonProps {
    isActive: boolean;
    isLoading: boolean;
    onClick: () => void;
}

export const NearbyWinterPitsButton: React.FC<NearbyWinterPitsButtonProps> = ({ isActive, isLoading, onClick }) => (
    <button
        className={`${styles.button}${isActive ? ` ${styles.isActive}` : ''}`}
        type="button"
        aria-pressed={isActive}
        disabled={isLoading}
        onClick={onClick}
    >
        <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M16.25 8.35c0 4.22-6.25 9.15-6.25 9.15S3.75 12.57 3.75 8.35a6.25 6.25 0 1 1 12.5 0Z" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="10" cy="8.25" r="2.1" stroke="currentColor" strokeWidth="1.5" />
        </svg>
        <span>{isLoading ? 'Определяем местоположение…' : 'Зимовальные ямы поблизости'}</span>
    </button>
);
