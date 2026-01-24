import { useState, useEffect } from 'react'
import { Card, Badge, Button, Skeleton } from '@dinein/ui'
import { Search, Settings } from 'lucide-react'
import { Venue } from '@dinein/db'
import { supabase } from '../shared/services/supabase'

export default function Venues() {
    const [searchTerm, setSearchTerm] = useState('')
    const [venues, setVenues] = useState<Venue[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchVenues = async () => {
            setLoading(true)
            try {
                const { data, error } = await supabase
                    .from('vendors')
                    .select('*')
                    .order('name', { ascending: true })

                if (error) {
                    console.error('Error fetching venues:', error)
                    return
                }

                setVenues((data || []) as Venue[])
            } catch (error) {
                console.error('Error:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchVenues()
    }, [])

    const filteredVenues = venues.filter(v =>
        v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.country.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white">Venue Management</h1>
                    <p className="text-zinc-400">Manage all registered venues across regions.</p>
                </div>
                <Button>Add Venue</Button>
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                <input
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-md py-2 pl-10 pr-4 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-red-600"
                    placeholder="Search venues..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>

            <Card className="bg-zinc-900 border-zinc-800">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-zinc-500 border-b border-zinc-800 bg-zinc-950/50">
                            <tr>
                                <th className="px-6 py-3 font-medium">Venue Name</th>
                                <th className="px-6 py-3 font-medium">Country</th>
                                <th className="px-6 py-3 font-medium">Status</th>
                                <th className="px-6 py-3 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <>
                                    {[1, 2, 3].map(i => (
                                        <tr key={i} className="border-b border-zinc-800">
                                            <td className="px-6 py-4"><Skeleton className="h-6 w-48" /></td>
                                            <td className="px-6 py-4"><Skeleton className="h-6 w-12" /></td>
                                            <td className="px-6 py-4"><Skeleton className="h-6 w-20" /></td>
                                            <td className="px-6 py-4"><Skeleton className="h-6 w-8 ml-auto" /></td>
                                        </tr>
                                    ))}
                                </>
                            ) : (
                                filteredVenues.map((venue) => (
                                    <tr key={venue.id} className="border-b border-zinc-800 hover:bg-zinc-800/20">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-zinc-100">{venue.name}</div>
                                            <div className="text-xs text-zinc-500">{venue.slug}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant="outline" className="border-zinc-700 text-zinc-400">
                                                {venue.country}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                                                <span className="text-zinc-300">Active</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Button size="icon" variant="ghost" className="h-8 w-8 text-zinc-400 hover:text-white">
                                                <Settings className="h-4 w-4" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                    {!loading && filteredVenues.length === 0 && (
                        <div className="p-8 text-center text-zinc-500">
                            {venues.length === 0
                                ? 'No venues registered yet'
                                : `No venues found matching "${searchTerm}"`}
                        </div>
                    )}
                </div>
            </Card>
        </div>
    )
}
