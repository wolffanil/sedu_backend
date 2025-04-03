import {
	ArgumentMetadata,
	BadRequestException,
	Injectable,
	PipeTransform
} from '@nestjs/common'
import { validate as uuidValidate } from 'uuid'

@Injectable()
export class UuidValidationPipe implements PipeTransform<string> {
	transform(value: string, metadata: ArgumentMetadata): string {
		if (metadata.type !== 'param') return value

		if (!uuidValidate(value)) {
			throw new BadRequestException('Невалидный UUID')
		}
		return value
	}
}
