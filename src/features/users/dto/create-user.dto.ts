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
  @MinLength(5)
  @MaxLength(20)
  username: string;

  @IsString()
  @MinLength(8)
  @MaxLength(64)
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
