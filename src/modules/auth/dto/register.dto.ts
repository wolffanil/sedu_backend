import { Transform } from 'class-transformer'
import {
	IsDate,
	IsEmail,
	IsNotEmpty,
	IsString,
	Matches,
	MaxDate,
	MinDate,
	MinLength
} from 'class-validator'

export class RegisterDto {
	@IsString()
	@IsEmail({}, { message: 'Почта должна быть валидной' })
	email: string

	@IsString({ message: 'Имя должно быть' })
	@IsNotEmpty({ message: 'Имя не должно быть пустой' })
	name: string

	@IsString({ message: 'Фамилия должна быть' })
	@IsNotEmpty({ message: 'Фамилия не должна быть пустой' })
	surname: string

	@Transform(({ value }) => value.replace(/[^\d+]/g, ''))
	@Matches(/^(\+7|8)\d{10}$/, {
		message: 'Введите номер в формате +79000000000 или 89000000000'
	})
	@IsNotEmpty({ message: 'Номер телефона не может быть пустым' })
	phone: string

	@IsString({ message: 'Пароль должен быть' })
	@IsNotEmpty({ message: 'Пароль не должен быть пустым' })
	@MinLength(8, { message: 'Минимальноя длина пароля 8 символов' })
	password: string
}
