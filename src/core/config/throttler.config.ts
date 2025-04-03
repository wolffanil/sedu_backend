import { ThrottlerOptions } from '@nestjs/throttler'

export function getThrottlerConfig(): ThrottlerOptions {
	return {
		limit: 0,
		ttl: 0
	}
}
