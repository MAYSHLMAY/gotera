# 🌾 ጎተራ Gotera — Farm to Business Marketplace
The Problem
Every day, tonnes of fresh produce rot at Atkelt Tera while hotels and supermarkets in Addis Ababa overpay middlemen for the same food. Farmers earn less. Buyers pay more. And nobody wins.
# What We Built
Gotera is a direct farm-to-business marketplace that connects Ethiopian farmers with commercial buyers — hotels, supermarkets, and restaurants — cutting out the chaos of traditional markets entirely.
The result: fresher produce, fairer prices, and dramatically less waste.
# How It Works
Farmer lists harvest → Buyer places order → Driver picks up → Fresh food delivered
No middlemen. No Atkelt Tera. No spoilage.
# Who It's For
UserHow they use Gotera🧑‍🌾 FarmersList available harvest, set prices, accept orders🏨 Hotels & SupermarketsBrowse fresh produce, order directly from farms🚚 Transport driversPick up confirmed orders and earn per delivery

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
