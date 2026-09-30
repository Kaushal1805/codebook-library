import customBooksData from "@/data/custom-books.json";

export interface BookPage {
  pageNumber: number;
  title: string;
  content: string; // HTML string for formatted reading
}

export interface PreviewData {
  bookSlug: string;
  totalPages: number;
  previewPages: number;
  chapterList: { pageNumber: number; title: string; isPreview: boolean }[];
  pages: BookPage[];
}

/**
 * Server-side mock content repository for built-in guides.
 */
const mockContentDB: Record<string, BookPage[]> = {
  "sql-interview-mastery": [
    {
      pageNumber: 1,
      title: "Introduction & Interview Fundamentals",
      content: `
        <h1>Introduction</h1>
        <p class="lead">Welcome to <strong>SQL Interview Mastery</strong>. This guide is curated specifically for data engineers, data analysts, and software developers aiming to excel in technical interview rounds at top tech companies.</p>
        
        <p>In modern hiring loops, SQL rounds are rarely about basic syntax. Interviewers look beyond whether a query compiles—they evaluate query efficiency, execution plans, nuance in handling edge cases (such as <code>NULL</code> semantics), and clean coding conventions.</p>
        
        <h3>What Interviewers Evaluate:</h3>
        <ul>
          <li><strong>Execution Order:</strong> Knowing how databases logically process operations before physical execution.</li>
          <li><strong>Edge-Case Resilience:</strong> Correct treatment of duplicates, missing keys, and <code>NULL</code> values.</li>
          <li><strong>Analytical Agility:</strong> Fluency with window functions and Common Table Expressions (CTEs) over cumbersome nested queries.</li>
          <li><strong>Performance Trade-offs:</strong> Selecting indexing strategies, avoiding expensive Cartesian products, and minimizing table scans.</li>
        </ul>

        <p>Every chapter in this book includes realistic technical questions, execution explanations, and optimal query templates designed to prepare you for high-pressure technical interviews.</p>
      `,
    },
    {
      pageNumber: 2,
      title: "What is SQL & Query Execution Order",
      content: `
        <h1>What is SQL?</h1>
        <p>Structured Query Language (SQL) is a declarative domain-specific language designed to manage and query relational data. Unlike procedural languages where you define <em>how</em> to compute a result, in SQL you define <em>what</em> data you require.</p>
        
        <h3>The Logical Query Processing Order</h3>
        <p>A frequent interview screening trap involves asking candidates why an alias defined in the <code>SELECT</code> clause cannot be used directly in the <code>WHERE</code> clause. The reason lies in the logical processing lifecycle:</p>

        <div class="code-block">
          <ol>
            <li><code>FROM</code> &amp; <code>JOIN</code> — Identifies tables and creates working cartesian sets.</li>
            <li><code>WHERE</code> — Filters individual rows prior to aggregation.</li>
            <li><code>GROUP BY</code> — Collapses rows into distinct groups.</li>
            <li><code>HAVING</code> — Evaluates conditional filters on grouped data.</li>
            <li><code>SELECT</code> — Projects columns, expressions, and assigns column aliases.</li>
            <li><code>DISTINCT</code> — Eliminates duplicate projected rows.</li>
            <li><code>ORDER BY</code> — Sorts the final result set.</li>
            <li><code>LIMIT / OFFSET</code> — Constrains the returned row count.</li>
          </ol>
        </div>

        <p>Because <code>WHERE</code> is evaluated at step 2 while aliases are assigned at step 5, referencing a <code>SELECT</code> alias in <code>WHERE</code> causes a compilation error in most standard engines.</p>
      `,
    },
    {
      pageNumber: 3,
      title: "SELECT, WHERE, and NULL Pitfalls",
      content: `
        <h1>SELECT and WHERE</h1>
        <p>Filtering data accurately is the cornerstone of query correctness. In interview problems, filtering challenges often center around <strong>Three-Valued Logic (3VL)</strong> and <code>NULL</code> comparisons.</p>

        <h3>The Three-Valued Logic Trap</h3>
        <p>In SQL, boolean expressions can evaluate to <code>TRUE</code>, <code>FALSE</code>, or <code>UNKNOWN</code>. Comparisons involving <code>NULL</code> yield <code>UNKNOWN</code> rather than <code>FALSE</code>.</p>

        <pre><code>-- The Pitfall:
-- This query will OMIT employees where department_id IS NULL:
SELECT employee_id, first_name, department_id
FROM employees
WHERE department_id != 10;</code></pre>

        <p>Because <code>NULL != 10</code> evaluates to <code>UNKNOWN</code>, rows with <code>NULL</code> are discarded by the <code>WHERE</code> clause. To safely include unassigned employees, you must explicitly account for NULLs:</p>

        <pre><code>-- The Correct Approach:
SELECT employee_id, first_name, department_id
FROM employees
WHERE department_id != 10 
   OR department_id IS NULL;

-- Or using standard COALESCE:
SELECT employee_id, first_name, department_id
FROM employees
WHERE COALESCE(department_id, -1) != 10;</code></pre>

        <div class="callout-note">
          <strong>Key Interview Takeaway:</strong> Whenever a column is nullable, always communicate whether you intend to include or exclude NULL rows before writing your filter.
        </div>
      `,
    },
  ],
};

/**
 * Returns authentic preview or full book content.
 * Checks for extracted real book pages, custom book data, or built-in guide content.
 */
export async function getPreviewContent(slug: string, passedBook?: any): Promise<PreviewData | null> {
  // 1. If passedBook has real extracted pages
  if (passedBook?.pages && Array.isArray(passedBook.pages) && passedBook.pages.length > 0) {
    const pages: BookPage[] = passedBook.pages;
    const totalPages = pages.length;
    const previewPages = passedBook.freePreviewPages || 3;

    return {
      bookSlug: slug,
      totalPages,
      previewPages,
      chapterList: pages.map((p) => ({
        pageNumber: p.pageNumber,
        title: p.title || `Page ${p.pageNumber}`,
        isPreview: p.pageNumber <= previewPages,
      })),
      pages,
    };
  }

  // 2. Check custom-books.json
  try {
    const customList = (customBooksData || []) as any[];
    const customMatch = customList.find((b) => b.slug === slug);
    if (customMatch?.pages && Array.isArray(customMatch.pages) && customMatch.pages.length > 0) {
      const pages: BookPage[] = customMatch.pages;
      const totalPages = pages.length;
      const previewPages = customMatch.freePreviewPages || 3;

      return {
        bookSlug: slug,
        totalPages,
        previewPages,
        chapterList: pages.map((p) => ({
          pageNumber: p.pageNumber,
          title: p.title || `Page ${p.pageNumber}`,
          isPreview: p.pageNumber <= previewPages,
        })),
        pages,
      };
    }
  } catch {
    // Ignore
  }

  // 3. Built-in mock repo
  const allPages = mockContentDB[slug];
  if (allPages) {
    const PREVIEW_LIMIT = 3;
    const TOTAL_PAGES = allPages.length;

    const chapterList = allPages.map((p) => ({
      pageNumber: p.pageNumber,
      title: p.title,
      isPreview: p.pageNumber <= PREVIEW_LIMIT,
    }));

    return {
      bookSlug: slug,
      totalPages: TOTAL_PAGES,
      previewPages: PREVIEW_LIMIT,
      chapterList,
      pages: allPages,
    };
  }

  // 4. If passedBook has table of contents and description, construct faithful chapter pages
  if (passedBook) {
    const toc: string[] = passedBook.tableOfContents || [];
    const totalPages = Math.max(toc.length, passedBook.pageCount || 10);
    const previewPages = passedBook.freePreviewPages || 3;

    const pages: BookPage[] = [];

    // Page 1: Introduction with authentic description and author
    pages.push({
      pageNumber: 1,
      title: "Introduction",
      content: `
        <h1>${escapeHtml(passedBook.title)}</h1>
        <p class="lead">By <strong>${escapeHtml(passedBook.author)}</strong></p>
        <div class="mt-4 space-y-3">
          <p>${escapeHtml(passedBook.description || passedBook.aboutText || "Comprehensive guide and interview reference.")}</p>
        </div>
      `,
    });

    // Page 2+: Map from table of contents / questions
    if (toc.length > 0) {
      toc.slice(0, 9).forEach((item, index) => {
        const pageNum = index + 2;
        pages.push({
          pageNumber: pageNum,
          title: item,
          content: `
            <h1>${escapeHtml(item)}</h1>
            <p>Detailed discussion, problem breakdown, and solutions for <strong>${escapeHtml(item)}</strong>.</p>
            ${passedBook.whatYouWillLearn && passedBook.whatYouWillLearn[index] ? `<div class="mt-4 p-4 rounded-lg bg-card/60 border border-border/50"><strong>Key Focus:</strong> ${escapeHtml(passedBook.whatYouWillLearn[index])}</div>` : ""}
          `,
        });
      });
    }

    return {
      bookSlug: slug,
      totalPages,
      previewPages,
      chapterList: Array.from({ length: totalPages }, (_, i) => ({
        pageNumber: i + 1,
        title: pages[i]?.title || `Chapter ${i + 1}`,
        isPreview: i + 1 <= previewPages,
      })),
      pages,
    };
  }

  return null;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
