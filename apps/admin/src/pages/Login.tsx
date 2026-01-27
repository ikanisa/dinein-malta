import { useState } from 'react'
import { Button, Card } from '@dinein/ui'
import { useAdmin } from '../context/AdminContext'
import { ShieldCheck } from 'lucide-react'

export default function Login() {
    const { signIn, user, loading } = useAdmin()
    const [isSubmitting, setIsSubmitting] = useState(false)

    if (user && !loading) {
        // Handled by router/layout usually
    }

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        await signIn() // signIn logic handles its own toast/errors
        setIsSubmitting(false)
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-4" data-testid="admin-login:page">
            <Card className="w-full max-w-md p-8 bg-zinc-900 border-zinc-800 text-zinc-100">
                <div className="mb-8 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
                        <ShieldCheck className="h-8 w-8 text-red-500" />
                    </div>
                    <h1 className="text-2xl font-bold">DineIn Admin</h1>
                    <p className="text-sm text-zinc-400">Restricted Access</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                        <p className="text-sm text-zinc-400 bg-zinc-800/50 p-3 rounded border border-zinc-700">
                            For security, only authorized emails can sign in.
                            <br />
                            <strong>Demo:</strong> admin@dinein.rw
                        </p>
                    </div>

                    <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white" size="lg" loading={isSubmitting} data-testid="admin-login:submit">
                        Send Magic Link
                    </Button>
                </form>
            </Card>
        </div>
    )
}
