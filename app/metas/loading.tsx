export default function Loading() {
  return (
    <div className="p-6 lg:p-8 space-y-6 animate-pulse">
      <div className="flex items-start justify-between">
        <div>
          <div className="h-7 w-20 bg-surface rounded-lg" />
          <div className="h-4 w-60 bg-surface rounded mt-2" />
        </div>
        <div className="h-10 w-32 bg-surface rounded-lg" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-surface border border-border rounded-xl p-5 h-40" />
        ))}
      </div>
    </div>
  )
}
