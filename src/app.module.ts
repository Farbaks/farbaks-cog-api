import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { AppConfig, AppConfigValidationSchema } from './app.config';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { UsersModule } from './routes/users/users.module';
import { AuthMiddleware } from './middlewares/auth.middleware';
import { UsersController } from './routes/users/users.controller';
import { UserSchema } from './routes/users/schemas/users.schema';
import { AssessmentsController } from './routes/assessments/assessments.controller';
import { AssessmentsModule } from './routes/assessments/assessments.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            validationSchema: AppConfigValidationSchema
        }),
        MongooseModule.forRoot(AppConfig.DATABASE_URI),
        MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
        ThrottlerModule.forRoot([{
            ttl: 60000,
            limit: 30,
        }]),
        UsersModule,
        AssessmentsModule
    ],
    controllers: [AppController, AssessmentsController],
    providers: [
        AppService,
        {
            provide: APP_GUARD,
            useClass: ThrottlerGuard
        },
    ],
})
export class AppModule implements NestModule  {
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(AuthMiddleware)
            .exclude(
                { path: 'users', method: RequestMethod.POST },
                { path: 'users/login', method: RequestMethod.POST },
            )
            .forRoutes(
                UsersController,
                AssessmentsController
            )
    }

}
