import { z } from "zod";

/** Multipart forms often send "" when an optional field is left blank. */
function emptyStringToNull(value: unknown) {
  if (value === "" || value === undefined) return null;
  return value;
}

const MAX_TREE_PATHS = 200;
const MAX_PATH_SEGMENTS = 20;

function isValidSegment(name: string): boolean {
  if (name.length < 1 || name.length > 255) return false;
  if (name === "." || name === "..") return false;
  if (/[\x00-\x1f\\]/.test(name)) return false;
  return true;
}

function normalizePath(raw: string): string {
  return raw
    .trim()
    .replace(/\\/g, "/")
    .replace(/^\/+|\/+$/g, "")
    .replace(/\/+/g, "/");
}

/** Expands paths to all prefixes, validates segments and limits. */
export function expandFolderTreePaths(paths: string[]): string[] {
  const expanded = new Set<string>();

  for (const raw of paths) {
    const normalized = normalizePath(raw);
    if (!normalized) {
      throw new Error("Path cannot be empty");
    }

    const segments = normalized.split("/");
    if (segments.length > MAX_PATH_SEGMENTS) {
      throw new Error(`Path exceeds ${MAX_PATH_SEGMENTS} segments`);
    }

    for (const segment of segments) {
      const trimmed = segment.trim();
      if (!isValidSegment(trimmed)) {
        throw new Error(`Invalid path segment: ${segment}`);
      }
    }

    for (let i = 0; i < segments.length; i++) {
      expanded.add(segments.slice(0, i + 1).join("/"));
    }
  }

  const result = Array.from(expanded).sort(
    (a, b) => a.split("/").length - b.split("/").length,
  );

  if (result.length > MAX_TREE_PATHS) {
    throw new Error(
      `Too many folders after expansion (${result.length}); max is ${MAX_TREE_PATHS}`,
    );
  }

  return result;
}

export const folderIdParamsSchema = z.object({
  id: z.uuid("Invalid folder id"),
});

export const createFolderBodySchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(255),
  parent_id: z.uuid("Invalid parent folder id").nullable().optional(),
});

export const createFolderTreeBodySchema = z
  .object({
    parent_id: z.preprocess(
      emptyStringToNull,
      z.uuid("Invalid parent folder id").nullable().optional(),
    ),
    paths: z.array(z.string()).min(1, "At least one path is required"),
  })
  .superRefine((data, ctx) => {
    try {
      expandFolderTreePaths(data.paths);
    } catch (error) {
      ctx.addIssue({
        code: "custom",
        message: error instanceof Error ? error.message : "Invalid paths",
        path: ["paths"],
      });
    }
  })
  .transform((data) => ({
    parent_id: data.parent_id ?? null,
    expanded_paths: expandFolderTreePaths(data.paths),
  }));

export const renameFolderBodySchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(255),
});

export const trashFolderBodySchema = z.object({
  id: z.uuid("Invalid folder id"),
});

export const permanentDeleteFolderBodySchema = z.object({
  id: z.uuid("Invalid folder id"),
});

export const moveFolderBodySchema = z.object({
  parent_id: z.uuid("Invalid parent folder id").nullable(),
});

export type FolderIdParams = z.infer<typeof folderIdParamsSchema>;
export type CreateFolderBody = z.infer<typeof createFolderBodySchema>;
export type CreateFolderTreeBody = z.infer<typeof createFolderTreeBodySchema>;
export type RenameFolderBody = z.infer<typeof renameFolderBodySchema>;
export type TrashFolderBody = z.infer<typeof trashFolderBodySchema>;
export type PermanentDeleteFolderBody = z.infer<
  typeof permanentDeleteFolderBodySchema
>;
export type MoveFolderBody = z.infer<typeof moveFolderBodySchema>;
