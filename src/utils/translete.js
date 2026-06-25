const translitMap = {
    // Maxsus harf juftliklari (2 harfli kombinatsiyalar)
    "sh": "ш", "Sh": "Ш", "SH": "Ш",
    "ch": "ч", "Ch": "Ч", "CH": "Ч",
    "yo'": "ё", "Yo'": "Ё", "YO'": "Ё", "yo'": "ё", "Yoʻ": "Ё", "YOʻ": "Ё",
    "yu": "ю", "Yu": "Ю", "YU": "Ю",
    "ya": "я", "Ya": "Я", "YA": "Я",
    "ye": "е", "Ye": "Е", "YE": "Е",
    "o'": "ў", "oʻ": "ў", "Oʻ": "Ў",
    "g'": "ғ", "G'": "Ғ",

    "a": "а", "b": "б", "d": "д",
    "f": "ф", "g": "г", "h": "ҳ",
    "i": "и", "j": "ж", "k": "к", "l": "л", "m": "м", "n": "н", "o": "о",
    "p": "п", "q": "қ", "r": "р", "s": "с", "t": "т", "u": "у", "v": "в",
    "x": "х", "y": "й", "z": "з", "'": "ъ", "ʻ": "ъ",

    "A": "А", "B": "Б", "D": "Д", "F": "Ф", "G": "Г", "H": "Ҳ",
    "I": "И", "J": "Ж", "K": "К", "L": "Л", "M": "М", "N": "Н", "O": "О",
    "P": "П", "Q": "Қ", "R": "Р", "S": "С", "T": "Т", "U": "У", "V": "В",
    "X": "Х", "Y": "Й", "Z": "З", 'O‘': 'Ў', "O'": "Ў", ",": ",",
};

const translateText = (text) => {
    let translated = text;

    translated = translated.replace(/\b[e]/g, "э").replace(/\b[E]/g, "Э");

    const twoLetterKeys = Object.keys(translitMap).filter(key => key.length === 2);
    const oneLetterKeys = Object.keys(translitMap).filter(key => key.length === 1);

    for (const key of twoLetterKeys) {
        const regex = new RegExp(key, "g");
        translated = translated?.replace(regex, translitMap[key]);
    }

    for (const key of oneLetterKeys) {
        const regex = new RegExp(key, "g");
        translated = translated?.replace(regex, translitMap[key]);
    }

    return translated;
};

export default translateText;