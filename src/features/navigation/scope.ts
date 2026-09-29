const SCOPE_KEY = "ib-econ-atlas:exam-scope:v1";

export function loadScope(storage: Pick<Storage, "getItem"> = sessionStorage): Set<string> {
  try {
    const raw = storage.getItem(SCOPE_KEY);
    if (!raw) return new Set();
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed) || !parsed.every((item) => typeof item === "string")) return new Set();
    return new Set(parsed);
  } catch {
    return new Set();
  }
}

export function saveScope(ids: ReadonlySet<string>, storage: Pick<Storage, "setItem" | "removeItem"> = sessionStorage): void {
  if (ids.size === 0) {
    storage.removeItem(SCOPE_KEY);
    return;
  }
  storage.setItem(SCOPE_KEY, JSON.stringify([...ids].sort()));
}

export function toggleScopeGroup(current: ReadonlySet<string>, groupIds: string[]): Set<string> {
  const next = new Set(current);
  const allSelected = groupIds.length > 0 && groupIds.every((id) => next.has(id));
  for (const id of groupIds) {
    if (allSelected) next.delete(id);
    else next.add(id);
  }
  return next;
}

export function isGroupSelected(current: ReadonlySet<string>, groupIds: string[]): boolean {
  return groupIds.length > 0 && groupIds.every((id) => current.has(id));
}

export function scopeStorageKey(): string {
  return SCOPE_KEY;
}
