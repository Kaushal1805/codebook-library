export interface Category {
  name: string;
  slug: string;
  icon: string;
  bookCount: number;
  description: string;
}

export const categories: Category[] = [
  {
    name: "SQL",
    slug: "sql",
    icon: "Database",
    bookCount: 12,
    description: "Queries, optimization, and database design",
  },
  {
    name: "Python",
    slug: "python",
    icon: "Code",
    bookCount: 18,
    description: "Core Python, scripting, and automation",
  },
  {
    name: "Data Analytics",
    slug: "data-analytics",
    icon: "BarChart3",
    bookCount: 9,
    description: "Analysis, visualization, and business intelligence",
  },
  {
    name: "Data Science",
    slug: "data-science",
    icon: "FlaskConical",
    bookCount: 14,
    description: "Statistics, modeling, and data pipelines",
  },
  {
    name: "Machine Learning",
    slug: "machine-learning",
    icon: "Brain",
    bookCount: 11,
    description: "Algorithms, deep learning, and model deployment",
  },
  {
    name: "GenAI",
    slug: "genai",
    icon: "Sparkles",
    bookCount: 7,
    description: "LLMs, prompt engineering, and generative models",
  },
  {
    name: "LangChain",
    slug: "langchain",
    icon: "Link",
    bookCount: 5,
    description: "LLM orchestration and application frameworks",
  },
  {
    name: "RAG",
    slug: "rag",
    icon: "Search",
    bookCount: 4,
    description: "Retrieval-augmented generation and vector search",
  },
  {
    name: "DSA",
    slug: "dsa",
    icon: "GitBranch",
    bookCount: 16,
    description: "Data structures, algorithms, and problem solving",
  },
  {
    name: "MLOps",
    slug: "mlops",
    icon: "Settings",
    bookCount: 6,
    description: "ML pipelines, monitoring, and infrastructure",
  },
];
