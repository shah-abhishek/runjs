// src/lib/sandboxPermissions.ts
import type { SandboxPermissions } from "../types/modes";
import { DEFAULT_SANDBOX_PERMISSIONS } from "../types/modes";

const PERMISSIONS_STORAGE_KEY = "compiler-sandbox-permissions";

export function buildSandboxAttribute(perms: SandboxPermissions): string {
  const flags = ["allow-scripts"]; // always on — nothing runs without it
  if (perms.modals) flags.push("allow-modals");
  if (perms.popups) flags.push("allow-popups");
  if (perms.forms) flags.push("allow-forms");
  if (perms.downloads) flags.push("allow-downloads");
  return flags.join(" ");
  // allow-same-origin and allow-top-navigation are never included —
  // not exposed as toggles, not persisted, not settable.
}

export function getInitialPermissions(): SandboxPermissions {
  try {
    const stored = localStorage.getItem(PERMISSIONS_STORAGE_KEY);
    if (!stored) return DEFAULT_SANDBOX_PERMISSIONS;

    const parsed = JSON.parse(stored);
    // Merge with defaults so a future new flag (e.g. "downloads" added later)
    // still gets a sane value even if an old saved blob doesn't have it yet.
    return { ...DEFAULT_SANDBOX_PERMISSIONS, ...parsed };
  } catch {
    // Corrupted/invalid JSON in storage — fall back safely rather than throw
    return DEFAULT_SANDBOX_PERMISSIONS;
  }
}

export function persistPermissions(perms: SandboxPermissions): void {
  localStorage.setItem(PERMISSIONS_STORAGE_KEY, JSON.stringify(perms));
}