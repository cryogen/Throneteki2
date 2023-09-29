import { Button, Image } from '@nextui-org/react';

type StatButtonProps = {
    image: string;
    onClick: () => void;
};

const StatButton = ({ image, onClick }: StatButtonProps) => {
    return (
        <Button className='bg-transparent' onClick={onClick} isIconOnly size='sm'>
            <Image src={image} />
        </Button>
    );
};

export default StatButton;
