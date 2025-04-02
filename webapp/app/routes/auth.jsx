import { Outlet, Link } from "@remix-run/react"

export default function Layout() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Outlet />
        <div className="self-center max-w-xs text-balance text-center text-xs text-muted-foreground">
          By clicking continue, you agree to our
          &nbsp;
          <Link className="text-foreground font-medium underline underline-offset-4" href="/terms">Terms of service</Link>
          &nbsp;
          and
          &nbsp;
          <Link className="text-foreground font-medium underline underline-offset-4" href="/privacy">Privacy Policy</Link>
        </div>
      </div>
    </div>
  )
}
