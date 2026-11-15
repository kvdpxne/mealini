export interface ParsedUserAgent {
  browser: string
  os: string
  isMobile: boolean
}

export function parseUserAgent(ua: string | null): ParsedUserAgent {
  if (!ua) return {browser: 'Nieznana przeglądarka', os: 'Nieznany system', isMobile: false}

  const isMobile = /Mobile|Android|iPhone|iPad/i.test(ua)

  let browser = 'Nieznana przeglądarka'
  if (/Edg\//.test(ua)) browser = 'Edge'
  else if (/Chrome\//.test(ua) && !/Chromium/.test(ua)) browser = 'Chrome'
  else if (/Firefox\//.test(ua)) browser = 'Firefox'
  else if (/Safari\//.test(ua) && !/Chrome/.test(ua)) browser = 'Safari'
  else if (/OPR\//.test(ua) || /Opera/.test(ua)) browser = 'Opera'

  let os = 'Nieznany system'
  if (/Windows NT 10/.test(ua)) os = 'Windows 10/11'
  else if (/Windows NT/.test(ua)) os = 'Windows'
  else if (/Mac OS X/.test(ua) && !/iPhone|iPad/.test(ua)) os = 'macOS'
  else if (/Android/.test(ua)) os = 'Android'
  else if (/iPhone|iPad|iPod/.test(ua)) os = 'iOS'
  else if (/Linux/.test(ua)) os = 'Linux'

  return {browser, os, isMobile}
}