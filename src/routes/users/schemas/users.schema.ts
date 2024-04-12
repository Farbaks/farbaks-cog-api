import * as mongoose from 'mongoose';

export const UserSchema = new mongoose.Schema({
    username: String,
    age: Number,
    gender: String,
    password: { type: String, select: false },
    trainingType: { type: String, default: 'default' },
    status: { type: String, default: 'active' },
    isDeleted: { type: Boolean, default: false },
    createdAt: { type: Date, default: new Date() },
    updatedAt: { type: Date, default: new Date() },
    deletedAt: Date
});
