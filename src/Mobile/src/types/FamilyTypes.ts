export interface FamilyResponse {
  id: string;
  createdAt: string;
}

export interface PersonContext {
  userId: string;
  firstName: string;
  canManage: boolean;
}

export interface FamilyMembership {
  userId: string;
  firstName: string;
  lastName: string;
  isOwner: boolean;
  isParent: boolean;
  hasAccount: boolean;
  isChild: boolean;
  isPrimaryGuardianForMe: boolean;
  isMe: boolean;
  canManage: boolean;
}

export interface FamilyDetailsResponse {
  id: string;
  createdAt: string;
  isOwner: boolean;
  isParent: boolean;
  members: FamilyMembership[];
}

export interface FamilyInviteResponse {
  id: string;
  familyId: string;
  expiresAt: string;
  code: string;
}

export interface TransferOwnership {
  newOwnerId?: string | null;
  alsoLeaveFamily: boolean;
}

export interface FamilyInviteAccept {
  code: string;
}

export interface CreateManagedProfile {
  firstName: string;
  lastName: string;
  birthDate: string;
}
