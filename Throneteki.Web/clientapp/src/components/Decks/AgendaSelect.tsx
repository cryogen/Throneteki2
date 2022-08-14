import React, { useMemo, useState } from 'react';
import { Alert, Button, Col, Row } from 'react-bootstrap';
import { Trans, useTranslation } from 'react-i18next';
import { useGetCardsQuery } from '../../redux/api/apiSlice';
import { Card } from '../../types/data';
import CardImage from '../Images/CardImage';
import LoadingSpinner from '../LoadingSpinner';

interface AgendaSelectProps {
    onBackClick: () => void;
    onNextClick: (agendas: string[]) => void;
}

const AgendaSelect = ({ onBackClick, onNextClick }: AgendaSelectProps) => {
    const { t } = useTranslation();
    const { data, isLoading, isError } = useGetCardsQuery({});
    const [selectedAgendas, setAgendas] = useState<string[]>([]);
    const agendas = useMemo<Card[]>(() => {
        if (!data) {
            return [];
        }

        const agendas: Card[] = data.filter((c: Card) => c.type === 'agenda');

        return agendas.sort((a, b) => a.label.localeCompare(b.label));
    }, [data]);

    const canSelectAgenda = (agendaCode: string) => {
        if (selectedAgendas.some((a) => a === agendaCode)) {
            return true;
        }

        if (selectedAgendas.length > 2) {
            return false;
        }

        if (selectedAgendas.length > 0 && selectedAgendas.some((a) => a === '06018')) {
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
                <Button variant='light' className='me-2' onClick={() => onBackClick()}>
                    <Trans>Back</Trans>
                </Button>
                <Button variant='primary' onClick={() => onNextClick(selectedAgendas)}>
                    <Trans>Next</Trans>
                </Button>
            </div>
            <Row>
                {agendas.map((agenda) => (
                    <Col
                        sm='2'
                        key={agenda.code}
                        className='mt-2 mb-2 d-flex justify-content-center'
                    >
                        <div
                            role={canSelectAgenda(agenda.code) ? 'button' : undefined}
                            onClick={() => {
                                if (!canSelectAgenda(agenda.code)) {
                                    return;
                                }

                                const isSelected = selectedAgendas.some((a) => a === agenda.code);

                                setAgendas(
                                    isSelected
                                        ? selectedAgendas.filter((a) => a !== agenda.code)
                                        : selectedAgendas.concat(agenda.code)
                                );
                            }}
                        >
                            <div className='text-center'>
                                <CardImage
                                    card={agenda.code}
                                    size='lg'
                                    selected={selectedAgendas.some((a) => a === agenda.code)}
                                />
                                {agenda.label}
                            </div>
                        </div>
                    </Col>
                ))}
            </Row>
        </>
    );
};

export default AgendaSelect;
