// Uzbek Latin → Cyrillic transliteration
// Character-by-character approach for correctness

const map1 = {
  'a': 'а', 'A': 'А',
  'b': 'б', 'B': 'Б',
  'd': 'д', 'D': 'Д',
  'f': 'ф', 'F': 'Ф',
  'g': 'г', 'G': 'Г',
  'h': 'ҳ', 'H': 'Ҳ',
  'i': 'и', 'I': 'И',
  'j': 'ж', 'J': 'Ж',
  'k': 'к', 'K': 'К',
  'l': 'л', 'L': 'Л',
  'm': 'м', 'M': 'М',
  'n': 'н', 'N': 'Н',
  'o': 'о', 'O': 'О',
  'p': 'п', 'P': 'П',
  'q': 'қ', 'Q': 'Қ',
  'r': 'р', 'R': 'Р',
  's': 'с', 'S': 'С',
  't': 'т', 'T': 'Т',
  'u': 'у', 'U': 'У',
  'v': 'в', 'V': 'В',
  'x': 'х', 'X': 'Х',
  'y': 'й', 'Y': 'Й',
  'z': 'з', 'Z': 'З',
  "'": 'ъ', 'ʻ': 'ъ',
}

const isLetter = (c) => c && /[a-zA-Z''ʻ]/.test(c)
const isWordStart = (text, i) => i === 0 || !isLetter(text[i - 1])

const translateText = (text) => {
  if (!text || typeof text !== 'string') return text

  let result = ''
  let i = 0

  while (i < text.length) {
    const c = text[i]
    const c1 = text[i + 1] || ''
    const c2 = text[i + 2] || ''
    const lc = c.toLowerCase()
    const lc1 = c1.toLowerCase()
    const lc2 = c2.toLowerCase()
    const upper = c === c.toUpperCase() && c !== c.toLowerCase()

    // yo' / Yo' — 3 chars (ё)
    if (lc === 'y' && lc1 === 'o' && (c2 === "'" || c2 === 'ʻ')) {
      result += upper ? 'Ё' : 'ё'
      i += 3
      continue
    }

    // sh / Sh — (ш)
    if (lc === 's' && lc1 === 'h') {
      result += upper ? 'Ш' : 'ш'
      i += 2
      continue
    }

    // ch / Ch — (ч)
    if (lc === 'c' && lc1 === 'h') {
      result += upper ? 'Ч' : 'ч'
      i += 2
      continue
    }

    // ng — (нг)
    if (lc === 'n' && lc1 === 'g') {
      result += upper ? 'НГ' : 'нг'
      i += 2
      continue
    }

    // yu / Yu — (ю)
    if (lc === 'y' && lc1 === 'u') {
      result += upper ? 'Ю' : 'ю'
      i += 2
      continue
    }

    // ya / Ya — (я)
    if (lc === 'y' && lc1 === 'a') {
      result += upper ? 'Я' : 'я'
      i += 2
      continue
    }

    // ye / Ye — (е)
    if (lc === 'y' && lc1 === 'e') {
      result += upper ? 'Е' : 'е'
      i += 2
      continue
    }

    // o' / O' — (ў)
    if (lc === 'o' && (c1 === "'" || c1 === 'ʻ')) {
      result += upper ? 'Ў' : 'ў'
      i += 2
      continue
    }

    // g' / G' — (ғ)
    if (lc === 'g' && (c1 === "'" || c1 === 'ʻ')) {
      result += upper ? 'Ғ' : 'ғ'
      i += 2
      continue
    }

    // e / E — word start → э/Э, otherwise → е/Е
    if (lc === 'e') {
      if (isWordStart(text, i)) {
        result += upper ? 'Э' : 'э'
      } else {
        result += upper ? 'Е' : 'е'
      }
      i++
      continue
    }

    // Single char map
    result += map1[c] ?? c
    i++
  }

  return result
}

export default translateText
