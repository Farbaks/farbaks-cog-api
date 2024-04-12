import { Module } from '@nestjs/common';
import { AssessmentSchema, D3ModelSchema, SessionsSchema, TrainingSchema } from './schemas/assessments.schema';
import { AssessmentsController } from './assessments.controller';
import { AssessmentsService } from './assessments.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from '../users/schemas/users.schema';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
      MongooseModule.forFeature([{ name: 'Assessment', schema: AssessmentSchema }]),
      MongooseModule.forFeature([{ name: 'Session', schema: SessionsSchema }]),
      MongooseModule.forFeature([{ name: 'Training', schema: TrainingSchema }]),
      MongooseModule.forFeature([{ name: 'D3Model', schema: D3ModelSchema }]),
    ],
    controllers: [AssessmentsController],
    providers: [AssessmentsService],
    exports:[AssessmentsService]
  })
export class AssessmentsModule {}
