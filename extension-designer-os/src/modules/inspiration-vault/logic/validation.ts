import { z } from "zod";

const urlSchema = z
  .string()
  .trim()
  .min(1, "URL is required")
  .refine(
    (v) => {
      try {
        const u = new URL(v);
        return u.protocol === "http:" || u.protocol === "https:";
      } catch {
        return false;
      }
    },
    { message: "Enter a valid http(s) URL" },
  );

export const inspirationFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(200, "Title must be 200 characters or fewer"),
  url: urlSchema,
  notes: z
    .string()
    .trim()
    .max(1000, "Notes must be 1000 characters or fewer")
    .optional(),
  tagsRaw: z.string().max(300, "Too many tags").optional(),
  collection: z.string().optional(),
  projectId: z.string().optional(),
  favorite: z.boolean().optional(),
  thumbnail: z.string().optional(),
});

export type InspirationFormValues = z.infer<typeof inspirationFormSchema>;
