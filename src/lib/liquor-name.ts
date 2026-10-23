export function canonicalLiquorName(value: string) {
  return value
    .replace(/[`’‘]/g, "'")
    .replace(
      /\b\d{2,4}\s*ml(?=\b|[x×])(?:\s*[x×]\s*\d+\s*(?:btls?|bottles?|packs?)?)?/gi,
      " ",
    )
    .replace(/\s*\(\s*\d{1,6}\s*\)/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/[\s,;:-]+$/, "");
}
