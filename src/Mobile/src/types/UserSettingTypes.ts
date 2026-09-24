export interface CreateUserSettings {
    darkMode: boolean,
    fontSize: number
}

export type UpdateUserSettings = CreateUserSettings;

export interface PatchUserSettings {
    darkMode?: boolean,
    fontSize?: number
}

export interface UserSettingsResponse {
    id: string,
    userId: string,
    darkMode: boolean,
    fontSize: number
}
