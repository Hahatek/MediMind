import {
  CreateExamination,
  ExaminationListParams,
  ExaminationResponse,
  PatchExamination,
  UpdateExamination,
} from "../types/ExaminationTypes";
import instance from "./client";
import { requestReminderSync } from "../notifications/sync";

export async function examinationGet(params: ExaminationListParams = {}) {
  const response = await instance.get<ExaminationResponse[]>(
    `/api/examination`,
    { params },
  );
  return response.data;
}

export async function examinationGetOne(examinationId: string) {
  const response = await instance.get<ExaminationResponse>(
    `/api/examination/${examinationId}`,
  );
  return response.data;
}

export async function examinationCreate(examination: CreateExamination) {
  const response = await instance.post<ExaminationResponse>(
    "/api/examination",
    examination,
  );
  requestReminderSync();
  return response.data;
}

export async function examinationPut(
  examination: UpdateExamination,
  examinationId: string,
) {
  const response = await instance.put<ExaminationResponse>(
    `/api/examination/${examinationId}`,
    examination,
  );
  requestReminderSync();
  return response.data;
}

export async function examinationPatch(
  examinationP: PatchExamination,
  examinationId: string,
) {
  const response = await instance.patch<ExaminationResponse>(
    `/api/examination/${examinationId}`,
    examinationP,
  );
  requestReminderSync();
  return response.data;
}

export async function examinationComplete(examinationId: string) {
  const response = await instance.post<ExaminationResponse>(
    `/api/examination/${examinationId}/complete`,
  );
  requestReminderSync();
  return response.data;
}

export async function examinationSkip(examinationId: string) {
  const response = await instance.post<ExaminationResponse>(
    `/api/examination/${examinationId}/skip`,
  );
  requestReminderSync();
  return response.data;
}

export async function examinationDelete(examinationId: string) {
  await instance.delete(`/api/examination/${examinationId}`);
  requestReminderSync();
}
