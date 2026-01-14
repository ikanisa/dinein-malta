import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'com.dineinmalta.app',
    appName: 'DineIn Malta',
    webDir: 'dist',
    server: {
        androidScheme: 'https',
        cleartext: false,
        allowNavigation: [
            '*.supabase.co',
            'generativelanguage.googleapis.com'
        ]
    },
    plugins: {
        SplashScreen: {
            launchShowDuration: 2000,
            launchAutoHide: true,
            backgroundColor: '#ffffff',
            androidSplashResourceName: 'splash',
            androidScaleType: 'CENTER_CROP',
            showSpinner: false,
            androidSpinnerStyle: 'large',
            spinnerColor: '#999999'
        },
        StatusBar: {
            style: 'LIGHT',
            backgroundColor: '#ffffff'
        }
    }
};

export default config;
