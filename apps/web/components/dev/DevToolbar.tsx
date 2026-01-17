'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Card } from '@/components/ui/card'
import { Shield, User, Settings, Minimize2, Maximize2, LogOut, Save } from 'lucide-react'
import { useRouter } from 'next/navigation'

type Role = 'client' | 'manager' | 'admin'

interface RoleCredentials {
    email: string
    password: string
}

export function DevToolbar() {
    const [isOpen, setIsOpen] = useState(false)
    const [isConfigOpen, setIsConfigOpen] = useState(false)
    const [currentUser, setCurrentUser] = useState<any>(null)
    const [loading, setLoading] = useState(false)
    const [creds, setCreds] = useState<Record<Role, RoleCredentials>>({
        client: { email: '', password: '' },
        manager: { email: '', password: '' },
        admin: { email: '', password: '' },
    })

    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        // Load creds from local storage
        const loadedCreds = { ...creds }
        let hasSaved = false
            ; (['client', 'manager', 'admin'] as Role[]).forEach((role) => {
                const saved = localStorage.getItem(`dev_creds_${role}`)
                if (saved) {
                    try {
                        loadedCreds[role] = JSON.parse(saved)
                        hasSaved = true
                    } catch (e) {
                        console.error('Failed to parse saved creds', e)
                    }
                }
            })
        if (hasSaved) {
            setCreds(loadedCreds)
        }

        // Check current user
        supabase.auth.getUser().then(({ data }) => {
            setCurrentUser(data.user)
        })

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setCurrentUser(session?.user ?? null)
        })

        return () => {
            subscription.unsubscribe()
        }
    }, [])

    const handleSaveCreds = () => {
        ; (Object.keys(creds) as Role[]).forEach((role) => {
            localStorage.setItem(`dev_creds_${role}`, JSON.stringify(creds[role]))
        })
        setIsConfigOpen(false)
    }

    const handleRoleSwitch = async (role: Role) => {
        const roleCreds = creds[role]
        if (!roleCreds.email || !roleCreds.password) {
            alert(`No credentials saved for ${role}. Please configure them first.`)
            setIsConfigOpen(true)
            return
        }

        setLoading(true)
        try {
            await supabase.auth.signOut()
            const { error } = await supabase.auth.signInWithPassword({
                email: roleCreds.email,
                password: roleCreds.password,
            })
            if (error) throw error
            router.refresh()
        } catch (error: any) {
            alert(`Login failed: ${error.message}`)
        } finally {
            setLoading(false)
        }
    }

    const handleLogout = async () => {
        setLoading(true)
        await supabase.auth.signOut()
        router.refresh()
        setLoading(false)
    }

    if (!isOpen) {
        return (
            <Button
                variant="destructive"
                size="icon"
                className="fixed bottom-4 right-4 z-50 rounded-full shadow-lg hover:shadow-xl transition-all"
                onClick={() => setIsOpen(true)}
                title="Open Dev Toolbar"
            >
                <div className="flex h-10 w-10 items-center justify-center font-bold text-xs ring-2 ring-background">DEV</div>
            </Button>
        )
    }

    return (
        <Card className="fixed bottom-4 right-4 z-50 w-72 p-4 shadow-2xl bg-background/95 backdrop-blur border-destructive/20 animate-in slide-in-from-bottom-5">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-destructive" />
                    <span className="font-semibold text-sm">Dev Role Switcher</span>
                </div>
                <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsConfigOpen(true)}>
                        <Settings className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsOpen(false)}>
                        <Minimize2 className="h-3 w-3" />
                    </Button>
                </div>
            </div>

            <div className="space-y-3">
                <div className="grid grid-cols-3 gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={() => handleRoleSwitch('client')}
                        disabled={loading}
                    >
                        Client
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={() => handleRoleSwitch('manager')}
                        disabled={loading}
                    >
                        Manager
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={() => handleRoleSwitch('admin')}
                        disabled={loading}
                    >
                        Admin
                    </Button>
                </div>

                <div className="pt-2 border-t text-xs text-muted-foreground">
                    <div className="flex items-center justify-between">
                        <span className="truncate max-w-[140px]">
                            {currentUser ? currentUser.email : 'Not logged in'}
                        </span>
                        {currentUser && (
                            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={handleLogout}>
                                <LogOut className="h-3 w-3 mr-1" />
                                Logout
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            <Dialog open={isConfigOpen} onOpenChange={setIsConfigOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Configure Test Credentials</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        {(['client', 'manager', 'admin'] as Role[]).forEach && (['client', 'manager', 'admin'] as Role[]).map((role) => (
                            <div key={role} className="space-y-2">
                                <Label className="capitalize">{role} Account</Label>
                                <div className="grid grid-cols-2 gap-2">
                                    <Input
                                        placeholder="Email"
                                        value={creds[role].email}
                                        onChange={(e) =>
                                            setCreds({
                                                ...creds,
                                                [role]: { ...creds[role], email: e.target.value },
                                            })
                                        }
                                    />
                                    <Input
                                        type="password"
                                        placeholder="Password"
                                        value={creds[role].password}
                                        onChange={(e) =>
                                            setCreds({
                                                ...creds,
                                                [role]: { ...creds[role], password: e.target.value },
                                            })
                                        }
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                    <Button onClick={handleSaveCreds} className="w-full">
                        <Save className="h-4 w-4 mr-2" />
                        Save Credentials
                    </Button>
                </DialogContent>
            </Dialog>
        </Card>
    )
}
