export default function (time: string) {
  const date = new Date(time).toUTCString()
  return new Date(date)
}
