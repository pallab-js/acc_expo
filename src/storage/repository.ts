import AsyncStorage from '@react-native-async-storage/async-storage';

const PREFIX = 'ledger';
const VERSION = 'v1';

export type CollectionName = 'transactions' | 'budgets' | 'recurring' | 'settings';

const storageKey = (name: CollectionName) => `${PREFIX}:${name}:${VERSION}`;

// Migration functions - add new versions here
const migrations: Record<string, (data: unknown) => unknown> = {
  // Example for future v2:
  // 'v2': (data) => ({ ...data, newField: 'default' }),
} as const;

async function migrateIfNeeded<T>(name: CollectionName, data: T | null): Promise<T | null> {
  if (!data) return null;
  // In a real migration, we'd track version per collection or globally
  // For now, this is a placeholder for the migration infrastructure
  return data;
}

export async function loadCollection<T>(name: CollectionName): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(storageKey(name));
    const parsed = raw ? (JSON.parse(raw) as T) : null;
    return migrateIfNeeded(name, parsed);
  } catch {
    return null;
  }
}

export async function saveCollection(name: CollectionName, value: unknown): Promise<void> {
  try {
    await AsyncStorage.setItem(storageKey(name), JSON.stringify(value));
  } catch {
    // Non-fatal: in-memory state remains the source of truth this session.
  }
}

export async function clearAllCollections(): Promise<void> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const ours = keys.filter((key) => key.startsWith(`${PREFIX}:`));
    if (ours.length) await AsyncStorage.multiRemove(ours);
  } catch {
    // ignore
  }
}
