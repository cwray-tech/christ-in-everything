export const Logo = () => {
  return (
    <div className="flex items-center font-serif justify-start gap-2 text-current">
      <svg
        fill="none"
        width="24"
        height="30"
        viewBox="0 0 35 40"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect x="18" y="5" width="4" height="30" className="fill-current" />
        <rect x="8" y="15" width="24" height="4" className="fill-current" />
      </svg>
      <span className="text-sm font-bold">Christ in Everything</span>
    </div>
  )
}
