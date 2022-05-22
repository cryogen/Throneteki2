import React, { ChangeEvent, useRef, useState } from 'react';
import { Row, Col, Form } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';

import Panel from '../Site/Panel';

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

const ProfileBackground = ({
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
            <Row>
                {backgrounds.map((background) => (
                    <Col
                        sm={4}
                        onClick={() => onBackgroundSelected(background.name, null)}
                        key={background.name}
                    >
                        <img
                            className={classNames('img-fluid bg-image', {
                                selected: selectedBackground === background.name
                            })}
                            src={background.imageUrl}
                        />
                        <span className='bg-label'>{background.label}</span>
                    </Col>
                ))}
                <Col sm={4}>
                    <img
                        className={classNames('custom-bg bg-image', {
                            selected: selectedBackground === 'custom'
                        })}
                        src={localCustomBg}
                        onClick={() => uploadRef.current?.click()}
                    />
                    <Form.Control
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
                    ></Form.Control>
                    {fileError && <span className='text-danger bg-error'>{fileError}</span>}
                    <span className='bg-label'>Custom</span>
                </Col>
            </Row>
        </Panel>
    );
};

export default ProfileBackground;
