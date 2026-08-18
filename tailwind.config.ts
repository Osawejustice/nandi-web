import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#FAFAF9',
        surface: '#ffffff',
        soft: '#F5F5F4',
        charcoal: '#1C1917',
        border: '#E7E5E4',
        primary: '#0F766E',
        primaryHover: '#115E59',
        brand: '#0F766E',
        brandDark: '#115E59',
        brandLight: '#14B8A6',
        brandSoft: '#CCFBF1',
        accent: '#D97706',
        accentDark: '#B45309',
        accentSoft: '#FEF3C7',
        textMain: '#0C0A09',
        textMuted: '#57534E',
        textFaint: '#78716C',
        live: '#16A34A',
        liveSoft: '#DCFCE7',
        channelWhatsApp: '#059669',
        channelWhatsAppSoft: '#D1FAE5',
        channelSMS: '#0284C7',
        channelSMSSoft: '#E0F2FE',
        channelVoice: '#7C3AED',
        channelVoiceSoft: '#EDE9FE',
        channelTelegram: '#0891B2',
        channelTelegramSoft: '#CFFAFE',
      },
      boxShadow: {
        lift: '0 1px 2px rgba(0,0,0,0.06), 0 12px 28px -12px rgba(0,0,0,0.18)',
        float: '0 2px 4px rgba(0,0,0,0.05), 0 30px 60px -24px rgba(0,0,0,0.28)',
      },
    },
  },
  plugins: [],
}
export default config
