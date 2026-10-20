const prefix = "atlas-workshop-v1:";
export const workshopStorageKey = (pointId: string) => `${prefix}${pointId}`;

export function clearWorkshopDrafts(): boolean {
  try {
    for (const key of Object.keys(localStorage)) if (key.startsWith(prefix)) localStorage.removeItem(key);
    return true;
  } catch { return false; }
}
