export function useSiteLinks() {
  const requestUrl = useRequestURL()
  const config = useRuntimeConfig().public

  // Serialize the SSR decision so proxy headers cannot cause hydration differences.
  return useState('site-links', () => {
    const hostname = requestUrl.hostname.toLowerCase()
    const isCvHost = hostname.startsWith('cv.')
    const isPreview = hostname === 'localhost' || hostname.endsWith('.localhost')
      || !hostname.includes('.') || /^[\d.:]+$/.test(hostname)
      || hostname.endsWith('.vercel.app') || hostname.endsWith('.netlify.app')
    const parentHost = hostname.replace(/^(cv|www)\./, '')
    const port = requestUrl.port ? `:${requestUrl.port}` : ''
    const homeUrl = config.siteUrl || `${requestUrl.protocol}//${parentHost}${port}`
    return {
      isCvHost,
      // A one-time navigation hint, not persisted storage shared across subdomains.
      homeHref: isCvHost ? `${homeUrl.replace(/\/$/, '')}/?from=cv` : '/',
      resumeHref: config.cvUrl ? `${config.cvUrl.replace(/\/$/, '')}/` : isPreview ? '/resume' : `${requestUrl.protocol}//cv.${parentHost}${port}/`,
    }
  }).value
}
