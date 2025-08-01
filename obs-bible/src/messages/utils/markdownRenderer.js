/**
 * Markdown Renderer Utility
 * Provides markdown-to-plaintext and markdown-to-HTML conversion with XSS protection
 * Milestone 4: Basic markdown rendering for custom messages
 */

import { marked } from 'marked'
import DOMPurify from 'dompurify'

// Configure marked for consistent output
marked.setOptions({
  gfm: true, // GitHub Flavored Markdown
  breaks: true, // Convert \n to <br>
  headerIds: false, // Don't generate header IDs
  mangle: false // Don't mangle autolinks
})

// Custom renderer for plain text conversion
const plainTextRenderer = {
  // Headers become plain text with newlines
  heading(text) {
    return text + '\n'
  },
  
  // Paragraphs become plain text with newlines
  paragraph(text) {
    return text + '\n'
  },
  
  // Strong/bold text remains as plain text
  strong(text) {
    return text
  },
  
  // Emphasis/italic text remains as plain text
  em(text) {
    return text
  },
  
  // Code blocks and inline code become plain text
  code(text) {
    return text
  },
  codespan(text) {
    return text
  },
  
  // Lists become bullet points
  list(body, ordered) {
    return body
  },
  listitem(text) {
    return '• ' + text.replace(/\n$/, '') + '\n'
  },
  
  // Links become just the text
  link(href, title, text) {
    return text
  },
  
  // Images become alt text
  image(href, title, text) {
    return text || '[Image]'
  },
  
  // Blockquotes become plain text
  blockquote(quote) {
    return quote
  },
  
  // Line breaks
  br() {
    return '\n'
  },
  
  // Horizontal rules become dashes
  hr() {
    return '---\n'
  },
  
  // Tables - just return text content
  table(header, body) {
    return header + body
  },
  tablerow(content) {
    return content + '\n'
  },
  tablecell(content) {
    return content + ' '
  },
  
  // Strikethrough becomes plain text
  del(text) {
    return text
  }
}

/**
 * Convert markdown to plain text for OBS display
 * @param {string} markdown - Markdown content
 * @returns {string} Plain text with basic formatting preserved
 */
export const renderToPlainText = (markdown) => {
  if (!markdown || typeof markdown !== 'string') {
    return ''
  }
  
  try {
    // Parse markdown to tokens
    const tokens = marked.lexer(markdown)
    
    // Convert tokens to plain text
    const plainText = tokensToPlainText(tokens)
    
    // Clean up extra newlines and whitespace
    return plainText
      .replace(/\n\s*\n\s*\n+/g, '\n\n') // Multiple newlines -> double newline
      .replace(/^\s+|\s+$/g, '') // Trim whitespace  
      .replace(/ +$/gm, '') // Remove trailing spaces (but not newlines) on lines
  } catch (error) {
    console.error('markdownRenderer: Error converting to plain text:', error)
    return markdown // Fallback to original text
  }
}

/**
 * Convert tokens to plain text recursively
 * @param {Array} tokens - Marked tokens
 * @returns {string} Plain text
 */
const tokensToPlainText = (tokens) => {
  let result = ''
  
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]
    const nextToken = i < tokens.length - 1 ? tokens[i + 1] : null
    
    switch (token.type) {
      case 'heading':
        // Process nested tokens if they exist, otherwise use raw text
        const headingSpacing = (nextToken && nextToken.type === 'heading') || !nextToken ? '\n' : '\n\n'
        if (token.tokens) {
          result += tokensToPlainText(token.tokens) + headingSpacing
        } else {
          result += token.text + headingSpacing
        }
        break
        
      case 'paragraph':
        // Process nested tokens if they exist, otherwise use raw text
        const paragraphSpacing = !nextToken ? '\n' : '\n\n'
        if (token.tokens) {
          result += tokensToPlainText(token.tokens) + paragraphSpacing
        } else {
          result += token.text + paragraphSpacing
        }
        break
        
      case 'text':
        result += token.text
        break
        
      case 'strong':
        // For bold text, process nested tokens or use text
        if (token.tokens) {
          result += tokensToPlainText(token.tokens)
        } else {
          result += token.text
        }
        break
        
      case 'em':
        // For italic text, process nested tokens or use text
        if (token.tokens) {
          result += tokensToPlainText(token.tokens)
        } else {
          result += token.text
        }
        break
        
      case 'codespan':
        result += token.text
        break
        
      case 'code':
        result += token.text + '\n'
        break
        
      case 'list':
        if (token.items) {
          for (const item of token.items) {
            if (item.tokens) {
              result += '• ' + tokensToPlainText(item.tokens).replace(/\n$/, '') + '\n'
            } else {
              result += '• ' + item.text.replace(/\n$/, '') + '\n'
            }
          }
          if (nextToken) {
            result += '\n' // Add spacing after list if not last token
          }
        }
        break
        
      case 'list_item':
        if (token.tokens) {
          result += '• ' + tokensToPlainText(token.tokens).replace(/\n$/, '') + '\n'
        } else {
          result += '• ' + token.text.replace(/\n$/, '') + '\n'
        }
        break
        
      case 'link':
        // For links, extract only the text content
        if (token.tokens) {
          result += tokensToPlainText(token.tokens)
        } else {
          result += token.text
        }
        break
        
      case 'image':
        result += token.text || '[Image]'
        break
        
      case 'blockquote':
        if (token.tokens) {
          result += tokensToPlainText(token.tokens)
        } else {
          result += token.text
        }
        break
        
      case 'br':
        result += '\n'
        break
        
      case 'hr':
        result += '---\n'
        break
        
      case 'del':
        // For strikethrough, process nested tokens or use text
        if (token.tokens) {
          result += tokensToPlainText(token.tokens)
        } else {
          result += token.text
        }
        break
        
      case 'space':
        // Space tokens represent blank lines between elements
        result += '\n'
        break
        
      default:
        // For any other token types, try to extract text
        if (token.tokens) {
          result += tokensToPlainText(token.tokens)
        } else if (token.text) {
          result += token.text
        }
        break
    }
  }
  
  return result
}

/**
 * Convert markdown to sanitized HTML for preview
 * @param {string} markdown - Markdown content
 * @returns {string} Sanitized HTML
 */
export const renderToHTML = (markdown) => {
  if (!markdown || typeof markdown !== 'string') {
    return ''
  }
  
  try {
    // Convert markdown to HTML
    const rawHTML = marked(markdown)
    
    // Sanitize HTML to prevent XSS attacks
    const sanitizedHTML = DOMPurify.sanitize(rawHTML, {
      // Allow common HTML tags for formatting
      ALLOWED_TAGS: [
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'p', 'br', 'strong', 'b', 'em', 'i',
        'ul', 'ol', 'li', 'blockquote',
        'code', 'pre', 'hr', 'del', 's'
      ],
      // Remove all attributes except basic ones
      ALLOWED_ATTR: [],
      // Keep content of unknown tags but remove the tags
      KEEP_CONTENT: true
    })
    
    return sanitizedHTML
  } catch (error) {
    console.error('markdownRenderer: Error converting to HTML:', error)
    return `<p>${markdown}</p>` // Fallback to wrapped plain text
  }
}

/**
 * Validate that markdown content is safe and reasonable
 * @param {string} markdown - Markdown content to validate
 * @returns {Object} Validation result with errors
 */
export const validateMarkdown = (markdown) => {
  const errors = []
  
  if (typeof markdown !== 'string') {
    errors.push('Markdown content must be a string')
    return { valid: false, errors }
  }
  
  // Check for excessively long content (performance concern)
  if (markdown.length > 50000) {
    errors.push('Markdown content is too long (max 50,000 characters)')
  }
  
  // Check for potentially problematic patterns
  const dangerousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i, // Event handlers like onclick=
    /<iframe/i,
    /<object/i,
    /<embed/i
  ]
  
  for (const pattern of dangerousPatterns) {
    if (pattern.test(markdown)) {
      errors.push('Markdown contains potentially unsafe content')
      break
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Get performance information for markdown rendering
 * @param {string} markdown - Markdown content to test
 * @returns {Object} Performance metrics
 */
export const getPerformanceInfo = (markdown) => {
  if (!markdown || typeof markdown !== 'string') {
    return { plainTextTime: 0, htmlTime: 0, length: 0 }
  }
  
  // Test plain text conversion performance
  const plainStart = performance.now()
  renderToPlainText(markdown)
  const plainEnd = performance.now()
  
  // Test HTML conversion performance  
  const htmlStart = performance.now()
  renderToHTML(markdown)
  const htmlEnd = performance.now()
  
  return {
    plainTextTime: Number((plainEnd - plainStart).toFixed(3)),
    htmlTime: Number((htmlEnd - htmlStart).toFixed(3)),
    length: markdown.length,
    isPerformant: (plainEnd - plainStart) < 10 && (htmlEnd - htmlStart) < 10
  }
}

// Export utility object
export const markdownUtils = {
  renderToPlainText,
  renderToHTML,
  validateMarkdown,
  getPerformanceInfo
}

// Default export for convenience
export default markdownUtils