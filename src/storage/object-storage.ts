import type { Readable } from "node:stream";

/**
 * Bytes live behind this interface. Controllers/services use opaque storage keys
 * (DB `storage_name`), never filesystem paths. Swap LocalStorage for S3/R2 later
 * without changing download/delete call sites.
 */
export interface IObjectStorage {
  exists(storageKey: string): Promise<boolean>;
  getReadStream(storageKey: string): Readable;
  delete(storageKey: string): Promise<void>;
}
