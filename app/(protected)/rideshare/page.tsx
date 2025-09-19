// import { listRideOffers } from "../../../lib/repos";

export default async function RidesharePage() {
  // const rides = await listRideOffers();
  const rides = []
  return (
    <main className="p-5">
      <h1 className="text-2xl font-bold mb-4">Ride Share</h1>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <p>No Rides Yet..</p>
        {/* {rides.map((r) => (
          <li key={r.id} className="rounded-xl border bg-white p-4">
            <div className="font-medium">{r.from} → {r.to}</div>
            <div className="text-sm text-gray-600">Departs: {new Date(r.departure).toLocaleString()}</div>
            <div className="text-sm text-gray-600">Seats: {r.seats} • ₪{r.pricePerSeatIls}/seat</div>
          </li>
        ))} */}
      </ul>
    </main>
  );
}
