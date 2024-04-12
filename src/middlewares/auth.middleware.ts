import { HttpException, HttpStatus, Injectable, NestMiddleware } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import * as jwt from 'jsonwebtoken';
import { Model } from 'mongoose';
import { User } from 'src/routes/users/interfaces/user.interface';
@Injectable()
export class AuthMiddleware implements NestMiddleware {

  constructor(
    @InjectModel('User') private readonly userModel: Model<User>,
    private configService: ConfigService
  ) { }
  async use(req: any, res: any, next: () => void) {
    // check header or url parameters or post parameters for token
    const token = req.headers['Authorization'] || req.headers['authorization'];

    if (!token) {
      throw new HttpException('Authorization header not found - Access Restricted!', HttpStatus.FORBIDDEN);
    }

    if(token.substr(0, 7) != "Bearer ") {
      throw new HttpException('Invalid authorization header - Access Restricted!', HttpStatus.FORBIDDEN);
    }

    let decodedToken;

    try {
      decodedToken = await jwt.verify(token.substr(7), this.configService.get('APPLICATION_KEY'));
    }
    catch (err) {
      throw new HttpException('Expired token - Access Restricted!', HttpStatus.FORBIDDEN);
    }

    const user = await this.userModel.findOne({
      _id: decodedToken._id,
      status: "active",
      isDeleted: false
    }).exec();

    if(!user) {
      throw new HttpException('Invalid user - Access Restricted!', HttpStatus.FORBIDDEN);
    }

    req.decoded = decodedToken;
    next();
  }
}
