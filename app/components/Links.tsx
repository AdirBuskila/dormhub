import React from 'react'
import Link from "next/link";

const Links = () => {
    return (
        <div className="p-5 flex flex-wrap gap-4">
            <Link href="/marketplace" className="link">Swap & Sell</Link>
            <Link href="/studybuddy" className="link">Study Buddy</Link>
            <Link href="/rideshare" className="link">Ride Share</Link>
            <Link href="/tips" className="link">Tips & Events</Link>
        </div>
    )
}

export default Links