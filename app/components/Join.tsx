"use client"
import { useUser } from "@auth0/nextjs-auth0"

export const Join = () => {
    const { user } = useUser()

    return (
        <>
            {user && <section className="mx-auto max-w-6xl px-6 py-6">
                <div className="rounded-2xl border bg-base-200 px-5 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <p className="text-sm md:text-base">
                        Students are already sharing tips and saving money. Join in.
                    </p>
                    <div className="flex gap-2">
                        <a href="/auth/login?screen_hint=signup" className="btn btn-primary btn-sm">Create account</a>
                        <a href="/auth/login" className="btn btn-ghost btn-sm">Log in</a>
                    </div>
                </div>
            </section>}
        </>
    )
}