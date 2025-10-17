import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useEffect, useState } from 'react'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { useAddItemsToList, useCreateUserList, useRenameList, useUserListItems, useUserLists } from '@/queries/saved-lists'
import { useAuth } from '@/hooks/useAuth'
import { useChatStore } from '@/store/chatStore'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { useParams } from 'next/navigation'
import { normalizeListType } from '@/utils/normalizeListData'
import { useAuthStore } from '@/store/authStore'


export function CreateNewList({
    children,
    onConfirm,
}: {
    children: React.ReactNode
    onConfirm?: () => void
}) {
    const { id } = useParams()
    const [open, setOpen] = useState(false)
    const [listType, setListType] = useState('company')
    const [name, setName] = useState('')
    const { user } = useAuthStore()
    const { mutate: createUserList, isPending } = useCreateUserList()

    // console.log(activeList)
    const handleSubmit = () => {
        if (name.trim()?.length < 4) {
            toast.error('List name must be at least 4 characters long.')
            return
        }

        createUserList(
            {
                userId: user?.user_id || '',
                data: {
                    list_name: name,
                    list_type: listType,
                    webset_item_ids: [],
                },
                type: 'manual'
            },
            {
                onSuccess: () => {
                    toast.success('List created successfully.')
                    setOpen(false)
                    setName('')
                    onConfirm?.()
                },
                onError: () => {
                    toast.error('Failed to create list.')
                },
            }
        )
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <form>
                <DialogTrigger asChild>{children}</DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader className="gap-0">
                        <DialogTitle className="text-base">Create New List</DialogTitle>
                        <DialogDescription className="text-xs">
                            Create a new list to add selected items.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4">
                        <div className="grid gap-3">
                            <Label>List Name</Label>
                            <Input
                                id="name"
                                name="name"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                placeholder="Enter list name"
                            />
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="name-1">List Type</Label>
                            <Select value={listType} onValueChange={v => setListType(normalizeListType(v))}>
                                <SelectTrigger className="w-full border-foreground/70">
                                    <SelectValue placeholder="Select list type" />
                                </SelectTrigger>
                                <SelectContent className="z-60 max-h-40">
                                    <SelectItem value="company">Company List</SelectItem>
                                    <SelectItem value="investor">Investor List</SelectItem>
                                    <SelectItem value="people">People List</SelectItem>
                                    <SelectItem value="transaction">Transaction List</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button type="submit" onClick={handleSubmit} disabled={isPending}>
                            {isPending && <Loader2 className="animate-spin" />} Submit
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </form>
        </Dialog>
    )
}

