/**
 * Sample project seeder. Creates a "Getting Started" project pre-populated
 * with one item in each core module so new users see the tools in context.
 *
 * Every write goes through the module repository — no direct db.* calls.
 */
import { projectRepository } from "@/modules/projects/repository";
import { inspirationRepository } from "@/modules/inspiration-vault/repository";
import { colorRepository } from "@/modules/color-studio/repository";
import { typographyRepository } from "@/modules/typography-studio/repository";
import { assetRepository } from "@/modules/asset-extractor/repository";
import { noteRepository } from "@/modules/notes/repository";
import type { Project } from "@/types";

const SAMPLE_NAME = "Getting Started";

const SAMPLE_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">' +
  '<rect width="64" height="64" rx="12" fill="#3B82F6"/>' +
  '<path d="M20 34l8 8 16-18" stroke="white" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>' +
  "</svg>";

async function ensureProject(): Promise<Project> {
  const existing = (await projectRepository.getAll()).find(
    (p) => p.name === SAMPLE_NAME,
  );
  if (existing) return existing;
  return projectRepository.create({
    name: SAMPLE_NAME,
    description:
      "A demo project — feel free to edit, or delete it once you've explored the tools.",
    color: "#3B82F6",
    archived: false,
  });
}

export async function seedSampleProject(): Promise<Project> {
  const project = await ensureProject();

  // Inspiration
  await inspirationRepository
    .add?.({
      url: "https://dribbble.com",
      title: "Dribbble — Design inspiration",
      notes: "Great source for UI patterns and color exploration.",
      tags: ["ui", "inspiration"],
      collection: "ui",
      favorite: true,
      projectId: project.id,
    })
    .catch(() => undefined);

  // Color
  await colorRepository
    .add?.({
      hex: "#3B82F6",
      name: "Signal Blue",
      source: "picker",
      favorite: true,
      tags: ["brand"],
      projectId: project.id,
    })
    .catch(() => undefined);

  // Font
  await typographyRepository
    .add?.({
      family: "Inter",
      category: "sans-serif",
      source: "google",
      favorite: true,
      weights: [400, 500, 700],
      projectId: project.id,
    })
    .catch(() => undefined);

  // Asset
  const svgBlob = new Blob([SAMPLE_SVG], { type: "image/svg+xml" });
  await assetRepository
    .add?.(
      {
        name: "welcome-icon.svg",
        type: "svg",
        kind: "image",
        source: "upload",
        size: svgBlob.size,
        url: `data:image/svg+xml;utf8,${encodeURIComponent(SAMPLE_SVG)}`,
        thumbnail: `data:image/svg+xml;utf8,${encodeURIComponent(SAMPLE_SVG)}`,
        favorite: false,
        tags: ["sample"],
        projectId: project.id,
      },
      svgBlob,
    )
    .catch(() => undefined);

  // Note
  await noteRepository
    .add?.({
      title: "Welcome",
      body:
        "This is a sample project. Try the Design Inspector on any website to see " +
        "colors, fonts, and components in one place.",
      pinned: true,
      tags: ["welcome"],
      projectId: project.id,
    })
    .catch(() => undefined);

  return project;
}
