interface PlaceholderProps {
    name: string;
    feedType?: string;
}

export default function Placeholder({ name, feedType }: PlaceholderProps) {
    return (
        <div className="placeholder">
            <h2>{name}</h2>
            {feedType && <p>feedType: {feedType}</p>}
        </div>
    );
}
