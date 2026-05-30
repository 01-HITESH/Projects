export type BrandStat = {
  label: string;
  value: string;
};

export type Brand = {
  id: string;
  name: string;
  tagline: string;
  logo: string;
  coverImage: string;
  stats: BrandStat[];
  externalUrl: string;
  slug: string;
  story: string[];
  gallery: string[];
  partners: string[];
};

export type TeamMember = {
  name: string;
  role: string;
  bio: string;
  image: string;
};

export type Article = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  tag: string;
  author: string;
  coverImage: string;
  readTime: string;
  body: string[];
};

export type Job = {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  remote: boolean;
  greenhouseUrl: string;
  description: string;
  requirements: string[];
};
