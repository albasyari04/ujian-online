import JSZip from "jszip"

type LevelFmt = Record<number, string>

/**
 * Ekstrak teks dari .docx SAMBIL mempertahankan penomoran otomatis Word
 * (1. 2. 3. / a. b. c.). mammoth.extractRawText membuang nomor & huruf ini.
 */
export async function docxToText(buffer: ArrayBuffer): Promise<string> {
  const zip = await JSZip.loadAsync(buffer)
  const docXml = await zip.file("word/document.xml")?.async("string")
  if (!docXml) throw new Error("File .docx tidak valid (document.xml tidak ditemukan).")
  const numXml = await zip.file("word/numbering.xml")?.async("string")

  const parser = new DOMParser()
  const W = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"
  const attr = (el: Element | null | undefined, name: string) => el?.getAttributeNS(W, "val") ?? el?.getAttribute(`w:${name}`) ?? el?.getAttribute("w:val") ?? null

  // numId -> (ilvl -> numFmt)
  const numFmt = new Map<string, LevelFmt>()
  if (numXml) {
    const num = parser.parseFromString(numXml, "application/xml")
    const abstracts = new Map<string, LevelFmt>()
    for (const a of Array.from(num.getElementsByTagNameNS(W, "abstractNum"))) {
      const id = a.getAttributeNS(W, "abstractNumId") ?? a.getAttribute("w:abstractNumId") ?? ""
      const levels: LevelFmt = {}
      for (const l of Array.from(a.getElementsByTagNameNS(W, "lvl"))) {
        const ilvl = Number(l.getAttributeNS(W, "ilvl") ?? l.getAttribute("w:ilvl") ?? 0)
        levels[ilvl] = attr(l.getElementsByTagNameNS(W, "numFmt")[0], "val") ?? "decimal"
      }
      abstracts.set(id, levels)
    }
    for (const n of Array.from(num.getElementsByTagNameNS(W, "num"))) {
      const id = n.getAttributeNS(W, "numId") ?? n.getAttribute("w:numId") ?? ""
      const abs = attr(n.getElementsByTagNameNS(W, "abstractNumId")[0], "val") ?? ""
      numFmt.set(id, abstracts.get(abs) ?? {})
    }
  }

  const doc = parser.parseFromString(docXml, "application/xml")
  const counters = new Map<string, number[]>()
  const lines: string[] = []

  for (const p of Array.from(doc.getElementsByTagNameNS(W, "p"))) {
    const text = Array.from(p.getElementsByTagNameNS(W, "t")).map((t) => t.textContent ?? "").join("").trim()
    const numPr = p.getElementsByTagNameNS(W, "numPr")[0]
    let prefix = ""
    if (numPr && text) {
      const numId = attr(numPr.getElementsByTagNameNS(W, "numId")[0], "val") ?? ""
      const ilvl = Number(attr(numPr.getElementsByTagNameNS(W, "ilvl")[0], "val") ?? 0)
      const c = counters.get(numId) ?? []
      c[ilvl] = (c[ilvl] ?? 0) + 1
      c.length = ilvl + 1 // reset level yang lebih dalam
      counters.set(numId, c)
      const fmt = numFmt.get(numId)?.[ilvl] ?? "decimal"
      const n = c[ilvl]
      if (fmt === "decimal") prefix = `${n}. `
      else if (fmt === "lowerLetter" || fmt === "upperLetter") prefix = `${String.fromCharCode(64 + ((n - 1) % 26) + 1)}. `
    }
    lines.push(prefix + text)
  }
  return lines.join("\n")
}