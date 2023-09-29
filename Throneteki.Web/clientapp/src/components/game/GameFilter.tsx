import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { GameType } from '../../types/enums';
import { Filter } from '../../types/lobby';
import Panel from '../site/Panel';
import { Switch } from '@nextui-org/react';

interface GameFilterProps {
    filter: Record<string, boolean>;
    onFilterChanged?: (filter: Filter) => void;
}

const GameFilter = ({ filter, onFilterChanged }: GameFilterProps) => {
    const { t } = useTranslation();
    const filters = [
        { name: GameType.Beginner, label: t('Beginner') },
        { name: GameType.Casual, label: t('Casual') },
        { name: GameType.Competitive, label: t('Competitive') }
    ];

    const [currentFilter, setCurrentFilter] = useState<Filter>(filter);

    const onFilterChecked = (name: string, checked: boolean) => {
        currentFilter[name] = checked;
        const newFilter = Object.assign({}, currentFilter);

        setCurrentFilter(newFilter);

        onFilterChanged && onFilterChanged(newFilter);
    };

    return (
        <Panel type='primary'>
            <div className='grid grid-cols-3'>
                {filters.map((filter) => (
                    <div key={filter.name}>
                        <Switch
                            id={filter.name}
                            onValueChange={(isSelected) => {
                                onFilterChecked(filter.name, isSelected);
                            }}
                            isSelected={currentFilter[filter.name]}
                        >
                            {filter.label}
                        </Switch>
                    </div>
                ))}
            </div>
            <div className='mt-2'>
                <Switch
                    id='onlyShowNew'
                    onValueChange={(isSelected) => {
                        onFilterChecked('onlyShowNew', isSelected);
                    }}
                    isSelected={currentFilter['onlyShowNew']}
                >
                    {t('Only show new games')}
                </Switch>
            </div>
        </Panel>
    );
};

export default GameFilter;
