import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppShell } from "@/components/AppShell";
import { assetPath } from "@/lib/assets";

/**
 * The @font-face rules are built here rather than in `globals.css` so the
 * font files can carry the deployment's base path — a `url()` in a stylesheet
 * is emitted verbatim, and would 404 on any host serving from a subdirectory.
 */
const FONT_FACES = [
  { family: "Press Start 2P", file: "PressStart2P-Regular.ttf", format: "truetype", weight: "400" },
  {
    family: "Pixelify Sans",
    file: "PixelifySans-Variable.ttf",
    format: "truetype-variations",
    weight: "400 700",
  },
  { family: "Silkscreen", file: "Silkscreen-Regular.ttf", format: "truetype", weight: "400" },
  { family: "Silkscreen", file: "Silkscreen-Bold.ttf", format: "truetype", weight: "700" },
]
  .map(
    ({ family, file, format, weight }) => `@font-face {
  font-family: "${family}";
  src: url("${assetPath(`/fonts/${file}`)}") format("${format}");
  font-weight: ${weight};
  font-display: block;
}`,
  )
  .join("\n");

export const metadata: Metadata = {
  title: "Productivity App",
  description:
    "A journal, garden, gym and food log that lives entirely in your own browser. No account, no server, no one reading your entries.",
};

export const viewport: Viewport = {
  themeColor: "#f5d877",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full">
      <head>
        <style>{FONT_FACES}</style>
      </head>
      <body className="min-h-full">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
