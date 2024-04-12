import * as mongoose from 'mongoose';

export const AssessmentSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    asessmentType: String,
    score: Number,
    time: Number,
    createdAt: { type: Date, default: new Date() },
    deletedAt: Date
});

export const SessionsSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: new Date() },
    deletedAt: Date
});

export const TrainingSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    session: { type: mongoose.Schema.Types.ObjectId, ref: 'Session' },
    trainingType: String,
    score: Number,
    time: String,
    difficulty: Number,
    createdAt: { type: Date, default: new Date() },
    deletedAt: Date
});

export const D3ModelSchema = new mongoose.Schema({
    data: String,
    createdAt: { type: Date, default: new Date() },
    deletedAt: Date
});
