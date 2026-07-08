import { z } from "zod";

/**
 * Central validation for the Projects module.
 * All UI + repository writes must pass these schemas before hitting Dexie.
 */

export const ALLOWED_COVER_MIME = ["image/png", "image/jpeg", "image/webp", "image/gif", "image/svg+xml"];
export const MAX_COVER_BYTES = 2 * 1024 * 1024; // 2 MB

export const projectNameSchema = z
  .string({ required_error: "Name is required" })
  .trim()
  .min(3, "Name must be at least 3 characters")
  .max(60, "Name must be 60 characters or fewer");

export const projectDescriptionSchema = z
  .string()
  .trim()
  .max(500, "Description must be 500 characters or fewer")
  .optional();

export const projectClientSchema = z
  .string()
  .trim()
  .max(120, "Client name must be 120 characters or fewer")
  .optional();

export const projectFormSchema = z.object({
  name: projectNameSchema,
  clientName: projectClientSchema,
  description: projectDescriptionSchema,
  color: z.string().optional(),
  coverImage: z.string().optional(),
});

export type ProjectFormValues = z.infer<typeof projectFormSchema>;

export interface CoverImageError {
  message: string;
}

export function validateCoverImageFile(file: File): CoverImageError | null {
  if (!file.type.startsWith("image/")) return { message: "Cover must be an image" };
  if (!ALLOWED_COVER_MIME.includes(file.type)) {
    return { message: "Unsupported image format" };
  }
  if (file.size > MAX_COVER_BYTES) {
    return { message: `Image too large (max ${(MAX_COVER_BYTES / 1024 / 1024).toFixed(0)}MB)` };
  }
  return null;
}
