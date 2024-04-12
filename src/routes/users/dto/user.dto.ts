import { Type } from "class-transformer";
import { IsString, IsNotEmpty, IsOptional, IsObject, ValidateNested, IsIn, IsMongoId, IsNumber, IsNumberString } from "class-validator";


export class CreateUserDto {

    @IsString()
    @IsNotEmpty()
    readonly userName: String;

    @IsNotEmpty()
    @IsNumber()
    readonly age: Number;

    @IsNotEmpty()
    @IsString()
    @IsIn(['male', 'female'])
    readonly gender: String;

    @IsString()
    @IsIn(['default', 'personalised'])
    readonly trainingType: String;

    @IsString()
    readonly password: String;
}

export class LoginDto {
    @IsString()
    readonly userName: String;

    @IsString()
    readonly password: String;
}