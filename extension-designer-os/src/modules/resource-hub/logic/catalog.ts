import type { Resource } from "../types";

/**
 * Curated seed list. Kept as static data (no network fetch) so the module
 * works fully offline — matches the "Privacy First" principle.
 */
export const RESOURCES: Resource[] = [
  // Icons
  { id: "lucide", name: "Lucide", url: "https://lucide.dev", category: "icons", description: "Beautiful open-source icon set", free: true, tags: ["open-source", "svg"] },
  { id: "phosphor", name: "Phosphor Icons", url: "https://phosphoricons.com", category: "icons", description: "Flexible icon family with 6 weights", free: true, tags: ["svg", "weights"] },
  { id: "tabler", name: "Tabler Icons", url: "https://tabler.io/icons", category: "icons", description: "5000+ free MIT icons", free: true, tags: ["open-source"] },
  { id: "heroicons", name: "Heroicons", url: "https://heroicons.com", category: "icons", description: "Icons by the makers of Tailwind CSS", free: true, tags: ["tailwind"] },
  { id: "iconify", name: "Iconify", url: "https://icon-sets.iconify.design", category: "icons", description: "100+ icon sets in one browser", free: true, tags: ["mega"] },
  { id: "noun-project", name: "The Noun Project", url: "https://thenounproject.com", category: "icons", description: "Millions of curated icons", free: false, tags: ["premium"] },

  // Fonts
  { id: "gfonts", name: "Google Fonts", url: "https://fonts.google.com", category: "fonts", description: "1600+ open-source web fonts", free: true, tags: ["open-source"] },
  { id: "fontshare", name: "Fontshare", url: "https://fontshare.com", category: "fonts", description: "Quality free fonts by Indian Type Foundry", free: true, tags: ["display"] },
  { id: "beautywebtype", name: "Beautiful Web Type", url: "https://beautifulwebtype.com", category: "fonts", description: "Best of Google Fonts, curated", free: true, tags: ["curated"] },
  { id: "fontsource", name: "Fontsource", url: "https://fontsource.org", category: "fonts", description: "Self-host any open-source font", free: true, tags: ["npm"] },
  { id: "typewolf", name: "Typewolf", url: "https://www.typewolf.com", category: "fonts", description: "Typography inspiration + pairings", free: true, tags: ["inspiration"] },

  // Stock photos
  { id: "unsplash", name: "Unsplash", url: "https://unsplash.com", category: "stock", description: "High-res free photos", free: true, tags: ["photos"] },
  { id: "pexels", name: "Pexels", url: "https://www.pexels.com", category: "stock", description: "Free stock photos + videos", free: true, tags: ["video"] },
  { id: "pixabay", name: "Pixabay", url: "https://pixabay.com", category: "stock", description: "Images, video, music, sound", free: true, tags: ["variety"] },
  { id: "burst", name: "Burst by Shopify", url: "https://burst.shopify.com", category: "stock", description: "Free stock for commerce", free: true, tags: ["commercial"] },

  // Mockups
  { id: "mockuuups", name: "Mockuuups Studio", url: "https://mockuuups.studio", category: "mockups", description: "Device mockup library", free: false, tags: ["device"] },
  { id: "shots", name: "Shots.so", url: "https://shots.so", category: "mockups", description: "Browser & device mockups in seconds", free: true, tags: ["browser"] },
  { id: "screenlane", name: "Screenlane", url: "https://screenlane.com", category: "mockups", description: "Curated app UI mockup inspiration", free: true, tags: ["inspiration"] },
  { id: "angle", name: "Angle Mockups", url: "https://angle.sh", category: "mockups", description: "3D device mockups", free: false, tags: ["3d"] },

  // Illustrations
  { id: "undraw", name: "unDraw", url: "https://undraw.co", category: "illustrations", description: "Open-source recolorable illustrations", free: true, tags: ["svg", "recolor"] },
  { id: "storyset", name: "Storyset", url: "https://storyset.com", category: "illustrations", description: "Customizable illustrations & animations", free: true, tags: ["animation"] },
  { id: "blushdesign", name: "Blush", url: "https://blush.design", category: "illustrations", description: "Mix & match illustration components", free: true, tags: ["mix"] },
  { id: "iradesign", name: "IRA Design", url: "https://iradesign.io", category: "illustrations", description: "Customizable illustrations builder", free: true, tags: ["builder"] },

  // Gradients
  { id: "uigradients", name: "uiGradients", url: "https://uigradients.com", category: "gradients", description: "Handpicked CSS gradients", free: true, tags: ["css"] },
  { id: "gradienthunt", name: "Gradient Hunt", url: "https://gradienthunt.com", category: "gradients", description: "Fresh gradient inspiration", free: true, tags: ["community"] },
  { id: "mesher", name: "Mesher", url: "https://csshero.org/mesher/", category: "gradients", description: "Mesh gradient generator", free: true, tags: ["mesh"] },
  { id: "meshgradient", name: "Mesh Gradient", url: "https://meshgradient.in", category: "gradients", description: "Interactive mesh gradient builder", free: true, tags: ["mesh"] },

  // Color tools
  { id: "coolors", name: "Coolors", url: "https://coolors.co", category: "colors", description: "The super fast color palette generator", free: true, tags: ["palette"] },
  { id: "colorhunt", name: "Color Hunt", url: "https://colorhunt.co", category: "colors", description: "Curated palettes for designers", free: true, tags: ["curated"] },
  { id: "khroma", name: "Khroma", url: "https://khroma.co", category: "colors", description: "AI-generated color palettes", free: true, tags: ["ai"] },
  { id: "realtimecolors", name: "Realtime Colors", url: "https://realtimecolors.com", category: "colors", description: "Preview palette on a real UI", free: true, tags: ["preview"] },
  { id: "huemint", name: "Huemint", url: "https://huemint.com", category: "colors", description: "AI palette generator for brand", free: true, tags: ["ai", "brand"] },

  // Inspiration
  { id: "dribbble", name: "Dribbble", url: "https://dribbble.com", category: "inspiration", description: "Design community showcase", free: true, tags: ["community"] },
  { id: "behance", name: "Behance", url: "https://behance.net", category: "inspiration", description: "Full creative portfolios", free: true, tags: ["portfolio"] },
  { id: "awwwards", name: "Awwwards", url: "https://awwwards.com", category: "inspiration", description: "Awarded website design", free: true, tags: ["web"] },
  { id: "godly", name: "Godly", url: "https://godly.website", category: "inspiration", description: "Divine website inspiration", free: true, tags: ["web"] },
  { id: "landbook", name: "Land-book", url: "https://land-book.com", category: "inspiration", description: "Landing page gallery", free: true, tags: ["landing"] },
  { id: "mobbin", name: "Mobbin", url: "https://mobbin.com", category: "inspiration", description: "Mobile design patterns library", free: false, tags: ["mobile"] },
  { id: "refactoring-ui", name: "SaaS Landing Page", url: "https://saaslandingpage.com", category: "inspiration", description: "SaaS landing page examples", free: true, tags: ["saas"] },

  // Tools
  { id: "figma", name: "Figma", url: "https://figma.com", category: "tools", description: "The collaborative design tool", free: true, tags: ["design"] },
  { id: "excalidraw", name: "Excalidraw", url: "https://excalidraw.com", category: "tools", description: "Hand-drawn style whiteboard", free: true, tags: ["whiteboard"] },
  { id: "tinypng", name: "TinyPNG", url: "https://tinypng.com", category: "tools", description: "Smart PNG & JPEG compression", free: true, tags: ["optimize"] },
  { id: "svgomg", name: "SVGOMG", url: "https://jakearchibald.github.io/svgomg/", category: "tools", description: "SVG optimizer in the browser", free: true, tags: ["svg"] },
  { id: "removebg", name: "remove.bg", url: "https://remove.bg", category: "tools", description: "Remove image backgrounds", free: true, tags: ["photo"] },
  { id: "squoosh", name: "Squoosh", url: "https://squoosh.app", category: "tools", description: "Image compression by Google", free: true, tags: ["optimize"] },
];
