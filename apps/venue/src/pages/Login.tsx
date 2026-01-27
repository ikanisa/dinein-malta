import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Input, Card } from '@dinein/ui'
import { useOwner } from '../context/OwnerContext'
import { ChefHat } from 'lucide-react'

export default function Login() {
    const [email, setEmail] = useState('')
    const [pincode, setPincode] = useState('')
    const [error, setError] = useState('')
    const { login } = useOwner()
    const navigate = useNavigate()
    const [isLoading, setIsLoading] = useState(false)

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setIsLoading(true)
        try {
            await login(email, pincode)
            navigate('/dashboard')
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Login failed')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4" data-testid="venue-login:page">
            <Card className="w-full max-w-md p-8 shadow-xl">
                <div className="mb-8 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                        <ChefHat className="h-8 w-8 text-primary" />
                    </div>
                    <h1 className="text-2xl font-bold">Venue Portal</h1>
                    <p className="text-sm text-muted-foreground">Manage your venue and orders</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                        <label htmlFor="login-email" className="text-sm font-medium">Email Address</label>
                        <Input
                            id="login-email"
                            type="email"
                            placeholder="owner@venue.com"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                            data-testid="venue-login:email"
                        />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="login-password" className="text-sm font-medium">Password</label>
                        <Input
                            id="login-password"
                            type="password"
                            placeholder="Enter password"
                            value={pincode}
                            onChange={e => setPincode(e.target.value)}
                            required
                            data-testid="venue-login:pin"
                        />
                    </div>

                    {error && (
                        <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
                            {error}
                        </div>
                    )}

                    <Button type="submit" className="w-full" size="lg" loading={isLoading} data-testid="venue-login:submit">
                        Sign In
                    </Button>

                    <div className="mt-4 text-center text-xs text-muted-foreground">
                        <p>Demo accounts:</p>
                        <p>owner@kigali.com (1234)</p>
                        <p>owner@valletta.com (5678)</p>
                    </div>

                    <div className="mt-8 text-center pt-4 border-t">
                        <p className="text-sm text-muted-foreground mb-2">Own a venue?</p>
                        <Button variant="outline" className="w-full" type="button" onClick={() => navigate('/claim')}>
                            Claim your Business
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    )
}
