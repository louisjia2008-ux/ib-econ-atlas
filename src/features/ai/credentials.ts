const TOKEN_KEY = "ib-econ-atlas:owner-access-token:v1";

export function loadOwnerAccessToken(storage: Pick<Storage, "getItem"> = localStorage): string {
  return storage.getItem(TOKEN_KEY) ?? "";
}

export function saveOwnerAccessToken(token: string, storage: Pick<Storage, "setItem" | "removeItem"> = localStorage): void {
  const trimmed = token.trim();
  if (!trimmed) storage.removeItem(TOKEN_KEY);
  else storage.setItem(TOKEN_KEY, trimmed);
}

export function clearOwnerAccessToken(storage: Pick<Storage, "removeItem"> = localStorage): void {
  storage.removeItem(TOKEN_KEY);
}

export function ownerTokenStorageKey(): string {
  return TOKEN_KEY;
}
