import type { ZodRecord, ZodString, ZodTypeAny } from 'zod';

declare module 'zod' {
	export function record<Value extends ZodTypeAny>(
		valueType: Value,
		params?: unknown,
	): ZodRecord<ZodString, Value>;
}
