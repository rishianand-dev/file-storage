import path from "node:path";
import { LocalStorage } from "./local.storage";
import type { IObjectStorage } from "./object-storage";

export const objectStorage: IObjectStorage = new LocalStorage(
  path.join(process.cwd(), "uploads"),
);
