export function getMedalIcon(rank: number | string) {
  switch (Number(rank)) {
    case 1:
      return 'noto:1st-place-medal'
    case 2:
      return 'noto:2nd-place-medal'
    case 3:
      return 'noto:3rd-place-medal'
    default:
      return 'noto:trophy'
  }
}
