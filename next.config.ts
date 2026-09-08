import type { NextConfig } from "next";

/**
 * The app is exported as plain static files.
 *
 * That isn't a workaround — it's what this app already was. There is no
 * server, no database and no API route, so there is nothing for a Node host
 * to do at request time. A static export can therefore sit on any dumb file
 * host, which is one fewer thing that can be taken away.
 *
 * `NEXT_PUBLIC_BASE_PATH` exists because GitHub Pages serves a project from a
 * subdirectory, and a static export has no server to rewrite URLs — the prefix
 * has to be baked in at build time. Left unset (local dev, or a host serving
 * from the root) it is empty and nothing changes.
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  // No image optimiser exists without a server. Every sprite is already an
  // exact-size pixel PNG that must not be resampled anyway.
  images: { unoptimized: true },
};

export default nextConfig;
