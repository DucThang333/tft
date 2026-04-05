import { Icon } from '../../../components/ui/Icon'

export function MetaInsight() {
  return (
    <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2 bg-surface-container p-6 rounded-lg border-t border-outline-variant/15 flex flex-col justify-between overflow-hidden relative">
        <div className="relative z-10">
          <h4 className="text-xs font-bold text-tertiary uppercase tracking-widest mb-4">Nhận định meta</h4>
          <p className="text-2xl font-headline font-bold text-on-background mb-4">
            Tuyến trước Warden đang có <span className="text-primary">mức tăng +12%</span> về thứ hạng ở ELO cao.
          </p>
          <p className="text-on-surface-variant text-sm max-w-md">
            Ưu tiên trang bị phòng thủ hơn nhịp tấn công thuần trong meta bản 14.12 hiện tại.
          </p>
        </div>
        <div className="absolute right-[-10%] bottom-[-10%] w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
      </div>
      <div className="bg-primary-container p-6 rounded-lg flex flex-col justify-center items-center text-center">
        <Icon name="auto_awesome" className="text-4xl text-primary mb-4" />
        <h4 className="text-lg font-headline font-bold text-white mb-2">Ghép đội</h4>
        <p className="text-white/70 text-sm mb-6">
          Tự xây chiến thuật lệch meta và chia sẻ với cộng đồng.
        </p>
        <button className="bg-white text-primary-container font-bold text-xs px-6 py-3 rounded uppercase tracking-wider hover:bg-opacity-90 transition-all">
          Bắt đầu ghép
        </button>
      </div>
    </div>
  )
}
