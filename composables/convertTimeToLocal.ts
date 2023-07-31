export default function (value: Date | null) {
  if (value === null) return ''
  const off = value.getTimezoneOffset() * -1
  const del = value.getMilliseconds() ? 'Z' : '.' // have milliseconds ?
  value = new Date(value.getTime() + off * 60000) // add or subtract time zone
  return (
    value.toISOString().split(del)[0] +
    (off < 0 ? '-' : '+') +
    ('0' + Math.abs(Math.floor(off / 60))).substr(-2) +
    ':' +
    ('0' + Math.abs(off % 60)).substr(-2)
  ).slice(0, 19)
}
