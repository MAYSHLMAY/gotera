# 🌾 Gotera – Fresh Produce Marketplace

Gotera is a digital marketplace connecting **farmers**, **buyers**, and **transporters** in one seamless platform. Farmers list their fresh produce, buyers place orders, and transporters handle deliveries – all powered by Next.js, Supabase, and Africa's Talking.

## 🚀 Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Language**: TypeScript
- **Backend & Auth**: Supabase
- **SMS/Communications**: Africa's Talking
- **Styling**: Tailwind CSS
- **Package Manager**: npm

## 🛠️ Getting Started

### Prerequisites

- Node.js 20+ and npm
- A Supabase project (create one at [supabase.com](https://supabase.com))
- Africa's Talking account (for SMS features)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/hi-z-k/Gotera-GDG.git
   cd Gotera-GDG
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**  
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   AFRICASTALKING_API_KEY=your_api_key
   AFRICASTALKING_USERNAME=sandbox  # or your username
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view the app.

## 🧪 Building for Production

```bash
npm run build
npm start
```

## 📄 License

This project is private and intended for the Gotera-GDG team.

## 🙌 Acknowledgments

- Next.js team for the amazing framework
- Supabase for backend & auth
- Africa's Talking for communication services
