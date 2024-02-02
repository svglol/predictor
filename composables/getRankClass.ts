export const getRankClass = (rank: number) => {
  switch (rank) {
    case 1:
      return 'font-bold text-yellow-500'
    case 2:
      return 'font-bold text-gray-400'
    case 3:
      return 'font-bold text-amber-600'
    default:
      return ''
  }
}
