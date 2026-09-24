import {
  CreateExamination,
  ExaminationResponse,
  PatchExamination,
  UpdateExamination,
} from "../types/ExaminationTypes";
import instance from "./client";

export async function examinationGet() {
  const response =
    await instance.get<ExaminationResponse[]>(`/api/examination`);
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
  return response.data;
}

export async function examinationDelete(examinationId: string) {
  const response = await instance.delete(`/api/examination/${examinationId}`);
}
