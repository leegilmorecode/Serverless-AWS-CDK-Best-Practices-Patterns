import {
  APIGatewayEvent,
  APIGatewayProxyHandler,
  APIGatewayProxyResult,
} from 'aws-lambda';

import { v4 as uuid } from 'uuid';

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const correlationId = uuid();
    const method = 'health-check.handler';
    const prefix = `${correlationId} - ${method}`;

    console.log(`${prefix} - success`);
    return {
      statusCode: 200,
      body: JSON.stringify('success'),
    };
  } catch (error) {
    console.error(error);
    throw error;
  }
};
