"use client";

/**
 * PDF & Document Auto-Extractor Utility
 * Dynamically loads PDF.js to extract real text, page structure, chapter titles,
 * metadata, and render a high-res cover image from page 1.
 * Also supports plain text (.txt, .md) and document files.
 */

export interface ExtractedBookPage {
  pageNumber: number;
  title: string;
  content: string; // Formatted HTML for the reader
}

export interface ExtractedPdfData {
  title: string;
  author: string;
  pageCount: number;
  shortDescription: string;
  fullDescription: string;
  category: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  suggestedPrice: number;
  tags: string[];
  topics: string[];
  tableOfContents: string[];
  whatYouWillLearn: string[];
  pages: ExtractedBookPage[];
  coverBlob?: Blob;
  coverPreviewUrl?: string;
  suggestedSlug: string;
  rawTextSnippet?: string;
}

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  SQL: ["sql", "query", "queries", "postgresql", "mysql", "joins", "indexing", "database", "rdbms", "sqlite"],
  Python: ["python", "django", "flask", "fastapi", "pandas", "numpy", "pytest", "asyncio", "pip"],
  "Machine Learning": ["machine learning", "deep learning", "neural network", "pytorch", "tensorflow", "scikit-learn", "model", "supervised", "unsupervised"],
  GenAI: ["generative ai", "genai", "llm", "large language model", "gpt", "prompt engineering", "diffusion", "claude", "gemini", "fine-tuning", "openai"],
  LangChain: ["langchain", "langgraph", "agent", "agents", "chain", "chains", "tools", "vector store", "prompt template"],
  RAG: ["rag", "retrieval augmented generation", "vector db", "embeddings", "pinecone", "chroma", "qdrant", "similarity search"],
  "System Design": ["system design", "distributed systems", "microservices", "load balancer", "caching", "redis", "kafka", "scalability", "architecture", "sharding"],
  "Data Structures & Algorithms": ["data structures", "algorithms", "dsa", "leetcode", "binary tree", "graph", "dynamic programming", "sorting", "recursion", "array", "linked list", "stack", "queue"],
  "Data Analytics": ["data analytics", "data analysis", "power bi", "tableau", "visualization", "business intelligence", "metrics", "analytics", "statistics"],
  "DevOps & MLOps": ["devops", "mlops", "docker", "kubernetes", "ci/cd", "terraform", "helm", "monitoring", "ansible", "aws", "gcp", "azure"],
};

/**
 * Ensure PDF.js is loaded in the browser environment via CDN
 */
export async function loadPdfJsLibrary(): Promise<any> {
  if (typeof window === "undefined") return null;

  if (window.pdfjsLib) {
    return window.pdfjsLib;
  }

  return new Promise((resolve, reject) => {
    const existingScript = document.getElementById("pdfjs-cdn-script");
    if (existingScript) {
      existingScript.addEventListener("load", () => {
        if (window.pdfjsLib) {
          window.pdfjsLib.GlobalWorkerOptions.workerSrc =
            "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
          resolve(window.pdfjsLib);
        }
      });
      return;
    }

    const script = document.createElement("script");
    script.id = "pdfjs-cdn-script";
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
    script.onload = () => {
      if (window.pdfjsLib) {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc =
          "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
        resolve(window.pdfjsLib);
      } else {
        reject(new Error("PDF.js failed to initialize"));
      }
    };
    script.onerror = () => reject(new Error("Failed to load PDF.js from CDN"));
    document.head.appendChild(script);
  });
}

/**
 * Convert string to clean URL-friendly slug
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Clean up extracted raw text
 */
function cleanText(text: string): string {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\t/g, "  ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * Converts a list of text lines into clean, formatted HTML paragraphs and headings
 */
function formatLinesToHtml(lines: string[], defaultTitle: string): { title: string; html: string } {
  const cleanLines = lines.map((l) => l.trim()).filter((l) => l.length > 0);
  if (cleanLines.length === 0) {
    return {
      title: defaultTitle,
      html: `
        <div class="py-6 text-center space-y-4">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-medium">
            Book Cover &amp; Overview
          </div>
          <h1 class="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">${escapeHtml(defaultTitle)}</h1>
          <p class="text-sm text-muted-foreground max-w-md mx-auto">This page represents the cover and title page. Proceed to <strong>Page 2</strong> to read the complete chapters and content.</p>
        </div>
      `,
    };
  }

  let pageTitle = defaultTitle;
  const htmlParts: string[] = [];

  // Check if first line is a heading
  const firstLine = cleanLines[0];
  if (firstLine.length < 90 && !firstLine.endsWith(".") && !firstLine.toLowerCase().startsWith("http")) {
    pageTitle = firstLine;
    htmlParts.push(`<h1>${escapeHtml(firstLine)}</h1>`);
    cleanLines.shift();
  } else {
    htmlParts.push(`<h1>${escapeHtml(pageTitle)}</h1>`);
  }

  let inList = false;
  let inCode = false;
  let codeBuffer: string[] = [];

  const flushCode = () => {
    if (inCode && codeBuffer.length > 0) {
      htmlParts.push(`<pre><code>${escapeHtml(codeBuffer.join("\n"))}</code></pre>`);
      codeBuffer = [];
      inCode = false;
    }
  };

  const flushList = () => {
    if (inList) {
      htmlParts.push(`</ul>`);
      inList = false;
    }
  };

  for (const line of cleanLines) {
    const isBullet = /^[•\-*]\s+/.test(line) || /^\d+[\.)]\s+/.test(line);
    const isCodeLine = line.startsWith("    ") || line.startsWith("\t") || /^(SELECT|FROM|WHERE|INSERT|UPDATE|def |function |import |class |const |let |var )/i.test(line);
    const isHeading = (line.length < 75 && (line.endsWith(":") || /^(Chapter|Section|Module|Part|Q\d+|Question \d+)/i.test(line))) || (/^[A-Z\s0-9]{4,50}$/.test(line) && line.length < 50);

    if (isHeading) {
      flushCode();
      flushList();
      htmlParts.push(`<h3>${escapeHtml(line)}</h3>`);
    } else if (isBullet) {
      flushCode();
      if (!inList) {
        htmlParts.push(`<ul>`);
        inList = true;
      }
      const itemText = line.replace(/^[•\-*]\s+/, "").replace(/^\d+[\.)]\s+/, "");
      htmlParts.push(`<li>${escapeHtml(itemText)}</li>`);
    } else if (isCodeLine) {
      flushList();
      inCode = true;
      codeBuffer.push(line);
    } else {
      flushCode();
      flushList();
      htmlParts.push(`<p>${escapeHtml(line)}</p>`);
    }
  }

  flushCode();
  flushList();

  return {
    title: pageTitle,
    html: htmlParts.join("\n"),
  };
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Extract book metadata, content analysis, all pages, and cover image from a PDF or text document
 */
export async function extractDataFromPdfFile(
  file: File,
  onProgress?: (step: string, percent: number) => void
): Promise<ExtractedPdfData> {
  const fileName = file.name.toLowerCase();

  // If text file (.txt, .md, .json)
  if (fileName.endsWith(".txt") || fileName.endsWith(".md") || fileName.endsWith(".json")) {
    return extractFromTextFile(file, onProgress);
  }

  onProgress?.("Initializing PDF Engine...", 10);
  const pdfjs = await loadPdfJsLibrary();

  if (!pdfjs) {
    throw new Error("Could not load PDF processing engine.");
  }

  onProgress?.("Reading document binary...", 20);
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;

  const totalPages = pdf.numPages;
  onProgress?.(`Parsing all ${totalPages} pages & metadata...`, 35);

  // 1. Extract PDF info and metadata
  let metaTitle = "";
  let metaAuthor = "";
  let metaSubject = "";

  try {
    const meta = await pdf.getMetadata();
    const info = meta?.info || {};
    if (info.Title && typeof info.Title === "string" && info.Title.trim().length > 2) {
      metaTitle = info.Title.trim();
    }
    if (info.Author && typeof info.Author === "string" && info.Author.trim().length > 1) {
      metaAuthor = info.Author.trim();
    }
    if (info.Subject && typeof info.Subject === "string") {
      metaSubject = info.Subject.trim();
    }
  } catch (e) {
    console.warn("Could not read embedded PDF metadata:", e);
  }

  // 2. Extract content from ALL pages of the PDF (up to 100 pages)
  const pagesToScan = Math.min(totalPages, 100);
  const extractedPages: ExtractedBookPage[] = [];
  const allPageTexts: string[] = [];
  const detectedHeadings: string[] = [];

  for (let i = 1; i <= pagesToScan; i++) {
    const progressPercent = 35 + Math.round((i / pagesToScan) * 45);
    onProgress?.(`Extracting page ${i} of ${totalPages}...`, progressPercent);

    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const strings: string[] = [];

    for (const item of content.items as any[]) {
      if (item.str && item.str.trim().length > 0) {
        strings.push(item.str.trim());
      }
    }

    // Collect headings / questions for table of contents
    for (const str of strings) {
      if (
        (str.length >= 4 && str.length <= 80 && /^(Q\d+|Question \d+|\d+\.|\d+\)|\bChapter\b|\bSection\b|\bModule\b)/i.test(str)) ||
        (str.length >= 8 && str.length <= 70 && str.endsWith("?"))
      ) {
        if (!detectedHeadings.includes(str)) {
          detectedHeadings.push(str);
        }
      }
    }

    const defaultTitle = i === 1 ? (metaTitle || "Cover & Introduction") : `Page ${i}`;
    const formatted = formatLinesToHtml(strings, defaultTitle);

    extractedPages.push({
      pageNumber: i,
      title: formatted.title,
      content: formatted.html,
    });

    allPageTexts.push(strings.join(" "));
  }

  const fullText = allPageTexts.join("\n\n");

  // 3. Fallback Title extraction from page 1 or file name
  let title = metaTitle;
  if (!title || title.length < 3 || title.toLowerCase().includes("untitled") || title.endsWith(".pdf")) {
    const page1 = extractedPages[0];
    if (page1 && page1.title && page1.title.length > 3 && page1.title !== "Cover & Introduction" && !page1.title.endsWith(".pdf")) {
      title = page1.title;
    } else {
      title = file.name
        .replace(/\.pdf$/i, "")
        .replace(/[-_]+/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase())
        .trim();
    }
  }
  title = title.replace(/\.pdf$/i, "").trim();

  // 4. Author Extraction
  let author = metaAuthor;
  if (!author || author.toLowerCase().includes("anonymous") || author.length < 2) {
    const authorRegex = /(?:by|author[:\s]|written by|curated by)\s+([A-Z][a-zA-Z\s.]{2,35})/i;
    const authorMatch = fullText.slice(0, 3000).match(authorRegex);
    if (authorMatch && authorMatch[1]) {
      author = authorMatch[1].trim();
    } else {
      author = "CodeBook Author";
    }
  }

  // 5. Category & Topics Classification
  let bestCategory = "SQL";
  let maxMatches = 0;
  const lowerText = fullText.toLowerCase() + " " + file.name.toLowerCase() + " " + title.toLowerCase();
  const detectedTopics = new Set<string>();

  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    let matches = 0;
    for (const kw of keywords) {
      if (lowerText.includes(kw.toLowerCase())) {
        matches++;
        const formattedTopic = kw
          .split(" ")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ");
        detectedTopics.add(formattedTopic);
      }
    }
    if (matches > maxMatches) {
      maxMatches = matches;
      bestCategory = cat;
    }
  }

  // 6. Difficulty Estimation
  let difficulty: "Beginner" | "Intermediate" | "Advanced" = "Intermediate";
  if (lowerText.includes("advanced") || lowerText.includes("internals") || lowerText.includes("distributed") || lowerText.includes("optimization")) {
    difficulty = "Advanced";
  } else if (lowerText.includes("beginner") || lowerText.includes("basics") || lowerText.includes("fundamentals") || lowerText.includes("introduction")) {
    difficulty = "Beginner";
  }

  // 7. Descriptions Generation
  let shortDescription = metaSubject;
  if (!shortDescription || shortDescription.length < 20) {
    // Extract first substantial paragraph from page 1 or page 2
    const paragraphs = fullText
      .split(/\n\s*\n/)
      .map((p) => cleanText(p))
      .filter((p) => p.length > 50 && p.length < 350 && !p.toLowerCase().startsWith("copyright") && !p.toLowerCase().startsWith("http"));

    if (paragraphs.length > 0) {
      shortDescription = paragraphs[0];
    } else {
      shortDescription = `Comprehensive interview preparation guide and practical reference for ${title}, featuring real-world problems, step-by-step explanations, and solutions.`;
    }
  }

  if (shortDescription.length > 300) {
    shortDescription = shortDescription.substring(0, 297) + "...";
  }

  // Extract actual Table of Contents
  let tableOfContents = detectedHeadings.slice(0, 15);
  if (tableOfContents.length < 3) {
    tableOfContents = extractedPages
      .filter((p) => p.title && p.title.length > 3)
      .map((p) => `${p.pageNumber.toString().padStart(2, "0")} — ${p.title}`)
      .slice(0, 10);
  }

  if (tableOfContents.length === 0) {
    tableOfContents = [
      "01 — Overview & Core Concepts",
      "02 — High Frequency Questions",
      "03 — Advanced Technical Problems",
      "04 — Detailed Solutions & Explanations",
    ];
  }

  // Extract what you will learn / highlights
  const whatYouWillLearn: string[] = [];
  const bulletMatches = fullText.match(/(?:^|\n)[•\-*]\s+([^\n]{15,120})/g);
  if (bulletMatches && bulletMatches.length > 0) {
    for (const b of bulletMatches.slice(0, 5)) {
      const cleanB = b.replace(/^[\n•\-*\s]+/, "").trim();
      if (cleanB.length > 15 && !whatYouWillLearn.includes(cleanB)) {
        whatYouWillLearn.push(cleanB);
      }
    }
  }

  if (whatYouWillLearn.length < 3) {
    const topicsArr = Array.from(detectedTopics);
    if (topicsArr.length > 0) {
      topicsArr.slice(0, 4).forEach((t) => {
        whatYouWillLearn.push(`Comprehensive mastery of ${t} questions and patterns`);
      });
    } else {
      whatYouWillLearn.push(
        "Core technical principles and step-by-step problem breakdowns",
        "High-frequency interview questions with complete explanations",
        "Optimal code patterns and common edge-case analysis"
      );
    }
  }

  const fullDescription = `### Overview\n\n${shortDescription}\n\n### Key Highlights:\n${whatYouWillLearn.map((item) => `- ${item}`).join("\n")}\n\nDesigned for software engineers, data analysts, and tech candidates preparing for technical interviews.`;

  // 8. Suggested Price
  let suggestedPrice = 79;
  if (totalPages > 200) suggestedPrice = 149;
  else if (totalPages > 100) suggestedPrice = 99;
  else if (totalPages < 20) suggestedPrice = 29;

  // 9. Generate High-Res Cover from Page 1 (Canvas render)
  onProgress?.("Rendering Page 1 cover thumbnail...", 90);
  let coverBlob: Blob | undefined;
  let coverPreviewUrl: string | undefined;

  try {
    const page1 = await pdf.getPage(1);
    const viewport = page1.getViewport({ scale: 2.0 });

    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext("2d");

    if (ctx) {
      await page1.render({ canvasContext: ctx, viewport }).promise;
      coverBlob = (await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.92);
      })) || undefined;

      if (coverBlob) {
        coverPreviewUrl = URL.createObjectURL(coverBlob);
      }
    }
  } catch (err) {
    console.warn("Could not generate page 1 cover image:", err);
  }

  onProgress?.("Extraction completed successfully!", 100);

  const finalTopics = Array.from(detectedTopics).slice(0, 8);
  if (finalTopics.length === 0) {
    finalTopics.push(bestCategory, "Interview Prep", "DSA", "Guide");
  }

  return {
    title,
    author,
    pageCount: totalPages,
    shortDescription: cleanText(shortDescription),
    fullDescription: cleanText(fullDescription),
    category: bestCategory,
    difficulty,
    suggestedPrice,
    tags: finalTopics.slice(0, 5),
    topics: finalTopics,
    tableOfContents,
    whatYouWillLearn: whatYouWillLearn.slice(0, 4),
    pages: extractedPages,
    coverBlob,
    coverPreviewUrl,
    suggestedSlug: slugify(title) || `book-${Date.now()}`,
    rawTextSnippet: fullText.slice(0, 1000),
  };
}

/**
 * Text file extractor (.txt, .md)
 */
async function extractFromTextFile(
  file: File,
  onProgress?: (step: string, percent: number) => void
): Promise<ExtractedPdfData> {
  onProgress?.("Reading text document...", 30);
  const text = await file.text();

  const titleFromFileName = file.name
    .replace(/\.(txt|md|docx|json)$/i, "")
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();

  // Split text into pages (~400 words per page or by section divider)
  const sections = text.split(/\n\s*---+\s*\n|\n\s*#{1,2}\s+/).filter((s) => s.trim().length > 0);
  const pages: ExtractedBookPage[] = [];

  if (sections.length > 1) {
    sections.forEach((sec, idx) => {
      const lines = sec.split("\n").filter((l) => l.trim().length > 0);
      const firstLine = lines[0] || `Section ${idx + 1}`;
      const pageTitle = firstLine.length < 80 ? firstLine.replace(/^#+\s*/, "") : `Section ${idx + 1}`;
      pages.push({
        pageNumber: idx + 1,
        title: pageTitle,
        content: `<h1>${escapeHtml(pageTitle)}</h1>` + lines.map((l) => `<p>${escapeHtml(l)}</p>`).join("\n"),
      });
    });
  } else {
    // Split into chunks of ~2000 chars
    const chunkSize = 2000;
    const totalChunks = Math.max(1, Math.ceil(text.length / chunkSize));
    for (let i = 0; i < totalChunks; i++) {
      const chunk = text.slice(i * chunkSize, (i + 1) * chunkSize);
      pages.push({
        pageNumber: i + 1,
        title: i === 0 ? "Introduction" : `Part ${i + 1}`,
        content: `<h1>${i === 0 ? "Introduction" : `Part ${i + 1}`}</h1><p>${escapeHtml(chunk)}</p>`,
      });
    }
  }

  const shortDesc = text.slice(0, 200).replace(/\s+/g, " ").trim();

  return {
    title: titleFromFileName,
    author: "Kaushal",
    pageCount: pages.length,
    shortDescription: shortDesc,
    fullDescription: text.slice(0, 800),
    category: "General",
    difficulty: "Intermediate",
    suggestedPrice: 49,
    tags: ["Document", "Interview"],
    topics: ["Guide", "Questions"],
    tableOfContents: pages.map((p) => p.title),
    whatYouWillLearn: ["Complete review of written materials", "Practical problems and interview concepts"],
    pages,
    suggestedSlug: slugify(titleFromFileName),
  };
}
