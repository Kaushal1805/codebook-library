import customBooksData from "@/data/custom-books.json";

export interface Book {
  id: string;
  title: string;
  slug: string;
  author: string;
  category: string;
  description: string;
  price: number;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  coverColor: string;
  coverAccent: string;
  pageCount: number;
  rating: number;
  reviewCount: number;
  tags: string[];
  topics: string[];
  // Details page specific
  aboutText: string;
  whatYouWillLearn: string[];
  tableOfContents: string[];
  targetAudience: string;
  displayPrice?: string;
  status?: "draft" | "published" | "unpublished";
  coverUrl?: string;
  pdfPath?: string;
  pdfFileName?: string;
  pdfFileSize?: number;
  freePreviewPages?: number;
  companyRelevance?: string;
  seoTitle?: string;
  seoDescription?: string;
  pages?: { pageNumber: number; title: string; content: string }[];
  createdAt?: string;
  updatedAt?: string;
}

export function formatBookPrice(book: Book): string {
  if (book.displayPrice) return book.displayPrice;
  if (book.price === 0) return "Free";
  if (book.slug === "sql-interview-mastery") return "₹79";
  return `₹${book.price}`;
}

const retiredDemoBooks: Book[] = [
  {
    id: "book-1",
    title: "SQL Interview Mastery",
    slug: "sql-interview-mastery",
    author: "Alex Mercer",
    category: "SQL",
    description: "Master SQL queries, joins, window functions, and optimization techniques commonly asked in data engineering interviews.",
    price: 79,
    displayPrice: "₹79",
    difficulty: "Intermediate",
    coverColor: "#0f172a",
    coverAccent: "#38bdf8",
    pageCount: 240,
    rating: 4.8,
    reviewCount: 342,
    tags: ["SQL", "Interview Prep", "Database", "Query Optimization"],
    topics: ["Window Functions", "CTEs", "Subqueries", "Indexing", "Query Plans"],
    aboutText: "This book provides a comprehensive, hands-on approach to tackling the most challenging SQL interview questions. It skips the basic introductory material and dives straight into the complex scenarios you'll face at top tech companies.",
    whatYouWillLearn: [
      "Master logical query execution and Three-Valued Logic",
      "Advanced window functions (RANK, DENSE_RANK, NTILE, LAG/LEAD)",
      "High performance indexing strategies and EXPLAIN plans",
      "Real-world FAANG interview scenarios with step-by-step solutions"
    ],
    tableOfContents: [
      "01 — Introduction & Query Processing Order",
      "02 — Advanced Filtering & 3VL Semantics",
      "03 — Join Algorithms & Anti-Join Patterns",
      "04 — CTEs & Recursive Hierarchies",
      "05 — Window Functions Deep Dive",
      "06 — Query Optimization & Indexing",
      "07 — FAANG Real-World Interview Problems"
    ],
    targetAudience: "Data Engineers, Analytics Engineers, Backend Developers, and Data Scientists preparing for technical screening rounds.",
    status: "published",
    freePreviewPages: 3,
  },
  {
    id: "book-2",
    title: "200 SQL Interview Questions",
    slug: "200-sql-interview-questions",
    author: "Sarah Chen",
    category: "SQL",
    description: "A rapid-fire collection of 200 SQL questions ranging from basic syntax to advanced analytical queries.",
    price: 0,
    displayPrice: "Free",
    difficulty: "Beginner",
    coverColor: "#1e293b",
    coverAccent: "#f59e0b",
    pageCount: 180,
    rating: 4.5,
    reviewCount: 890,
    tags: ["SQL", "Free", "Cheat Sheet", "Interview Questions"],
    topics: ["Basic Queries", "Aggregations", "Joins", "Data Types"],
    aboutText: "The perfect companion for quick interview preparation. This book contains 200 carefully curated questions covering every aspect of SQL, organized by difficulty.",
    whatYouWillLearn: [
      "Rapid recall of fundamental SQL concepts and syntax",
      "Quick solutions to classic table manipulation problems",
      "Common interview screening questions with explanations"
    ],
    tableOfContents: [
      "01 — Basic SELECT & Filtering",
      "02 — Grouping and Aggregate Functions",
      "03 — Joins & Set Operations",
      "04 — Tricky Screening Scenarios"
    ],
    targetAudience: "Freshers and junior developers looking for quick revision before SQL rounds.",
    status: "published",
    freePreviewPages: 3,
  },
  {
    id: "book-3",
    title: "Python Interview Questions",
    slug: "python-interview-questions",
    author: "David Kumar",
    category: "Python",
    description: "Comprehensive collection of Python problems covering data structures, OOP, decorators, and real-world coding challenges.",
    price: 149,
    displayPrice: "₹149",
    difficulty: "Intermediate",
    coverColor: "#172554",
    coverAccent: "#60a5fa",
    pageCount: 310,
    rating: 4.7,
    reviewCount: 512,
    tags: ["Python", "OOP", "Decorators", "AsyncIO"],
    topics: ["Generators", "Metaclasses", "Memory Management", "GIL"],
    aboutText: "Move beyond standard LeetCode problems with Python-specific interview questions. Learn how to write pythonic code that impresses interviewers.",
    whatYouWillLearn: [
      "Master Python internals, GIL, and garbage collection",
      "Writing robust decorators, context managers, and generators",
      "AsyncIO concurrency patterns in high-throughput services"
    ],
    tableOfContents: [
      "01 — Core Python Internals & Memory Model",
      "02 — OOP & Dunder Magic Methods",
      "03 — Decorators, Closures, and Iterators",
      "04 — Concurrency, Multiprocessing & AsyncIO"
    ],
    targetAudience: "Software engineers and Python developers preparing for mid-to-senior technical interviews.",
    status: "published",
    freePreviewPages: 3,
  },
  {
    id: "book-4",
    title: "Python for Data Analytics",
    slug: "python-for-data-analytics",
    author: "Elena Rodriguez",
    category: "Python",
    description: "Learn how to use Python, Pandas, and NumPy to clean, analyze, and visualize complex datasets.",
    price: 199,
    displayPrice: "₹199",
    difficulty: "Beginner",
    coverColor: "#064e3b",
    coverAccent: "#34d399",
    pageCount: 420,
    rating: 4.9,
    reviewCount: 1205,
    tags: ["Python", "Pandas", "NumPy", "Data Analytics"],
    topics: ["Data Wrangling", "Vectorization", "EDA", "Matplotlib"],
    aboutText: "The definitive guide to doing data analysis in Python. This book walks you through the entire data pipeline from extraction to visualization.",
    whatYouWillLearn: [
      "Vectorized operations in NumPy and high-speed array computing",
      "Comprehensive data transformation with Pandas DataFrames",
      "Creating publication-ready statistical visualizations"
    ],
    tableOfContents: [
      "01 — Environment Setup & NumPy Fundamentals",
      "02 — Pandas Series & DataFrames Masterclass",
      "03 — Handling Missing Values & Data Cleaning",
      "04 — Exploratory Data Analysis & Case Studies"
    ],
    targetAudience: "Aspiring data analysts and business intelligence engineers.",
    status: "published",
    freePreviewPages: 3,
  },
  {
    id: "book-5",
    title: "Pandas Interview Guide",
    slug: "pandas-interview-guide",
    author: "James Wilson",
    category: "Data Analytics",
    description: "Ace your data manipulation interviews with 100+ Pandas coding challenges and detailed solutions.",
    price: 99,
    displayPrice: "₹99",
    difficulty: "Intermediate",
    coverColor: "#312e81",
    coverAccent: "#a5b4fc",
    pageCount: 200,
    rating: 4.6,
    reviewCount: 280,
    tags: ["Pandas", "Data Analytics", "Interview Prep"],
    topics: ["GroupBy", "Pivot Tables", "Apply vs Vectorize", "Time Series"],
    aboutText: "A focused study guide strictly for Pandas interview rounds. Learn the most efficient ways to solve data manipulation tasks without resorting to slow loops.",
    whatYouWillLearn: [
      "Eliminating for-loops using vectorization and apply transforms",
      "MultiIndex manipulation, unstacking, and complex reshapes",
      "Time-series resampling, rolling windows, and shift operations"
    ],
    tableOfContents: [
      "01 — Vectorized Transformations & Filtering",
      "02 — Advanced Aggregations with GroupBy",
      "03 — Merging, Joining, and Concatenating",
      "04 — 100 Interview Challenges with Explanations"
    ],
    targetAudience: "Data scientists and analysts preparing for live coding rounds.",
    status: "published",
    freePreviewPages: 3,
  },
  {
    id: "book-6",
    title: "Data Analyst Interview Handbook",
    slug: "data-analyst-interview-handbook",
    author: "Maria Garcia",
    category: "Data Analytics",
    description: "End-to-end preparation for data analyst roles — statistics, Excel, SQL, visualization, and business case studies.",
    price: 199,
    displayPrice: "₹199",
    difficulty: "Intermediate",
    coverColor: "#1e3a5f",
    coverAccent: "#38bdf8",
    pageCount: 280,
    rating: 4.8,
    reviewCount: 450,
    tags: ["Data Analytics", "Statistics", "A/B Testing", "Business Intelligence"],
    topics: ["Hypothesis Testing", "Metrics Design", "Cohort Analysis", "Dashboards"],
    aboutText: "More than just coding, this handbook covers the business and statistical aspects of data analyst interviews, including product sense and A/B testing.",
    whatYouWillLearn: [
      "Designing conversion and retention metrics for product analytics",
      "Rigorous statistical hypothesis testing & sample sizing",
      "Frameworks for breaking down ambiguous business case questions"
    ],
    tableOfContents: [
      "01 — Product Sense & Metric Definition",
      "02 — Applied Statistics & A/B Testing Mechanics",
      "03 — SQL & Tableau Screening Problems",
      "04 — Behavioral & System Communication"
    ],
    targetAudience: "Product Analysts, BI Engineers, and Quantitative Researchers.",
    status: "published",
    freePreviewPages: 3,
  },
  {
    id: "book-7",
    title: "Machine Learning Interview Guide",
    slug: "machine-learning-interview-guide",
    author: "Dr. Alan Turing",
    category: "Machine Learning",
    description: "From linear regression to transformers — theory, math, coding problems, and system design for ML interviews.",
    price: 249,
    displayPrice: "₹249",
    difficulty: "Advanced",
    coverColor: "#4c0519",
    coverAccent: "#fb7185",
    pageCount: 350,
    rating: 4.9,
    reviewCount: 820,
    tags: ["Machine Learning", "Deep Learning", "System Design", "Transformers"],
    topics: ["Loss Functions", "Backprop", "Regularization", "Attention Mechanism"],
    aboutText: "A rigorous guide covering the mathematical foundations, algorithm implementations from scratch, and large-scale ML system design required for senior roles.",
    whatYouWillLearn: [
      "Deriving gradient descent, backprop, and optimization math",
      "End-to-end ML System Design (recommendation engines, fraud detection)",
      "Dealing with class imbalance, data drift, and latency constraints"
    ],
    tableOfContents: [
      "01 — Classical ML Math & Algorithms",
      "02 — Deep Learning & Architectures",
      "03 — ML System Design Blueprint",
      "04 — Live Coding ML Algorithms from Scratch"
    ],
    targetAudience: "ML Engineers, AI Researchers, and Data Science candidates.",
    status: "published",
    freePreviewPages: 3,
  },
  {
    id: "book-8",
    title: "DSA Interview Preparation",
    slug: "dsa-interview-preparation",
    author: "Kevin Patel",
    category: "DSA",
    description: "Master Data Structures and Algorithms with step-by-step visual explanations of the 50 most common patterns.",
    price: 0,
    displayPrice: "Free",
    difficulty: "Intermediate",
    coverColor: "#14532d",
    coverAccent: "#4ade80",
    pageCount: 400,
    rating: 4.7,
    reviewCount: 1500,
    tags: ["DSA", "LeetCode", "Free", "Algorithms"],
    topics: ["Two Pointers", "Sliding Window", "Dynamic Programming", "Graphs"],
    aboutText: "Stop memorizing solutions. This book teaches you the underlying patterns (sliding window, two pointers, BFS/DFS) to solve any algorithm problem.",
    whatYouWillLearn: [
      "Recognizing patterns in 50 core algorithmic templates",
      "Mastering dynamic programming state transitions",
      "Graph traversal (Dijkstra, Topological Sort, Union-Find)"
    ],
    tableOfContents: [
      "01 — Arrays & Two-Pointer Patterns",
      "02 — Sliding Window & Hashing",
      "03 — Trees, Tries & Graph Traversals",
      "04 — Dynamic Programming Mastery"
    ],
    targetAudience: "Software engineers preparing for FAANG coding rounds.",
    status: "published",
    freePreviewPages: 3,
  },
  {
    id: "book-9",
    title: "LangChain Practical Guide",
    slug: "langchain-practical-guide",
    author: "Lisa Zhang",
    category: "LangChain",
    description: "Build production-ready LLM applications with LangChain, vector databases, and autonomous agents.",
    price: 199,
    displayPrice: "₹199",
    difficulty: "Advanced",
    coverColor: "#3b0764",
    coverAccent: "#c084fc",
    pageCount: 220,
    rating: 4.6,
    reviewCount: 195,
    tags: ["LangChain", "LLM", "Agents", "Vector DB"],
    topics: ["Chains", "LCEL", "Agentic Workflows", "Tool Calling"],
    aboutText: "A hands-on engineering guide to building robust applications on top of Large Language Models using the LangChain framework.",
    whatYouWillLearn: [
      "LangChain Expression Language (LCEL) for declarative pipeline design",
      "Building stateful ReAct agents with function calling and custom tools",
      "Production tracing and evaluation using LangSmith"
    ],
    tableOfContents: [
      "01 — Introduction to LLM Orchestration",
      "02 — LCEL & Chain Composition",
      "03 — Memory, State & Autonomous Agents",
      "04 — Evaluation, Guardrails & Production Deployment"
    ],
    targetAudience: "AI Engineers and fullstack developers building LLM features.",
    status: "published",
    freePreviewPages: 3,
  },
  {
    id: "book-10",
    title: "RAG From Basics to Production",
    slug: "rag-from-basics-to-production",
    author: "Marcus Johnson",
    category: "RAG",
    description: "Master Retrieval-Augmented Generation. Learn chunking strategies, vector embeddings, and hybrid search.",
    price: 249,
    displayPrice: "₹249",
    difficulty: "Advanced",
    coverColor: "#1e1b4b",
    coverAccent: "#818cf8",
    pageCount: 250,
    rating: 4.8,
    reviewCount: 310,
    tags: ["RAG", "Embeddings", "Vector Search", "Hybrid Search"],
    topics: ["Chunking", "Reranking", "HyDE", "Evaluation (RAGAS)"],
    aboutText: "The complete guide to grounding LLMs in your own data. This book covers the entire RAG pipeline from document parsing to advanced retrieval techniques.",
    whatYouWillLearn: [
      "Optimal chunking and embedding strategies for enterprise documents",
      "Hybrid search combining BM25 keyword matching and dense vector search",
      "Cross-encoder reranking and hallucination mitigation"
    ],
    tableOfContents: [
      "01 — Architecture of Modern RAG Systems",
      "02 — Advanced Chunking & Metadata Enrichment",
      "03 — Vector Stores, Indexing & Hybrid Retrieval",
      "04 — Reranking, HyDE & RAG Evaluation Frameworks"
    ],
    targetAudience: "AI Engineers designing high-accuracy search and knowledge retrieval systems.",
    status: "published",
    freePreviewPages: 3,
  },
  {
    id: "book-11",
    title: "Generative AI Interview Questions",
    slug: "genai-interview-questions",
    author: "Dr. Sophie Lin",
    category: "GenAI",
    description: "Prepare for generative AI roles with questions on LLMs, prompt engineering, fine-tuning, and evaluation methods.",
    price: 149,
    displayPrice: "₹149",
    difficulty: "Intermediate",
    coverColor: "#701a75",
    coverAccent: "#f472b6",
    pageCount: 190,
    rating: 4.5,
    reviewCount: 125,
    tags: ["GenAI", "Prompt Engineering", "Fine-Tuning", "LLMs"],
    topics: ["LoRA / QLoRA", "RLHF", "Hallucination Control", "Quantization"],
    aboutText: "The GenAI field is moving fast. This book compiles the most common interview questions asked for emerging AI Engineering roles in the past year.",
    whatYouWillLearn: [
      "Key mechanisms of transformer decoder models & rotary embeddings",
      "Parameter-Efficient Fine Tuning (PEFT, LoRA, QLoRA)",
      "Context window management, KV caching, and latency optimization"
    ],
    tableOfContents: [
      "01 — Transformer Architecture Deep Dive",
      "02 — Prompt Engineering & In-Context Learning",
      "03 — Fine-Tuning Paradigms (SFT, RLHF, DPO)",
      "04 — High-Frequency Interview Questions & Solutions"
    ],
    targetAudience: "Developers transitioning to GenAI and AI Engineering positions.",
    status: "published",
    freePreviewPages: 3,
  },
  {
    id: "book-12",
    title: "MLOps Interview Handbook",
    slug: "mlops-interview-handbook",
    author: "Thomas Wright",
    category: "MLOps",
    description: "A comprehensive guide to ML infrastructure, model deployment, CI/CD for ML, and monitoring in production.",
    price: 299,
    displayPrice: "₹299",
    difficulty: "Advanced",
    coverColor: "#1c1917",
    coverAccent: "#fb923c",
    pageCount: 320,
    rating: 4.8,
    reviewCount: 205,
    tags: ["MLOps", "Docker", "Kubernetes", "CI/CD", "Monitoring"],
    topics: ["Model Registry", "Feature Stores", "Data Drift", "Kubeflow"],
    aboutText: "Bridge the gap between data science and DevOps. Learn how to architect systems that continuously train, deploy, and monitor machine learning models at scale.",
    whatYouWillLearn: [
      "Automated ML training and validation pipelines with CI/CD",
      "Feature stores, model registries, and versioning protocols",
      "Detecting data drift and concept drift in live production traffic"
    ],
    tableOfContents: [
      "01 — Foundations of Production ML Systems",
      "02 — Feature Engineering Pipelines & Feature Stores",
      "03 — Model Serving, Low-Latency Inference & Triton",
      "04 — Production Monitoring, Observability & Drift"
    ],
    targetAudience: "MLOps Engineers, DevOps specialists, and senior ML engineers.",
    status: "published",
    freePreviewPages: 3,
  },
];

// The storefront begins with an empty catalog. Books are added through the admin panel.
export const books: Book[] = [];

export function getAllStaticBooks(): Book[] {
  const custom = (customBooksData || []) as unknown as Book[];
  return custom;
}

let supabaseOffline = false;

const hasSupabase = () => {
  if (supabaseOffline) return false;
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder")
  );
};

async function withTimeout<T = any>(promise: PromiseLike<T> | Promise<T>, timeoutMs = 250): Promise<T> {
  let timeoutId: any;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      supabaseOffline = true;
      reject(new Error("Supabase timeout"));
    }, timeoutMs);
  });
  return Promise.race([Promise.resolve(promise), timeoutPromise]).finally(() => clearTimeout(timeoutId));
}

// Map DB difficulty to UI difficulty format
const mapDifficulty = (diff: string): "Beginner" | "Intermediate" | "Advanced" => {
  if (diff === "beginner") return "Beginner";
  if (diff === "advanced") return "Advanced";
  return "Intermediate";
};

// Map DB book structure to interface Book structure
function mapDbBook(dbBook: any): Book {
  const hash = (dbBook.slug || dbBook.title || "").split("").reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
  const colors = [
    { bg: "#0f172a", fg: "#38bdf8" },
    { bg: "#1e293b", fg: "#f59e0b" },
    { bg: "#172554", fg: "#60a5fa" },
    { bg: "#064e3b", fg: "#34d399" },
    { bg: "#312e81", fg: "#a5b4fc" },
    { bg: "#4c0519", fg: "#fb7185" },
    { bg: "#3b0764", fg: "#c084fc" },
  ];
  const color = colors[hash % colors.length];

  return {
    id: dbBook.id,
    title: dbBook.title,
    slug: dbBook.slug || dbBook.title?.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-") || dbBook.id,
    author: dbBook.author,
    category: dbBook.categories?.name || "General",
    description: dbBook.short_description || "",
    price: Number(dbBook.price || 0),
    difficulty: mapDifficulty(dbBook.difficulty),
    coverColor: color.bg,
    coverAccent: color.fg,
    pageCount: dbBook.page_count || 200,
    rating: Number(dbBook.rating || 4.8),
    reviewCount: dbBook.review_count || 120,
    tags: dbBook.book_tags?.map((t: any) => t.tag) || ["Tech", "Interview"],
    topics: dbBook.book_tags?.map((t: any) => t.tag) || ["Concepts", "Code Examples"],
    aboutText: dbBook.full_description || dbBook.short_description || "",
    whatYouWillLearn: [
      "Key architectural concepts & core design principles",
      "Hands-on coding challenges & optimal solutions",
      "Real-world case studies & execution benchmarks",
      "Interview-ready scenario discussions"
    ],
    tableOfContents: [
      "01 — Introduction & Fundamentals",
      "02 — Core Implementations & Patterns",
      "03 — Advanced Deep Dive & Optimization",
      "04 — Real-World Interview Scenarios"
    ],
    targetAudience: "Developers and engineers preparing for technical interviews.",
    status: dbBook.status || "published",
    coverUrl: dbBook.cover_url || "",
    pdfPath: dbBook.pdf_path || "",
    pdfFileName: dbBook.pdf_file_name || "",
    pdfFileSize: dbBook.pdf_file_size ? Number(dbBook.pdf_file_size) : undefined,
    freePreviewPages: dbBook.free_preview_pages || 3,
    companyRelevance: dbBook.company_relevance || "",
    seoTitle: dbBook.seo_title || "",
    seoDescription: dbBook.seo_description || "",
    createdAt: dbBook.created_at || "",
    updatedAt: dbBook.updated_at || "",
  };
}

export async function getPublishedBooks(supabase?: any): Promise<Book[]> {
  if (hasSupabase() && supabase) {
    try {
      const { data, error } = await withTimeout(
        supabase
          .from("books")
          .select("*, categories(name), book_tags(tag)")
          .eq("status", "published")
          .order("created_at", { ascending: false })
      );

      if (!error && data && data.length > 0) {
        const dbBooks = data.map(mapDbBook);
        return dbBooks;
      }
    } catch {
      supabaseOffline = true;
    }
  }

  // Fallback to comprehensive catalog including custom uploaded books
  return getAllStaticBooks().filter(
    (b) => b.status === "published" || !b.status
  );
}

export async function getBookBySlug(slug: string, supabase?: any): Promise<Book | null> {
  if (hasSupabase() && supabase) {
    try {
      const { data, error } = await withTimeout(
        supabase
          .from("books")
          .select("*, categories(name), book_tags(tag)")
          .eq("slug", slug)
          .maybeSingle()
      );

      if (!error && data) {
        return mapDbBook(data);
      }
    } catch {
      supabaseOffline = true;
    }
  }

  return getAllStaticBooks().find((b) => b.slug === slug) || null;
}

export async function getBookById(id: string, supabase?: any): Promise<Book | null> {
  if (hasSupabase() && supabase) {
    try {
      const { data, error } = await withTimeout(
        supabase
          .from("books")
          .select("*, categories(name), book_tags(tag)")
          .eq("id", id)
          .maybeSingle()
      );

      if (!error && data) {
        return mapDbBook(data);
      }
    } catch {
      supabaseOffline = true;
    }
  }

  return getAllStaticBooks().find((b) => b.id === id) || null;
}

export async function getBooksByCategory(categorySlug: string, supabase?: any): Promise<Book[]> {
  if (hasSupabase() && supabase) {
    try {
      const { data, error } = await supabase
        .from("books")
        .select("*, categories(name, slug), book_tags(tag)")
        .eq("status", "published")
        .eq("categories.slug", categorySlug);

      if (!error && data && data.length > 0) {
        return data.filter((b: any) => b.categories !== null).map(mapDbBook);
      }
    } catch {
      // Fall through
    }
  }

  return getAllStaticBooks().filter((b) => b.category.toLowerCase().replace(/\s+/g, "-") === categorySlug.toLowerCase() || b.category.toLowerCase() === categorySlug.toLowerCase());
}

export async function searchBooks(query: string, supabase?: any): Promise<Book[]> {
  const allBooks = await getPublishedBooks(supabase);
  if (!query) return allBooks;

  const q = query.toLowerCase();
  return allBooks.filter(
    (b) =>
      b.title.toLowerCase().includes(q) ||
      b.description.toLowerCase().includes(q) ||
      b.author.toLowerCase().includes(q) ||
      b.category.toLowerCase().includes(q) ||
      b.tags.some((t) => t.toLowerCase().includes(q))
  );
}

export async function getRelatedBooks(slug: string, category: string, supabase?: any): Promise<Book[]> {
  const allBooks = await getPublishedBooks(supabase);
  return allBooks
    .filter((b) => b.category === category && b.slug !== slug)
    .slice(0, 4);
}

// ==============================================================================
// ADMIN FUNCTIONS (Require admin role server-side)
// ==============================================================================

export async function getAllBooksAdmin(supabase: any): Promise<Book[]> {
  if (typeof window !== "undefined") {
    try {
      const res = await fetch("/api/admin/books");
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.books)) {
          return json.books;
        }
      }
    } catch {
      // Ignore
    }
  }

  if (hasSupabase() && supabase) {
    try {
      const { data, error } = await supabase
        .from("books")
        .select("*, categories(name, slug), book_tags(tag)")
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        return data.map(mapDbBook);
      }
    } catch {
      // Fallback
    }
  }

  // Fallback in dev if Supabase is not configured or offline
  return getAllStaticBooks();
}

export async function getBookByIdAdmin(id: string, supabase: any): Promise<Book | null> {
  if (hasSupabase() && supabase) {
    try {
      const { data, error } = await supabase
        .from("books")
        .select("*, categories(name, slug), book_tags(tag)")
        .eq("id", id)
        .single();

      if (!error && data) {
        return mapDbBook(data);
      }
    } catch {
      // Fallback
    }
  }

  return getAllStaticBooks().find((b) => b.id === id) || null;
}

export interface AdminMetrics {
  totalBooks: number;
  publishedCount: number;
  draftCount: number;
  unpublishedCount: number;
  categoriesCount: number;
  recentBooks: Book[];
}

export async function getAdminMetrics(supabase: any): Promise<AdminMetrics> {
  if (hasSupabase() && supabase) {
    try {
      const { data: allBooks, error: booksError } = await supabase
        .from("books")
        .select("*, categories(name, slug)")
        .order("created_at", { ascending: false });

      const { count: catCount } = await supabase
        .from("categories")
        .select("*", { count: "exact", head: true });

      if (!booksError && allBooks && allBooks.length > 0) {
        const mapped: Book[] = allBooks.map(mapDbBook);
        return {
          totalBooks: mapped.length,
          publishedCount: mapped.filter((b: Book) => b.status === "published").length,
          draftCount: mapped.filter((b: Book) => b.status === "draft").length,
          unpublishedCount: mapped.filter((b: Book) => b.status === "unpublished").length,
          categoriesCount: catCount || 9,
          recentBooks: mapped.slice(0, 5),
        };
      }
    } catch {
      // Fallback
    }
  }

  // Fallback for dev mode
  return {
    totalBooks: books.length,
    publishedCount: books.length,
    draftCount: 0,
    unpublishedCount: 0,
    categoriesCount: 9,
    recentBooks: books.slice(0, 5),
  };
}

export async function createBookAdmin(
  bookData: {
    title: string;
    slug: string;
    author: string;
    category?: string;
    shortDescription: string;
    fullDescription: string;
    categoryId?: string;
    difficulty: "Beginner" | "Intermediate" | "Advanced";
    price: number;
    pageCount: number;
    freePreviewPages?: number;
    status: "draft" | "published" | "unpublished";
    coverUrl?: string;
    pdfPath?: string;
    pdfFileName?: string;
    pdfFileSize?: number;
    tags?: string[];
    topics?: string[];
    tableOfContents?: string[];
    whatYouWillLearn?: string[];
    pages?: { pageNumber: number; title: string; content: string }[];
    companyRelevance?: string;
    seoTitle?: string;
    seoDescription?: string;
  },
  supabase: any
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    // During local development, persist through the authenticated local route.
    // This avoids waiting on a remote database after the PDF upload is complete.
    if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
      const response = await fetch("/api/admin/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookData),
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        return { success: false, error: result.error || "Failed to save book locally" };
      }

      return { success: true, data: result.book };
    }

    const difficultyMap: Record<string, string> = {
      Beginner: "beginner",
      Intermediate: "intermediate",
      Advanced: "advanced",
    };

    const insertPayload: any = {
      title: bookData.title,
      slug: bookData.slug,
      author: bookData.author,
      short_description: bookData.shortDescription,
      full_description: bookData.fullDescription,
      category_id: bookData.categoryId || null,
      difficulty: difficultyMap[bookData.difficulty] || "intermediate",
      price: bookData.price,
      page_count: bookData.pageCount,
      free_preview_pages: bookData.freePreviewPages ?? 3,
      status: bookData.status,
      cover_url: bookData.coverUrl || null,
      pdf_path: bookData.pdfPath || null,
      pdf_file_name: bookData.pdfFileName || null,
      pdf_file_size: bookData.pdfFileSize || null,
      topics: bookData.topics || [],
      company_relevance: bookData.companyRelevance || null,
      seo_title: bookData.seoTitle || null,
      seo_description: bookData.seoDescription || null,
    };

    if (hasSupabase() && supabase) {
      const { data, error } = await withTimeout(
        supabase.from("books").insert(insertPayload).select().single(),
        3500
      );

      if (!error && data) {
        if (bookData.tags && bookData.tags.length > 0) {
          const tagRows = bookData.tags.map((t) => ({
            book_id: data.id,
            tag: t.trim(),
          }));
          await withTimeout(supabase.from("book_tags").insert(tagRows), 2000);
        }
        return { success: true, data };
      }
    }

    // Fallback in memory & local storage
    const newBook: Book = {
      id: `custom-book-${Date.now()}`,
      title: bookData.title,
      slug: bookData.slug,
      author: bookData.author,
      category: bookData.category || bookData.categoryId || "SQL",
      description: bookData.shortDescription,
      price: bookData.price,
      displayPrice: `₹${bookData.price}`,
      difficulty: bookData.difficulty,
      coverColor: "#1e293b",
      coverAccent: "#f59e0b",
      pageCount: bookData.pageCount,
      rating: 5.0,
      reviewCount: 1,
      tags: bookData.tags || ["New Release"],
      topics: bookData.topics || [],
      aboutText: bookData.fullDescription,
      whatYouWillLearn: bookData.whatYouWillLearn && bookData.whatYouWillLearn.length > 0
        ? bookData.whatYouWillLearn
        : [
            "Core architectural patterns and design best practices",
            "Comprehensive interview problem breakdown",
            "Practical code implementations with full context",
          ],
      tableOfContents: bookData.tableOfContents && bookData.tableOfContents.length > 0
        ? bookData.tableOfContents
        : [
            "1. Introduction & Core Fundamentals",
            "2. Deep Dive Architecture & Patterns",
            "3. Advanced Optimization & Scaling",
            "4. Interview Questions & Solutions",
          ],
      targetAudience: "Engineers and developers preparing for interviews.",
      coverUrl: bookData.coverUrl,
      pdfPath: bookData.pdfPath,
      pdfFileName: bookData.pdfFileName,
      pdfFileSize: bookData.pdfFileSize,
      pages: bookData.pages,
      status: bookData.status,
      companyRelevance: bookData.companyRelevance,
      seoTitle: bookData.seoTitle,
      seoDescription: bookData.seoDescription,
      createdAt: new Date().toISOString(),
    };

    if (typeof window !== "undefined") {
      try {
        await fetch("/api/admin/books", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newBook),
        });
      } catch {
        // Ignored
      }
    }

    books.unshift(newBook);
    return { success: true, data: newBook };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to create book" };
  }
}

export async function updateBookAdmin(
  id: string,
  bookData: Partial<{
    title: string;
    slug: string;
    author: string;
    shortDescription: string;
    fullDescription: string;
    categoryId?: string;
    difficulty: "Beginner" | "Intermediate" | "Advanced";
    price: number;
    pageCount: number;
    freePreviewPages?: number;
    status: "draft" | "published" | "unpublished";
    coverUrl?: string;
    pdfPath?: string;
    pdfFileName?: string;
    pdfFileSize?: number;
    tags?: string[];
    topics?: string[];
    tableOfContents?: string[];
    whatYouWillLearn?: string[];
    pages?: { pageNumber: number; title: string; content: string }[];
    companyRelevance?: string;
    seoTitle?: string;
    seoDescription?: string;
  }>,
  supabase: any
): Promise<{ success: boolean; error?: string }> {
  try {
    const updatePayload: any = {};
    if (bookData.title !== undefined) updatePayload.title = bookData.title;
    if (bookData.slug !== undefined) updatePayload.slug = bookData.slug;
    if (bookData.author !== undefined) updatePayload.author = bookData.author;
    if (bookData.shortDescription !== undefined) updatePayload.short_description = bookData.shortDescription;
    if (bookData.fullDescription !== undefined) updatePayload.full_description = bookData.fullDescription;
    if (bookData.categoryId !== undefined) updatePayload.category_id = bookData.categoryId || null;
    if (bookData.difficulty !== undefined) {
      const difficultyMap: Record<string, string> = {
        Beginner: "beginner",
        Intermediate: "intermediate",
        Advanced: "advanced",
      };
      updatePayload.difficulty = difficultyMap[bookData.difficulty] || "intermediate";
    }
    if (bookData.price !== undefined) updatePayload.price = bookData.price;
    if (bookData.pageCount !== undefined) updatePayload.page_count = bookData.pageCount;
    if (bookData.freePreviewPages !== undefined) updatePayload.free_preview_pages = bookData.freePreviewPages;
    if (bookData.status !== undefined) updatePayload.status = bookData.status;
    if (bookData.coverUrl !== undefined) updatePayload.cover_url = bookData.coverUrl;
    if (bookData.pdfPath !== undefined) updatePayload.pdf_path = bookData.pdfPath;
    if (bookData.pdfFileName !== undefined) updatePayload.pdf_file_name = bookData.pdfFileName;
    if (bookData.pdfFileSize !== undefined) updatePayload.pdf_file_size = bookData.pdfFileSize;
    if (bookData.topics !== undefined) updatePayload.topics = bookData.topics;
    if (bookData.companyRelevance !== undefined) updatePayload.company_relevance = bookData.companyRelevance;
    if (bookData.seoTitle !== undefined) updatePayload.seo_title = bookData.seoTitle;
    if (bookData.seoDescription !== undefined) updatePayload.seo_description = bookData.seoDescription;
    updatePayload.updated_at = new Date().toISOString();

    // 1. Always persist to local custom books API first
    if (typeof window !== "undefined") {
      try {
        const res = await fetch("/api/admin/books", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, ...bookData }),
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          console.warn("Local update API warning:", errData);
        }
      } catch (err) {
        console.warn("Local API update fetch error:", err);
      }
    }

    // 2. Sync to Supabase if available and not a custom-only book
    if (hasSupabase() && supabase && !id.startsWith("custom-book-")) {
      try {
        const { error } = await withTimeout(
          supabase.from("books").update(updatePayload).eq("id", id),
          3000
        );
        if (!error && bookData.tags !== undefined) {
          await withTimeout(supabase.from("book_tags").delete().eq("book_id", id), 2000).catch(() => {});
          if (bookData.tags.length > 0) {
            const tagRows = bookData.tags.map((t) => ({
              book_id: id,
              tag: t.trim(),
            }));
            await withTimeout(supabase.from("book_tags").insert(tagRows), 2000).catch(() => {});
          }
        }
      } catch (dbErr) {
        console.warn("Supabase update non-fatal warning:", dbErr);
      }
    }

    const idx = books.findIndex((b) => b.id === id);
    if (idx !== -1) {
      books[idx] = { ...books[idx], ...(bookData as any) };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to update book" };
  }
}

export async function deleteBookAdmin(id: string, supabase: any): Promise<{ success: boolean; error?: string }> {
  try {
    if (typeof window !== "undefined") {
      try {
        const res = await fetch(`/api/admin/books?id=${encodeURIComponent(id)}`, {
          method: "DELETE",
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          console.warn("Local delete response warning:", errData);
        }
      } catch (err) {
        console.warn("Local API delete error:", err);
      }
    }

    if (hasSupabase() && supabase) {
      try {
        await supabase.from("books").delete().eq("id", id);
      } catch (dbErr) {
        console.warn("Supabase delete warning:", dbErr);
      }
    }

    const idx = books.findIndex((b) => b.id === id);
    if (idx !== -1) books.splice(idx, 1);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to delete book" };
  }
}

export async function updateBookStatusAdmin(
  id: string,
  status: "draft" | "published" | "unpublished",
  supabase: any
): Promise<{ success: boolean; error?: string }> {
  try {
    if (hasSupabase() && supabase) {
      const { error } = await supabase
        .from("books")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) return { success: false, error: error.message };
    }
    const book = books.find((b) => b.id === id);
    if (book) book.status = status;
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to update status" };
  }
}
