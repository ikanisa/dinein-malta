import { useState } from 'react'
import { Check } from 'lucide-react'
import { Button, Bell } from '@dinein/ui'
import { useServiceRequests } from '../hooks/useServiceRequests'
import * as PopoverPrimitive from '@radix-ui/react-popover'

export function BellNotifications() {
    const { requests, resolveRequest } = useServiceRequests()
    const [open, setOpen] = useState(false)

    const hasRequests = requests.length > 0

    return (
        <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
            <PopoverPrimitive.Trigger asChild>
                <Bell hasNotifications={hasRequests} />
            </PopoverPrimitive.Trigger>
            <PopoverPrimitive.Portal>
                <PopoverPrimitive.Content
                    className="z-50 w-80 rounded-xl border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 bg-white dark:bg-slate-900"
                    sideOffset={5}
                    align="end"
                >
                    <div className="space-y-4">
                        <div className="flex items-center justify-between border-b pb-2">
                            <h4 className="font-medium leading-none">Service Requests</h4>
                            <span className="text-xs text-muted-foreground">{requests.length} pending</span>
                        </div>

                        {requests.length === 0 ? (
                            <div className="py-6 text-center text-sm text-muted-foreground">
                                No pending requests.
                            </div>
                        ) : (
                            <div className="space-y-2 max-h-[300px] overflow-y-auto">
                                {requests.map(req => (
                                    <div key={req.id} className="flex items-center justify-between p-3 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-900/50">
                                        <div>
                                            <p className="font-semibold text-sm">Table {req.table_no}</p>
                                            <p className="text-xs text-muted-foreground">Calling waiter...</p>
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-100 dark:hover:bg-green-900/30"
                                            onClick={() => resolveRequest(req.id)}
                                        >
                                            <Check className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </PopoverPrimitive.Content>
            </PopoverPrimitive.Portal>
        </PopoverPrimitive.Root>
    )
}
