export function getPointsForRank(rank: number) {
  const pointsForRanks = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1]
  return pointsForRanks[rank - 1] || 0
}
