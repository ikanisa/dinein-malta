import { useState, useRef, useEffect } from 'react'
import { BottomSheet, Button, Input } from '@dinein/ui'
import { QrCode, ArrowRight } from 'lucide-react'

interface TableNumberSheetProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: (tableNo: string) => void
    onScanQr?: () => void
    initialValue?: string
}

export function TableNumberSheet({
    isOpen,
    onClose,
    onConfirm,
    onScanQr,
    initialValue = ''
}: TableNumberSheetProps) {
    const [tableNo, setTableNo] = useState(initialValue)
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (isOpen) {
            // Small timeout to ensure sheet animation doesn't interfere with focus
            const timer = setTimeout(() => {
                inputRef.current?.focus()
            }, 100)
            return () => clearTimeout(timer)
        }
    }, [isOpen])

    const handleSubmit = (e?: React.FormEvent) => {
        e?.preventDefault()
        if (tableNo.trim()) {
            onConfirm(tableNo.trim())
            onClose()
        }
    }

    return (
        <BottomSheet
            isOpen={isOpen}
            onClose={onClose}
            title="Where are you sitting?"
        >
            <form onSubmit={handleSubmit} className="space-y-6 pt-2 pb-6">
                <div className="text-center space-y-2">
                    <p className="text-muted-foreground text-sm">
                        Enter your table number to start ordering.
                    </p>
                </div>

                <div className="flex justify-center">
                    <Input
                        ref={inputRef}
                        type="number"
                        inputMode="numeric"
                        placeholder="12"
                        className="text-center text-4xl w-32 h-20 rounded-2xl border-2 border-primary/20 focus:border-primary bg-secondary/50"
                        value={tableNo}
                        onChange={(e) => setTableNo(e.target.value)}
                    />
                </div>

                <div className="space-y-3">
                    <Button
                        type="submit"
                        size="lg"
                        className="w-full text-lg h-14 rounded-xl font-bold bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                        disabled={!tableNo.trim()}
                    >
                        Confirm Table {tableNo ? `#${tableNo}` : ''}
                        <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>

                    {onScanQr && (
                        <div className="relative flex py-2 items-center">
                            <div className="flex-grow border-t border-border"></div>
                            <span className="flex-shrink mx-4 text-muted-foreground text-xs">OR</span>
                            <div className="flex-grow border-t border-border"></div>
                        </div>
                    )}

                    {onScanQr && (
                        <Button
                            type="button"
                            variant="outline"
                            size="lg"
                            className="w-full h-12 rounded-xl text-muted-foreground border-dashed"
                            onClick={onScanQr}
                        >
                            <QrCode className="mr-2 w-5 h-5" />
                            Scan QR Code
                        </Button>
                    )}
                </div>
            </form>
        </BottomSheet>
    )
}
