import { Story } from '../../app/shared/models/story';
import { useSettings } from '../context/SettingsContext';

export interface ItemProps {
    item: Story;
}

// ngOnInit() in ItemComponent has an empty body, so there is no useEffect equivalent to add here.
export const Item = ({ item }: ItemProps) => {
    const settings = useSettings();
    const hasUrl = item.url.indexOf('http') === 0;
    const isJob = item.type === 'job';

    return null;
};
