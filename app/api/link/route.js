import { NextResponse } from "next/server";
import { JSDOM } from "jsdom";

// Domain to website name mapping (Example)
const domainToNameMap = {
  "thesun.com": "The Sun",
  "nytimes.com": "The New York Times",
  "bbc.com": "BBC",
  // Add more mappings as needed
};

export async function GET(request) {
  const requestUrl = new URL(request.url);
  const targetUrl = requestUrl.searchParams.get("url");

  if (!targetUrl) {
    return NextResponse.json({ error: "URL is required" }, { status: 400 });
  }

  try {
    const response = await fetch(targetUrl);
    const html = await response.text();

    // Parse the HTML to extract text content
    const dom = new JSDOM(html);
    let articleText = "";
    let imageUrl = "";
    let articleTitle = "";

    // Extract the base domain from the URL
    const { hostname } = new URL(targetUrl);
    const domain = hostname.replace(/^www\./, "");

    // Try to map the domain to a website name
    const websiteName = domainToNameMap[domain] || domain;

    // Extract the title by prioritizing h1, then h2, then h3
    const article = dom.window.document.querySelector("article");
    if (article) {
      const h1Tag = article.querySelector("h1");
      const h2Tag = article.querySelector("h2");
      const h3Tag = article.querySelector("h3");

      if (h1Tag) {
        articleTitle = h1Tag.textContent || h1Tag.innerText;
      } else if (h2Tag) {
        articleTitle = h2Tag.textContent || h2Tag.innerText;
      } else if (h3Tag) {
        articleTitle = h3Tag.textContent || h3Tag.innerText;
      }
    }

    // Fallback to global h1, h2, h3 tags if not found within article
    if (!articleTitle) {
      const h1Tag = dom.window.document.querySelector("h1");
      const h2Tag = dom.window.document.querySelector("h2");
      const h3Tag = dom.window.document.querySelector("h3");

      if (h1Tag) {
        articleTitle = h1Tag.textContent || h1Tag.innerText;
      } else if (h2Tag) {
        articleTitle = h2Tag.textContent || h2Tag.innerText;
      } else if (h3Tag) {
        articleTitle = h3Tag.textContent || h3Tag.innerText;
      }
    }

    // Image extraction logic
    // First attempt: Extract image from the 'article-image' div
    const articleImageDiv = dom.window.document.querySelector(".article-image");
    if (articleImageDiv) {
      const imgTag = articleImageDiv.querySelector("img");
      if (imgTag) {
        imageUrl = imgTag.src || "";
      }
    }

    // Second attempt: Extract the first <img> tag within the <article> section
    if (!imageUrl && article) {
      const firstImgTag = article.querySelector("img");
      if (firstImgTag) {
        imageUrl = firstImgTag.src || "";
      }
    }

    // Third attempt: Fallback to the first global <img> tag on the page
    if (!imageUrl) {
      const globalImgTag = dom.window.document.querySelector("img");
      if (globalImgTag) {
        imageUrl = globalImgTag.src || "";
      }
    }

    // Extract text from <article> or <p> tags
    if (article) {
      articleText = article.textContent || article.innerText;
    } else {
      const paragraphs = dom.window.document.querySelectorAll("p");
      articleText = Array.from(paragraphs)
        .map((p) => p.textContent || p.innerText)
        .join(" ");
    }

    // Clean up the text
    articleText = articleText
      .replace(/<!--[\s\S]*?-->/g, "")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\{[^}]*\}/g, " ")
      .replace(/\([^)]*\)/g, " ")
      .replace(/https?:\/\/\S+/g, "")
      .replace(/&quot;/g, '"')
      .replace(/\\[^\\]*\\/g, " ")
      .replace(/\/[^\/]*\//g, " ")
      .replace(/\s+/g, " ")
      .trim();

    // Filter words and calculate reading time
    articleText = articleText
      .split(/\s+/)
      .filter((word) => word.length <= 15 && !/[\\/]/.test(word))
      .join(" ");

    const wordCount = articleText.split(/\s+/).length;
    const averageReadingSpeed = 200; // Words per minute
    const timeInMinutes = Math.ceil(wordCount / averageReadingSpeed);

    if (wordCount < 5) {
      return NextResponse.json(
        { error: "Insufficient content found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      title: articleTitle,
      text: articleText,
      websiteName,
      imageUrl,
      readingTime: timeInMinutes,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch the URL" },
      { status: 500 }
    );
  }
}
