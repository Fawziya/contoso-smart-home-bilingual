import type { Config } from 'tailwindcss'

const config: Config = {
  mode: 'jit',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        'inter': ['Inter', 'sans-serif'],
        'chinese': ['"Noto Sans SC"', 'Inter', 'sans-serif'],
      },
      colors: {
        primary: {
          light: '#FAFAFA', // 有质感的白色-浅
          DEFAULT: '#F6F6F6', // 有质感的白色
          dark: '#EEEEEE',   // 有质感的白色-深
        },
        secondary: {
          light: '#222222', // 主字体色
          DEFAULT: '#666666', // 次级字体色
          dark: '#1E1E1E',   // CTA按钮色（墨黑/炭黑色）
        },
        accent: {
          DEFAULT: '#00C2A8', // 辅助强调色（薄荷绿）
        },
        hover: {
          DEFAULT: 'rgba(0, 0, 0, 0.08)', // hover状态
        }
      },
      backgroundImage: {
        'smart-home': "url('/images/smart-home-hero.jpg')",
      },
    },
  },
  plugins: [],
}
export default config
