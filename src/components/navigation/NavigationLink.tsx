'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ComponentProps, MouseEvent, useCallback } from 'react'
import { useNavigation } from './NavigationProvider'

type NavigationLinkProps = ComponentProps<typeof Link>

export function NavigationLink({ href, onClick, children, ...props }: NavigationLinkProps) {
  const { startNavigation } = useNavigation()
  const pathname = usePathname()

  const handleClick = useCallback(
    (e: MouseEvent<HTMLAnchorElement>) => {
      // 外部リンクや新しいタブで開く場合はスキップ
      const hrefString = typeof href === 'string' ? href : href.pathname || ''
      const isExternal = hrefString.startsWith('http') || hrefString.startsWith('//')
      const isNewTab = props.target === '_blank'
      const isModifierKey = e.metaKey || e.ctrlKey || e.shiftKey

      if (!isExternal && !isNewTab && !isModifierKey) {
        // 同じページへのナビゲーションでなければローディングを開始
        const targetPath = hrefString.split('?')[0].split('#')[0]
        const currentPath = pathname.split('?')[0].split('#')[0]

        if (targetPath !== currentPath) {
          startNavigation()
        }
      }

      onClick?.(e)
    },
    [href, onClick, pathname, props.target, startNavigation]
  )

  return (
    <Link href={href} onClick={handleClick} {...props}>
      {children}
    </Link>
  )
}
