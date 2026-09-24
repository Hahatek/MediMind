import { BloodType, Gender, RoleUser } from './EnumTypes';

export interface UpdateUser {
    firstName: string,
    lastName: string,
    birthDate?: string | null,   // "YYYY-MM-DD"
    gender?: Gender | null,
    height?: number | null,
    weight?: number | null,
    bloodType?: BloodType | null,
    avatar?: string | null
}

export interface PatchUser {
    firstName?: string,
    lastName?: string,
    birthDate?: string,
    gender?: Gender,
    height?: number,
    weight?: number,
    bloodType?: BloodType,
    avatar?: string
}

export interface UserResponse {
    id: string,
    email: string,
    firstName: string,
    lastName: string,
    birthDate?: string | null,
    gender?: Gender | null,
    height?: number | null,
    weight?: number | null,
    role: RoleUser,
    bloodType?: BloodType | null,
    avatar?: string | null
}
