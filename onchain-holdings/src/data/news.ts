import type { Article, Job } from "@/types";

export const articles: Article[] = [
  {
    slug: "consumer-crypto-needs-brands",
    title: "Consumer Crypto Needs Brands, Not More Dashboards",
    excerpt: "Why durable onchain adoption starts with characters, taste, and distribution.",
    date: "2026-04-16",
    tag: "Thesis",
    author: "Editorial Desk",
    coverImage: "/images/news/consumer-crypto.svg",
    readTime: "5 min read",
    body: [
      "The next generation of crypto companies will feel less like protocol portals and more like entertainment, commerce, and community brands.",
      "Financial primitives remain important, but consumer adoption comes from identity. People return to worlds that signal who they are.",
      "Our portfolio is designed around that shift: IP that travels, infrastructure that disappears, and communities that own a piece of the upside.",
    ],
  },
  {
    slug: "ip-onchain-playbook",
    title: "The Onchain IP Playbook",
    excerpt: "A practical framework for taking digital characters into mainstream markets.",
    date: "2026-03-28",
    tag: "IP",
    author: "Strategy Team",
    coverImage: "/images/news/ip-playbook.svg",
    readTime: "6 min read",
    body: [
      "Great IP earns emotional permission before it earns commercial permission. Onchain ownership sharpens that relationship.",
      "The best licensing programs keep the character world coherent while letting holders, retailers, and partners create real surface area.",
    ],
  },
  {
    slug: "abstracting-the-chain",
    title: "Abstracting the Chain for Everyone Else",
    excerpt: "Infrastructure wins when the user no longer has to think about infrastructure.",
    date: "2026-02-10",
    tag: "Infrastructure",
    author: "Protocol Team",
    coverImage: "/images/news/abstracting-chain.svg",
    readTime: "4 min read",
    body: [
      "Consumer crypto cannot ask every user to become a systems thinker. The experience must feel immediate, resilient, and legible.",
      "That is the purpose of our infrastructure work: compress complexity until ownership feels natural.",
    ],
  },
];

export const jobs: Job[] = [
  {
    id: "brand-director",
    title: "Brand Director",
    department: "Brand",
    location: "New York",
    type: "Full-time",
    remote: true,
    greenhouseUrl: "https://www.greenhouse.com",
    description: "Lead narrative systems, launches, and cultural partnerships across portfolio brands.",
    requirements: ["8+ years in brand strategy", "Deep taste in consumer culture", "Experience leading multidisciplinary launches"],
  },
  {
    id: "creative-technologist",
    title: "Creative Technologist",
    department: "Studio",
    location: "Remote",
    type: "Full-time",
    remote: true,
    greenhouseUrl: "https://www.greenhouse.com",
    description: "Prototype expressive web, 3D, and interactive brand surfaces for the portfolio.",
    requirements: ["Advanced frontend craft", "Three.js or realtime graphics experience", "Strong animation and performance instincts"],
  },
  {
    id: "protocol-partnerships",
    title: "Protocol Partnerships Lead",
    department: "Ecosystem",
    location: "London",
    type: "Full-time",
    remote: false,
    greenhouseUrl: "https://www.greenhouse.com",
    description: "Bring founders, builders, and distribution partners into the consumer crypto ecosystem.",
    requirements: ["Crypto-native network", "Commercial negotiation experience", "Excellent written communication"],
  },
];

export function getArticle(slug: string) {
  return articles.find((article) => article.slug === slug);
}

export function getJob(id: string) {
  return jobs.find((job) => job.id === id);
}
