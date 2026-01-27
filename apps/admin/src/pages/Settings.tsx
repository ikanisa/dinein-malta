import { useState, useEffect } from 'react'
import { Card, Button, Badge } from '@dinein/ui'
import { supabase } from '../shared/services/supabase'
import { toast } from 'sonner'
import { Globe, RefreshCw, Save } from 'lucide-react'
import * as Tabs from '@radix-ui/react-tabs'

interface Country {
    code: string
    name: string
    currency: string
    currency_symbol: string
    is_active: boolean
}

export default function Settings() {
    const [countries, setCountries] = useState<Country[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    const fetchCountries = async () => {
        setLoading(true)
        try {
            const { data, error } = await supabase
                .from('countries')
                .select('*')
                .order('name')

            if (error) throw error
            setCountries(data || [])
        } catch (error) {
            console.error('Error fetching countries:', error)
            toast.error('Failed to load countries')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchCountries()
    }, [])

    const toggleCountry = async (code: string, currentActive: boolean) => {
        setSaving(true)
        try {
            const { error } = await supabase
                .from('countries')
                .update({ is_active: !currentActive, updated_at: new Date().toISOString() })
                .eq('code', code)

            if (error) throw error

            setCountries(prev => prev.map(c =>
                c.code === code ? { ...c, is_active: !currentActive } : c
            ))
            toast.success(`${code} ${!currentActive ? 'enabled' : 'disabled'}`)
        } catch (error) {
            console.error('Error toggling country:', error)
            toast.error('Failed to update country')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Global Settings</h1>
                    <p className="text-muted-foreground">Manage system-wide configuration.</p>
                </div>
                <Button variant="outline" onClick={fetchCountries} disabled={loading}>
                    <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </header>

            <Tabs.Root defaultValue="countries" className="w-full">
                <Tabs.List className="flex border-b border-border mb-6">
                    <Tabs.Trigger
                        value="countries"
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary transition-colors"
                    >
                        <Globe className="h-4 w-4" />
                        Countries
                    </Tabs.Trigger>
                    <Tabs.Trigger
                        value="system"
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary transition-colors"
                    >
                        <Save className="h-4 w-4" />
                        System
                    </Tabs.Trigger>
                </Tabs.List>

                <Tabs.Content value="countries" className="space-y-4">
                    <Card className="p-6">
                        <h2 className="text-lg font-semibold mb-4">Supported Countries</h2>
                        <p className="text-sm text-muted-foreground mb-6">
                            Enable or disable countries for DineIn deployment.
                        </p>

                        {loading ? (
                            <div className="space-y-3">
                                {[1, 2].map(i => (
                                    <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {countries.map(country => (
                                    <div
                                        key={country.code}
                                        className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                                                {country.code}
                                            </div>
                                            <div>
                                                <div className="font-medium">{country.name}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    {country.currency} ({country.currency_symbol})
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Badge variant={country.is_active ? 'default' : 'secondary'}>
                                                {country.is_active ? 'Active' : 'Inactive'}
                                            </Badge>
                                            <Button
                                                size="sm"
                                                variant={country.is_active ? 'outline' : 'default'}
                                                onClick={() => toggleCountry(country.code, country.is_active)}
                                                disabled={saving}
                                            >
                                                {country.is_active ? 'Disable' : 'Enable'}
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>
                </Tabs.Content>

                <Tabs.Content value="system" className="space-y-4">
                    <Card className="p-6">
                        <h2 className="text-lg font-semibold mb-4">System Configuration</h2>
                        <p className="text-sm text-muted-foreground">
                            Additional system settings will be available here in future updates.
                        </p>
                        <div className="mt-6 p-8 border-2 border-dashed rounded-lg text-center text-muted-foreground">
                            <Save className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            Coming soon: Feature flags, notification settings, and more.
                        </div>
                    </Card>
                </Tabs.Content>
            </Tabs.Root>
        </div>
    )
}
