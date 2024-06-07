export function getRankClass(rank: number | string) {
  switch (Number(rank)) {
    case 1:
      return 'font-bold !text-yellow-500'
    case 2:
      return 'font-bold !text-gray-400'
    case 3:
      return 'font-bold !text-amber-600'
    default:
      return ''
  }
}
