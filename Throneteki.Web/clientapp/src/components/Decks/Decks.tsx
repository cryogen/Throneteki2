import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import Panel from '../../components/site/Panel';

import DeckList from './DeckList';
import { useGetRestrictedListQuery } from '../../redux/api/apiSlice';
import { RestrictedList } from '../../types/decks';
import { Select, SelectItem } from '@nextui-org/react';

const Decks = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { data: restrictedLists } = useGetRestrictedListQuery([]);
    const [restrictedList, setRestrictedList] = useState<string | null>();

    useEffect(() => {
        if (!restrictedList && restrictedLists) {
            setRestrictedList(restrictedLists[0].id);
        }
    }, [restrictedList, restrictedLists]);

    return (
        <Panel className='h-full' title={t('Decks')}>
            <div className='mb-2 mt-2 w-full md:w-2/6'>
                <Select
                    label={t('Game node')}
                    onChange={(e) => setRestrictedList(e.target.value)}
                    selectedKeys={restrictedList ? new Set([restrictedList]) : null}
                >
                    {restrictedLists?.map((rl: RestrictedList) => (
                        <SelectItem key={rl.id} value={rl.id}>
                            {t(rl.name)}
                        </SelectItem>
                    ))}
                </Select>
            </div>
            <DeckList
                restrictedList={restrictedList}
                onDeckSelected={(deck) => navigate(`/decks/${deck.id}/`)}
            />
        </Panel>
    );
};

export default Decks;
