import React from 'react';
import Panel from '../../Site/Panel';
import { useTranslation } from 'react-i18next';
import { Button } from 'react-bootstrap';

interface ActivePlayerPromptProps {
    buttons: any;
    cards: any;
    controls: any;
    onButtonClick: any;
    onMouseOut: any;
    onMouseOver: any;
    onTitleClick: any;
    phase: any;
    promptText: any;
    promptTitle: any;
    stopAbilityTimer?: any;
    timerLimit?: any;
    timerStartTime?: any;
    user: any;
}

const MaxButtonTextLength = 28;

const ActivePlayerPrompt = ({
    buttons,
    controls,
    onButtonClick,
    onMouseOut,
    onMouseOver,
    phase,
    promptText,
    promptTitle
}: ActivePlayerPromptProps) => {
    const { i18n, t } = useTranslation();

    const localizedText = (source: any, text: any, values: any) => {
        if (!isNaN(text)) {
            // text is just a plain number, avoid translation
            return text;
        }

        if (!text) {
            return '';
        }

        if (i18n.language !== 'en') {
            // Avoid locale replacement if language is English

            if (!source || !source.locale || !source.locale[i18n.language]) {
                // If no source or source does not have locale, simply do the translation
                return t(text, values);
            }

            if (values && values.card) {
                // if there is a {{card}} property in the values, we should use localized source name
                values.card = source.locale[i18n.language].name;
                return t(text, values);
            }

            if (!values) {
                // if no values, add a 'card' with localized source name and try to find, worst case, the source name
                // in the text and replace it for i18n interpolation
                values = { card: source.locale[i18n.language].name };
                while (text.includes(source.name)) {
                    text = text.replace(source.name, '{{card}}');
                }
            }
        }

        return t(text, values);
    };

    const getSafePromptText = (promptObject: any) => {
        if (promptObject) {
            return typeof promptObject === 'string' ? promptObject : promptObject.text;
        }

        return null;
    };

    const getButtons = () => {
        let buttonIndex = 0;

        const buttonsToRender = [];

        if (
            !buttons ||
            controls.some((c: any) => ['house-select', 'options-select'].includes(c.type))
        ) {
            return null;
        }

        for (const button of buttons) {
            const originalButtonText = localizedText(button.card, button.text, button.values);
            let buttonText = originalButtonText;

            if (buttonText.length > MaxButtonTextLength) {
                buttonText = buttonText.slice(0, MaxButtonTextLength - 3).trim() + '...';
            }

            const option = (
                <Button
                    variant='primary'
                    key={button.command + buttonIndex.toString()}
                    className='btn btn-default prompt-button btn-stretch'
                    title={originalButtonText}
                    onClick={() =>
                        onButtonClick(button.command, button.arg, button.method, button.promptId)
                    }
                    onMouseOver={() => onMouseOver(button.card)}
                    onMouseOut={() => onMouseOut(button.card)}
                    disabled={button.disabled}
                >
                    {buttonText}{' '}
                    {button.icon && <div className={`button-icon icon-${button.icon}`} />}
                </Button>
            );

            buttonIndex++;

            buttonsToRender.push(option);
        }

        return buttonsToRender;
    };

    let controlSource = null;
    if (controls && controls.length > 0 && controls[0].source) {
        controlSource = controls[0].source;
    }

    let promptTitleToRender;

    if (promptTitle) {
        const promptTitleText = getSafePromptText(promptTitle);

        promptTitleToRender = (
            <div className='menu-pane-source'>
                {localizedText(controlSource, promptTitleText, promptTitle.values)}
            </div>
        );
    }

    const safePromptText = getSafePromptText(promptText);
    const promptTexts = [];

    if (safePromptText) {
        if (safePromptText.includes('\n')) {
            const split = safePromptText.split('\n');
            for (const token of split) {
                promptTexts.push(localizedText(controlSource, token, promptText.values));
                promptTexts.push(<br />);
            }
        } else {
            promptTexts.push(localizedText(controlSource, safePromptText, promptText.values));
        }
    }

    return (
        <Panel title={t(phase + ' phase')} titleClass='phase-indicator'>
            {/*timer*/}
            {promptTitleToRender}
            <div className='menu-pane'>
                <h4>{promptTexts}</h4>
                {/*getControls()*/}
                {getButtons()}
            </div>
        </Panel>
    );
};

export default ActivePlayerPrompt;
