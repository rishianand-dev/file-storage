import { AppError } from "@/errors";
import { fileRepository, recentlyOpenedRepository } from "@/repositories";
import type {
  ListRecentlyOpenedQuery,
  TrackRecentlyOpenedBody,
} from "@/validators";

function toFileResponse<T extends { size: bigint }>(file: T) {
  return {
    ...file,
    size: file.size.toString(),
  };
}

export async function trackRecentlyOpened(
  userId: string,
  input: TrackRecentlyOpenedBody,
) {
  const file = await fileRepository.findOwnedById(userId, input.file_id);
  if (!file) {
    throw new AppError("File not found", 404);
  }

  const recent = await recentlyOpenedRepository.upsert(userId, file.id);

  return {
    ...recent,
    file: toFileResponse(recent.file),
  };
}

export async function listRecentlyOpened(
  userId: string,
  query: ListRecentlyOpenedQuery,
) {
  const items = await recentlyOpenedRepository.listByUser(userId, query.limit);

  return items.map((item) => ({
    ...item,
    file: toFileResponse(item.file),
  }));
}
