const indiaDateTimeFormatter = new Intl.DateTimeFormat('en-IN', {
  timeZone: 'Asia/Kolkata',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: 'numeric',
  minute: '2-digit',
  second: '2-digit',
  hour12: true,
})

const indiaDateFormatter = new Intl.DateTimeFormat('en-IN', {
  timeZone: 'Asia/Kolkata',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

export function formatIndiaDateTime(value) {
  if (!value) return ''
  return indiaDateTimeFormatter.format(new Date(value))
}

export function formatIndiaDate(value) {
  if (!value) return ''
  return indiaDateFormatter.format(new Date(value))
}
