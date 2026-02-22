import { NextRequest, NextResponse } from "next/server";
import { load } from "cheerio";

export const runtime = "nodejs";
export const maxDuration = 25; // allow time for fetch + parse on Vercel

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const url = typeof body.url === "string" ? body.url.trim() : "";
    if (!url) {
      return NextResponse.json({ error: "Missing url in body." }, { status: 400 });
    }
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      return NextResponse.json(
        { error: "URL must start with http:// or https://" },
        { status: 400 }
      );
    }

    const fetchOptions = {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
    };

    const fetchWithTimeout = async (): Promise<Response> => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 20000);
      const res = await fetch(url, { ...fetchOptions, signal: controller.signal });
      clearTimeout(timeout);
      return res;
    };

    let response = await fetchWithTimeout();

    // Retry once after delay on 429 (rate limit) or 503 (unavailable)
    if (!response.ok && (response.status === 429 || response.status === 503)) {
      await new Promise((r) => setTimeout(r, 4000));
      response = await fetchWithTimeout();
    }

    if (!response.ok) {
      const status = response.status;
      const messages: Record<number, string> = {
        429: "This site is rate-limiting requests (429). Try again in a few minutes or use a different store URL.",
        403: "Access denied (403). This site may block automated requests. Try a different store URL.",
        404: "Page not found (404). Check the URL and try again.",
        503: "Service temporarily unavailable (503). Try again in a minute or use a different URL.",
        502: "The site returned a bad gateway (502). Try again shortly.",
        500: "The site returned an error (500). Try again or use a different URL.",
      };
      const errorMessage =
        messages[status] ||
        `The site returned ${status}. Please check the URL and try again.`;
      const httpStatus = status === 429 ? 429 : status >= 500 ? 502 : 502;
      const code = status === 429 ? "RATE_LIMIT" : status === 403 ? "ACCESS_DENIED" : undefined;
      return NextResponse.json(
        { error: errorMessage, ...(code && { code }) },
        { status: httpStatus }
      );
    }

    const html = await response.text();
    const $ = load(html);

    const title = $("title").first().text().trim() ?? "";
    let description =
      $('meta[name="description"]').attr("content")?.trim() ?? "";
    if (!description) {
      description = $('meta[property="og:description"]').attr("content")?.trim() ?? "";
    }

    const texts: string[] = [];

    for (const tagName of ["h1", "h2", "h3", "h4"]) {
      $(tagName).each((_, el) => {
        const text = $(el).text().replace(/\s+/g, " ").trim();
        if (text) texts.push(`${tagName.toUpperCase()}: ${text}`);
      });
    }

    $("p").each((_, el) => {
      const text = $(el).text().replace(/\s+/g, " ").trim();
      if (text) texts.push(text);
    });

    $("li").each((_, el) => {
      const text = $(el).text().replace(/\s+/g, " ").trim();
      if (text) texts.push(`• ${text}`);
    });

    $("td, th").each((_, el) => {
      const text = $(el).text().replace(/\s+/g, " ").trim();
      if (text) texts.push(text);
    });

    const candidateTexts = new Set<string>();

    // Schema.org / microdata
    $('[itemtype*="Product"] [itemprop="name"]').each((_, el) => {
      const t = $(el).text().replace(/\s+/g, " ").trim();
      if (t && t.length > 1) candidateTexts.add(t);
    });

    // Common ecommerce product selectors (Shopify, WooCommerce, BigCommerce, Wix, custom)
    const productSelectors = [
      ".product-title",
      ".product-name",
      ".product-card__title",
      ".product-card-title",
      "[data-product-title]",
      ".ProductItem__Title",
      ".product-item__title",
      ".product-single__title",
      ".product__title",
      ".grid-product__title",
      ".card__title",
      ".product__name",
      "h2.product-title",
      "h3.product-title",
      ".woocommerce-loop-product__title",
      ".product_title",
      ".product-name a",
      ".product-card h3",
      ".product-item h3",
      ".collection-item__title",
      ".product-block__title",
      "a.product-link",
      ".product-title a",
      ".product-list-item__name",
      ".product-grid-item__title",
      ".product-tile__name",
    ];

    for (const selector of productSelectors) {
      try {
        $(selector).each((_, el) => {
          const t = $(el).text().replace(/\s+/g, " ").trim();
          if (t && t.length > 1 && t.length < 200) candidateTexts.add(t);
        });
      } catch {
        // ignore invalid selector
      }
    }

    // Fallback: headings that look like product names (short, no "policy" etc.)
    if (candidateTexts.size === 0) {
      $("h2, h3, h4").each((_, el) => {
        const t = $(el).text().replace(/\s+/g, " ").trim();
        if (t && t.length > 1 && t.length < 120 && !/policy|privacy|terms|contact|about|faq|help|cart|account/i.test(t)) {
          candidateTexts.add(t);
        }
      });
    }

    const products = Array.from(candidateTexts)
      .slice(0, 80)
      .map((name) => ({ name }));

    const content = texts.join("\n\n");

    return NextResponse.json({
      title,
      description,
      content,
      products,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    if (message.includes("abort") || message.includes("fetch")) {
      return NextResponse.json(
        { error: "Request timed out or URL could not be reached. Please try again." },
        { status: 504 }
      );
    }
    console.error("Scrape API error:", err);
    return NextResponse.json(
      { error: "Unexpected error while scraping website." },
      { status: 500 }
    );
  }
}
