import { IsBoolean, IsNotEmpty, IsOptional, IsUUID } from 'class-validator'

export class BookDto {
	@IsUUID(null, { message: 'Формат id должен быть валидный' })
	@IsNotEmpty({ message: 'id не может быть пустой' })
	timeId: string

	@IsOptional()
	@IsBoolean({ message: 'Активация бонусов должно быть' })
	isActiveBonuses: boolean
}
