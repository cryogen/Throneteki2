import React, { useState } from 'react';
import { toastr } from 'react-redux-toastr';
import { useTranslation } from 'react-i18next';
// import { Carousel } from 'react-responsive-carousel';
import { useAppDispatch, useAppSelector } from '../redux/hooks';

// import NewsComponent from '../Components/News/News';
import Panel from '../components/site/Panel';
import { lobbyActions } from '../redux/slices/lobbySlice';
import { useAuth } from 'react-oidc-context';
import LobbyChat from '../components/lobby/LobbyChat';
import { Permission } from '../components/navigation/menus';
import { ThronetekiUser } from '../types/user';
import { Input } from '@nextui-org/react';
// import { News } from '../redux/types';

// import 'react-responsive-carousel/lib/styles/carousel.min.css';

const Lobby = () => {
    const dispatch = useAppDispatch();
    const { users, lobbyMessages, noChat } = useAppSelector((state) => state.lobby);

    // const user = useSelector((state) => state.account.user);
    // const news = useSelector((state) => state.news.news);
    // const apiState = useSelector((state) => {
    //     const retState = state.api[News.RequestNews];

    //     return retState;
    // });
    const [popupError, setPopupError] = useState(false);
    const [message, setMessage] = useState<string>('');
    const { t } = useTranslation();
    const auth = useAuth();

    // useEffect(() => {
    //     dispatch(loadNews({ limit: 3 }));
    // }, [dispatch]);

    if (!popupError && noChat) {
        setPopupError(true);

        toastr.error('Error', 'New users are limited from chatting in the lobby, try again later');

        setTimeout(() => {
            dispatch(lobbyActions.clearNoChatStatus());
            setPopupError(false);
        }, 5000);
    }

    const sendMessage = () => {
        if (message === '') {
            return;
        }

        dispatch(lobbyActions.sendLobbyChat(message));

        setMessage('');
    };

    const onKeyPress = (event: React.KeyboardEvent<HTMLElement>) => {
        if (event.key === 'Enter') {
            event.preventDefault();

            sendMessage();
        }
    };

    const user = auth.user?.profile as ThronetekiUser;

    const isLoggedIn = !!user;
    const placeholder = isLoggedIn
        ? 'Enter a message...'
        : 'You must be logged in to send lobby chat messages';

    //     // const banners = [
    //     //     {
    //     //         img: '/banner/swindle-ste3.png',
    //     //         link: 'https://forms.gle/SQSbcxEDATbYkSU8A'
    //     //     }
    //     // ];
    return (
        <div className='mx-auto flex h-[91vh] w-2/3 flex-col'>
            <div>
                {/* <Carousel
                            autoPlay={true}
                            infiniteLoop={true}
                            showArrows={false}
                            showThumbs={false}
                            showIndicators={false}
                            showStatus={false}
                            interval={7500}
                        >
                            {banners.map((banner) => {
                                return (
                                    <a
                                        key={banner.img}
                                        target='_blank'
                                        rel='noreferrer'
                                        href={banner.link}
                                    >
                                        <div className='banner'>
                                            <img src={banner.img} />
                                        </div>
                                    </a>
                                );
                            })}
                        </Carousel> */}
            </div>

            {/* {motd?.message && (
                    <div>
                        <Col sm={{ span: 10, offset: 1 }} className='banner'>
                            <AlertPanel type={motd.motdType} message={motd.message}></AlertPanel>
                        </Col>
                    </div>
                )} */}
            {/* {bannerNotice && (
                    <div>
                        <Col sm={{ span: 10, offset: 1 }} className='annoucement'>
                            <AlertPanel message={bannerNotice} type='error' />
                        </Col>
                    </div>
                )} */}
            <div>
                <Panel title={t('Latest site news')}>
                    {/* {apiState?.loading ? (
                                <div>
                                    <Trans>News loading, please wait...</Trans>
                                </div>
                            ) : null}
                            <NewsComponent news={news} /> */}
                </Panel>
            </div>
            <Panel
                className='mt-4'
                title={t('Lobby Chat ({{users}}) online', {
                    users: users.length
                })}
            >
                <LobbyChat
                    messages={lobbyMessages}
                    isModerator={user?.role?.includes(Permission.CanModerateChat)}
                    onRemoveMessageClick={(messageId) => {
                        dispatch(lobbyActions.sendRemoveLobbyMessage(messageId));
                    }}
                />
            </Panel>
            <form
                className='relative bottom-[42px] left-[2px] z-50 pr-[5px]'
                onSubmit={(event) => {
                    event.preventDefault();
                    sendMessage();
                }}
            >
                <Input
                    classNames={{ inputWrapper: 'rounded-tl-none rounded-tr-none' }}
                    onKeyDown={onKeyPress}
                    onChange={(event) =>
                        setMessage(
                            event.target.value.substring(
                                0,
                                Math.min(512, event.target.value.length)
                            )
                        )
                    }
                    placeholder={t(placeholder)}
                    value={message}
                ></Input>
            </form>
        </div>
    );
};

Lobby.displayName = 'Lobby';

export default Lobby;
