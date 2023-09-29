import { ChangeEvent, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Image } from '@nextui-org/react';
import classNames from 'classnames';

import Panel from '../site/Panel';

interface BackgroundOption {
    name: string;
    label: string;
    imageUrl: string;
}

interface BackgroundProps {
    backgrounds: BackgroundOption[];
    selectedBackground?: string;
    customBackground?: string;
    onBackgroundSelected(backgroundName: string, customBgFile: File | null): void;
}

const SettingsBackground = ({
    backgrounds,
    selectedBackground,
    customBackground,
    onBackgroundSelected
}: BackgroundProps) => {
    const { t } = useTranslation();
    const uploadRef = useRef<HTMLInputElement>(null);
    const [localCustomBg, setCustomBg] = useState(
        customBackground ? `/img/bgs/${customBackground}` : undefined
    );
    const [fileError, setFileError] = useState<string | null>(null);

    return (
        <Panel title={t('Game Board Background')}>
            <div className='grid grid-cols-3'>
                {backgrounds.map((background) => (
                    <div
                        className={'m-2'}
                        onClick={() => onBackgroundSelected(background.name, null)}
                        key={background.name}
                    >
                        <Image
                            className={classNames('cursor-pointer', {
                                'shadow-[0_0_1px_4px] shadow-success':
                                    selectedBackground === background.name
                            })}
                            src={background.imageUrl}
                        />
                        <span className='inline-block w-full text-center'>{background.label}</span>
                    </div>
                ))}
                <div className='m-2'>
                    <img
                        className={classNames('w-[476px]', {
                            'shadow-[0_0_1px_4px] shadow-success': selectedBackground === 'custom'
                        })}
                        src={localCustomBg}
                        onClick={() => uploadRef.current?.click()}
                    />
                    <input
                        name='avatar'
                        type='file'
                        accept='image/*'
                        hidden
                        onChange={(event: ChangeEvent<HTMLInputElement>) => {
                            if (
                                !event.currentTarget ||
                                !event.currentTarget.files ||
                                event.currentTarget.files.length === 0
                            ) {
                                return;
                            }

                            const file = event.currentTarget.files[0];

                            if (file.type !== 'image/png' && file.type !== 'image/jpeg') {
                                setFileError('File must be an image');
                                setCustomBg(undefined);
                            } else if (file.size / 1024 / 1024 > 5) {
                                setFileError('File must be less than 5MB');
                                setCustomBg(undefined);
                            } else {
                                setCustomBg(URL.createObjectURL(file));
                                onBackgroundSelected('custom', file);
                                setFileError(null);
                            }
                        }}
                        ref={uploadRef}
                    />
                    {fileError && <span className='bg-error text-danger'>{fileError}</span>}
                    <span className='inline-block w-full text-center'>Custom</span>
                </div>
            </div>
        </Panel>
    );
};

export default SettingsBackground;
