import { deleteItemAsync, getItemAsync, setItemAsync } from "expo-secure-store";

const REFRESH_TOKEN = "refresh_token";

export async function saveRefreshToken(token: string) {
  await setItemAsync(REFRESH_TOKEN, token);
}
export async function readRefreshToken() {
  return await getItemAsync(REFRESH_TOKEN);
}
export async function deleteRefreshToken() {
  await deleteItemAsync(REFRESH_TOKEN);
}
