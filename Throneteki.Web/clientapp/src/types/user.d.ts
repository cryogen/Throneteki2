import { IdTokenClaims } from 'oidc-client-ts';

export interface BlockListEntry {
    id: string;
    username: string;
}

export interface CustomUserProfile extends IdTokenClaims {
    role: [string];
    throneteki_settings?: string;
}
