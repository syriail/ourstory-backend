import {AWS} from '@serverless/typescript'
const CognitoResources: AWS['resources']['Resources']={

    OurstoryMangerUserPool:{
        Type: 'AWS::Cognito::UserPool',
        Properties:{
            UserPoolName:'${self:custom.cognito.userPoolName}',
            AutoVerifiedAttributes: ['email'],
            UsernameConfiguration: {
                CaseSensitive: false
            },
            AdminCreateUserConfig:{
                AllowAdminCreateUserOnly: true
            },
            Policies:{
                PasswordPolicy:{
                    MinimumLength: 8,
                    RequireLowercase: false,
                    RequireNumbers: false,
                    RequireSymbols: false,
                    RequireUppercase: false,
                    TemporaryPasswordValidityDays: 365
                }
            }
        }
    },
    OurstoryUserPoolClient:{
        Type: 'AWS::Cognito::UserPoolClient',
        Properties:{
            UserPoolId: {
                Ref: 'OurstoryMangerUserPool'
            },
            GenerateSecret: false,
            ClientName: '${self:custom.cognito.userPoolClientName}',
            TokenValidityUnits: {
                AccessToken : 'days',
                IdToken : 'days',
                RefreshToken : 'days'
            },
            IdTokenValidity: 1,
            AccessTokenValidity: 1,
            RefreshTokenValidity: 3650

        }
    },
    AdminUserGroup:{
        Type: 'AWS::Cognito::UserPoolGroup',
        Properties:{
            GroupName: 'ADMIN',
            UserPoolId: {
                Ref: 'OurstoryMangerUserPool'
            },
            Precedence: 0
        }
    },
    CollectionManagerUserGroup:{
        Type: 'AWS::Cognito::UserPoolGroup',
        Properties:{
            GroupName: 'COLLECTION_MANAGER',
            UserPoolId: {
                Ref: 'OurstoryMangerUserPool'
            },
            Precedence: 10
        }
    },
    EditorUserGroup:{
        Type: 'AWS::Cognito::UserPoolGroup',
        Properties:{
            GroupName: 'EDITOR',
            UserPoolId: {
                Ref: 'OurstoryMangerUserPool'
            },
            Precedence: 20
        }
    }

}

export default CognitoResources

/*
AdminCreateUserConfig:
        AllowAdminCreateUserOnly: true
        UnusedAccountValidityDays: 90
        InviteMessageTemplate:
          EmailMessage: 'Your AWS Ops Wheel username is {username} and the temporary password is {####}'
          EmailSubject: 'Your temporary password for AWS Ops Wheel '
          SMSMessage: 'Your AWS Ops Wheel username is {username} and the temporary password is {####}'
*/