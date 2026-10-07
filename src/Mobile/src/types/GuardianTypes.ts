export interface GuardianResponse {
  userId: string;
  firstName: string;
  lastName: string;
  isPrimary: boolean;
}

export interface AddGuardian {
  guardianUserId: string;
}
