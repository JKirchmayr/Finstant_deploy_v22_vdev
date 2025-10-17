'use client'

import { useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { Loader2, MoreVertical } from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { useAuthStore } from '@/store/authStore'
import { useRenameList, useUpdateUserList, useUpdateUserListsBulk, useUserListItems, useUserLists } from '@/queries/saved-lists'
import { useQueryClient } from '@tanstack/react-query'

// ✅ Actions dropdown
export default function ActionsBlock({ list_id, name }: { list_id: string; name: string }) {
    const [open, setOpen] = useState(false)
    const [openRename, setOpenRename] = useState(false)
    const [openDelete, setOpenDelete] = useState(false)
    const { user } = useAuthStore()
    const { mutate: archiveList } = useUpdateUserListsBulk()
    const queryClient = useQueryClient()
    const searchParams = useSearchParams()
    const status = (searchParams.get('status') || 'active') as 'active' | 'archived'

    const handleArchive = () => {
        archiveList(
            {
                userId: user?.user_id || '',
                action: status === 'active' ? 'archive' : 'reactivate',
                saved_list_ids: [list_id],
            },
            {
                onSuccess: () => {
                    queryClient.invalidateQueries({ queryKey: ['userLists'] })
                },
            }
        )
    }

    return (
        <>
            {/* Dropdown menu */}
            <DropdownMenu open={open} onOpenChange={setOpen}>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end">
                    <DropdownMenuItem
                        onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            setOpen(false)
                            setTimeout(() => setOpenRename(true), 50) // wait for dropdown to unmount
                        }}
                    >
                        Rename
                    </DropdownMenuItem>

                    <DropdownMenuItem
                        onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            handleArchive()
                        }}
                    >
                        {status === 'active' ? "Archive" : "Unarchive"}
                    </DropdownMenuItem>

                    <DropdownMenuItem
                        className="text-red-500 hover:text-red-500"
                        onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            setOpen(false)
                            setTimeout(() => setOpenDelete(true), 50)
                        }}
                    >
                        Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Render dialogs outside Dropdown */}
            <RenameList list_id={list_id} open={openRename} setOpen={setOpenRename} />
            <DeleteList list_id={list_id} name={name} open={openDelete} setOpen={setOpenDelete} />
        </>
    )
}


export function RenameList({
    list_id,
    open,
    setOpen,
}: {
    list_id: string
    open: boolean
    setOpen: (open: boolean) => void
}) {
    const [name, setName] = useState('')
    const { user } = useAuthStore()
    const { mutate: renameList, isPending } = useRenameList()
    const queryClient = useQueryClient()

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (name.trim().length < 4) {
            toast.error('List name must be at least 4 characters long.')
            return
        }

        renameList(
            { userId: user?.user_id || '', list_id, name },
            {
                onSuccess: () => {
                    queryClient.invalidateQueries({ queryKey: ['userLists'] })
                    setOpen(false)
                },
            }
        )
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Rename List</DialogTitle>
                        <DialogDescription>Rename selected list</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-2">
                        <Label htmlFor="name">New List Name</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter new name"
                        />
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button type="submit" disabled={isPending}>
                            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Submit
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

export function DeleteList({
    list_id,
    name,
    open,
    setOpen,
}: {
    list_id: string
    name: string
    open: boolean
    setOpen: (open: boolean) => void
}) {
    const { user } = useAuthStore()
    const { mutate: deleteList, isPending } = useUpdateUserListsBulk()
    const queryClient = useQueryClient()

    const handleDelete = () => {
        deleteList(
            { userId: user?.user_id || '', action: 'delete', saved_list_ids: [list_id] },
            {
                onSuccess: () => {
                    queryClient.invalidateQueries({ queryKey: ['userLists'] })
                    setOpen(false)
                    toast.success(`"${name}" deleted successfully!`)
                },
            }
        )
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                    <DialogTitle>Delete List</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete <b>{name}</b>? This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={isPending}
                    >
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Delete
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
