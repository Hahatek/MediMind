export interface RegisterRequest  {
    firstName: string ,
    lastName: string ,
    email: string ,
    password: string ,
    confirmPassword: string ,
    birthDate: string // "YYYY-MM-DD"
}

export interface LoginRequest {
    email: string ,
    password: string 
}

export interface RefreshTokenRequest {
    refreshToken: string 
}

export interface AuthResponse {
    token: string,
    refreshToken: string
}
