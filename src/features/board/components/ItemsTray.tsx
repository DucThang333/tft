import { Icon } from '../../../components/ui/Icon'

interface BoardItem {
  id: string
  imageUrl: string
}

interface ItemsTrayProps {
  items: BoardItem[]
}

export function ItemsTray({ items }: ItemsTrayProps) {
  return (
    <div className="mt-12 p-4 bg-surface-container-lowest rounded-xl flex gap-3 items-center border border-outline-variant/10">
      <Icon name="inventory_2" className="text-on-surface-variant px-2" />
      <div className="flex gap-2">
        {items.map((item) => (
          <div
            key={item.id}
            className="w-10 h-10 bg-surface-container-high rounded-lg border border-outline-variant/30 flex items-center justify-center hover:bg-surface-bright cursor-grab transition-colors"
          >
            <div
              className="w-7 h-7 bg-cover rounded-sm"
              style={{ backgroundImage: `url('${item.imageUrl}')` }}
            />
          </div>
        ))}
        <div className="w-10 h-10 bg-surface-container-high rounded-lg border border-outline-variant/30 flex items-center justify-center opacity-40">
          <Icon name="add" className="text-xs" />
        </div>
      </div>
      <div className="ml-auto text-[10px] font-bold uppercase text-on-surface-variant tracking-widest">
        Đã trang bị: {items.length}/10
      </div>
    </div>
  )
}
