/** @format */
export const siteVerticalSchema = {
	type: 'object',
	additionalProperties: false,
	properties: {
		isUserInput: {
			type: 'boolean',
		},
		name: {
			type: 'string',
		},
		slug: {
			type: 'string',
		},
	},
};
