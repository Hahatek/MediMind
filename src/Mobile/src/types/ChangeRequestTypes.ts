import { ChangeRequestStatus } from './EnumTypes';

export interface CreateChangeRequest {
    examinationId: string,
    status: ChangeRequestStatus,
    proposedChanges?: string | null,
    reason?: string | null
}

export interface UpdateChangeRequest {
    proposedChanges?: string | null,
    reason?: string | null
}

export type PatchChangeRequest = UpdateChangeRequest;

export interface ReviewChangeRequest {
    status: ChangeRequestStatus
}

export interface ChangeRequestResponse {
    id: string,
    examinationId: string,
    requestedBy: string,
    reviewedBy?: string | null,
    status: ChangeRequestStatus,
    proposedChanges?: string | null,
    reason?: string | null,
    reviewedAt?: string | null,
    createdAt: string,
    examination?: string | null,
    createdBy?: string | null,
    reviewer?: string | null
}
