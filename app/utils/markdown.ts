/**
 * Lightweight markdown-to-HTML renderer for the subset used by the
 * Post Order rich-text editor (CommonMark-ish).  Input is HTML-escaped
 * before formatting so that user-supplied HTML is rendered as plain text.
 */
export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function renderMarkdown(src: string): string {
  const esc = escapeHtml(src)
  const lines = esc.split('\n')
  const html: string[] = []
  let inUl = false
  let inOl = false

  const inline = (s: string) => s
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*\n]+)\*/g, '<em>$1</em>')
    .replace(/~~(.+?)~~/g, '<del>$1</del>')
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')

  const closeLists = () => {
    if (inUl) { html.push('</ul>'); inUl = false }
    if (inOl) { html.push('</ol>'); inOl = false }
  }

  for (const line of lines) {
    const bullet = line.match(/^\s*[-*]\s+(.*)$/)
    const ordered = line.match(/^\s*\d+\.\s+(.*)$/)
    if (bullet) {
      if (inOl) { html.push('</ol>'); inOl = false }
      if (!inUl) { html.push('<ul>'); inUl = true }
      html.push(`<li>${inline(bullet[1] ?? '')}</li>`)
    } else if (ordered) {
      if (inUl) { html.push('</ul>'); inUl = false }
      if (!inOl) { html.push('<ol>'); inOl = true }
      html.push(`<li>${inline(ordered[1] ?? '')}</li>`)
    } else {
      closeLists()
      html.push(line.trim() === '' ? '' : `<p>${inline(line)}</p>`)
    }
  }
  closeLists()
  return html.join('')
}
