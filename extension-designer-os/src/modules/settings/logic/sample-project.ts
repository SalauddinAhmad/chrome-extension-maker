/**
 * Sample project seeder. Creates a "Getting Started" project pre-populated
 * with one item in each core module so new users see the tools in context.
 *
 * Every write goes through a module repository — no direct db.* calls.
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

const SAMPLE_SVG_DATAURL = `data:image/svg+xml;utf8,${encodeURIComponent(SAMPLE_SVG)}`;

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

  await inspirationRepository.create({
    url: "https://dribbble.com",
    title: "Dribbble — Design inspiration",
    tags: ["ui", "inspiration"],
    notes: "Great source for UI patterns and color exploration.",
    collection: "ui",
    favorite: true,
    projectId: project.id,
  });

  await colorRepository.create({
    name: "Signal Blue",
    hex: "#3B82F6",
    rgb: { r: 59, g: 130, b: 246 },
    hsl: { h: 217, s: 91, l: 60 },
    source: "picker",
    favorite: true,
    tags: ["brand"],
    projectId: project.id,
  });

  await typographyRepository.createFont({
    family: "Inter",
    weights: [400, 500, 700],
    styles: ["normal"],
    category: "sans-serif",
    source: "google",
    favorite: true,
    tags: ["brand"],
    projectId: project.id,
  });

  await assetRepository.create({
    name: "welcome-icon.svg",
    type: "svg",
    url: SAMPLE_SVG_DATAURL,
    thumbnail: SAMPLE_SVG_DATAURL,
    source: "upload",
    size: SAMPLE_SVG.length,
    mimeType: "image/svg+xml",
    favorite: false,
    tags: ["sample"],
    projectId: project.id,
  });

  await noteRepository.create({
    title: "Welcome",
    body:
      "This is a sample project. Try the **Design Inspector** on any website to " +
      "see colors, fonts, and components in one place.",
    pinned: true,
    tags: ["welcome"],
    projectId: project.id,
  });

  return project;
}
