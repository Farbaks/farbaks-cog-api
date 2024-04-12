import * as dotenv from 'dotenv';

dotenv.config();

export const AppConfig: any = process.env;

import * as Joi from 'joi';

export const AppConfigValidationSchema = Joi.object({
	NODE_ENV: Joi.string()
		.valid('development', 'production')
		.default('development'),
	NAME: Joi.string().required(),
	PORT: Joi.number().required(),
	APPLICATION_KEY: Joi.string().required(),
	DATABASE_URI: Joi.string().required(),
});
