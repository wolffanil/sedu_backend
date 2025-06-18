import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common'

import type { User } from '@/prisma/generated'
import { Auth } from '@/src/shared/decorators/auth.decorator'
import { Authorized } from '@/src/shared/decorators/authorized.decorator'
import { UuidValidationPipe } from '@/src/shared/pipes/uuid-validation.pipe'

import { BookService } from './book.service'
import { BookDto } from './dto/book.dto'

@Controller('books')
export class BookController {
	constructor(private readonly bookService: BookService) {}

	@Get('get-by-time/:timeId')
	@Auth('MASTER')
	async getByTimeId(@Param('timeId', UuidValidationPipe) timeId: string) {
		return this.bookService.getBookByTimeId(timeId)
	}

	@Get('get-my')
	@Auth()
	async getMy(@Authorized() user: User) {
		return this.bookService.getMyBooks(false, user)
	}

	@Get('get-my-last')
	@Auth()
	async getMyLast(@Authorized() user: User) {
		return this.bookService.getMyBooks(true, user)
	}

	@Post()
	@Auth()
	async create(@Authorized() user: User, @Body() dto: BookDto) {
		return this.bookService.create(user, dto)
	}

	@Delete(':bookId')
	@Auth()
	async cancel(
		@Param('bookId', UuidValidationPipe) bookId: string,
		@Authorized() user: User
	) {
		return this.bookService.cancel(bookId, user)
	}
}
