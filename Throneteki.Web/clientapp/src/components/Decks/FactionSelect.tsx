import { Trans } from 'react-i18next';

import { Constants } from '../../constants';
import FactionImage from '../images/FactionImage';
import { Faction } from '../../types/data';

interface FactionSelectProps {
    onSelect: (faction: Faction) => void;
}

const FactionSelect = ({ onSelect }: FactionSelectProps) => {
    const factions = Constants.Factions;

    return (
        <>
            <div>
                <div className='w-full text-center mb-3'>
                    <h4>
                        <Trans>To start, select a faction</Trans>
                    </h4>
                </div>
            </div>
            <div className='grid grid-cols-4'>
                {factions.map((faction) => (
                    <div key={faction} className='mt-2 mb-2 flex content-center'>
                        <div
                            role='button'
                            onClick={() => onSelect({ code: faction, name: faction })}
                        >
                            <FactionImage size='lg' faction={faction} />
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
};

export default FactionSelect;
