import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
  
    // Port
    const configService = app.get(ConfigService);
    const port = configService.get('PORT');
  
    // Validation
    app.useGlobalPipes(new ValidationPipe({
      // whitelist: true,
      transform: true
    }));
  
    // Cors
    app.enableCors({
      origin: '*'
    });
  
    await app.listen(port || 3000);
  }
bootstrap();
