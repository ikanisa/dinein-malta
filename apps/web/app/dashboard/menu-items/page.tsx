import { Button } from "@/components/ui/button"

export default function MenuItemsManagementPage() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Menu Items</h1>
                <Button>Add Menu Item</Button>
            </div>
            <div className="border rounded-lg p-8 text-center text-muted-foreground">
                Menu Item management interface would go here.
                <br />
                (List of items with AI generation options)
            </div>
        </div>
    )
}
