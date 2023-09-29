import { Trans, useTranslation } from 'react-i18next';
import { GameType } from '../../types/enums';
import GameTypeInfo from './GameTypeInfo';
import { Radio, RadioGroup } from '@nextui-org/react';

interface GameTypesProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    formProps: any;
}

const GameTypes = ({ formProps }: GameTypesProps) => {
    const { t } = useTranslation();

    const types = [
        { name: GameType.Beginner, label: t('Beginner') },
        { name: GameType.Casual, label: t('Casual') },
        { name: GameType.Competitive, label: t('Competitive') }
    ];

    return (
        <>
            <div>
                <GameTypeInfo gameType={formProps.values.gameType} />
            </div>
            <div className='mt-2'>
                <RadioGroup
                    name='gameType'
                    label={t('Type')}
                    orientation='horizontal'
                    value={formProps.values.gameType}
                    onValueChange={(value) => formProps.setFieldValue('gameType', value)}
                >
                    {types.map((type) => (
                        <Radio
                            key={type.name}
                            id={type.name}
                            //         onChange={formProps.handleChange}
                            value={type.name}
                        >
                            {type.label}
                        </Radio>
                    ))}
                </RadioGroup>
            </div>
        </>
    );
};

export default GameTypes;
