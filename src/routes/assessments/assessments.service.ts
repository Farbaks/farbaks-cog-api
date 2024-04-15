import { HttpStatus, Injectable } from '@nestjs/common';
import { Assessment, D3Model, Session, TestType, Training, TrainingType } from './interfaces/assessments.interface';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AddNewAssessmentScoreDto, AddNewTrainingScoreDto, GetDifficultyDto } from './dtos/assessments.dto';
import * as moment from 'moment';
import { User } from '../users/interfaces/user.interface';
var DecisionTree = require('decision-tree');

@Injectable()
export class AssessmentsService {

    constructor(
        @InjectModel('User') private readonly UserModel: Model<User>,
        @InjectModel('Assessment') private readonly AssessmentModel: Model<Assessment>,
        @InjectModel('Session') private readonly SessionModel: Model<Session>,
        @InjectModel('Training') private readonly TrainingModel: Model<Training>,
        @InjectModel('D3Model') private readonly D3Model: Model<D3Model>,
        private configService: ConfigService
    ) {

    }

    async createAssessment(userInfo: any, addNewAssessmentDto: AddNewAssessmentScoreDto) {

        // Check if there's an existing assessment in less than 10 days
        let previousDate = moment().subtract('10', 'days').endOf('day').toDate();

        let checkAssessment = await this.AssessmentModel.findOne({
            user: new Types.ObjectId(userInfo._id),
            asessmentType: addNewAssessmentDto.asessmentType,
            createdAt: { $gte: previousDate }
        }).exec()

        if (checkAssessment) {
            return {
                statusCode: HttpStatus.BAD_REQUEST,
                message: "This assessment has already been completed this week."
            }
        }

        // Save assessment
        let assessment = new this.AssessmentModel({
            user: new Types.ObjectId(userInfo._id),
            asessmentType: addNewAssessmentDto.asessmentType,
            time: addNewAssessmentDto.time,
            score: addNewAssessmentDto.score,
        })

        await assessment.save();

        return {
            statusCode: HttpStatus.OK,
            message: "Assessment saved successfully."
        }
    }

    async createTraining(userInfo: any, addNewTrainingDto: AddNewTrainingScoreDto) {

        // Check if there's an existing training in less than 24 hours
        let previousDate = moment().startOf('day').toDate();;

        let checkTraining = await this.TrainingModel.findOne({
            user: new Types.ObjectId(userInfo._id),
            trainingType: addNewTrainingDto.trainingType,
            createdAt: { $gte: previousDate }
        }).exec()

        if (checkTraining) {
            return {
                statusCode: HttpStatus.BAD_REQUEST,
                message: "This training has already been completed today."
            }
        }

        // Get latest session
        let session;
        session = await this.SessionModel.findOne({
            user: new Types.ObjectId(userInfo._id),
            createdAt: { $gte: previousDate }
        }).exec()

        if (!session) {
            session = await new this.SessionModel({
                user: new Types.ObjectId(userInfo._id),
            }).save();
        }

        // Save training
        let training = new this.TrainingModel({
            user: new Types.ObjectId(userInfo._id),
            session: new Types.ObjectId(session._id),
            trainingType: addNewTrainingDto.trainingType,
            time: addNewTrainingDto.time,
            score: addNewTrainingDto.score,
            difficulty: addNewTrainingDto.difficulty
        })

        await training.save();

        const user = await this.UserModel.findById(userInfo._id).exec();

        // Save data to  decision tree model
        await this.saveDataToModel(
            user.username.toString(),
            +user.age,
            addNewTrainingDto.trainingType,
            +addNewTrainingDto.score,
            +addNewTrainingDto.difficulty
        );

        return {
            statusCode: HttpStatus.OK,
            message: "Training data saved successfully."
        }
    }

    async canPlayTraining(userInfo: any, query: GetDifficultyDto) {
        let previousDate;
        if(query.trainingType == "assessment") {
            previousDate = moment().subtract('10', 'days').endOf('day').toDate(); // Assessments can only be taken every 10 days

            let checkAssessment = await this.AssessmentModel.findOne({
                user: new Types.ObjectId(userInfo._id),
                asessmentType: "tmt-a",
                createdAt: { $gte: previousDate }
            }).exec()
    
            return {
                statusCode: HttpStatus.OK,
                message: "Data fetched successfully.",
                data: {
                    canPlay: checkAssessment ? false : true
                }
            }
        }
        else {
            previousDate = moment().startOf('day').toDate(); // Training sessions can only be done once a day
            let checkTraining = await this.TrainingModel.findOne({
                user: new Types.ObjectId(userInfo._id),
                trainingType: query.trainingType,
                createdAt: { $gte: previousDate }
            }).exec()

            return {
                statusCode: HttpStatus.OK,
                message: "Data fetched successfully.",
                data: {
                    canPlay: checkTraining ? false : true
                }
            }
        }
        
    }

    async saveDataToModel(username: string, age: number, training: TrainingType, score: number, difficulty: number) {
        // Save data in d3 model 
        let class_name: string = "difficulty";
        let features: Array<string> = ["username", "age", "trainingType", "score"];

        const d3Model = await this.D3Model.findOne().exec();
        let model;
        let trainingData = [{
            "username": username,
            "age": age,
            "trainingType": training,
            "score": score,
            "difficulty": difficulty
        }];

        if (d3Model) {
            let modelData = JSON.parse(d3Model.data.toString());
            model = new DecisionTree(modelData);
            model.train(trainingData);
            d3Model.data = JSON.stringify(model);
            await d3Model.save();
        }
        else {
            model = new DecisionTree(class_name, features);
            model.train(trainingData);
            await new this.D3Model({ data: JSON.stringify(model) }).save();
        }
    }

    async getDifficultyLevel(userInfo: any, query: GetDifficultyDto) {
        // Initialize difficulty level
        let level = 1;

        // Check if user is using default or personalised training
        const user = await this.UserModel.findById(userInfo._id).exec();

        // Check if any training session has been done
        const checkTraining = await this.TrainingModel.findOne({
            user: new Types.ObjectId(userInfo._id),
            trainingType: query.trainingType
        }).sort({ createdAt: -1 }).exec()

        // If no training has been done or If user is using default training, generate difficulty based on tmt assessment
        if(!checkTraining || user.trainingType == 'default') {
            const tmtAssessment = await this.AssessmentModel.findOne({
                user: new Types.ObjectId(userInfo._id),
                asessmentType: 'tmt-b'
            }).sort({ createdAt: -1 });

            let normalizedScore = +this.normalizeTrailMakingTestScore(+tmtAssessment.time);
            level = Math.ceil(normalizedScore / 10);

            if(user.trainingType == 'default') level = 4; // For default users, user a static level 4

            return {
                statusCode: HttpStatus.OK,
                message: "Difficulty level fetched successfully....",
                data: {
                    difficultyLevel: level
                }
            }
        }

        // Check if up to 5 training sessions have been done
        const countTrainings = await this.TrainingModel.countDocuments({
            user: new Types.ObjectId(userInfo._id),
            trainingType: query.trainingType
        }).sort({ createdAt: -1 }).exec()

        // If training sessions not up to 5, generate based on last training performance
        if(countTrainings < 5) {
            level = Math.ceil(+checkTraining.score * 1.05 / 10); // Multiply by 1.05 for a 5% target increase in performance

            return {
                statusCode: HttpStatus.OK,
                message: "Difficulty level fetched successfully.",
                data: {
                    difficultyLevel: level
                }
            }
        }

        // Else use decision model to predict (Aiming for a score of 10% increase from previous training)
        const d3Model = await this.D3Model.findOne().exec();
        let modelData = JSON.parse(d3Model.data.toString());
        let model = new DecisionTree(modelData);

        level = model.predict({
            "username": user.username,
            "age": user.age,
            "trainingType": query.trainingType,
            "score": +checkTraining.score * 1.05,
        })


        // Return difficulty
        return {
            statusCode: HttpStatus.OK,
            message: "Difficulty level fetched successfully.",
            data: {
                difficultyLevel: level
            }
        }

    }

    async getUserReport(userInfo: any) {

        let data: any = {};

        // Get number of tests done
        data.numOfAssessments = await this.AssessmentModel.countDocuments({
            user: new Types.ObjectId(userInfo._id)
        }).exec()

        // Get number of sessions done
        data.numOfSessions = await this.SessionModel.countDocuments({
            user: new Types.ObjectId(userInfo._id)
        }).exec()

        // Get the initial starting date
        const initialAssessment = await this.AssessmentModel.findOne({
            user: new Types.ObjectId(userInfo._id),
        }).sort({ createdAt: 1 }).exec();

        data.initialAssessementDate = initialAssessment.createdAt;

        // Get the last training date
        const lasTraining = await this.TrainingModel.findOne({
            user: new Types.ObjectId(userInfo._id),
        }).sort({ createdAt: -1 }).exec();

        data.lastTrainingDate = lasTraining.createdAt;

        return {
            statusCode: HttpStatus.OK,
            message: "User report fetched successfully.",
            data: {
                ...data
            }
        }
    }

    normalizeTrailMakingTestScore(completionTime: number) {
        let deficientTime = 273; // Deficient completion time for TMT B 
        let averageTime = 75; // Average completion time for TMT B

        if (completionTime >= deficientTime) {
            return 10; // If completion time is equal to or greater than deficient time, return 1
        } else if (completionTime >= averageTime) {
            // If completion time is greater than or equal to average time but less than deficient time
            // Normalize between 2 and 99
            return (100 - ((completionTime - averageTime) / (deficientTime - averageTime)) * 98).toFixed(2);
        } else if (completionTime < averageTime) {
            // If completion time is less than average time, normalize between 2 and 100
            return (100 - ((completionTime) / (deficientTime - averageTime)) * 99).toFixed(2);
        }
    }
}
