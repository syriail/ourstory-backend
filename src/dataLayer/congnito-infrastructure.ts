import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
const XAWS = AWSXRay.captureAWS(AWS)

export const createCognitoServiceProvider = ()=>{
    return new XAWS.CognitoIdentityServiceProvider
}
