import type { WorksWheelItem } from "@/components/ui/works-wheel";
const source = (file: string) =>
  "https://commons.wikimedia.org/wiki/File:" +
  encodeURIComponent(file.replaceAll(" ", "_"));
const credit = (author: string, file: string, version = "4.0") => ({
  author,
  source: source(file),
  license: `CC BY-SA ${version}`,
  licenseUrl: `https://creativecommons.org/licenses/by-sa/${version}/`,
});
// Exact photographed identities; links search the catalogue without asserting local availability.
export const featuredBottles = [
  {
    title: "Hendrick’s Gin",
    category: "Gin",
    image: "/images/bottles/hendricks.webp",
    alt: "Hendrick’s Gin bottle with a dark glass body and cream label, isolated on a transparent background",
    href: "/prices?q=Hendrick",
    credit: credit(
      "Mikaf1fan; cutout by Bruce The Deus",
      "Hendrick's Gin - Bottle.png",
    ),
  },
  {
    title: "Captain Morgan",
    category: "Rum",
    image: "/images/bottles/captain-morgan.webp",
    alt: "Captain Morgan The Original Rum bottle with its illustrated label, isolated on a transparent background",
    href: "/prices?q=Captain%20Morgan",
    credit: credit(
      "Pinakpani; cutout by Bruce The Deus",
      "Captain Morgan Rum - Bottle.png",
    ),
  },
  {
    title: "Tanqueray",
    category: "Gin",
    image: "/images/bottles/tanqueray.webp",
    alt: "Green Tanqueray gin bottle with a red seal, isolated on a transparent background",
    href: "/prices?q=Tanqueray",
    credit: credit("Bruce The Deus", "Tanqueray bottle Gin.png"),
  },
  {
    title: "Appleton Estate V-X",
    category: "Rum",
    image: "/images/bottles/appleton.webp",
    alt: "Appleton Estate V-X rum bottle with amber liquid and a dark cap, isolated on a transparent background",
    href: "/prices?q=Appleton",
    credit: credit(
      "Nebrot; cutout by Bruce The Deus",
      "Appleton Estate V-X bottle.png",
      "3.0",
    ),
  },
  {
    title: "Angélus 1989",
    category: "Wine",
    image: "/images/bottles/angelus.webp",
    alt: "A Château Angélus 1989 wine bottle with its vintage label, isolated on a transparent background",
    href: "/wines",
    credit: credit("Angelus", "ANGELUS'89.png", "3.0"),
  },
  {
    title: "Siegfried Dry Gin",
    category: "Gin",
    image: "/images/bottles/siegfried.webp",
    alt: "Siegfried Rheinland Dry Gin bottle isolated on a transparent background",
    href: "/guides/spirit-families",
    credit: credit("SiegfriedRheinland", "Siegfried Gin.png"),
  },
] satisfies WorksWheelItem[];
