// import { listStudyBuddies } from "../../../lib/repos";

export default async function StudyBuddyPage() {
  // const buddies = await listStudyBuddies();
  const buddies = []
  return (
    <main className="p-5">
      <h1 className="text-2xl font-bold mb-4">Study Buddy</h1>
      <ul className="grid gap-4 sm:grid-cols-2">
        <p>No Buddies yet..</p>
        {/* {buddies.map((b) => (
          <li key={b.id} className="rounded-xl border bg-white p-4">
            <div className="font-medium">{b.name}</div>
            <div className="text-sm text-gray-600">{b.course} • {b.level ?? "—"}</div>
            <div className="text-sm text-gray-600">{b.availability}</div>
          </li>
        ))} */}
      </ul>
    </main>
  );
}
