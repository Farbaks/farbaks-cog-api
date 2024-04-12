import { Document, ObjectId } from 'mongoose';


export interface Assessment extends Document  {
    user: ObjectId,
    asessmentType: String,
    score: Number,
    time: Number,
    createdAt: Date,
    deletedAt: Date
}

export interface Session extends Document  {
    user: ObjectId,
    createdAt: Date,
    deletedAt: Date
}

export interface Training extends Document  {
    user: ObjectId,
    session: ObjectId,
    trainingType: String,
    score: Number,
    time: String,
    difficulty: Number,
    createdAt: Date,
    deletedAt: Date
}

export interface D3Model extends Document  {
    data: String,
    createdAt: Date,
    deletedAt: Date
}

export type TestType = 'tmt' | 'training';

export type TrainingType = 'words-recall' | 'numbers-recall' | "object-recognition";
