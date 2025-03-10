// markdown_utils.js
import { marked } from 'marked';

// Initialize marked with custom options
function initializeMarked() {
    marked.setOptions({
        breaks: true,        // Adds <br> on single line breaks
        gfm: true,          // GitHub Flavored Markdown
        sanitize: false,     // Allow HTML in the source
        highlight: function(code, lang) {
            return code;
        }
    });
}

// Add markdown styles to the document
function addMarkdownStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .markdown-content {
            line-height: 1.6;
        }
        .markdown-content p {
            margin-bottom: 1em;
        }
        .markdown-content code {
            background-color: #f3f4f6;
            padding: 0.2em 0.4em;
            border-radius: 3px;
            font-family: monospace;
        }
        .markdown-content pre {
            background-color: #f3f4f6;
            padding: 1em;
            border-radius: 5px;
            overflow-x: auto;
            margin: 1em 0;
        }
        .markdown-content pre code {
            background-color: transparent;
            padding: 0;
        }
        .markdown-content ul, .markdown-content ol {
            margin: 1em 0;
            padding-left: 2em;
        }
        .markdown-content ul {
            list-style-type: disc;
        }
        .markdown-content ol {
            list-style-type: decimal;
        }
        .markdown-content h1, .markdown-content h2, .markdown-content h3, 
        .markdown-content h4, .markdown-content h5, .markdown-content h6 {
            margin-top: 1.5em;
            margin-bottom: 0.5em;
            font-weight: bold;
        }
        .markdown-content h1 { font-size: 1.5em; }
        .markdown-content h2 { font-size: 1.4em; }
        .markdown-content h3 { font-size: 1.3em; }
        .markdown-content h4 { font-size: 1.2em; }
        .markdown-content h5 { font-size: 1.1em; }
        .markdown-content h6 { font-size: 1em; }
        .markdown-content table {
            border-collapse: collapse;
            margin: 1em 0;
            width: 100%;
        }
        .markdown-content table th,
        .markdown-content table td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }
        .markdown-content table th {
            background-color: #f3f4f6;
        }
        .markdown-content blockquote {
            border-left: 4px solid #ddd;
            padding-left: 1em;
            margin: 1em 0;
            color: #666;
        }
    `;
    document.head.appendChild(style);
}

// Render markdown content
function renderMarkdown(text) {
    try {
        return marked(text);
    } catch (error) {
        console.error('Markdown parsing error:', error);
        return text;
    }
}

// Initialize markdown functionality
function initializeMarkdown() {
    initializeMarked();
    addMarkdownStyles();
}

export {
    initializeMarkdown,
    renderMarkdown
};