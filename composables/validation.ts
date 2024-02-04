export function isUrlValid(url: string) {
  try {
    // eslint-disable-next-line no-new
    new URL(url)
    return true
  } catch (err) {
    return false
  }
}

export function isImage(url: string) {
  return /\.(jpg|jpeg|png|webp|avif|gif|svg)$/.test(url)
}
