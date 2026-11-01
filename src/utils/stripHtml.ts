// A REST Countries não devolve HTML, mas textos livres passam por aqui por
// segurança: remove tags e decodifica as entidades mais comuns.
export function stripHtml(text: string | null | undefined): string {
  if (!text) return '';
  return text
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/gi, '&') // por último, para não decodificar duas vezes
    .replace(/\s+/g, ' ')
    .trim();
}
