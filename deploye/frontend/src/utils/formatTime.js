export function formatTime(ms){
  if (ms == null) return '-'
  const s = Number(ms)
  if (s < 1000) return `${s} ms`
  const sec = (s/1000).toFixed(2)
  return `${sec} s`
}

export default formatTime
