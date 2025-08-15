const Tesseract = require('tesseract.js');

async function runOCR(pngBuffer, lang = 'por') {
  if (lang === 'pt-BR') {
    lang = 'por';
  }
  const { data: { text } } = await Tesseract.recognize(pngBuffer, lang);
  return text;
}

module.exports = { runOCR };
