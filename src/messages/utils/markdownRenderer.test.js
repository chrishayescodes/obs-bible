import { markdownUtils, renderToPlainText, renderToHTML, validateMarkdown, getPerformanceInfo } from './markdownRenderer'

describe('markdownRenderer', () => {
  describe('renderToPlainText', () => {
    test('converts headers to plain text', () => {
      const markdown = '# Header 1\n## Header 2\n### Header 3'
      const result = renderToPlainText(markdown)
      
      expect(result).toBe('Header 1\nHeader 2\nHeader 3')
    })

    test('converts bold and italic text', () => {
      const markdown = '**Bold text** and *italic text* and ***both***'
      const result = renderToPlainText(markdown)
      
      expect(result).toBe('Bold text and italic text and both')
    })

    test('converts lists to bullet points', () => {
      const markdown = '- Item 1\n- Item 2\n- Item 3'
      const result = renderToPlainText(markdown)
      
      expect(result).toBe('• Item 1\n• Item 2\n• Item 3')
    })

    test('handles ordered lists', () => {
      const markdown = '1. First item\n2. Second item\n3. Third item'
      const result = renderToPlainText(markdown)
      
      expect(result).toBe('• First item\n• Second item\n• Third item')
    })

    test('converts links to just text', () => {
      const markdown = '[Google](https://google.com) and [Example](http://example.com)'
      const result = renderToPlainText(markdown)
      
      expect(result).toBe('Google and Example')
    })

    test('converts images to alt text', () => {
      const markdown = '![Alt text](image.jpg) and ![](no-alt.jpg)'
      const result = renderToPlainText(markdown)
      
      expect(result).toBe('Alt text and [Image]')
    })

    test('handles code blocks and inline code', () => {
      const markdown = 'Here is `inline code` and:\n\n```\ncode block\n```'
      const result = renderToPlainText(markdown)
      
      expect(result).toBe('Here is inline code and:\n\ncode block')
    })

    test('handles blockquotes', () => {
      const markdown = '> This is a quote\n> with multiple lines'
      const result = renderToPlainText(markdown)
      
      expect(result).toBe('This is a quote\nwith multiple lines')
    })

    test('handles line breaks and paragraphs', () => {
      const markdown = 'First paragraph\n\nSecond paragraph\n\nThird paragraph'
      const result = renderToPlainText(markdown)
      
      expect(result).toBe('First paragraph\n\nSecond paragraph\n\nThird paragraph')
    })

    test('handles horizontal rules', () => {
      const markdown = 'Before\n\n---\n\nAfter'
      const result = renderToPlainText(markdown)
      
      expect(result).toBe('Before\n\n---\n\nAfter')
    })

    test('handles strikethrough text', () => {
      const markdown = '~~Strikethrough text~~'
      const result = renderToPlainText(markdown)
      
      expect(result).toBe('Strikethrough text')
    })

    test('handles complex mixed content', () => {
      const markdown = '# Title\n\n**Bold** and *italic* text.\n\n- List item 1\n- List item 2\n\n[Link](url) and `code`'
      const result = renderToPlainText(markdown)
      
      expect(result).toBe('Title\n\nBold and italic text.\n\n• List item 1\n• List item 2\n\nLink and code')
    })

    test('handles empty and invalid input', () => {
      expect(renderToPlainText('')).toBe('')
      expect(renderToPlainText(null)).toBe('')
      expect(renderToPlainText(undefined)).toBe('')
      expect(renderToPlainText(123)).toBe('')
    })

    test('cleans up extra whitespace', () => {
      const markdown = '# Title\n\n\n\nParagraph   \n\n\n'
      const result = renderToPlainText(markdown)
      
      // Should not have excessive newlines or trailing spaces
      expect(result).not.toMatch(/\n\n\n/)
      expect(result).not.toMatch(/\s+$/)
    })
  })

  describe('renderToHTML', () => {
    test('converts headers to HTML', () => {
      const markdown = '# Header 1\n## Header 2'
      const result = renderToHTML(markdown)
      
      expect(result).toContain('<h1>Header 1</h1>')
      expect(result).toContain('<h2>Header 2</h2>')
    })

    test('converts bold and italic text to HTML', () => {
      const markdown = '**Bold text** and *italic text*'
      const result = renderToHTML(markdown)
      
      expect(result).toContain('<strong>Bold text</strong>')
      expect(result).toContain('<em>italic text</em>')
    })

    test('converts lists to HTML', () => {
      const markdown = '- Item 1\n- Item 2'
      const result = renderToHTML(markdown)
      
      expect(result).toContain('<ul>')
      expect(result).toContain('<li>Item 1</li>')
      expect(result).toContain('<li>Item 2</li>')
      expect(result).toContain('</ul>')
    })

    test('converts ordered lists to HTML', () => {
      const markdown = '1. First\n2. Second'
      const result = renderToHTML(markdown)
      
      expect(result).toContain('<ol>')
      expect(result).toContain('<li>First</li>')
      expect(result).toContain('<li>Second</li>')
      expect(result).toContain('</ol>')
    })

    test('sanitizes dangerous HTML', () => {
      const markdown = '<script>alert("xss")</script>\n<img src="x" onerror="alert(1)">'
      const result = renderToHTML(markdown)
      
      expect(result).not.toContain('<script>')
      expect(result).not.toContain('onerror')
      expect(result).not.toContain('alert')
    })

    test('allows safe HTML tags', () => {
      const markdown = '**Bold** and *italic* and `code`'
      const result = renderToHTML(markdown)
      
      expect(result).toContain('<strong>Bold</strong>')
      expect(result).toContain('<em>italic</em>')
      expect(result).toContain('<code>code</code>')
    })

    test('handles code blocks', () => {
      const markdown = '```\ncode block\n```'
      const result = renderToHTML(markdown)
      
      expect(result).toContain('<pre>')
      expect(result).toContain('<code>')
      expect(result).toContain('code block')
    })

    test('handles blockquotes', () => {
      const markdown = '> This is a quote'
      const result = renderToHTML(markdown)
      
      expect(result).toContain('<blockquote>')
      expect(result).toContain('This is a quote')
    })

    test('handles line breaks', () => {
      const markdown = 'Line 1\nLine 2'
      const result = renderToHTML(markdown)
      
      expect(result).toContain('<br>')
    })

    test('handles empty and invalid input', () => {
      expect(renderToHTML('')).toBe('')
      expect(renderToHTML(null)).toBe('')
      expect(renderToHTML(undefined)).toBe('')
      expect(renderToHTML(123)).toBe('')
    })

    test('handles complex mixed content', () => {
      const markdown = '# Title\n\n**Bold** text with [link](url)\n\n- List item\n\n`code`'
      const result = renderToHTML(markdown)
      
      expect(result).toContain('<h1>Title</h1>')
      expect(result).toContain('<strong>Bold</strong>')
      expect(result).toContain('<li>List item</li>')
      expect(result).toContain('<code>code</code>')
    })
  })

  describe('validateMarkdown', () => {
    test('validates normal markdown as safe', () => {
      const markdown = '# Title\n\n**Bold** text with lists:\n\n- Item 1\n- Item 2'
      const result = validateMarkdown(markdown)
      
      expect(result.valid).toBe(true)
      expect(result.errors).toEqual([])
    })

    test('rejects non-string input', () => {
      const result = validateMarkdown(123)
      
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Markdown content must be a string')
    })

    test('rejects excessively long content', () => {
      const longMarkdown = 'x'.repeat(50001)
      const result = validateMarkdown(longMarkdown)
      
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Markdown content is too long (max 50,000 characters)')
    })

    test('detects potentially dangerous script tags', () => {
      const dangerousMarkdown = 'Normal text <script>alert("xss")</script>'
      const result = validateMarkdown(dangerousMarkdown)
      
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Markdown contains potentially unsafe content')
    })

    test('detects javascript: URLs', () => {
      const dangerousMarkdown = '[Click me](javascript:alert("xss"))'
      const result = validateMarkdown(dangerousMarkdown)
      
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Markdown contains potentially unsafe content')
    })

    test('detects event handlers', () => {
      const dangerousMarkdown = '<img src="x" onclick="alert(1)">'
      const result = validateMarkdown(dangerousMarkdown)
      
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Markdown contains potentially unsafe content')
    })

    test('detects iframe tags', () => {
      const dangerousMarkdown = '<iframe src="evil.com"></iframe>'
      const result = validateMarkdown(dangerousMarkdown)
      
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Markdown contains potentially unsafe content')
    })

    test('accepts markdown at maximum length', () => {
      const maxMarkdown = 'x'.repeat(50000)
      const result = validateMarkdown(maxMarkdown)
      
      expect(result.valid).toBe(true)
      expect(result.errors).toEqual([])
    })
  })

  describe('getPerformanceInfo', () => {
    test('measures performance of plain text conversion', () => {
      const markdown = '# Title\n\n**Bold** text\n\n- List item'
      const result = getPerformanceInfo(markdown)
      
      expect(typeof result.plainTextTime).toBe('number')
      expect(result.plainTextTime).toBeGreaterThanOrEqual(0)
      expect(result.length).toBe(markdown.length)
    })

    test('measures performance of HTML conversion', () => {
      const markdown = '# Title\n\n**Bold** text\n\n- List item'
      const result = getPerformanceInfo(markdown)
      
      expect(typeof result.htmlTime).toBe('number')
      expect(result.htmlTime).toBeGreaterThanOrEqual(0)
    })

    test('indicates if performance is acceptable', () => {
      const shortMarkdown = '# Title\n\nShort content'
      const result = getPerformanceInfo(shortMarkdown)
      
      expect(typeof result.isPerformant).toBe('boolean')
      // Short content should be performant
      expect(result.isPerformant).toBe(true)
    })

    test('handles empty input', () => {
      const result = getPerformanceInfo('')
      
      expect(result.plainTextTime).toBe(0)
      expect(result.htmlTime).toBe(0)
      expect(result.length).toBe(0)
    })

    test('handles null/undefined input', () => {
      expect(getPerformanceInfo(null).plainTextTime).toBe(0)
      expect(getPerformanceInfo(undefined).htmlTime).toBe(0)
    })

    test('performance is acceptable for typical content', () => {
      // Test with typical message content (~1000 chars)
      const typicalMarkdown = '# Meeting Notes\n\n## Agenda\n\n- **Topic 1**: Discussion about project progress\n- **Topic 2**: Planning next sprint\n- **Topic 3**: Code review feedback\n\n## Actions\n\n1. Update documentation\n2. Fix bug in authentication\n3. Prepare demo for client\n\n## Code Examples\n\n```javascript\nconst example = "Hello World";\nconsole.log(example);\n```\n\n> Remember to test thoroughly before deployment!\n\n**Next meeting**: Friday at 2 PM'
      
      const result = getPerformanceInfo(typicalMarkdown)
      
      // Should be performant for typical content
      expect(result.plainTextTime).toBeLessThan(10)
      expect(result.htmlTime).toBeLessThan(10)
      expect(result.isPerformant).toBe(true)
    })
  })

  describe('markdownUtils object', () => {
    test('exports all utility functions', () => {
      expect(typeof markdownUtils.renderToPlainText).toBe('function')
      expect(typeof markdownUtils.renderToHTML).toBe('function')
      expect(typeof markdownUtils.validateMarkdown).toBe('function')
      expect(typeof markdownUtils.getPerformanceInfo).toBe('function')
    })

    test('utility functions work correctly', () => {
      const markdown = '# Test\n\n**Bold** text'
      
      const plainText = markdownUtils.renderToPlainText(markdown)
      const html = markdownUtils.renderToHTML(markdown)
      const validation = markdownUtils.validateMarkdown(markdown)
      const performance = markdownUtils.getPerformanceInfo(markdown)
      
      expect(plainText).toBe('Test\n\nBold text')
      expect(html).toContain('<h1>Test</h1>')
      expect(validation.valid).toBe(true)
      expect(typeof performance.plainTextTime).toBe('number')
    })
  })

  describe('error handling', () => {
    test('handles markdown parsing errors gracefully', () => {
      // Create a scenario that might cause parsing issues
      const problematicMarkdown = '[' + '('.repeat(1000) + ')'.repeat(1000) + ']'
      
      const plainText = renderToPlainText(problematicMarkdown)
      const html = renderToHTML(problematicMarkdown)
      
      // Should not crash and should return some reasonable output
      expect(typeof plainText).toBe('string')
      expect(typeof html).toBe('string')
    })

    test('console.error is called on parsing errors', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
      
      // Mock marked to throw an error
      const originalMarked = require('marked').marked
      require('marked').marked = jest.fn().mockImplementation(() => {
        throw new Error('Parsing error')
      })
      
      const result = renderToPlainText('# Test')
      
      expect(consoleSpy).toHaveBeenCalledWith(
        'markdownRenderer: Error converting to plain text:',
        expect.any(Error)
      )
      
      // Restore original function
      require('marked').marked = originalMarked
      consoleSpy.mockRestore()
    })
  })
})