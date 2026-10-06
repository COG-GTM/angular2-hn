export interface BackButtonProps {
    onClick: () => void;
}

export function BackButton({ onClick }: BackButtonProps) {
    return (
        <span
            className="back-button"
            role="button"
            tabIndex={0}
            aria-label="Back"
            onClick={onClick}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onClick();
                }
            }}
        ></span>
    );
}
