'use client'
import { useUser } from '@auth0/nextjs-auth0'
import React from 'react'

const Nav = () => {
    const { user, isLoading } = useUser()
    return (
        <nav className="flex gap-3">
            {!user && <a href="/auth/login" className="btn">Log in</a>}
            {!user && <a href="/auth/login?screen_hint=signup" className="btn">Sign up</a>}
            {user && <a href="/auth/logout" className="btn btn-ghost">Log out</a>}
        </nav>
    )
}

export default Nav