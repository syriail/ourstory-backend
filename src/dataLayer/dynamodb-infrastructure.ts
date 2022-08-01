import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
const XAWS = AWSXRay.captureAWS(AWS)

export const createDynamodbClient = ()=>{
    if(process.env.IS_OFFLINE || process.env.NODE_ENV === 'test'){
        
        return new AWS.DynamoDB.DocumentClient({
            region: 'localhost',
            sslEnabled: false,
            endpoint: 'http://localhost:8000'
        })
    }
    return new XAWS.DynamoDB.DocumentClient()
}
