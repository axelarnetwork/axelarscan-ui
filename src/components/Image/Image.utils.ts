const OPTIMIZER_URL = '';

/**
 * Parameters for the image loader function
 */
export interface LoaderParams {
  src: string;
  width: number;
  quality?: number;
}

/**
 * Custom image loader that handles optimization through a custom optimizer service
 *
 * @param params - Loader parameters including src, width, and quality
 * @returns Optimized image URL with query parameters
 */
export const loader = ({ src, width, quality = 75 }: LoaderParams): string => {
  // Start building the URL
  let url = '';

  // Add optimizer prefix if configured
  if (OPTIMIZER_URL) {
    url += `${OPTIMIZER_URL}/_next`;
  }

  // Add leading slash if src doesn't start with one
  if (!src?.startsWith('/')) {
    url += '/';
  }

  // Add the source path
  url += src;

  // Add optimization query parameters if optimizer is configured
  if (OPTIMIZER_URL) {
    url += '?url=';

    // Add app URL prefix for relative paths
    if (src?.startsWith('/')) {
      url += process.env.NEXT_PUBLIC_APP_URL || '';
    }

    // Add source and optimization parameters
    url += `${src}&w=${width}&q=${quality}`;
  }

  return url;
};
