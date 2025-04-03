import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator'

export class LoginDto {
	@IsString({ message: 'Почта должна быть строкой' })
	@IsEmail({}, { message: 'Почта должна быть валидной' })
	email: string

	@IsString({ message: 'Пароль должен быть' })
	@IsNotEmpty({ message: 'Пароль не должен быть пустым' })
	@MinLength(8, { message: 'Минимальноя длина пароля 8 символов' })
	password: string
}
