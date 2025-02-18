document.addEventListener("DOMContentLoaded", function () {
    const citationDiv = document.getElementById("citation");
    const copyBtn = document.getElementById("copyBtn");
  
    // Query the active tab and inject the content script
    chrome.tabs.query({ active: true, currentWindow: true }, async function (tabs) {
      if (!tabs || !tabs[0]) {
        console.error("No active tab found");
        citationDiv.innerText = "Error: Cannot access active tab";
        return;
      }

      try {
        // Inject the content script
        await chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          function: getCitationData,
        });

        // Now get the data
        chrome.tabs.sendMessage(tabs[0].id, { action: "getCitationData" }, function (response) {
          if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError);
            citationDiv.innerText = "Error loading citation data";
            return;
          }
          const data = response.data;
          // Format the citation (basic example)
          let citationText = "";
          if (data.title) citationText += data.title + ". ";
          if (data.author) citationText += "By " + data.author + ". ";
          if (data.description) citationText += data.description;
          citationDiv.innerText = citationText;
        });
      } catch (err) {
        console.error("Failed to inject content script:", err);
        citationDiv.innerText = "Error: Failed to access page content";
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
});

// This function will be injected into the page
function getCitationData() {
    // Set up message listener if not already present
    if (!window.citationListenerAdded) {
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            if (request.action === "getCitationData") {
                const titleElem = document.querySelector("title");
                const title = titleElem ? titleElem.innerText : document.title;

                const metaDesc = document.querySelector('meta[name="description"]');
                const description = metaDesc ? metaDesc.getAttribute("content") : "";

                const metaAuthor = document.querySelector('meta[name="author"]');
                const author = metaAuthor ? metaAuthor.getAttribute("content") : "";

                sendResponse({ data: { title, description, author } });
            }
        });
        window.citationListenerAdded = true;
    }
}
  