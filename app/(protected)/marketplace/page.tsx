import React from 'react'

const page = () => {
  return (
    <div>page</div>
  )
}

export default page


// import Link from "next/link";
// import { listMarketplace } from "../../../lib/repos";
// import { getCurrentUser } from "../../../lib/auth";
// import { redirect } from "next/navigation";

// export default async function MarketplacePage() {
//   // Server-side guard: if there's no current user, send them to the login route.
//   // This uses the repo's server helper `getCurrentUser()` so once that function
//   // reads real session data this guard will enforce protection automatically.
//   const user = await getCurrentUser();
//   console.log(user);
//   if (!user) {
//     redirect("/auth/login");
//   }

//   const items = await listMarketplace();
//   return (
//     <main className="p-5">
//       <h1 className="text-2xl font-bold mb-4">Swap & Sell</h1>
//       <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
//         {items.map((it) => (
//           <li key={it.id} className="rounded-xl border bg-white p-4">
//             <div className="h-28 rounded-lg bg-gray-100 mb-3 flex items-center justify-center">
//               <span className="text-sm text-gray-500">{it.imageUrl ? "image" : "no image"}</span>
//             </div>
//             <div className="font-medium">{it.title}</div>
//             <div className="text-sm text-gray-600">
//               ₪{it.priceIls} • {it.condition}
//             </div>
//             <Link href={`/marketplace/${it.id}`} className="mt-3 inline-block text-sm underline">
//               View
//             </Link>
//           </li>
//         ))}
//       </ul>
//     </main>
//   );
// }
