import { IdTokenClaims } from 'oidc-client-ts';

export interface BlockListEntry {
    id: string;
    username: string;
}

export interface ThronetekiUser extends IdTokenClaims {
    role: [string];
    throneteki_settings?: string;
}
