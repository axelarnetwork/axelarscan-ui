import NextImage from 'next/image'
import clsx from 'clsx'

import { includesStringList } from '@/lib/operator'
import { isString } from '@/lib/string'

const OPTIMIZER_URL = ''
const loader = ({ src, width, quality = 75 }) => `${OPTIMIZER_URL ? `${OPTIMIZER_URL}/_next` : ''}${src?.startsWith('/') ? '' : '/'}${src}${OPTIMIZER_URL ? `?url=${src?.startsWith('/') ? process.env.NEXT_PUBLIC_APP_URL : ''}${src}&w=${width}&q=${quality}` : ''}`

export function Image({ src, alt = '', className, ...props }) {
  return src && (
    <NextImage
      alt={alt}
      {...props}
      src={src}
      loader={() => loader({ ...props, src })}
      unoptimized
      className={clsx(className, !isString(src) ? '' :
        includesStringList(src, ['/immutable', '/ropsten']) ? 'bg-white rounded-full' :
        includesStringList(src, ['/dymension', '/saga', '/moonbase', '/moonbeam', '/stellar', '/xion', '/allora']) ? 'bg-white rounded-full p-0.5' :
        includesStringList(src, ['/blast']) ? 'bg-zinc-900 rounded-full p-0.5' : ''
      )}
    />
  )
}
