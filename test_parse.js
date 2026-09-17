function parseCurrency(value) {
  let clean = value.replace(/[R$\s]/g, '');
  if (clean.includes(',') && clean.includes('.')) {
    if (clean.lastIndexOf(',') > clean.lastIndexOf('.')) {
      clean = clean.replace(/\./g, '').replace(',', '.');
    } else {
      clean = clean.replace(/,/g, '');
    }
  } else if (clean.includes(',')) {
    // Check if it's likely a thousands separator, e.g. "1,000"
    // Usually Brazilian users use comma for decimals, so we assume it's decimal.
    clean = clean.replace(',', '.');
  }
  return parseFloat(clean) || 0;
}
console.log(parseCurrency('1.500,00')); // 1500
console.log(parseCurrency('1,500.00')); // 1500
console.log(parseCurrency('1500,00')); // 1500
console.log(parseCurrency('1500.00')); // 1500
console.log(parseCurrency('1.500')); // 1500
console.log(parseCurrency('R$ 1.500,00')); // 1500
console.log(parseCurrency('  1.500,50 ')); // 1500.5
