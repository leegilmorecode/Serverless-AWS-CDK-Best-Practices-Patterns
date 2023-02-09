import * as AWS from 'aws-sdk';

import {
  APIGatewayEvent,
  APIGatewayProxyHandler,
  APIGatewayProxyResult,
} from 'aws-lambda';

import { v4 as uuid } from 'uuid';

const dynamoDb = new AWS.DynamoDB.DocumentClient();

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const correlationId = uuid();
    const method = 'get-order.handler';
    const prefix = `${correlationId} - ${method}`;

    if (!process.env.TABLE_NAME) {
      throw new Error('no table name supplied');
    }

    console.log(`${prefix} - started`);

    if (!event?.pathParameters)
      throw new Error('no id in the path parameters of the event');

    // we get the specific order id from the path parameters in the event from api gateway
    const { id } = event.pathParameters;

    const ordersTable = process.env.TABLE_NAME;

    const params: AWS.DynamoDB.DocumentClient.GetItemInput = {
      TableName: ordersTable,
      Key: {
        id,
      },
    };

    console.log(`${prefix} - get order: ${id}`);

    const { Item: item } = await dynamoDb.get(params).promise();

    // api gateway needs us to return this body (stringified) and the status code
    return {
      statusCode: 200,
      body: JSON.stringify(item),
    };
  } catch (error) {
    console.error(error);
    throw error;
  }
};
