(function() {
    // Extract citation data from the current webpage
    function getCitationData() {
        try {
            // Check if current page is PDF
            if (document.contentType === 'application/pdf' || window.location.href.toLowerCase().endsWith('.pdf')) {
                return {
                    isPDF: true,
                    url: window.location.href
                };
            }

            // Title - try multiple sources
            const title = 
                document.querySelector('meta[property="og:title"]')?.getAttribute("content") ||
                document.querySelector('meta[name="twitter:title"]')?.getAttribute("content") ||
                document.querySelector('h1')?.innerText ||
                document.querySelector("title")?.innerText ||
                document.title;

            // Authors - try multiple methods
            let authors = [];
            // Schema.org metadata
            const schemaScript = document.querySelector('script[type="application/ld+json"]');
            if (schemaScript) {
                try {
                    const schema = JSON.parse(schemaScript.textContent);
                    // Handle nested @graph structure common in some sites
                    const items = schema['@graph'] || [schema];
                    for (const item of items) {
                        if (item.author || item.creator) {
                            const authorData = item.author || item.creator;
                            authors = Array.isArray(authorData) ? 
                                authorData.map(a => a.name || a) : 
                                [authorData.name || authorData];
                            if (authors.length > 0) break;
                        }
                    }
                } catch (e) {}
            }

            // Fallback to meta tags and common selectors if no authors found
            if (authors.length === 0) {
                const authorSelectors = [
                    'meta[name="author"]',
                    'meta[property="article:author"]',
                    'meta[name="citation_author"]',
                    '.author',
                    '.byline',
                    '[rel="author"]',
                    '[itemprop="author"]',
                    'meta[name="article:author"]',
                    'meta[name="sailthru.author"]',
                    '.p-author',
                    '.author-name',
                    '.ArticleAuthor',
                    '#authors',
                    '[class*="author" i]' // Case-insensitive class containing "author"
                ];

                authors = [...new Set(
                    authorSelectors.flatMap(selector => 
                        Array.from(document.querySelectorAll(selector))
                            .map(el => el.getAttribute("content") || el.innerText)
                            .filter(Boolean)
                    )
                )];
            }

            // Publication Date
            const publishedDate = 
                document.querySelector('meta[property="article:published_time"]')?.getAttribute("content") ||
                document.querySelector('meta[name="citation_publication_date"]')?.getAttribute("content") ||
                document.querySelector('meta[name="publication_date"]')?.getAttribute("content") ||
                document.querySelector('time[datetime]')?.getAttribute("datetime") ||
                document.querySelector('time[pubdate]')?.getAttribute("datetime") ||
                document.querySelector('[itemprop="datePublished"]')?.getAttribute("content");

            // Publisher/Journal/Website Name
            const publisher = 
                document.querySelector('meta[property="og:site_name"]')?.getAttribute("content") ||
                document.querySelector('meta[name="citation_journal_title"]')?.getAttribute("content") ||
                document.querySelector('[itemprop="publisher"] [itemprop="name"]')?.content ||
                new URL(window.location.href).hostname.replace(/^www\./, '');

            // DOI
            const doi = 
                document.querySelector('meta[name="citation_doi"]')?.getAttribute("content") ||
                document.querySelector('[data-doi]')?.getAttribute("data-doi") ||
                document.querySelector('.doi')?.textContent?.match(/10\.\d{4,}\/[-._;()\/:A-Z0-9]+/i)?.[0];

            // Volume, Issue, Pages
            const volume = document.querySelector('meta[name="citation_volume"]')?.getAttribute("content");
            const issue = document.querySelector('meta[name="citation_issue"]')?.getAttribute("content");
            const pages = 
                `${document.querySelector('meta[name="citation_firstpage"]')?.getAttribute("content") || ''}${
                    document.querySelector('meta[name="citation_lastpage"]')?.getAttribute("content") ? 
                    '-' + document.querySelector('meta[name="citation_lastpage"]')?.getAttribute("content") : 
                    ''
                }`;

            return {
                title,
                authors,
                publishedDate: publishedDate ? new Date(publishedDate).toISOString() : null,
                publisher,
                doi,
                volume,
                issue,
                pages,
                url: window.location.href,
                siteName: publisher,
                // Additional metadata for academic papers
                abstract: document.querySelector('meta[name="citation_abstract"]')?.getAttribute("content") ||
                         document.querySelector('meta[name="description"]')?.getAttribute("content"),
                keywords: document.querySelector('meta[name="keywords"]')?.getAttribute("content")?.split(',').map(k => k.trim()),
                language: document.querySelector('html')?.getAttribute('lang') || 'en'
            };
        } catch (error) {
            console.error("Error extracting citation data:", error);
            return {
                title: "",
                authors: [],
                publishedDate: null,
                publisher: "",
                doi: "",
                volume: "",
                issue: "",
                pages: "",
                url: window.location.href,
                siteName: "",
                abstract: "",
                keywords: [],
                language: 'en'
            };
        }
    }
  
    // Listen for messages from the popup
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === "getCitationData") {
        const citationData = getCitationData();
        sendResponse({ data: citationData });
      }
    });
  })();
  