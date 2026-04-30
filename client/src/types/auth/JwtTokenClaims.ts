export type JwtTokenClaims = {
    id: number;
    username: string;
    role: string;
    profile_picture?: string;
}