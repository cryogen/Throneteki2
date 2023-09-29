import { DeckValidationStatus } from '../../types/lobby';
import { deckStatusLabel } from '../../helpers/DeckHelper';
import { Chip } from '@nextui-org/react';
import { ColorType } from '../../types/ui';

interface DeckStatusLabelProps {
    className?: string;
    status: DeckValidationStatus;
}

const DeckStatusLabel = ({ className = 'h-10', status }: DeckStatusLabelProps) => {
    const text = status ? deckStatusLabel(status) : 'Loading...';
    const restrictionsFollowed = status.faqJoustRules && status.noUnreleasedCards;

    let bg: ColorType = 'default';

    if (!status.basicRules || !status.noBannedCards) {
        bg = 'danger';
    } else if (status.basicRules && status.noBannedCards && !restrictionsFollowed) {
        bg = 'warning';
    } else if (status.basicRules && status.noBannedCards && restrictionsFollowed) {
        bg = 'success';
    }

    return (
        <Chip className={className} color={bg} radius='md'>
            {text}
        </Chip>
    );
};

export default DeckStatusLabel;
