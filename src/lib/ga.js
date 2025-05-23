// log the pageview with their URL
export const pageview = url => {
  if (window && process.env.NEXT_PUBLIC_GA_TRACKING_ID) {
    window.gtag('config', process.env.NEXT_PUBLIC_GA_TRACKING_ID, { page_path: url })
  }
}
