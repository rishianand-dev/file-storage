import { createReadStream } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import type { Readable } from "node:stream";
import type { IObjectStorage } from "./object-storage";

/**
 * Local disk adapter. Keys are filenames under `uploads/` (e.g. `<uuid>.pdf`).
 */
export class LocalStorage implements IObjectStorage {
  constructor(private readonly rootDir: string) {}

  async exists(storageKey: string): Promise<boolean> {
    try {
      await fs.access(this.resolvePath(storageKey));
      return true;
    } catch {
      return false;
    }
  }

  getReadStream(storageKey: string): Readable {
    return createReadStream(this.resolvePath(storageKey));
  }

  async delete(storageKey: string): Promise<void> {
    await fs.unlink(this.resolvePath(storageKey)).catch(() => undefined);
  }

  private resolvePath(storageKey: string): string {
    const key = path.basename(storageKey);
    if (key !== storageKey || key === "" || key === "." || key === "..") {
      throw new Error("Invalid storage key");
    }
    return path.join(this.rootDir, key);
  }
}
