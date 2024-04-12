import { Controller, Post, Body, Request, Get, Query } from '@nestjs/common';
import { AssessmentsService } from './assessments.service';
import { AddNewAssessmentScoreDto, AddNewTrainingScoreDto, GetDifficultyDto } from './dtos/assessments.dto';

@Controller('assessments')
export class AssessmentsController {
    constructor(private readonly assessmentService: AssessmentsService) { }

    @Post()
    async createAssessment(@Request() request, @Body() addNewAssessmentDto: AddNewAssessmentScoreDto) {
        return await this.assessmentService.createAssessment(request.decoded, addNewAssessmentDto);
    }

    @Post('/training')
    async createTraining(@Request() request, @Body() addNewTrainingDto: AddNewTrainingScoreDto) {
        return await this.assessmentService.createTraining(request.decoded, addNewTrainingDto);
    }

    @Get('/training/difficulty')
    async getDifficulty(@Request() request, @Query() query: GetDifficultyDto) {
        return await this.assessmentService.getDifficultyLevel(request.decoded, query);
    }

    @Get('/can-play')
    async canPlayTraining(@Request() request, @Query() query: GetDifficultyDto) {
        return await this.assessmentService.canPlayTraining(request.decoded, query);
    }

    @Get('/report')
    async getReport(@Request() request) {
        return await this.assessmentService.getUserReport(request.decoded);
    }
}
