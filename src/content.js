(function() {
    // Extract citation data from the current webpage
    function getCitationData() {
      try {
        // Get the page title
        const titleElem = document.querySelector("title");
        const title = titleElem ? titleElem.innerText : document.title;
  
        // Get meta description (if available)
        const metaDesc = document.querySelector('meta[name="description"]');
        const description = metaDesc ? metaDesc.getAttribute("content") : "";
  
        // Get meta author (if available)
        const metaAuthor = document.querySelector('meta[name="author"]');
        const author = metaAuthor ? metaAuthor.getAttribute("content") : "";
  
        console.log("Citation data extracted:", { title, description, author });
        return { title, description, author };
      } catch (error) {
        console.error("Error extracting citation data:", error);
        return { title: "", description: "", author: "" };
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
  