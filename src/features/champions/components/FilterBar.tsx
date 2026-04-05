import { Chip } from '../../../components/ui/Chip'
import { Icon } from '../../../components/ui/Icon'

type CostFilter = 'all' | 1 | 2 | 3 | 4 | 5

interface FilterBarProps {
  costFilter: CostFilter
  onCostFilterChange: (filter: CostFilter) => void
  sortBy: string
  onSortChange: (sort: 'name' | 'cost' | 'winrate') => void
}

const costOptions: { label: string; value: CostFilter }[] = [
  { label: 'Tất cả', value: 'all' },
  { label: 'Giá 1', value: 1 },
  { label: 'Giá 2', value: 2 },
  { label: 'Giá 3', value: 3 },
  { label: 'Giá 4', value: 4 },
  { label: 'Giá 5', value: 5 },
]

export function FilterBar({ costFilter, onCostFilterChange, sortBy, onSortChange }: FilterBarProps) {
  return (
    <section className="mb-10 flex flex-col md:flex-row gap-4 items-end md:items-center justify-between">
      <div className="flex flex-wrap gap-3 overflow-x-auto hide-scrollbar pb-2 md:pb-0">
        {costOptions.map((opt) => (
          <Chip
            key={String(opt.value)}
            label={opt.label}
            active={costFilter === opt.value}
            onClick={() => onCostFilterChange(opt.value)}
          />
        ))}
      </div>
      <div className="flex gap-4 w-full md:w-auto">
        <div className="relative flex-1 md:flex-none">
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as 'name' | 'cost' | 'winrate')}
            className="appearance-none w-full bg-surface-container-highest/50 border-none text-on-surface py-2.5 pl-4 pr-10 rounded-lg font-label text-sm focus:ring-0 focus:ring-tertiary"
          >
            <option value="name">Sắp xếp: Tên</option>
            <option value="cost">Sắp xếp: Giá</option>
          </select>
          <Icon name="expand_more" className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant" />
        </div>
        <button className="bg-surface-container-highest p-2.5 rounded-lg text-on-surface active:scale-95 transition-transform">
          <Icon name="filter_list" />
        </button>
      </div>
    </section>
  )
}
