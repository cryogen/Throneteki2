import { useTranslation } from 'react-i18next';

import Panel from '../site/Panel';
import CardSizeOption from './CardSizeOption';

export interface SettingsCardSizeOption {
    name: string;
    label: string;
}

interface CardSizeProps {
    cardSizes: SettingsCardSizeOption[];
    selectedCardSize: string;
    onCardSizeSelected(cardSize: string): void;
}
const SettingsCardSize = ({ cardSizes, selectedCardSize, onCardSizeSelected }: CardSizeProps) => {
    const { t } = useTranslation();

    return (
        <Panel title={t('Card Image Size')}>
            <div>
                <div className='flex items-end'>
                    {cardSizes.map((cardSize) => (
                        <CardSizeOption
                            key={cardSize.name}
                            label={cardSize.label}
                            name={cardSize.name}
                            onSelect={onCardSizeSelected}
                            selected={selectedCardSize === cardSize.name}
                        />
                    ))}
                </div>
            </div>
        </Panel>
    );
};

export default SettingsCardSize;
