import React from 'react';
import Panel from '../Site/Panel';
import { Col, Form, Row } from 'react-bootstrap';
import { Trans, useTranslation } from 'react-i18next';
import { FormikProps } from 'formik';
import { CustomUserProfile } from '../Navigation/Navigation';
import { ExistingProfileDetails } from './Settings';

type SettingsActionWindowsProps = {
    formProps: FormikProps<ExistingProfileDetails>;
    user: CustomUserProfile;
};

const windows = [
    { name: 'plot', label: 'Plots revealed' },
    { name: 'draw', label: 'Draw phase' },
    { name: 'challengeBegin', label: 'Before challenge' },
    { name: 'attackersDeclared', label: 'Attackers declared' },
    { name: 'defendersDeclared', label: 'Defenders declared' },
    { name: 'dominance', label: 'Dominance phase' },
    { name: 'standing', label: 'Standing phase' },
    { name: 'taxation', label: 'Taxation phase' }
];

const SettingsActionWindows = ({ formProps }: SettingsActionWindowsProps) => {
    const { t } = useTranslation();

    const renderedWindows = windows.map((window) => {
        return (
            <Col key={window.name} sm={6}>
                <Form.Check
                    inline
                    id={window.name}
                    name={`actionWindows.${window.name}`}
                    label={t(window.label)}
                    type='switch'
                    checked={formProps.values.actionWindows[window.name]}
                    onChange={formProps.handleChange}
                    onBlur={formProps.handleBlur}
                />
            </Col>
        );
    });

    return (
        <Panel title={t('Action window defaults')}>
            <p className='form-text small'>
                <Trans key='action-windows-help'>
                    If an option is selected here, you will always be prompted if you want to take
                    an action in that window. If an option is not selected, you will receive no
                    prompts for that window. For some windows (e.g. dominance) this could mean the
                    whole window is skipped.
                </Trans>
            </p>

            <Row>{renderedWindows}</Row>
        </Panel>
    );
};

export default SettingsActionWindows;
