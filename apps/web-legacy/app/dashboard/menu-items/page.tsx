import { Button } from "@/components/ui/button"
import { MenuUploadDialog } from "@/components/dashboard/MenuUploadDialog"

export default function MenuItemsManagementPage() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Menu Items</h1>
                <div className="flex gap-2">
                    <MenuUploadDialog />
                    <Button>Add Manually</Button>
                </div>
            </div>
            <div className="border rounded-lg p-8 text-center text-muted-foreground">
                Menu Item management interface.
            </div>
        </div>
    )
}
