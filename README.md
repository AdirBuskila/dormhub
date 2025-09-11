# 🏡 DormHub

> All your problems, solved.  
DormHub is a student-life super-app for sharing tips, borrowing/selling items, finding study buddies, and organizing rides.  
Built with **Next.js 14**, **TypeScript**, **TailwindCSS + DaisyUI**, and **Appwrite**.

---

## ✨ Features

- 📌 **Tips & Recommendations** — Share life hacks, product finds, and study tips with dorm mates.  
- 🛒 **Swap & Sell** — List items you no longer need or grab second-hand essentials.  
- 📚 **Study Buddy** — Connect with peers studying the same subjects.  
- 🚗 **Ride Share** — Hitch a ride or offer one to classmates.  
- 🔐 **Auth0 Authentication** — Secure login and user verification.  
- 📷 **Image Uploads** — Attach pictures to your tips (powered by Appwrite Storage).  
- 🎨 **Modern UI** — TailwindCSS & DaisyUI components for fast, clean styling.

---

## 🚀 Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/AdirBuskila/dormhub
cd dormhub
````

### 2. Install dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Configure environment

Create a `.env.local` with your secrets:

```env
AUTH0_SECRET=your_auth0_secret
AUTH0_DOMAIN=your_auth0_domain
AUTH0_CLIENT_ID=your_auth0_client_id
AUTH0_CLIENT_SECRET=your_auth0_client_secret

APPWRITE_PROJECT_ID=your_appwrite_project_id
APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
```

### 4. Run the dev server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000).

## 🛠️ Tech Stack

* ⚛️ [Next.js](https://nextjs.org/) (App Router, Server Actions)
* 💨 [TailwindCSS](https://tailwindcss.com/) + [DaisyUI](https://daisyui.com/)
* 🗄️ [Appwrite](https://appwrite.io/) (Database + Storage)
* 🔑 [Auth0](https://auth0.com/) (Authentication)
* 🧪 [Zod](https://zod.dev/) (Schema validation)

---

## 🤝 Contributing

Pull requests are welcome! For major changes, open an issue first.
Make sure to update tests as appropriate.

---

## 📜 License

MIT License © 2025 DormHub Team