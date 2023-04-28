import React, { useState } from 'react';
import { Row, Col, Form } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { GameType } from '../../types/enums';
import { Filter } from '../../types/lobby';
import Panel from '../Site/Panel';

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
            <Row>
                {filters.map((filter) => {
                    return (
                        <Col key={filter.name} sm={6} lg={4}>
                            <Form.Check
                                type='switch'
                                id={filter.name}
                                label={filter.label}
                                inline
                                onChange={(event) => {
                                    onFilterChecked(filter.name, event.target.checked);
                                }}
                                checked={currentFilter[filter.name]}
                            ></Form.Check>
                        </Col>
                    );
                })}
            </Row>
            <Row>
                <Col>
                    <Form.Check
                        type='switch'
                        id='onlyShowNew'
                        label={t('Only show new games')}
                        inline
                        onChange={(event) => {
                            onFilterChecked('onlyShowNew', event.target.checked);
                        }}
                        checked={currentFilter['onlyShowNew']}
                    ></Form.Check>
                </Col>
            </Row>
        </Panel>
    );
};

export default GameFilter;
