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
import { useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAddItemsToList, useCreateUserList, useUserLists } from '@/queries/saved-lists'
import { useAuth } from '@/hooks/useAuth'
import { useChatStore } from '@/store/chatStore'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

export interface Item {
  LOGO: string
  NAME: string
  ITEM_ID: string
}

export interface SavedList {
  saved_list_id: string
  list_name: string
  list_type: 'company_list' | 'investor_list' | 'people_list' | 'transaction_list'
  list_description: string | null
  item_count: number
  created_at: string
  last_updated: string
  list_status: 'active' | 'inactive'
}

export function AddToListDialog({
  children,
  initialSelected = [],
  onConfirm,
}: {
  children: React.ReactNode
  initialSelected: Item[]
  onConfirm?: () => void
}) {
  const [open, setOpen] = useState(false)
  //   const [selected, setSelected] = useState<Item[]>(initialSelected)
  const [selectedList, setSelectedList] = useState<string>('')
  const { user } = useAuth()
  const { data } = useUserLists(user?.user_id || '', undefined, open)
  const lists = (data?.lists || []) as SavedList[]
  const { mutate: addItemsToList, isPending } = useAddItemsToList()

  const handleSubmit = () => {
    if (!selectedList) {
      toast.error('Please select a list to add')
      return
    }
    if (initialSelected.length === 0) {
      toast.error('Please select at least one item.')
      return
    }
    console.log({ selectedList }, { initialSelected })
    addItemsToList(
      {
        userId: user?.user_id || '',
        listId: selectedList,
        webset_item_ids: initialSelected.map(item => item.ITEM_ID),
      },
      {
        onSuccess: () => {
          toast.success('Items added to list successfully.')
          setOpen(false)
          onConfirm?.()
        },
        onError: data => {
          console.log(data)
          toast.error('Failed to add items to list.')
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
            <DialogTitle className="text-base">Add To List</DialogTitle>
            <DialogDescription className="">
              Add initialSelected items to this list.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-3">
              <Label htmlFor="name-1">List Name</Label>
              <Select value={selectedList} onValueChange={setSelectedList}>
                <SelectTrigger className="w-full border-foreground/70">
                  <SelectValue placeholder="Select list to add to" />
                </SelectTrigger>
                <SelectContent className="z-60 max-h-40">
                  {lists.length === 0 ? (
                    <SelectItem value="none">No list found</SelectItem>
                  ) : (
                    lists.map((item, i) => (
                      <SelectItem
                        key={item.saved_list_id}
                        value={item.saved_list_id}
                        className="cursor-pointer"
                      >
                        {item.list_name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-3 ">
              <Label>Selected Items</Label>
              <div className="grid gap-2 max-h-40 overflow-y-auto">
                {initialSelected.length === 0 ? (
                  <p>No items initialSelected.</p>
                ) : (
                  initialSelected.map(item => (
                    <ItemUi
                      key={item.ITEM_ID}
                      id={item.ITEM_ID}
                      name={item.NAME}
                      logo={item.LOGO}
                    />
                  ))
                )}
              </div>
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

export function CreateNewListDialog({
  children,
  initialSelected = [],
  onConfirm,
}: {
  children: React.ReactNode
  initialSelected: Item[]
  onConfirm?: () => void
}) {
  //   console.log(initialSelected)
  const [open, setOpen] = useState(false)
  const { activeList } = useChatStore()
  //   const [selected, setSelected] = useState<Item[]>(initialSelected)
  const [listType, setListType] = useState('company_list')
  const [name, setName] = useState(activeList.title || '')
  const { user } = useAuth()
  const { mutate: createUserList, isPending } = useCreateUserList()

  const handleSubmit = () => {
    if (name.trim()?.length < 4) {
      toast.error('List name must be at least 4 characters long.')
      return
    }
    if (initialSelected.length === 0) {
      toast.error('Please select at least one item.')
      return
    }
    createUserList(
      {
        userId: user?.user_id || '',
        data: {
          list_name: name,
          list_type: listType,
          webset_item_ids: initialSelected.map(item => item.ITEM_ID),
        },
      },
      {
        onSuccess: () => {
          toast.success('List created successfully.')
          setOpen(false)
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
            <DialogDescription>Create a new list to add initialSelected items.</DialogDescription>
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
              <Select value={listType} onValueChange={setListType}>
                <SelectTrigger className="w-full border-foreground/70">
                  <SelectValue placeholder="Select list type" />
                </SelectTrigger>
                <SelectContent className="z-60 max-h-40">
                  <SelectItem value="company_list">Company List</SelectItem>
                  <SelectItem value="investor_list">Investor List</SelectItem>
                  <SelectItem value="people_list">People List</SelectItem>
                  <SelectItem value="transaction_list">Transaction List</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-3 ">
              <Label>Selected Items</Label>
              <div className="grid gap-2 max-h-40 overflow-y-auto">
                {initialSelected.length === 0 ? (
                  <p>No items initialSelected.</p>
                ) : (
                  initialSelected.map(item => (
                    <ItemUi
                      key={item.ITEM_ID}
                      id={item.ITEM_ID}
                      name={item.NAME}
                      logo={item.LOGO}
                    />
                  ))
                )}
              </div>
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

const ItemUi = ({ id, name, logo }: { id: string; name: string; logo?: string }) => {
  return (
    <div className="p-2 bg-foreground/5 hover:bg-foreground/10 rounded-sm border !text-foreground border-foreground/20 flex items-center gap-2">
      {logo && <img src={logo} alt={name} className="size-5 rounded-sm" />}
      <Label className="text-accent-foreground/80 capitalize">{name}</Label>
    </div>
  )
}
