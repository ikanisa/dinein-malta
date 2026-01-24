import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { QrCode, MapPin, Globe, Bot } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/input'
// import { Select } from '@/components/ui/select' // Unused in the snippet
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useSupabase } from '@/contexts/SupabaseContext'
import { childLogger } from '@easymo/commons'

const log = childLogger({ service: 'waiter-pwa', module: 'OnboardingView' })

const LANGUAGES = [
    { value: 'en', label: 'English', flag: '🇬🇧' },
    { value: 'fr', label: 'Français', flag: '🇫🇷' },
    { value: 'es', label: 'Español', flag: '🇪🇸' },
    { value: 'pt', label: 'Português', flag: '🇵🇹' },
    { value: 'de', label: 'Deutsch', flag: '🇩🇪' },
]

export function OnboardingView() {
    const { t, i18n } = useTranslation()
    const navigate = useNavigate()
    const { userId } = useSupabase()
    const [venueCode, setVenueCode] = useState('')
    const [selectedLanguage, setSelectedLanguage] = useState(i18n.language)
    const [isScanning, setIsScanning] = useState(false)
    const [locationPermission, setLocationPermission] = useState<boolean | null>(null)

    useEffect(() => {
        // Check URL params from QR scan
        const params = new URLSearchParams(window.location.search)
        const venue = params.get('venue')
        const table = params.get('table')

        if (venue) {
            log.info({ event: 'QR_CODE_DETECTED', venue, table })
            // Auto-proceed if we have venue info
            handleStart(venue, table)
        }

        // Check geolocation permission
        if ('geolocation' in navigator) {
            navigator.permissions.query({ name: 'geolocation' as PermissionName }).then((result) => {
                setLocationPermission(result.state === 'granted')
            })
        }
    }, [])

    const handleLanguageChange = async (lang: string) => {
        setSelectedLanguage(lang)
        await i18n.changeLanguage(lang)
        log.info({ event: 'LANGUAGE_CHANGED', language: lang })
    }

    const handleStart = async (venue?: string, table?: string | null) => {
        const finalVenue = venue || venueCode

        if (!finalVenue && !locationPermission) {
            // Request location to find nearest venue
            requestLocation()
            return
        }

        // Store venue context
        if (finalVenue) {
            sessionStorage.setItem('venue', finalVenue)
            if (table) sessionStorage.setItem('table', table)
        }

        log.info({
            event: 'ONBOARDING_COMPLETE',
            venue: finalVenue,
            table,
            language: selectedLanguage,
            userId
        })

        navigate('/chat')
    }

    const requestLocation = () => {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords
                log.info({ event: 'LOCATION_OBTAINED', latitude, longitude })

                // Here you would find nearest venue
                // For now, just proceed
                navigate('/chat')
            },
            (error) => {
                log.error({ event: 'LOCATION_ERROR', error: error.message })
                // Fallback to manual entry
            }
        )
    }

    const handleQRScan = async () => {
        setIsScanning(true)

        // In production, integrate with a QR scanner library
        // For now, simulate QR scan
        setTimeout(() => {
            setIsScanning(false)
            // Simulate successful scan
            handleStart('restaurant-001', 'table-42')
        }, 2000)
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
                        <Bot className="h-10 w-10 text-green-600" />
                    </div>
                    <CardTitle className="text-2xl">{t('onboarding.welcome')}</CardTitle>
                    <CardDescription>
                        {t('onboarding.description', 'Your AI-powered dining companion')}
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* Language Selection */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-2">
                            <Globe className="h-4 w-4" />
                            {t('onboarding.selectLanguage')}
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            {LANGUAGES.map((lang) => (
                                <Button
                                    key={lang.value}
                                    variant={selectedLanguage === lang.value ? 'solid' : 'outline'}
                                    size="sm"
                                    onClick={() => handleLanguageChange(lang.value)}
                                    className="justify-start"
                                >
                                    <span className="mr-2">{lang.flag}</span>
                                    {lang.label}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* QR Code Scan */}
                    <div className="space-y-2">
                        <Button
                            onClick={handleQRScan}
                            className="w-full"
                            size="lg"
                            disabled={isScanning}
                        >
                            <QrCode className="mr-2 h-5 w-5" />
                            {isScanning ? t('onboarding.scanning') : t('onboarding.scanQR')}
                        </Button>
                    </div>

                    {/* Manual Entry */}
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white px-2 text-muted-foreground">
                                {t('common.or', 'Or')}
                            </span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Input
                            placeholder={t('onboarding.enterCode')}
                            value={venueCode}
                            onChange={(e) => setVenueCode(e.target.value)}
                            className="text-center"
                        />
                    </div>

                    {/* Location Permission */}
                    {locationPermission === false && (
                        <Button
                            variant="outline"
                            className="w-full"
                            onClick={requestLocation}
                        >
                            <MapPin className="mr-2 h-4 w-4" />
                            {t('onboarding.locationPermission')}
                        </Button>
                    )}

                    {/* Start Button */}
                    <Button
                        onClick={() => handleStart()}
                        className="w-full"
                        size="lg"
                        variant="solid"
                    >
                        {t('onboarding.start')}
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}
