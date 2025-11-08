export function clsx(...args){
  return args.filter(Boolean).join(' ')
}

export function tryParseJSON(s, fallback){
  try { return JSON.parse(s) } catch { return fallback }
}
