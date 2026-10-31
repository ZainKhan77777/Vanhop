import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { Van } from "../src/features/vans/van.model";
import { User } from "../src/features/auth/user.model";
import { USER_ROLE } from "../src/constants/reservation-status";

const VANS = [
  {
    name: "Ford Transit Custom",
    slug: "transit-custom",
    kind: "Cargo panel van",
    description: "Low roof so it clears most car parks, with a load bay that swallows a two-room move.",
    pricePerDay: 180,
    imageUrl: "https://images.unsplash.com/photo-1688619102725-f2fd886313e6?w=1200&q=80&auto=format&fit=crop",
    specs: ["2 seats", "6 m³ load", "Diesel", "Manual"],
    badge: "Most booked",
  },
  {
    name: "Mercedes Sprinter",
    slug: "sprinter",
    kind: "Crew minibus",
    description: "Nine belted seats with luggage room behind them. The one tour groups take to Kazbegi.",
    pricePerDay: 240,
    imageUrl: "https://images.unsplash.com/photo-1656426630273-ca84171a2010?w=1200&q=80&auto=format&fit=crop",
    specs: ["9 seats", "Climate", "Diesel", "Automatic"],
    badge: "9 seats",
  },
  {
    name: "VW Grand California",
    slug: "grand-california",
    kind: "Camper",
    description: "A proper bed, a two-ring hob and a wet room. Set up for a week in the mountains.",
    pricePerDay: 310,
    imageUrl: "https://images.unsplash.com/photo-1627386172764-1d1b7ea90b66?w=1200&q=80&auto=format&fit=crop",
    specs: ["Sleeps 4", "Kitchen", "Shower", "Automatic"],
    badge: "Sleeps 4",
  },
];

async function seed(): Promise<void> {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set. Copy .env.example to .env.local first.");

  await mongoose.connect(uri);
  console.log("Connected to MongoDB");

  // Idempotent: re-running updates the same documents instead of duplicating them.
  for (const van of VANS) {
    await Van.updateOne({ slug: van.slug }, { $set: van }, { upsert: true });
    console.log(`  van: ${van.name}`);
  }

  const email = (process.env.ADMIN_EMAIL ?? "admin@vanhop.ge").toLowerCase();
  const password = process.env.ADMIN_PASSWORD ?? "vanhop123";
  await User.updateOne(
    { email },
    { $set: { email, passwordHash: await bcrypt.hash(password, 10), role: USER_ROLE.ADMIN } },
    { upsert: true },
  );
  console.log(`  admin: ${email}`);

  await mongoose.disconnect();
  console.log("Seed complete");
}

seed().catch((error: unknown) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
