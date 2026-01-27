import { useState, useMemo, useEffect } from 'react'
import { Plus, Edit2, Trash2, GripVertical, AlertTriangle } from 'lucide-react'
import { Button, Card, Badge } from '@dinein/ui'
import { useOwner } from '../context/OwnerContext'
import { useCategories } from '../hooks/useCategories'
import { useMenuItems } from '../hooks/useMenuItems'
import { CategoryModal } from '../components/menu/CategoryModal'
import { ItemModal } from '../components/menu/ItemModal'
import { MenuItem } from '@dinein/db'
import { toast } from 'sonner'
import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog'

export default function MenuManager() {
    const { venue } = useOwner()
    const { categories, addCategory, deleteCategory, loading: loadingCat } = useCategories()
    const { items, addItem, updateItem, deleteItem, loading: loadingItems } = useMenuItems()

    // UI State
    const [activeCategory, setActiveCategory] = useState<string | undefined>()
    const [isCatModalOpen, setIsCatModalOpen] = useState(false)
    const [itemModal, setItemModal] = useState<{ open: boolean, item?: MenuItem }>({ open: false })
    const [deleteModal, setDeleteModal] = useState<{ open: boolean, type: 'category' | 'item', id?: string, name?: string }>({ open: false, type: 'item' })

    // Initialize active category using useEffect (not useMemo)
    useEffect(() => {
        if (!activeCategory && categories.length > 0) {
            // eslint-disable-next-line react-hooks/set-state-in-effect -- initialization pattern
            setActiveCategory(categories[0].id)
        }
    }, [categories, activeCategory])

    const filteredItems = useMemo(() => {
        return items.filter(i => i.category_id === activeCategory)
    }, [items, activeCategory])

    if (!venue) return null

    const handleDelete = async () => {
        if (!deleteModal.id) return
        try {
            if (deleteModal.type === 'category') {
                await deleteCategory(deleteModal.id)
                if (activeCategory === deleteModal.id) {
                    setActiveCategory(undefined)
                }
            } else {
                await deleteItem(deleteModal.id)
            }
            setDeleteModal({ ...deleteModal, open: false })
        } catch {
            // Toast handled in hooks
        }
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Menu Manager</h1>
                    <p className="text-muted-foreground">Manage categories and items.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => toast.info('OCR Import coming soon!')}>Import OCR</Button>
                    <Button onClick={() => {
                        if (!activeCategory) {
                            if (categories.length === 0) toast.error('Create a category first!')
                            else setActiveCategory(categories[0].id)
                            // If still no category and length > 0, set it? or just fail if really 0
                            if (categories.length > 0) setItemModal({ open: true })
                            return
                        }
                        setItemModal({ open: true })
                    }}>Add Item</Button>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Categories Sidebar */}
                <Card className="p-4 h-fit space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="font-semibold">Categories</h3>
                        <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setIsCatModalOpen(true)}>
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>

                    {loadingCat ? (
                        <div className="space-y-2">
                            {[1, 2, 3].map(i => <div key={i} className="h-8 bg-muted rounded animate-pulse" />)}
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {categories.map(cat => (
                                <button
                                    type="button"
                                    key={cat.id}
                                    className={`group flex items-center justify-between p-2 rounded-md text-sm transition-colors w-full text-left ${activeCategory === cat.id ? 'bg-secondary font-medium' : 'hover:bg-muted'}`}
                                    onClick={() => setActiveCategory(cat.id)}
                                >
                                    <span>{cat.name}</span>
                                    <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            type="button"
                                            className="p-1 hover:text-destructive transition-colors"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                setDeleteModal({ open: true, type: 'category', id: cat.id, name: cat.name })
                                            }}
                                            aria-label={`Delete ${cat.name}`}
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </button>
                                        <GripVertical className="h-3 w-3 text-muted-foreground opacity-50 ml-1" aria-hidden="true" />
                                    </div>
                                </button>
                            ))}
                            {categories.length === 0 && (
                                <div className="text-sm text-muted-foreground text-center py-4 italic">
                                    No categories yet.
                                </div>
                            )}
                        </div>
                    )}
                </Card>

                {/* Items Grid */}
                <div className="md:col-span-3 space-y-4">
                    {loadingItems ? (
                        <div className="space-y-4">
                            {[1, 2].map(i => <div key={i} className="h-24 bg-muted rounded-xl animate-pulse" />)}
                        </div>
                    ) : categories.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-xl flex flex-col items-center">
                            <AlertTriangle className="h-8 w-8 mb-2 opacity-50" />
                            Create a category to get started.
                            <Button variant="link" onClick={() => setIsCatModalOpen(true)}>Add Category</Button>
                        </div>
                    ) : (
                        <>
                            {filteredItems.map(item => (
                                <Card key={item.id} className="flex items-center p-4 gap-4 transition-all hover:shadow-md">
                                    <div className="h-12 w-12 rounded bg-muted flex items-center justify-center text-xs text-muted-foreground shrink-0 overflow-hidden">
                                        {item.image_url ? (
                                            <img src={item.image_url} alt={item.name} className="h-full w-full object-cover" />
                                        ) : 'Img'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold truncate">{item.name}</span>
                                            <Badge variant={item.available ? "outline" : "secondary"}>
                                                {item.available ? 'Active' : 'Sold Out'}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground line-clamp-1">{item.description}</p>
                                    </div>
                                    <div className="text-right font-medium mr-4 whitespace-nowrap">
                                        {item.currency} {item.price.toLocaleString()}
                                    </div>
                                    <div className="flex gap-1">
                                        <Button size="icon" variant="ghost" onClick={() => setItemModal({ open: true, item })}><Edit2 className="h-4 w-4" /></Button>
                                        <Button size="icon" variant="ghost" className="text-destructive" onClick={() => setDeleteModal({ open: true, type: 'item', id: item.id, name: item.name })}><Trash2 className="h-4 w-4" /></Button>
                                    </div>
                                </Card>
                            ))}
                            {filteredItems.length === 0 && (
                                <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-xl">
                                    No items in this category.
                                    <br />
                                    <Button variant="link" className="mt-2" onClick={() => setItemModal({ open: true })}>Add first item</Button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Modals */}
            <CategoryModal
                open={isCatModalOpen}
                onOpenChange={setIsCatModalOpen}
                onSubmit={addCategory}
            />

            <ItemModal
                open={itemModal.open}
                onOpenChange={(open) => setItemModal(prev => ({ ...prev, open }))}
                onSubmit={async (data) => {
                    if (itemModal.item) {
                        await updateItem(itemModal.item.id, data)
                    } else {
                        await addItem(data)
                    }
                }}
                initialData={itemModal.item}
                categoryId={activeCategory}
            />

            {/* Simple Delete Confirmation using Radix primitives directly for speed/customization if simpler than Shared Dialog */}
            <AlertDialogPrimitive.Root open={deleteModal.open} onOpenChange={(o) => setDeleteModal(prev => ({ ...prev, open: o }))}>
                <AlertDialogPrimitive.Portal>
                    <AlertDialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-in fade-in-0" />
                    <AlertDialogPrimitive.Content className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 animate-in fade-in-0 zoom-in-95 rounded-xl sm:rounded-2xl">
                        <div className="flex flex-col space-y-2 text-center sm:text-left">
                            <AlertDialogPrimitive.Title className="text-lg font-semibold text-foreground">
                                Delete {deleteModal.type === 'category' ? 'Category' : 'Item'}?
                            </AlertDialogPrimitive.Title>
                            <AlertDialogPrimitive.Description className="text-sm text-muted-foreground">
                                Are you sure you want to delete <span className="font-bold text-foreground">{deleteModal.name}</span>? This action cannot be undone.
                            </AlertDialogPrimitive.Description>
                        </div>
                        <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
                            <AlertDialogPrimitive.Cancel asChild>
                                <Button variant="ghost">Cancel</Button>
                            </AlertDialogPrimitive.Cancel>
                            <AlertDialogPrimitive.Action asChild>
                                <Button variant="destructive" onClick={handleDelete}>Delete</Button>
                            </AlertDialogPrimitive.Action>
                        </div>
                    </AlertDialogPrimitive.Content>
                </AlertDialogPrimitive.Portal>
            </AlertDialogPrimitive.Root>
        </div>
    )
}
