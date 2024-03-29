import Panel from '../../site/Panel';
import { useTranslation } from 'react-i18next';
import {
    CardMouseOverEventArgs,
    GameCard,
    Prompt,
    PromptButton,
    PromptControl
} from '../../../types/game';
import { Card } from '../../../types/data';
import { GamePhase } from '../../../types/enums';
import ZoomCardImage from './ZoomCardImage';
import { Button } from '@nextui-org/react';

interface ActivePlayerPromptProps {
    buttons: PromptButton[];
    cards: Card[];
    controls: PromptControl[];
    onButtonClick: (command: string, arg: string, method: string, promptId: string) => void;
    onMouseOut: (card: GameCard) => void;
    onMouseOver: (card: CardMouseOverEventArgs) => void;
    onTitleClick: (card: GameCard) => void;
    phase: GamePhase;
    promptText?: string;
    promptTitle?: string;
    stopAbilityTimer?: boolean;
    timerLimit?: number;
    timerStartTime?: number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const localizedText = (source: Card | null, text: string | null, values?: any) => {
        if (!isNaN(Number(text))) {
            // text is just a plain number, avoid translation
            return text || '';
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

    const getSafePromptText = (promptObject: Prompt | string | null | undefined) => {
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
            controls.some((c: PromptControl) => ['house-select', 'options-select'].includes(c.type))
        ) {
            return null;
        }

        for (const button of buttons) {
            const originalButtonText = localizedText(button.card, button.text, button.values);
            let buttonText = originalButtonText as string;

            if (buttonText.length > MaxButtonTextLength) {
                buttonText = buttonText.slice(0, MaxButtonTextLength - 3).trim() + '...';
            }

            const option = (
                <Button
                    color='primary'
                    key={button.command + buttonIndex.toString()}
                    className='btn btn-default prompt-button btn-stretch mb-1 w-full'
                    //  title={originalButtonText}
                    onClick={() =>
                        onButtonClick(button.command, button.arg, button.method, button.promptId)
                    }
                    onMouseOver={() =>
                        button.card &&
                        onMouseOver({
                            image: (
                                <ZoomCardImage imageUrl={`/img/cards/${button.card.code}.png`} />
                            ),
                            size: 'normal'
                        })
                    }
                    onMouseOut={() => onMouseOut(button.card)}
                    disabled={button.disabled}
                >
                    {buttonText}{' '}
                    {button.icon && (
                        <div className={`with-background thronesicon thronesicon-${button.icon}`} />
                    )}
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
            <div className='menu-pane-source -ml-5 -mr-5 -mt-5 border-b-1.5 border-t-1.5 border-default bg-primary text-center'>
                {localizedText(controlSource, promptTitleText, null) as string}
            </div>
        );
    }

    const safePromptText = getSafePromptText(promptText);
    const promptTexts = [];

    if (safePromptText) {
        if (safePromptText.includes('\n')) {
            const split = safePromptText.split('\n');
            for (const token of split) {
                promptTexts.push(localizedText(controlSource, token, null) as string);
                promptTexts.push(<br />);
            }
        } else {
            promptTexts.push(localizedText(controlSource, safePromptText, null) as string);
        }
    }

    return (
        <Panel title={t(phase + ' phase')} titleClass='uppercase' fullHeight={false}>
            {/*timer*/}
            {promptTitleToRender}
            <div className='mt-2 text-center'>
                <h4 className='mb-1'>{promptTexts}</h4>
                {/*getControls()*/}
                {getButtons()}
            </div>
        </Panel>
    );
};

export default ActivePlayerPrompt;
