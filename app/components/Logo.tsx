import Image from 'next/image'
import React from 'react'
import logo from "../../public/logo.png"

const Logo = () => {
    return (
        <>
            <Image
                src={logo}
                alt="logo"
                height={100}
                width={100}
            />
        </>
    )
}

export default Logo