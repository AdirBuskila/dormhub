// app/components/Headerbar.tsx
import Logo from "./Logo";
import Nav from "./Nav";

export const HeaderBar = () => {
  return (
    <header className="mx-auto max-w-6xl px-6 py-5 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Logo />
        <span className="font-semibold tracking-tight">DormHub</span>
      </div>
      <Nav />
    </header>
  )
}