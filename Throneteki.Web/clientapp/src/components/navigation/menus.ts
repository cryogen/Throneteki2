export enum Permission {
    CanEditNews = 'NewsManager',
    CanManageUsers = 'UserManager',
    CanManagePermissions = 'PermissionsManager',
    CanManageGames = 'GameManager',
    CanManageNodes = 'NodeManager',
    CanModerateChat = 'ChatManager',
    CanVerifyDecks = 'canVerifyDecks',
    CanManageBanlist = 'canManageBanlist',
    CanManageMotd = 'canManageMotd',
    CanManageTournaments = 'canManageTournaments',
    IsAdmin = 'isAdmin',
    IsContributor = 'isContributor',
    ISupporter = 'isSupporter',
    IsWinner = 'isWinner'
}

export enum MenuPosition {
    Left = 'left',
    Right = 'right'
}

export interface MenuItem {
    path?: string;
    title: string;
    showOnlyWhenLoggedIn?: boolean;
    showOnlyWhenLoggedOut?: boolean;
    state?: object;
    permission?: Permission;
    position?: MenuPosition;
    childItems?: MenuItem[];
}

export const LeftMenu: MenuItem[] = [
    { path: '/decks', title: 'Decks', showOnlyWhenLoggedIn: true },
    //{ path: '/matches', title: 'Matches', showOnlyWhenLoggedIn: true },
    { path: '/play', title: 'Play' },
    {
        path: '/tournamentlobby',
        title: 'Tournament',
        showOnlyWhenLoggedIn: true,
        permission: Permission.CanManageTournaments
    },
    {
        title: 'Help',
        childItems: [
            { path: '/how-to-play', title: 'How To Play' },
            { path: '/about', title: 'About' },
            { path: '/privacy', title: 'Privacy Policy' }
        ]
    },
    {
        title: 'Admin',
        showOnlyWhenLoggedIn: true,
        childItems: [
            { path: '/news', title: 'News', permission: Permission.CanEditNews },
            { path: '/admin/users', title: 'Users', permission: Permission.CanManageUsers },
            { path: '/nodes', title: 'Nodes', permission: Permission.CanManageNodes },
            { path: '/banlist', title: 'Ban List', permission: Permission.CanManageBanlist },
            { path: '/admin/motd', title: 'Motd', permission: Permission.CanManageMotd }
        ]
    }
];

export const RightMenu: MenuItem[] = [
    { path: '/account/login', title: 'Login', showOnlyWhenLoggedOut: true },
    {
        path: '/account/register',
        title: 'Register',
        showOnlyWhenLoggedOut: true,
        position: MenuPosition.Right
    }
];

export const ProfileMenu: MenuItem[] = [
    { title: 'Profile', path: '/account/profile' },
    { title: 'Settings', path: '/account/settings' },
    { title: 'Security', path: '/account/security' },
    { title: 'Block List', path: '/account/blocklist' },
    { title: 'Logout', path: '/authentication/logout', state: { local: true } }
];
