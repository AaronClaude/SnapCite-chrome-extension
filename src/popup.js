document.addEventListener("DOMContentLoaded", function () {
    const citationDiv = document.getElementById("citation");
    const copyBtn = document.getElementById("copyBtn");
    const formatSelector = document.getElementById("formatSelector");
    const saveBtn = document.getElementById("saveBtn");
    const clearBtn = document.getElementById("clearBtn");
    const savedCitationsDiv = document.getElementById("savedCitations");
    let currentData = null;

    // Format citation based on selected style
    function formatCitation(data, style) {
        if (!data) return "No data available";
        
        const currentDate = new Date();
        const pubDate = data.publishedDate ? new Date(data.publishedDate) : null;
        const authors = data.authors.length ? data.authors : ['n.d.'];
        
        switch (style) {
            case "APA":
                const authorString = authors.length > 2 
                    ? `${authors[0]} et al.`
                    : authors.join(" & ");
                
                return `${authorString} (${pubDate?.getFullYear() || 'n.d.'}). ${data.title}${data.doi 
                    ? `. https://doi.org/${data.doi}`
                    : data.volume 
                        ? `. ${data.publisher}, ${data.volume}${data.issue ? `(${data.issue})` : ''}${data.pages ? `, ${data.pages}` : ''}`
                        : `. Retrieved from ${data.url}`}`;
            
            case "MLA":
                const authorMLA = authors.length > 2 
                    ? `${authors[0]}, et al`
                    : authors.join(", and ");
                
                return `${authorMLA}. "${data.title}." ${data.publisher}${data.volume 
                    ? `, vol. ${data.volume}${data.issue ? `, no. ${data.issue}` : ''}`
                    : ''
                }${data.pages ? `, ${data.pages}` : ''}, ${pubDate 
                    ? pubDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
                    : 'n.d.'
                }${data.doi ? `, doi:${data.doi}` : `, ${data.url}`}`;
            
            case "Chicago":
                const authorChicago = authors.length > 3
                    ? `${authors[0]} et al.`
                    : authors.join(", ");
                
                return `${authorChicago}. "${data.title}." ${data.publisher}${data.volume 
                    ? ` ${data.volume}${data.issue ? `, no. ${data.issue}` : ''}`
                    : ''
                }${data.pages ? ` (${pubDate?.getFullYear() || 'n.d.'}): ${data.pages}` : 
                    `. Accessed ${currentDate.toLocaleDateString('en-US', { 
                        month: 'long', 
                        day: 'numeric', 
                        year: 'numeric' 
                    })}`
                }. ${data.doi ? `https://doi.org/${data.doi}` : data.url}.`;
            
            case "Harvard":
                const authorHarvard = authors.length > 3
                    ? `${authors[0]} et al.`
                    : authors.join(", ");
                
                return `${authorHarvard} (${pubDate?.getFullYear() || 'n.d.'}) '${data.title}', ${data.publisher}${data.volume 
                    ? `, ${data.volume}${data.issue ? `(${data.issue})` : ''}`
                    : ''
                }${data.pages ? `, pp. ${data.pages}` : ''}${data.doi 
                    ? `. doi: ${data.doi}`
                    : `. Available at: ${data.url} (Accessed: ${currentDate.toLocaleDateString('en-US', { 
                        day: 'numeric', 
                        month: 'short', 
                        year: 'numeric' 
                    })})`}`;
            
            default:
                return "Invalid citation format";
        }
    }

    // Query the active tab and inject the content script
    chrome.tabs.query({ active: true, currentWindow: true }, async function (tabs) {
        if (!tabs || !tabs[0]) {
            citationDiv.innerText = "Error: Cannot access active tab";
            return;
        }

        try {
            await chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                function: getCitationData,
            });

            chrome.tabs.sendMessage(tabs[0].id, { action: "getCitationData" }, async function (response) {
                if (chrome.runtime.lastError) {
                    citationDiv.innerText = "Error loading citation data";
                    return;
                }

                // Handle PDF files
                if (response.data.isPDF) {
                    citationDiv.innerText = "Extracting PDF metadata...";
                    try {
                        const pdfMetadata = await extractPDFMetadata(response.data.url);
                        if (pdfMetadata) {
                            currentData = {
                                ...pdfMetadata,
                                siteName: new URL(tabs[0].url).hostname
                            };
                            citationDiv.innerText = formatCitation(currentData, formatSelector.value);
                        } else {
                            citationDiv.innerText = "Could not extract PDF metadata";
                        }
                    } catch (error) {
                        citationDiv.innerText = "Error processing PDF";
                    }
                    return;
                }

                currentData = {
                    ...response.data,
                    url: tabs[0].url,
                    siteName: new URL(tabs[0].url).hostname
                };
                citationDiv.innerText = formatCitation(currentData, formatSelector.value);
            });
        } catch (err) {
            citationDiv.innerText = "Error: Failed to access page content";
        }
    });

    // Handle format changes
    formatSelector.addEventListener("change", function() {
        if (currentData) {
            citationDiv.innerText = formatCitation(currentData, formatSelector.value);
        }
    });

    // Copy citation to clipboard
    copyBtn.addEventListener("click", function () {
        const citationText = citationDiv.innerText;
        navigator.clipboard.writeText(citationText).then(() => {
            copyBtn.innerText = "Copied!";
            setTimeout(() => {
                copyBtn.innerText = "Copy Citation";
            }, 2000);
        }).catch(err => {
            console.error("Failed to copy text: ", err);
        });
    });

    // Load saved citations
    function loadSavedCitations() {
        chrome.storage.local.get(['savedCitations'], function(result) {
            const citations = result.savedCitations || [];
            savedCitationsDiv.innerHTML = citations.length ? citations.map((citation, index) => `
                <div class="saved-citation p-2 border-b hover:bg-gray-50 flex justify-between items-center">
                    <div class="truncate flex-1 pr-2" title="${citation.text}">
                        ${citation.title}
                    </div>
                    <div class="flex gap-1">
                        <button class="text-sm text-blue-500 hover:text-blue-600 copy-saved" data-index="${index}">
                            Copy
                        </button>
                        <button class="text-sm text-red-500 hover:text-red-600 delete-saved" data-index="${index}">
                            Delete
                        </button>
                    </div>
                </div>
            `).join('') : '<div class="text-gray-500 text-sm text-center p-2">No saved citations</div>';

            // Add event listeners to the new buttons
            document.querySelectorAll('.copy-saved').forEach(btn => {
                btn.addEventListener('click', function() {
                    const index = parseInt(this.dataset.index);
                    chrome.storage.local.get(['savedCitations'], function(result) {
                        const citations = result.savedCitations || [];
                        if (citations[index]) {
                            navigator.clipboard.writeText(citations[index].text).then(() => {
                                btn.textContent = 'Copied!';
                                setTimeout(() => btn.textContent = 'Copy', 2000);
                            });
                        }
                    });
                });
            });

            document.querySelectorAll('.delete-saved').forEach(btn => {
                btn.addEventListener('click', function() {
                    const index = parseInt(this.dataset.index);
                    chrome.storage.local.get(['savedCitations'], function(result) {
                        const citations = result.savedCitations || [];
                        citations.splice(index, 1);
                        chrome.storage.local.set({ savedCitations: citations }, loadSavedCitations);
                    });
                });
            });
        });
    }

    // Save current citation
    saveBtn.addEventListener("click", function() {
        const citationText = citationDiv.innerText;
        if (citationText && citationText !== "Loading citation..." && currentData) {
            chrome.storage.local.get(['savedCitations'], function(result) {
                const citations = result.savedCitations || [];
                citations.unshift({
                    title: currentData.title,
                    text: citationText,
                    format: formatSelector.value,
                    timestamp: new Date().toISOString()
                });
                chrome.storage.local.set({ savedCitations: citations }, function() {
                    saveBtn.innerText = "Saved!";
                    setTimeout(() => {
                        saveBtn.innerText = "Save Citation";
                    }, 2000);
                    loadSavedCitations();
                });
            });
        }
    });

    // Clear all saved citations
    clearBtn.addEventListener("click", function() {
        if (confirm("Are you sure you want to clear all saved citations?")) {
            chrome.storage.local.set({ savedCitations: [] }, loadSavedCitations);
        }
    });

    // Load saved citations when popup opens
    loadSavedCitations();
});

// This function will be injected into the page
function getCitationData() {
    // Set up message listener if not already present
    if (!window.citationListenerAdded) {
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            if (request.action === "getCitationData") {
                try {
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
                            if (schema.author) {
                                authors = Array.isArray(schema.author) ? 
                                    schema.author.map(a => a.name || a) : 
                                    [schema.author.name || schema.author];
                            }
                        } catch (e) {}
                    }

                    // Fallback to meta tags if no authors found
                    if (authors.length === 0) {
                        const authorSelectors = [
                            'meta[name="author"]',
                            'meta[property="article:author"]',
                            'meta[name="citation_author"]',
                            '.author',
                            '.byline',
                            '[rel="author"]',
                            '[itemprop="author"]'
                        ];

                        authors = [...new Set(
                            authorSelectors.flatMap(selector => 
                                Array.from(document.querySelectorAll(selector))
                                    .map(el => el.getAttribute("content") || el.innerText)
                                    .filter(Boolean)
                            )
                        )];
                    }

                    // Get other metadata
                    const publishedDate = 
                        document.querySelector('meta[property="article:published_time"]')?.getAttribute("content") ||
                        document.querySelector('meta[name="citation_publication_date"]')?.getAttribute("content") ||
                        document.querySelector('time[pubdate]')?.getAttribute("datetime");

                    const publisher = 
                        document.querySelector('meta[property="og:site_name"]')?.getAttribute("content") ||
                        document.querySelector('meta[name="citation_journal_title"]')?.getAttribute("content") ||
                        document.querySelector('[itemprop="publisher"] [itemprop="name"]')?.content ||
                        new URL(window.location.href).hostname.replace(/^www\./, '');

                    sendResponse({ 
                        data: { 
                            title,
                            authors,
                            publishedDate,
                            publisher,
                            url: window.location.href,
                            siteName: publisher
                        } 
                    });
                } catch (error) {
                    sendResponse({ 
                        data: { 
                            title: document.title,
                            authors: [],
                            publishedDate: null,
                            publisher: window.location.hostname,
                            url: window.location.href,
                            siteName: window.location.hostname
                        } 
                    });
                }
            }
        });
        window.citationListenerAdded = true;
    }
}
  