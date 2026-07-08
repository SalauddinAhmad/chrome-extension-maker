import { db } from "./db";
import { DEFAULT_SETTINGS, type Settings } from "@/types";

export async function getSettings(): Promise<Settings> {
  const existing = await db.settings.get("singleton");
  if (existing) return existing;
  await db.settings.put(DEFAULT_SETTINGS);
  return DEFAULT_SETTINGS;
}

export async function updateSettings(patch: Partial<Settings>): Promise<Settings> {
  const current = await getSettings();
  const next: Settings = { ...current, ...patch, id: "singleton" };
  await db.settings.put(next);
  return next;
}
