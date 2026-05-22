export default function Loading() {
  return (
    <div className="p-6 lg:p-8 space-y-6 animate-pulse">
      <div className="flex items-start justify-between">
        <div>
          <div className="h-7 w-32 bg-surface rounded-lg" />
          <div className="h-4 w-40 bg-surface rounded mt-2" />
        </div>
        <div className="h-10 w-36 bg-surface rounded-lg" />
      </div>

      <div className="bg-surface border border-border rounded-xl p-4 h-24" />

      <div className="bg-surface border border-border rounded-xl p-5 space-y-3">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="h-14 bg-surface-2 rounded-lg" />
        ))}
      </div>
    </div>
  )
}
