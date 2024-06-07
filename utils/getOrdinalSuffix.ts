export function getOrdinalSuffix(n: number | string) {
  return `${Number(n)}${['st', 'nd', 'rd'][((((Number(n) + 90) % 100) - 10) % 10) - 1] || 'th'}`
}
