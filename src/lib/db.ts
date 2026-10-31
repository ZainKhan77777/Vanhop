import mongoose, { type Mongoose } from "mongoose";
import { env } from "./env";

interface ConnectionCache { conn: Mongoose | null; promise: Promise<Mongoose> | null }

// Serverless functions spin up constantly, so the connection is cached on
// globalThis to survive hot reloads and warm invocations on Vercel.
const globalForMongoose = globalThis as unknown as { _mongoose?: ConnectionCache };
const cache: ConnectionCache = globalForMongoose._mongoose ?? { conn: null, promise: null };
globalForMongoose._mongoose = cache;

export async function connectDb(): Promise<Mongoose> {
  if (cache.conn) return cache.conn;
  if (!cache.promise) {
    cache.promise = mongoose.connect(env().MONGODB_URI, {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10_000,
    });
  }
  cache.conn = await cache.promise;
  return cache.conn;
}
