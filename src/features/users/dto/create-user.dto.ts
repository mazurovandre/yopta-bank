import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @MinLength(3)
  @MaxLength(20)
  username: string;

  @IsNotEmpty()
  @MinLength(3)
  password: string;

  @IsEmail()
  email: string;

  @IsInt()
  @Min(0)
  @Max(999)
  age: number;

  @IsNotEmpty()
  @MaxLength(1000)
  description: string;
}
