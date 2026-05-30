import type { Brand } from "@/types";

export const brands: Brand[] = [
  {
    id: "pudgy-penguins",
    name: "Pudgy Penguins",
    tagline: "The NFT brand that went mainstream.",
    logo: "/images/logos/pudgy.svg",
    coverImage: "/images/brands/pudgy-cover.svg",
    stats: [
      { label: "Holders", value: "8,888" },
      { label: "Volume", value: "$2B+" },
      { label: "Retail", value: "2,000+" },
    ],
    externalUrl: "https://pudgypenguins.com",
    slug: "pudgy-penguins",
    story: [
      "Pudgy Penguins transforms digital ownership into a character universe with consumer reach, retail distribution, and community-led cultural gravity.",
      "The brand anchors the portfolio with a simple thesis: onchain IP becomes more valuable when it earns attention outside crypto-native rooms.",
    ],
    gallery: ["/images/brands/pudgy-cover.svg", "/images/brands/abstract-cover.svg", "/images/brands/overpass-cover.svg"],
    partners: ["Walmart", "Target", "Amazon", "Ethereum"],
  },
  {
    id: "overpass-ip",
    name: "Overpass IP",
    tagline: "Licensing rails for onchain characters.",
    logo: "/images/logos/overpass.svg",
    coverImage: "/images/brands/overpass-cover.svg",
    stats: [
      { label: "Licenses", value: "140+" },
      { label: "Creators", value: "60K+" },
      { label: "Markets", value: "18" },
    ],
    externalUrl: "https://example.com",
    slug: "overpass-ip",
    story: [
      "Overpass IP gives onchain brands the legal, commercial, and creative framework to expand into retail, games, content, and collaborations.",
      "It converts community-owned characters into structured opportunities without stripping away the culture that made them matter.",
    ],
    gallery: ["/images/brands/overpass-cover.svg", "/images/brands/pudgy-cover.svg", "/images/brands/abstract-cover.svg"],
    partners: ["Studios", "Retail", "Agencies", "Creators"],
  },
  {
    id: "abstract-chain",
    name: "Abstract Chain",
    tagline: "Consumer crypto infrastructure.",
    logo: "/images/logos/abstract.svg",
    coverImage: "/images/brands/abstract-cover.svg",
    stats: [
      { label: "Apps", value: "75+" },
      { label: "Users", value: "5M+" },
      { label: "Uptime", value: "99.99%" },
    ],
    externalUrl: "https://example.com",
    slug: "abstract-chain",
    story: [
      "Abstract Chain is the invisible infrastructure layer for applications that need speed, low friction, and familiar consumer-grade experiences.",
      "It lets portfolio companies ship onchain products without asking users to understand every protocol detail first.",
    ],
    gallery: ["/images/brands/abstract-cover.svg", "/images/brands/overpass-cover.svg", "/images/brands/pudgy-cover.svg"],
    partners: ["Wallets", "Games", "Commerce", "Developers"],
  },
];

export function getBrand(slug: string) {
  return brands.find((brand) => brand.slug === slug);
}
