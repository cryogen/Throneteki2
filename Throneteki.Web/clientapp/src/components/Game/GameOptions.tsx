import { Input, Switch } from '@nextui-org/react';
import { Trans, useTranslation } from 'react-i18next';

interface GameOptionsProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    formProps: any;
}

const GameOptions = ({ formProps }: GameOptionsProps) => {
    const { t } = useTranslation();

    const options = [
        { name: 'allowSpectators', label: t('Allow spectators') },
        { name: 'showHand', label: t('Show hands to spectators') },
        { name: 'muteSpectators', label: t('Mute spectators') },
        { name: 'useGameTimeLimit', label: t('Use a time limit (in minutes)') },
        { name: 'gamePrivate', label: t('Private (requires game link)') },
        {
            name: 'useChessClocks',
            label: t('Use chess clocks with a time limit per player (in minutes)')
        }
    ];

    return (
        <>
            <div>
                <div className='text-foreground-500'>
                    <Trans>Options</Trans>
                </div>
                <div className='mt-2 grid grid-cols-3'>
                    {options.map((option) => (
                        <div key={option.name}>
                            <Switch
                                className='mb-2'
                                classNames={{ label: 'text-sm' }}
                                id={option.name}
                                onChange={formProps.handleChange}
                                value='true'
                                isSelected={formProps.values[option.name]}
                            >
                                {option.label}
                            </Switch>
                        </div>
                    ))}
                </div>
            </div>
            {formProps.values.useGameTimeLimit && (
                <div>
                    <Input
                        label={t('Time Limit')}
                        type='text'
                        placeholder={t('Enter time limit')}
                        {...formProps.getFieldProps('gameTimeLimit')}
                        errorMessage={formProps.errors.gameTimeLimit}
                    />
                </div>
            )}
            {formProps.values.useChessClocks && (
                <div className='mt-2'>
                    <Input
                        label={t('Chess Clock Limit')}
                        type='text'
                        placeholder={t('Enter time limit')}
                        {...formProps.getFieldProps('gameChessClockLimit')}
                        errorMessage={formProps.errors.gameChessClockLimit}
                    />
                </div>
            )}
        </>
    );
};

export default GameOptions;
