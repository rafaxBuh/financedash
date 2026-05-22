export default function Loading() {
  return (
    <div className="p-6 lg:p-8 space-y-6 animate-pulse">
      <div>
        <div className="h-7 w-32 bg-surface rounded-lg" />
        <div className="h-4 w-52 bg-surface rounded mt-2" />
      </div>

      {/* Cards skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-surface border border-border rounded-xl p-5 h-24" />
        ))}
      </div>

      {/* Charts skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-surface border border-border rounded-xl p-5 h-64" />
        <div className="bg-surface border border-border rounded-xl p-5 h-64" />
      </div>

      {/* List skeleton */}
      <div className="bg-surface border border-border rounded-xl p-5 space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-14 bg-surface-2 rounded-lg" />
        ))}
      </div>
    </div>
  )
}
