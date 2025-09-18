import { config } from 'dotenv';
config({ path: '.env.local' });
import { Client, Databases, ID, Query } from 'node-appwrite';

// ---- seed data (yours) ----
const seedTips = [
    {
        ownerId: "user_adir",
        type: "text",
        title: "Use the red cart from the guard’s post",
        text: "There is a red cart in the guard's post. It belongs to one of the guards, but you can use it to carry stuff to your apartment. Just return it to where it was when you're done.",
        tags: ["moving", "equipment", "logistics"],
        images: [],
        status: "active",
    },
    {
        ownerId: "user_adir",
        type: "text",
        title: "Overflow parking near the dorms",
        text: "If the free parking lot close to the dorms is full, there are additional free parking spots nearby.",
        tags: ["parking", "transport", "nearby"],
        images: [],
        status: "active",
    },
    {
        ownerId: "user_adir",
        type: "text",
        title: "Delivery tip for Waze",
        text: `Delivery guys sometimes get confused; tell them to enter "מעונות HIT" in Waze for the easiest pickup.`,
        tags: ["delivery", "waze", "address"],
        images: [],
        status: "active",
    },
    {
        ownerId: "user_adir",
        type: "text",
        title: "Student discounts: Tuvia’s Pizza & the nearby bakery",
        text: "Tuvia's Pizza place and the bakery near the dorms offer a student discount.",
        tags: ["food", "discount", "deals"],
        images: [],
        status: "active",
    }
]

// ---- appwrite setup ----
const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!;
const project = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!;
const apiKey = process.env.APPWRITE_API_KEY!;
const DB_ID = process.env.APPWRITE_DB_ID!;
const TIPS_COL = process.env.APPWRITE_TIPS_COLLECTION_ID!;

if (!endpoint || !project || !apiKey || !DB_ID || !TIPS_COL) {
    throw new Error("Missing Appwrite env vars");
}

const client = new Client().setEndpoint(endpoint).setProject(project).setKey(apiKey);
const db = new Databases(client);

async function run() {
    for (const tip of seedTips) {
        // avoid duplicates by title + owner
        const existing = await db.listDocuments(DB_ID, TIPS_COL, [
            Query.equal('title', tip.title),
            Query.equal('ownerId', tip.ownerId),
            Query.limit(1),
        ]);
        if (existing.total > 0) {
            console.log(`↷ Skip (exists): ${tip.title}`);
            continue;
        }

        const doc = {
            ...tip,
            // optional: auto-fill your "search" field if you want, since you have it indexed
            search: `${tip.title} ${tip.text} ${(tip.tags || []).join(" ")}`.slice(0, 2048),
        };

        const created = await db.createDocument(DB_ID, TIPS_COL, ID.unique(), doc);
        console.log(`✓ Inserted: ${created.title} (${created.$id})`);
    }
}

run().catch((e) => {
    console.error(e);
    process.exit(1);
});
