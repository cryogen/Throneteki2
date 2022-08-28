export interface UserSummary {
    username: string;
    name: string;
    role: string;
    avatar: string;
}

export interface LobbyUser {
    name: string;
}

export interface LobbyMessage {
    id: number;
    message: string;
    user: UserSummary;
    time: Date;
    deleted: boolean;
    deletedBy: string;
}
