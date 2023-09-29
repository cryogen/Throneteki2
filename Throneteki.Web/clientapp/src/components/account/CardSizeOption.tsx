import classNames from 'classnames';
import IdentityDefault from '../../assets/img/cardback.png';

interface CardSizeOptionProps {
    name: string;
    label: string;
    selected: boolean;
    onSelect(cardSize: string): void;
}

function CardSizeOption({ name, label, selected, onSelect }: CardSizeOptionProps) {
    const handleClick = () => {
        if (onSelect) {
            onSelect(name);
        }
    };

    return (
        <div key={name} className='ml-1 mr-1 inline-block' onClick={handleClick}>
            <div className={classNames('game-card', 'vertical', name, { selected: selected })}>
                <img className={classNames('game-card', 'vertical', name)} src={IdentityDefault} />
            </div>

            <span className='bg-label'>{label}</span>
        </div>
    );
}

export default CardSizeOption;
