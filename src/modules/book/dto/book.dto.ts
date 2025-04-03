import {
	IsBoolean,
	IsNotEmpty,
	IsNumber,
	IsOptional,
	IsUUID,
	Min
} from 'class-validator'

export class BookDto {
	@IsUUID(null, { message: 'Формат id должен быть валидный' })
	@IsNotEmpty({ message: 'id не может быть пустой' })
	timeId: string

	@IsOptional()
	@IsNumber({}, { message: 'Бонусы обязательный' })
	@Min(0, { message: 'Минимально кол-во бонусов должно быть 0' })
	bonuses: number

	@IsOptional()
	@IsBoolean({ message: 'Активация бонусов должно быть' })
	isActiveBonuses: boolean
}
