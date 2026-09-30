export interface Company {
  name: string;
  slug: string;
  questionCount: number;
}

export const companies: Company[] = [
  {
    name: "Amazon",
    slug: "amazon",
    questionCount: 142,
  },
  {
    name: "Microsoft",
    slug: "microsoft",
    questionCount: 118,
  },
  {
    name: "Google",
    slug: "google",
    questionCount: 96,
  },
  {
    name: "TCS",
    slug: "tcs",
    questionCount: 87,
  },
  {
    name: "Infosys",
    slug: "infosys",
    questionCount: 73,
  },
  {
    name: "Accenture",
    slug: "accenture",
    questionCount: 64,
  },
];
