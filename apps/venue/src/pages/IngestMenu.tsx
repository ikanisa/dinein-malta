import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button, Card, Badge, Input, Skeleton } from '@dinein/ui'
import {
    getIngestJob,
    getStagingItems,
    updateStagingItemAction,
    publishApprovedItems,
    IngestJob,
    IngestStagingItem
} from '@dinein/db'
import { supabase } from '../shared/services/supabase'
import { useOwner } from '../context/OwnerContext'
import { ArrowLeft, Check, X, Loader2, Save, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'

export default function IngestMenu() {
    const { jobId } = useParams<{ jobId: string }>()
    const navigate = useNavigate()
    const { venue } = useOwner()

    const [job, setJob] = useState<IngestJob | null>(null)
    const [items, setItems] = useState<IngestStagingItem[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isPublishing, setIsPublishing] = useState(false)
    const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set())

    // Fetch job and staging items
    const fetchData = useCallback(async () => {
        if (!jobId) return

        try {
            const fetchedJob = await getIngestJob(supabase, jobId)
            if (fetchedJob) {
                setJob(fetchedJob)

                if (fetchedJob.status === 'needs_review') {
                    const stagingItems = await getStagingItems(supabase, jobId)
                    setItems(stagingItems)
                }
            }
        } catch (error) {
            console.error('Error fetching ingest data:', error)
            toast.error('Failed to load job data')
        } finally {
            setIsLoading(false)
        }
    }, [jobId])

    // Initial fetch and polling for processing jobs
    useEffect(() => {
        fetchData()

        // Poll every 2s while job is processing
        const interval = setInterval(() => {
            if (job?.status === 'pending' || job?.status === 'running') {
                fetchData()
            } else {
                clearInterval(interval)
            }
        }, 2000)

        return () => clearInterval(interval)
    }, [fetchData, job?.status])

    const handleApprove = async (itemId: string) => {
        setUpdatingItems(prev => new Set(prev).add(itemId))

        const result = await updateStagingItemAction(supabase, itemId, 'keep')
        if (result) {
            setItems(prev => prev.map(i => i.id === itemId ? { ...i, suggested_action: 'keep' } : i))
            toast.success('Item kept')
        } else {
            toast.error('Failed to update item')
        }

        setUpdatingItems(prev => {
            const next = new Set(prev)
            next.delete(itemId)
            return next
        })
    }

    const handleReject = async (itemId: string) => {
        setUpdatingItems(prev => new Set(prev).add(itemId))

        const result = await updateStagingItemAction(supabase, itemId, 'drop')
        if (result) {
            setItems(prev => prev.map(i => i.id === itemId ? { ...i, suggested_action: 'drop' } : i))
            toast.success('Item removed')
        } else {
            toast.error('Failed to update item')
        }

        setUpdatingItems(prev => {
            const next = new Set(prev)
            next.delete(itemId)
            return next
        })
    }

    const handlePublish = async () => {
        if (!jobId || !venue) {
            toast.error('Missing venue context')
            return
        }

        setIsPublishing(true)

        try {
            const currency = venue.country === 'MT' ? 'EUR' : 'RWF'
            const publishedCount = await publishApprovedItems(supabase, jobId, venue.id, currency)

            if (publishedCount > 0) {
                toast.success(`Published ${publishedCount} items to menu!`)
                navigate('/dashboard/menu')
            } else {
                toast.error('No items were published')
            }
        } catch (error) {
            console.error('Publish error:', error)
            toast.error('Failed to publish items')
        } finally {
            setIsPublishing(false)
        }
    }

    // Loading state
    if (isLoading) {
        return (
            <div className="space-y-6 p-4">
                <Skeleton className="h-10 w-64" />
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <Skeleton key={i} className="h-32 w-full" />
                    ))}
                </div>
            </div>
        )
    }

    // Job not found
    if (!job) {
        return (
            <div className="p-8 text-center">
                <h2 className="text-lg font-medium text-muted-foreground">Job not found</h2>
                <Button variant="outline" onClick={() => navigate('/dashboard/menu')} className="mt-4">
                    Back to Menu
                </Button>
            </div>
        )
    }

    const approvedCount = items.filter(i => i.suggested_action !== 'drop').length

    return (
        <div className="space-y-6">
            <header className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard/menu')}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold">Review Menu Import</h1>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>Job ID: {job.id.slice(0, 8)}...</span>
                        <Badge variant="outline">{job.status}</Badge>
                    </div>
                </div>
                <Button variant="outline" size="icon" onClick={fetchData}>
                    <RefreshCw className="h-4 w-4" />
                </Button>
            </header>

            {/* Processing state */}
            {(job.status === 'pending' || job.status === 'running') && (
                <Card className="p-12 flex flex-col items-center justify-center text-center space-y-4">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <div className="space-y-1">
                        <h3 className="text-lg font-medium">
                            {job.status === 'pending' ? 'Starting OCR...' : 'Analyzing Menu Image...'}
                        </h3>
                        <p className="text-muted-foreground">
                            Gemini is extracting items, prices, and descriptions.
                        </p>
                    </div>
                </Card>
            )}

            {/* Failed state */}
            {job.status === 'failed' && (
                <Card className="p-12 flex flex-col items-center justify-center text-center space-y-4 border-destructive">
                    <X className="h-12 w-12 text-destructive" />
                    <div className="space-y-1">
                        <h3 className="text-lg font-medium">OCR Failed</h3>
                        <p className="text-muted-foreground">
                            The menu image could not be processed. Try uploading a clearer image.
                        </p>
                    </div>
                    <Button onClick={() => navigate('/dashboard/menu')}>Back to Menu</Button>
                </Card>
            )}

            {/* Completed - show items for review */}
            {(job.status === 'needs_review' || job.status === 'published') && (
                <div className="space-y-4">
                    {items.length === 0 ? (
                        <Card className="p-8 text-center">
                            <p className="text-muted-foreground">No items extracted from this image.</p>
                        </Card>
                    ) : (
                        items.map(item => (
                            <Card
                                key={item.id}
                                className={`p-4 transition-colors ${item.suggested_action === 'drop' ? 'opacity-50 bg-muted' : ''
                                    } ${item.suggested_action === 'keep' ? 'border-green-500/50 bg-green-500/5' : ''
                                    }`}
                            >
                                <div className="flex flex-col md:flex-row gap-4">
                                    {/* Fields */}
                                    <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                                        <div className="md:col-span-1">
                                            <label htmlFor={`category-${item.id}`} className="text-xs font-medium text-muted-foreground">
                                                Category
                                            </label>
                                            <Input id={`category-${item.id}`} defaultValue={item.raw_category ?? ''} className="h-8" />
                                        </div>
                                        <div className="md:col-span-1">
                                            <label htmlFor={`name-${item.id}`} className="text-xs font-medium text-muted-foreground">
                                                Item Name
                                            </label>
                                            <Input id={`name-${item.id}`} defaultValue={item.name} className="h-8 font-medium" />
                                        </div>
                                        <div className="md:col-span-1">
                                            <label htmlFor={`price-${item.id}`} className="text-xs font-medium text-muted-foreground">
                                                Price
                                            </label>
                                            <Input id={`price-${item.id}`} defaultValue={(item.price ?? 0).toString()} className="h-8" />
                                        </div>
                                        <div className="md:col-span-1">
                                            <span className="text-xs font-medium text-muted-foreground block">Confidence</span>
                                            <div className={`text-sm py-1.5 ${item.confidence > 0.8 ? 'text-green-600' : 'text-yellow-600'}`}>
                                                {(item.confidence * 100).toFixed(0)}%
                                            </div>
                                        </div>
                                        <div className="md:col-span-4">
                                            <label htmlFor={`description-${item.id}`} className="text-xs font-medium text-muted-foreground">
                                                Description
                                            </label>
                                            <Input id={`description-${item.id}`} defaultValue={item.description ?? ''} className="h-8" />
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex flex-col justify-center gap-2 border-l pl-4">
                                        {item.suggested_action !== 'keep' && (
                                            <Button
                                                size="sm"
                                                className="bg-green-600 hover:bg-green-700 w-full"
                                                onClick={() => handleApprove(item.id)}
                                                disabled={updatingItems.has(item.id)}
                                            >
                                                {updatingItems.has(item.id) ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Check className="h-4 w-4" />
                                                )}
                                            </Button>
                                        )}
                                        {item.suggested_action !== 'drop' && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="text-destructive w-full"
                                                onClick={() => handleReject(item.id)}
                                                disabled={updatingItems.has(item.id)}
                                            >
                                                {updatingItems.has(item.id) ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <X className="h-4 w-4" />
                                                )}
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        ))
                    )}

                    {/* Floating publish button */}
                    {items.length > 0 && (
                        <div className="fixed bottom-6 right-6 flex gap-4">
                            <div className="bg-background border shadow-lg rounded-lg p-4 flex items-center gap-4">
                                <div className="text-sm">
                                    <strong>{approvedCount}</strong> items approved
                                </div>
                                <Button
                                    onClick={handlePublish}
                                    disabled={isPublishing || approvedCount === 0}
                                >
                                    {isPublishing ? (
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    ) : (
                                        <Save className="h-4 w-4 mr-2" />
                                    )}
                                    Publish to Menu
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
