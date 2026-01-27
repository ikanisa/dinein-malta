import { useState } from 'react'
import { useOwner } from '../context/OwnerContext'
import { Card, Button, Input } from '@dinein/ui'
import { updateVenue, UpdateVenueInput } from '@dinein/db'
import { supabase } from '../shared/services/supabase'
import { toast } from 'sonner'
import { MapPin, Smartphone, CreditCard, QrCode, Download, Share2 } from 'lucide-react'
import * as Tabs from '@radix-ui/react-tabs'
import QRCode from 'react-qr-code'

export default function Settings() {
    const { venue, refreshVenue } = useOwner()
    const [loading, setLoading] = useState(false)

    if (!venue) return null

    const handleSave = async (updates: UpdateVenueInput) => {
        setLoading(true)
        try {
            await updateVenue(supabase, venue.id, updates)
            await refreshVenue()
            toast.success('Settings updated successfully')
        } catch (error) {
            console.error(error)
            toast.error('Failed to update settings')
        } finally {
            setLoading(false)
        }
    }

    const QR_URL = `https://dinein.app/v/${venue.slug}`

    return (
        <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground">Manage your venue details and payment methods.</p>
            </div>

            <Tabs.Root defaultValue="general" className="space-y-6">
                <Tabs.List className="flex w-full max-w-md border rounded-lg bg-muted/20 p-1">
                    <Tabs.Trigger
                        value="general"
                        className="flex-1 px-4 py-2 text-sm font-medium rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"
                    >
                        General
                    </Tabs.Trigger>
                    <Tabs.Trigger
                        value="payments"
                        className="flex-1 px-4 py-2 text-sm font-medium rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"
                    >
                        Payments
                    </Tabs.Trigger>
                    <Tabs.Trigger
                        value="qr"
                        className="flex-1 px-4 py-2 text-sm font-medium rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"
                    >
                        QR Code
                    </Tabs.Trigger>
                </Tabs.List>

                {/* GENERAL TAB */}
                <Tabs.Content value="general" className="space-y-4 focus:outline-none">
                    <Card className="p-6 space-y-4">
                        <div className="grid gap-2">
                            <label htmlFor="name" className="text-sm font-medium">Venue Name</label>
                            <Input
                                id="name"
                                defaultValue={venue.name}
                                disabled={loading}
                                onBlur={(e) => {
                                    if (e.target.value !== venue.name) {
                                        handleSave({ name: e.target.value })
                                    }
                                }}
                            />
                        </div>

                        <div className="grid gap-2">
                            <label htmlFor="description" className="text-sm font-medium">Description</label>
                            <Input
                                id="description"
                                defaultValue={venue.description || ''}
                                disabled={loading}
                                onBlur={(e) => {
                                    if (e.target.value !== venue.description) {
                                        handleSave({ description: e.target.value })
                                    }
                                }}
                            />
                        </div>

                        <div className="grid gap-2">
                            <label htmlFor="address" className="text-sm font-medium flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                Address
                            </label>
                            <Input
                                id="address"
                                defaultValue={venue.address || ''}
                                disabled={loading}
                                onBlur={(e) => {
                                    if (e.target.value !== venue.address) {
                                        handleSave({ address: e.target.value })
                                    }
                                }}
                            />
                        </div>

                        <p className="text-xs text-muted-foreground pt-2">
                            Changes saved automatically on blur.
                        </p>
                    </Card>
                </Tabs.Content>

                {/* PAYMENTS TAB */}
                <Tabs.Content value="payments" className="space-y-4 focus:outline-none">
                    <Card className="p-6">
                        <div className="flex items-start gap-4 mb-6">
                            <div className="p-3 bg-primary/10 rounded-full">
                                {venue.country === 'RW' ? (
                                    <Smartphone className="h-6 w-6 text-primary" />
                                ) : (
                                    <CreditCard className="h-6 w-6 text-primary" />
                                )}
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg">
                                    {venue.country === 'RW' ? 'MoMo Configuration' : 'Revolut Configuration'}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    {venue.country === 'RW'
                                        ? 'Enter your MoMo Merchant Code for USSD payments.'
                                        : 'Enter your personalized Revolut payment link.'}
                                </p>
                            </div>
                        </div>

                        {venue.country === 'RW' ? (
                            <div className="grid gap-2 max-w-md">
                                <label htmlFor="whatsapp" className="text-sm font-medium">MoMo Merchant Code (USSD)</label>
                                <Input
                                    id="whatsapp"
                                    placeholder="e.g. *182*8*1*..."
                                    defaultValue={venue.whatsapp || ''}
                                    disabled={loading}
                                    onBlur={(e) => {
                                        if (e.target.value !== venue.whatsapp) {
                                            handleSave({ whatsapp: e.target.value })
                                        }
                                    }}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Customers will see this code to dial when checking out with MoMo.
                                </p>
                            </div>
                        ) : (
                            <div className="grid gap-2 max-w-md">
                                <label htmlFor="revolut" className="text-sm font-medium">Revolut Pay Link</label>
                                <Input
                                    id="revolut"
                                    placeholder="https://revolut.me/..."
                                    defaultValue={venue.revolut_link || ''}
                                    disabled={loading}
                                    onBlur={(e) => {
                                        if (e.target.value !== venue.revolut_link) {
                                            handleSave({ revolut_link: e.target.value })
                                        }
                                    }}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Customers will be redirected to this link to pay via Revolut.
                                </p>
                            </div>
                        )}
                    </Card>
                </Tabs.Content>

                {/* QR CODES TAB */}
                <Tabs.Content value="qr" className="space-y-4 focus:outline-none">
                    <Card className="p-6 flex flex-col md:flex-row gap-8 items-center md:items-start">
                        <div className="bg-white p-4 rounded-xl border shadow-sm">
                            <QRCode
                                value={QR_URL}
                                size={200}
                                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                                viewBox={`0 0 256 256`}
                            />
                        </div>

                        <div className="space-y-4 flex-1">
                            <div>
                                <h3 className="text-xl font-bold flex items-center gap-2">
                                    <QrCode className="h-5 w-5" />
                                    Entry QR Code
                                </h3>
                                <p className="text-muted-foreground mt-1">
                                    This is your venue's unique entry point. Print this QR code and place it on your tables.
                                </p>
                            </div>

                            <div className="p-3 bg-muted rounded-lg font-mono text-xs break-all select-all">
                                {QR_URL}
                            </div>

                            <div className="flex gap-3 pt-2">
                                <Button onClick={() => {
                                    // Basic download implementation
                                    const svg = document.querySelector('svg');
                                    if (svg) {
                                        const svgData = new XMLSerializer().serializeToString(svg);
                                        const canvas = document.createElement("canvas");
                                        const ctx = canvas.getContext("2d");
                                        const img = new Image();
                                        img.onload = () => {
                                            canvas.width = img.width;
                                            canvas.height = img.height;
                                            ctx?.drawImage(img, 0, 0);
                                            const pngFile = canvas.toDataURL("image/png");
                                            const downloadLink = document.createElement("a");
                                            downloadLink.download = `${venue.slug}-qr.png`;
                                            downloadLink.href = pngFile;
                                            downloadLink.click();
                                        };
                                        img.src = "data:image/svg+xml;base64," + btoa(svgData);
                                    }
                                }}>
                                    <Download className="h-4 w-4 mr-2" />
                                    Download PNG
                                </Button>
                                <Button variant="outline" onClick={() => {
                                    if (navigator.share) {
                                        navigator.share({
                                            title: venue.name,
                                            text: `Check out our menu at ${venue.name}`,
                                            url: QR_URL
                                        })
                                    } else {
                                        navigator.clipboard.writeText(QR_URL)
                                        toast.success('Link copied!')
                                    }
                                }}>
                                    <Share2 className="h-4 w-4 mr-2" />
                                    Share Link
                                </Button>
                            </div>
                        </div>
                    </Card>
                </Tabs.Content>
            </Tabs.Root>
        </div>
    )
}
