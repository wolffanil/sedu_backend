import {
	Body,
	Controller,
	HttpCode,
	HttpStatus,
	Patch,
	Post,
	UploadedFile,
	UseInterceptors
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'

import type { User } from '@/prisma/generated'
import { Auth } from '@/src/shared/decorators/auth.decorator'
import { Authorized } from '@/src/shared/decorators/authorized.decorator'
import { FileValidationPipe } from '@/src/shared/pipes/file-validation.pipe'

import { ChangeInfoDto } from './dto/change-info.dto'
import { ProfileService } from './profile.service'

@Controller('profile')
export class ProfileController {
	constructor(private readonly profileService: ProfileService) {}

	@Post('change-photo')
	@Auth()
	@HttpCode(HttpStatus.OK)
	@UseInterceptors(FileInterceptor('photo'))
	async changeAvatar(
		@Authorized() user: User,
		@UploadedFile(new FileValidationPipe()) photo: Express.Multer.File
	) {
		return this.profileService.changeAvatar(user, photo)
	}

	@Post('remove-photo')
	@Auth()
	async deletePhoto(@Authorized() user: User) {
		return this.profileService.removeAvatar(user)
	}

	@Patch('change-info')
	@Auth()
	async changeInfo(@Body() dto: ChangeInfoDto, @Authorized() user: User) {
		return this.profileService.changeInfo(user, dto)
	}
}
