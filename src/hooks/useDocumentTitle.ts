import { useEffect } from 'react';

export function useDocumentTitle(title: string): void {
    useEffect(() => {
        document.title = title ? `${title} | React HN` : 'React HN';
    }, [title]);
}
