// Lotin yozuvidagi o'zbekcha matnni standart rus alifbosidagi kirillchaga o'giradi.
// Rus TTS ovozlari faqat standart rus harflarini biladi (ғ, қ, ҳ, ў kabi
// o'zbekchaga xos harflar yo'q), shuning uchun ularni eng yaqin rus harfiga
// almashtiramiz — aniq imlo emas, balki tovushga yaqin talaffuz uchun.
const DIGRAPHS = [
  ['yo', 'ё'], ['yu', 'ю'], ['ya', 'я'], ['ye', 'е'],
  ['sh', 'ш'], ['ch', 'ч'], ['ng', 'нг'],
  ["o'", 'у'], ["g'", 'г'],
]

const SINGLE = {
  a: 'а', b: 'б', d: 'д', e: 'е', f: 'ф', g: 'г', h: 'х', i: 'и', j: 'ж',
  k: 'к', l: 'л', m: 'м', n: 'н', o: 'о', p: 'п', q: 'к', r: 'р', s: 'с',
  t: 'т', u: 'у', v: 'в', x: 'х', y: 'й', z: 'з', c: 'к',
}

const VOWELS = 'аоуиеёюя'

// Rus TTS notanish/bitta bo'g'inli so'zlarni (masalan "jon") urg'usiz deb
// hisoblab, unlisini qisqartirib yuboradi ("акanye" hodisasi) — natijada
// "жон" "жn" kabi tushunarsiz eshitiladi. Urg'u belgisini (U+0301, "́")
// so'zning oxirgi unlisidan keyin qo'yish ko'plab TTS dvigatellariga to'liq
// talaffuz qilishni bildiradi. O'zbek tilida urg'u odatda so'z oxirida bo'ladi.
function addStress(word) {
  for (let i = word.length - 1; i >= 0; i--) {
    if (VOWELS.includes(word[i].toLowerCase())) {
      return word.slice(0, i + 1) + '́' + word.slice(i + 1)
    }
  }
  return word
}

export function uzToCyrillicRu(text, { stress = true } = {}) {
  if (!text) return ''
  let s = text.toLowerCase().replace(/[ʻʼ`']/g, "'")

  for (const [lat, cyr] of DIGRAPHS) {
    s = s.split(lat).join(cyr)
  }

  let out = ''
  for (const ch of s) {
    if (ch === "'") continue
    out += SINGLE[ch] !== undefined ? SINGLE[ch] : ch
  }

  out = out.replace(/(^|\s)([а-яё])/g, (m, sp, c) => sp + c.toUpperCase())

  if (stress) {
    out = out.split(' ').map((w) => (w ? addStress(w) : w)).join(' ')
  }

  return out
}
