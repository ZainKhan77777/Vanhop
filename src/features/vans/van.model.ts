import { Schema, model, models, type Model, type InferSchemaType } from "mongoose";

const vanSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    kind: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    pricePerDay: { type: Number, required: true, min: 0 },
    imageUrl: { type: String, required: true },
    specs: { type: [String], default: [] },
    badge: { type: String, default: null },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true },
);

export type VanDocument = InferSchemaType<typeof vanSchema> & { _id: Schema.Types.ObjectId };

export const Van: Model<VanDocument> =
  (models.Van as Model<VanDocument>) ?? model<VanDocument>("Van", vanSchema);
