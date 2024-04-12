import { Type } from "class-transformer";
import { IsString, IsNotEmpty, IsOptional, IsObject, ValidateNested, IsIn, IsMongoId, IsNumber, IsNumberString } from "class-validator";
import { TrainingType } from "../interfaces/assessments.interface";


export class AddNewAssessmentScoreDto {
    @IsIn(['tmt-a', 'tmt-b'])
    readonly asessmentType: String;

    @IsOptional()
    @IsNumber()
    readonly score: Number;

    @IsNumber()
    readonly time: Number;
}

export class AddNewTrainingScoreDto {
    @IsIn(['words-recall', 'numbers-recall', 'object-recognition'])
    readonly trainingType: TrainingType;

    @IsNumber()
    readonly score: Number;

    @IsNumber()
    readonly time: Number;

    @IsNumber()
    readonly difficulty: Number;
}

export class GetDifficultyDto {
    @IsIn(['words-recall', 'numbers-recall', 'object-recognition', 'assessment'])
    readonly trainingType: String;
}