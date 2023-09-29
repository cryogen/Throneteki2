import { useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useGetCardsQuery } from '../../redux/api/apiSlice';
import { Card } from '../../types/data';
import CardImage from '../images/CardImage';
import LoadingSpinner from '../LoadingSpinner';
import Alert from '../site/Alert';
import { Button } from '@nextui-org/react';

interface AgendaSelectProps {
    onBackClick: () => void;
    onNextClick: (agendas: Card[]) => void;
}

const AgendaSelect = ({ onBackClick, onNextClick }: AgendaSelectProps) => {
    const { t } = useTranslation();
    const { data, isLoading, isError } = useGetCardsQuery({});
    const [selectedAgendas, setAgendas] = useState<Card[]>([]);
    const agendas = useMemo<Card[]>(() => {
        if (!data) {
            return [];
        }

        const agendas: Card[] = data.filter((c: Card) => c.type === 'agenda');

        return agendas.sort((a, b) => a.label.localeCompare(b.label));
    }, [data]);

    const canSelectAgenda = (agendaCode: string) => {
        if (selectedAgendas.some((a) => a.code === agendaCode)) {
            return true;
        }

        if (selectedAgendas.length > 2) {
            return false;
        }

        if (selectedAgendas.length > 0 && selectedAgendas.some((a) => a.code === '06018')) {
            const card = agendas.find((a) => a.code === agendaCode);

            return card?.traits.some((t) => t === 'Banner');
        }

        return selectedAgendas.length == 0;
    };

    if (isLoading) {
        return <LoadingSpinner text={t('Loading, please wait...')} />;
    } else if (isError) {
        return (
            <Alert variant='danger'>
                <Trans>
                    An error occurred loading data from the server. Please try again later.
                </Trans>
            </Alert>
        );
    }

    return (
        <>
            <div className='mb-2'>
                <Button color='default' className='mr-2' onClick={() => onBackClick()}>
                    <Trans>Back</Trans>
                </Button>
                <Button color='primary' onClick={() => onNextClick(selectedAgendas)}>
                    <Trans>Next</Trans>
                </Button>
            </div>
            <div className='grid h-[75vh] grid-cols-8 overflow-y-auto '>
                {agendas.map((agenda) => (
                    <div key={agenda.code} className='m-4 flex content-center'>
                        <div
                            role={canSelectAgenda(agenda.code) ? 'button' : undefined}
                            onClick={() => {
                                if (!canSelectAgenda(agenda.code)) {
                                    return;
                                }

                                const isSelected = selectedAgendas.some(
                                    (a) => a.code === agenda.code
                                );

                                setAgendas(
                                    isSelected
                                        ? selectedAgendas.filter((a) => a.code !== agenda.code)
                                        : selectedAgendas.concat(agenda)
                                );
                            }}
                        >
                            <div className='text-center'>
                                <CardImage
                                    imageUrl={`/img/cards/${agenda.code}.png`}
                                    size='lg'
                                    selected={selectedAgendas.some((a) => a.code === agenda.code)}
                                />
                                {agenda.label}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
};

export default AgendaSelect;
