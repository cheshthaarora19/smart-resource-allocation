const Tesseract = require('tesseract.js');

const extractTextFromImage = async (imagePath) => {
  try {
    console.log('🔍 Running OCR on:', imagePath);
    const { data: { text } } = await Tesseract.recognize(imagePath, 'eng');
    console.log('✅ OCR complete');
    return text.trim();
  } catch (error) {
    console.error('❌ OCR Error:', error.message);
    return '';
  }
};

module.exports = { extractTextFromImage };