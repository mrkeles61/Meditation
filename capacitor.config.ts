import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'com.ultravioletperigee.app',
    appName: 'Ultraviolet Perigee',
    webDir: 'dist',
    plugins: {
        StatusBar: {
            style: 'DARK',
            backgroundColor: '#0a0a0f',
        },
        SplashScreen: {
            launchAutoHide: true,
            launchShowDuration: 2000,
            backgroundColor: '#0a0a0f',
        },
    },
};

export default config;
