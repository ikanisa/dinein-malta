import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, Button, Input } from '@dinein/ui'
import { MenuItem } from '@dinein/db'
import { Loader2 } from 'lucide-react'
import * as SwitchPrimitive from '@radix-ui/react-switch'

interface ItemModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- flexible item data
    onSubmit: (item: any) => Promise<void>
    initialData?: MenuItem
    categoryId?: string
}

export function ItemModal({ open, onOpenChange, onSubmit, initialData, categoryId }: ItemModalProps) {
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [price, setPrice] = useState('')
    const [currency, setCurrency] = useState<'RWF' | 'EUR'>('RWF')
    const [available, setAvailable] = useState(true)
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        if (open) {
            if (initialData) {
                setName(initialData.name)
                setDescription(initialData.description || '')
                setPrice(initialData.price.toString())
                setCurrency(initialData.currency)
                setAvailable(initialData.available)
            } else {
                setName('')
                setDescription('')
                setPrice('')
                setCurrency('RWF')
                setAvailable(true)
            }
        }
    }, [open, initialData])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!name.trim() || !price || !categoryId) return

        setSubmitting(true)
        try {
            await onSubmit({
                name,
                description: description || null,
                price: parseFloat(price),
                currency,
                available,
                category_id: categoryId
            })
            onOpenChange(false)
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{initialData ? 'Edit Item' : 'Add Item'}</DialogTitle>
                    <DialogDescription>
                        {initialData ? 'Update item details.' : 'Add a new item to this category.'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    {/* Name */}
                    <div className="space-y-2">
                        <label htmlFor="item-name" className="text-sm font-medium">Name</label>
                        <Input id="item-name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Samosas" />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <label htmlFor="item-description" className="text-sm font-medium">Description</label>
                        <Input id="item-description" value={description} onChange={e => setDescription(e.target.value)} placeholder="Ingredients, etc." />
                    </div>

                    {/* Price & Currency */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-2 space-y-2">
                            <label htmlFor="item-price" className="text-sm font-medium">Price</label>
                            <Input
                                id="item-price"
                                type="number"
                                value={price}
                                onChange={e => setPrice(e.target.value)}
                                placeholder="0.00"
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="item-currency" className="text-sm font-medium">Currency</label>
                            <div className="relative">
                                {/* Simple Native Select for prototype speed & reliability on mobile */}
                                <select
                                    id="item-currency"
                                    className="flex h-12 w-full items-center justify-between rounded-xl border border-input/60 bg-white/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    value={currency}
                                    onChange={(e) => setCurrency(e.target.value as 'RWF' | 'EUR')}
                                >
                                    <option value="RWF">RWF</option>
                                    <option value="EUR">EUR</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Availability Switch */}
                    <div className="flex items-center justify-between space-x-2 pt-2">
                        <label htmlFor="item-available" className="text-sm font-medium">Available</label>
                        <SwitchPrimitive.Root
                            id="item-available"
                            checked={available}
                            onCheckedChange={setAvailable}
                            className="peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-indigo-600 data-[state=unchecked]:bg-slate-200 dark:data-[state=unchecked]:bg-slate-700"
                        >
                            <SwitchPrimitive.Thumb className="pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0" />
                        </SwitchPrimitive.Root>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={!name.trim() || !price || submitting}>
                            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {initialData ? 'Save Changes' : 'Add Item'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
