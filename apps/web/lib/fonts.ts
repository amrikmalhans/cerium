import { Open_Sans, Crimson_Text } from 'next/font/google'

export const openSans = Open_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-open-sans',
  weight: ['300', '400', '500', '600', '700', '800'],
})

export const crimsonText = Crimson_Text({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-crimson-text',
  weight: ['400', '600', '700'],
})
