import { Inter } from 'next/font/google';
import localFont from 'next/font/local';

export const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

export const bebasNeue = localFont({
  src: [
    {
      path: '../../public/fonts/bebas-neue/BebasNeue-Thin.ttf',
      weight: '100',
      style: 'normal',
    },
    {
      path: '../../public/fonts/bebas-neue/BebasNeue-Light.ttf',
      weight: '200',
      style: 'normal',
    },
    {
      path: '../../public/fonts/bebas-neue/BebasNeue-Book.ttf',
      weight: '300',
      style: 'normal',
    },
    {
      path: '../../public/fonts/bebas-neue/BebasNeue-Regular.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/fonts/bebas-neue/BebasNeue-Bold.ttf',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-heading',
  display: 'swap',
});
