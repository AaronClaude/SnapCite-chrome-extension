## Roadmap

### 1. Planning & Design
- **Requirements & User Stories:**  
  - **Primary goal:** Allow users to extract citation data (title, author, publication date, etc.) from a webpage and format it into APA, MLA, or Chicago style.  
  - **User Stories:**  
    - “As a student, I want to click an extension icon and see a formatted citation of the current webpage.”  
    - “As a researcher, I need an option to copy the citation text for my bibliography.”
- **Wireframes & UI Design:**  
  - Sketch the popup UI: a simple window with a citation preview, a dropdown for citation style selection, and a “Copy to Clipboard” button.
- **Technical Specification:**  
  - Decide on a no-API-first approach (using native JavaScript and DOM parsing) with optional API integration for enhanced data validation later.

### 2. Development
- **Project Setup:**  
  - Create a project structure with key files: `manifest.json`, background script, content script, and popup HTML/CSS/JS.
- **Content Script:**  
  - Write a script that scans the webpage’s DOM to extract metadata (e.g., title tags, meta description, Open Graph tags).
- **Citation Formatter Module:**  
  - Develop JavaScript functions that take extracted data and format it into different citation styles (APA, MLA, Chicago).
- **Popup UI:**  
  - Build a user-friendly interface in HTML/CSS that displays the generated citation, allows style selection, and includes a copy button.
- **Local Storage:**  
  - Use the Chrome extension storage API to save user preferences (e.g., default citation style).

### 3. Testing & Refinement
- **Unit Testing:**  
  - Test each formatting function with various input scenarios.
- **Browser Testing:**  
  - Install the extension in developer mode and test on multiple websites to ensure accurate data extraction.
- **User Feedback:**  
  - Gather initial feedback from peers and iterate on UI and functionality based on usability issues.

### 4. Documentation & Deployment
- **User Documentation:**  
  - Create a concise guide covering installation (via Chrome Web Store), usage instructions, and customization options.
- **Developer Documentation:**  
  - Document the project structure, core modules, and code comments in a README on GitHub.
- **Deployment:**  
  - Package the extension and submit it to the Chrome Web Store.
- **Future Iterations:**  
  - Consider optional integrations (e.g., CrossRef or Zotero APIs) for more robust metadata extraction.
  - Expand citation style support based on user demand.

---

## Core Functions

- **DOM Parsing & Data Extraction:**  
  - Scans the current webpage to extract citation-relevant metadata using native DOM methods.
- **Citation Formatting:**  
  - Converts extracted data into properly formatted citations in APA, MLA, and Chicago styles.
- **User Interface:**  
  - A popup that displays the generated citation with options to change citation style and copy the text.
- **Local Storage of Preferences:**  
  - Saves user settings (e.g., default citation style) using Chrome’s storage API.
- **Optional API Integration:**  
  - Optional enhancement to use external APIs (like CrossRef) for validating or augmenting extracted metadata.

---

## Benefits for Students & Researchers

- **Time Savings:**  
  - Eliminates the need to manually create citations, reducing the time spent on research tasks.
- **Improved Accuracy:**  
  - Helps ensure citations adhere to correct formatting rules, reducing errors.
- **Convenience:**  
  - Integrated directly into the browser—no need to navigate to separate citation generator websites.
- **Privacy & Control:**  
  - Runs locally without sending data to third-party services unless users opt in for enhanced features.
- **Open Source & Customizable:**  
  - Offers transparency and the ability for community contributions and improvements.

---

## Comparison to Existing Tools

- **Traditional Citation Generators:**  
  - Most web-based citation tools (e.g., EasyBib, Citation Machine) rely on server-side processing and often external APIs.
- **Citation Quick Advantage:**  
  - Operates entirely on the client side using browser APIs, ensuring faster response times and greater privacy.
  - Lightweight and free from third-party dependencies by default.
  - Can be expanded with optional API features for enhanced functionality if needed.

---

## Recommended Tech Stack

- **Front-End:**  
  - **HTML/CSS/JavaScript:** For building the extension’s UI.
  - **Chrome Extension APIs:** To create a manifest (v3), background scripts, and content scripts.
  - **Optional UI Framework:** Vanilla JS is sufficient; however, you could use a lightweight library like Preact for better component management if desired.
- **Data Storage:**  
  - **Chrome Storage API:** To store user preferences locally.
- **Optional API Integrations:**  
  - **CrossRef/Zotero API:** For improved metadata validation (optional; enhances accuracy but isn’t required).
- **Build Tools:**  
  - **Webpack/Parcel:** For bundling your JavaScript code, if needed.

