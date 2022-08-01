import {AWS} from '@serverless/typescript'

const S3Resources: AWS['resources']['Resources']={
    MediaBucket:{
        Type: 'AWS::S3::Bucket',
        Properties:{
            BucketName:'${self:custom.s3Buckets.mediaBucket}',
            CorsConfiguration: {
                CorsRules:[
                    {
                        AllowedOrigins:['*'],
                        AllowedHeaders: ['*'],
                        AllowedMethods:['GET', 'POST', 'PUT', 'DELETE', 'HEAD'],
                        MaxAge: 3000
                    }
                ]
            }
        }
    }
    
}

export default S3Resources
/*
AttachementsBucketPolicy:{
        Type: 'AWS::S3::BucketPolicy',
        Properties:{
          Bucket: {
              Ref: 'MediaBucket'
          },
            PolicyDocument:{
                Version: '2012-10-17',
                Statement:[
                    {
                        Effect: "Allow",
                        Principal: "*",
                        Action: "s3:GetObject",
                        Resource: {
                            'Fn::Join':['/', [{'Fn::GetAtt':['MediaBucket', 'Arn']}, "*"]]
                        }
                    }
                ]
            }
            
        }
    }
*/
