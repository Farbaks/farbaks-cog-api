import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserDto, LoginDto } from './dto/user.dto';
import { User } from './interfaces/user.interface';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UsersService {
    constructor(
        @InjectModel('User') private readonly UserModel: Model<User>,
        private configService: ConfigService
    ) {

    }

    async create(createUserDto: CreateUserDto) {

        // Check if User already exists
        let checkUser = await this.UserModel.findOne({
            username: createUserDto.userName,
            isDeleted: false
        }).exec()

        // Return error if User already exists
        if (checkUser) {
            return {
                statusCode: HttpStatus.BAD_REQUEST,
                message: "Username already exists."
            }
        }

        let hashedPassword = await bcrypt.hash("" + createUserDto.password, 10);

        let user = new this.UserModel({
            username: createUserDto.userName,
            age: createUserDto.age,
            gender: createUserDto.gender,
            password: hashedPassword,
            trainingType: createUserDto.trainingType
        })

        await user.save();

        return {
            statusCode: HttpStatus.OK,
            message: "User Registration Successful."
        }
    }

    async login(loginDto: LoginDto) {
        // Check if User exists
        let checkUser = await this.UserModel.findOne({
            username: loginDto.userName,
            status: 'active',
            isDeleted: false
        }).select('password').exec()

        // Return error if User already exists
        if (!checkUser) {
            return {
                statusCode: HttpStatus.BAD_REQUEST,
                message: "Your Username/Password is incorrect. Please try again."
            }
        }

        // Compare password
        let match = await bcrypt.compare("" + loginDto.password, "" + checkUser.password);

        // Return error if passwords don't match
        if (!match) {
            return {
                statusCode: HttpStatus.BAD_REQUEST,
                message: "Your Username/Password is incorrect. Please try again."
            }
        }

        let user = await this.UserModel.findOne({
            username: loginDto.userName,
            status: 'active',
            isDeleted: false
        }).exec()

        let jwtObject: any = JSON.parse(JSON.stringify(user));

        delete jwtObject.passwordUpdatedAt;

        let apiToken = await jwt.sign(jwtObject, this.configService.get('APPLICATION_KEY'), {
            expiresIn: "7d"
        });

        jwtObject.apiToken = apiToken;

        return {
            statusCode: HttpStatus.OK,
            message: "User login successful.",
            data: jwtObject
        }

    }

    async me(userInfo: any) {
        let user = await this.UserModel.findOne({
            username: userInfo.username,
            status: "active",
            isDeleted: false
        }).exec();

        let jwtObject: any = JSON.parse(JSON.stringify(user));

        let apiToken = await jwt.sign(jwtObject, this.configService.get('APPLICATION_KEY'), {
            expiresIn: "1d"
        });

        jwtObject.apiToken = apiToken;

        return {
            statusCode: HttpStatus.OK,
            message: "User fetched successfully.",
            data: jwtObject
        }
    }
}
