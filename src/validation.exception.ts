import { HttpException } from '@nestjs/common'

export class ValidationException extends HttpException {
	constructor(errors: { field: string; message: string }) {
		super({ errors }, 400)
	}
}
