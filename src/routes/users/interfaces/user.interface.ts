import { Document } from 'mongoose';

export interface User extends Document  {
    username: String,
    age: Number,
    gender: String,
    password: String,
    trainingType: String
    status: String,
    isDeleted: Boolean,
    createdAt: Date,
    updatedAt: Date,
    deletedAt: Date
}
