async function extractPDFMetadata(pdfUrl) {
    try {
        const response = await fetch(pdfUrl);
        const pdfData = await response.arrayBuffer();
        
        // Using pdf.js to parse PDF
        const pdf = await pdfjsLib.getDocument({data: pdfData}).promise;
        const metadata = await pdf.getMetadata();
        
        // Get first page for additional info
        const firstPage = await pdf.getPage(1);
        const textContent = await firstPage.getTextContent();
        const firstPageText = textContent.items.map(item => item.str).join(' ');

        // Extract DOI using regex
        const doiMatch = firstPageText.match(/10\.\d{4,}\/[-._;()\/:A-Z0-9]+/i);
        
        return {
            title: metadata.info.Title || findTitle(firstPageText),
            authors: findAuthors(metadata.info.Author, firstPageText),
            publishedDate: metadata.info.CreationDate || null,
            doi: doiMatch ? doiMatch[0] : null,
            publisher: metadata.info.Producer || null,
            url: pdfUrl
        };
    } catch (error) {
        console.error('Error extracting PDF metadata:', error);
        return null;
    }
}

function findTitle(text) {
    // Simple heuristic: first line that's not authors or abstract
    const lines = text.split('\n');
    for (const line of lines) {
        if (line.length > 10 && 
            !line.toLowerCase().includes('abstract') && 
            !line.match(/^(by|authors?):?/i)) {
            return line.trim();
        }
    }
    return null;
}

function findAuthors(metadataAuthors, text) {
    if (metadataAuthors) {
        return metadataAuthors.split(/[,;&]/).map(a => a.trim());
    }

    // Try to find authors in text
    const authorSection = text.match(/^authors?:?\s*(.*?)(?:\n|abstract)/i);
    if (authorSection) {
        return authorSection[1]
            .split(/[,;&]/)
            .map(a => a.trim())
            .filter(a => a.length > 0 && !a.match(/^(and|et al)$/i));
    }

    return [];
} 