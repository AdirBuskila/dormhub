"use client"
import { merge } from "@/lib/url/qs"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

export const AddButton = () => {
    const router = useRouter()
    const path = usePathname()
    const searchParams = useSearchParams()

    const handleClick = () => {
        const url = merge(path, searchParams, { new: "1" })
        const modal: HTMLElement | null = document.getElementById('my_modal_1')
        router.push(url)
    }

    return (
        <div className="fixed bottom-6 right-6 z-50">
            <button onClick={handleClick} className="bg-blue-500 w-14 h-14 bg-blend-hue btn-circle shadow-lg hover:scale-110 transition-transform">
                <p className="font-bold text-black">
                    +
                </p>
            </button>
        </div>
    )

}