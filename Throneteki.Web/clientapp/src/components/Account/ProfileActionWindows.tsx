import React from 'react';
import Panel from '../Site/Panel';
import { Col, Form, Row } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { FormikProps } from 'formik';
import { CustomUserProfile } from '../Navigation/Navigation';
import { ExistingProfileDetails } from './Profile';

type ProfileActionWindowsProps = {
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

const ProfileActionWindows = ({ formProps }: ProfileActionWindowsProps) => {
    const { t } = useTranslation();

    const renderedWindows = windows.map((window) => {
        return (
            <Col key={window.name} sm={4}>
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
            <Row>{renderedWindows}</Row>
        </Panel>
    );
};

export default ProfileActionWindows;
