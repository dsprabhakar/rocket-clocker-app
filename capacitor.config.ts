import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.rayal.rocketclocker',
  appName: 'Rocket Clocker',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  plugins: {
    Camera: {
      permissions: ['camera'],
    },
    Geolocation: {
      permissions: ['location'],
    },
  },
}

export default config
