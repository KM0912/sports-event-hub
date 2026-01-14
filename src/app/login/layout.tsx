import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ログイン・新規登録',
  description: '宮城バドミントン練習会にログインまたは新規登録して、練習会を探したり、ビジターを募集しましょう。',
  robots: {
    index: true,
    follow: true,
  },
}

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
