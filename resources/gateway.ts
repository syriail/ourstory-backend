import {AWS} from '@serverless/typescript'
const GatewayResources: AWS['resources']['Resources']={
    GatewayResponseDefault4XX:{
        Type: 'AWS::ApiGateway::GatewayResponse',
        Properties:{
          ResponseParameters:{
            'gatewayresponse.header.Access-Control-Allow-Origin': "'*'",
            'gatewayresponse.header.Access-Control-Allow-Headers': "'Content-Type,X-Amz-Date,Authorization'",
            'gatewayresponse.header.Access-Control-Allow-Methods': "'GET,OPTIONS,POST,PUT'"
          },
          ResponseType: 'DEFAULT_4XX',
          RestApiId: {
            Ref: "ApiGatewayRestApi"
          }
        }
      }
}
export default GatewayResources