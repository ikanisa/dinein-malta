import { Button } from "@/components/ui/button"

export default function VenuesManagementPage() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Venues</h1>
                <Button>Add New Venue</Button>
            </div>
            <div className="border rounded-lg p-8 text-center text-muted-foreground">
                Venue management interface would go here.
                <br />
                (List of venues with Edit/Delete actions)
            </div>
        </div>
    )
}
