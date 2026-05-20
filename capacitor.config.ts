import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.quantum.focus',
  appName: 'Quantum Focus',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
