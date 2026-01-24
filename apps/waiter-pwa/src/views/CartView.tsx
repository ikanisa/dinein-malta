import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { childLogger } from '@easymo/commons'

const log = childLogger({ service: 'waiter-pwa', module: 'CartView' })

export function CartView() {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const { items, total, itemCount, updateQuantity, removeItem, clearCart } = useCart()

    const handleCheckout = () => {
        if (items.length === 0) return

        log.info({ event: 'CHECKOUT_INITIATED', itemCount, total })
        navigate('/payment')
    }

    if (items.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <header className="bg-white shadow-sm px-4 py-3 flex items-center">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(-1)}
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <h1 className="text-lg font-semibold ml-3">{t('cart.title')}</h1>
                </header>

                <div className="flex-1 flex flex-col items-center justify-center p-4">
                    <ShoppingBag className="h-16 w-16 text-gray-300 mb-4" />
                    <p className="text-gray-500 text-center mb-6">{t('cart.empty')}</p>
                    <Button onClick={() => navigate('/menu')}>
                        {t('menu.title')}
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <header className="bg-white shadow-sm px-4 py-3 flex items-center justify-between">
                <div className="flex items-center">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(-1)}
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <h1 className="text-lg font-semibold ml-3">{t('cart.title')}</h1>
                </div>

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                        clearCart()
                        log.info({ event: 'CART_CLEARED' })
                    }}
                >
                    {t('cart.clearCart')}
                </Button>
            </header>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {items.map((item) => (
                    <Card key={item.id}>
                        <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <h3 className="font-medium">{item.name}</h3>
                                    {item.description && (
                                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                                            {item.description}
                                        </p>
                                    )}
                                    <p className="font-semibold mt-2">
                                        ${item.price.toFixed(2)} × {item.quantity} = ${(item.price * item.quantity).toFixed(2)}
                                    </p>
                                </div>

                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="ml-2"
                                    onClick={() => {
                                        removeItem(item.id)
                                        log.info({ event: 'ITEM_REMOVED', itemId: item.id })
                                    }}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>

                            <div className="flex items-center gap-2 mt-3">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                    disabled={item.quantity <= 1}
                                >
                                    <Minus className="h-3 w-3" />
                                </Button>

                                <span className="w-12 text-center font-medium">{item.quantity}</span>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                >
                                    <Plus className="h-3 w-3" />
                                </Button>
                            </div>

                            {item.options && Object.keys(item.options).length > 0 && (
                                <div className="flex gap-1 mt-2">
                                    {Object.entries(item.options).map(([key, value]) => (
                                        <Badge key={key} variant="secondary" className="text-xs">
                                            {key}: {value}
                                        </Badge>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Footer with Total and Checkout */}
            <div className="bg-white border-t p-4 space-y-3">
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500">{t('cart.items', { count: itemCount })}</span>
                        <span className="text-gray-500">{t('cart.subtotal')}</span>
                    </div>
                    <div className="flex justify-between text-lg font-semibold">
                        <span>{t('cart.total')}</span>
                        <span>${total.toFixed(2)}</span>
                    </div>
                </div>

                <Button
                    onClick={handleCheckout}
                    className="w-full"
                    size="lg"
                    disabled={items.length === 0}
                >
                    {t('cart.checkout')}
                </Button>
            </div>
        </div>
    )
}
