export const getPointsForRank = (rank: number) => {
  switch (rank) {
    case 1:
      return 25
    case 2:
      return 18
    case 3:
      return 15
    case 4:
      return 12
    case 5:
      return 10
    case 6:
      return 8
    case 7:
      return 6
    case 8:
      return 4
    case 9:
      return 2
    case 10:
      return 1
    default:
      return 0
  }
}
