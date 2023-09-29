import Panel from '../site/Panel';
import { Trans, useTranslation } from 'react-i18next';
import { FormikProps } from 'formik';
import { ExistingProfileDetails } from './Settings';
import { ThronetekiUser } from '../../types/user';
import { Switch } from '@nextui-org/react';

type SettingsActionWindowsProps = {
    formProps: FormikProps<ExistingProfileDetails>;
    user: ThronetekiUser;
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
            <div key={window.name}>
                <Switch
                    id={window.name}
                    name={`actionWindows.${window.name}`}
                    isSelected={formProps.values.actionWindows[window.name]}
                    onChange={formProps.handleChange}
                    onBlur={formProps.handleBlur}
                >
                    {t(window.label)}
                </Switch>
            </div>
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

            <div className='mt-2 grid grid-cols-2'>{renderedWindows}</div>
        </Panel>
    );
};

export default SettingsActionWindows;
