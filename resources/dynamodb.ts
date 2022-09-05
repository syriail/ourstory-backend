import {AWS} from '@serverless/typescript'

const DynamodDbResources: AWS['resources']['Resources']={
    EmployeesTable:{
        Type: 'AWS::DynamoDB::Table',
        Properties:{
            TableName: '${self:custom.tables.employeesTable}',
            AttributeDefinitions:[
                {
                    AttributeName: 'id',
                    AttributeType: 'S'
                }
            ],
            KeySchema:[
                {
                    AttributeName: 'id',
                    KeyType: 'HASH'
                }
            ],
            BillingMode: 'PAY_PER_REQUEST'
        }
    },
    CollectionsTable:{
        Type: 'AWS::DynamoDB::Table',
        Properties:{
            TableName: '${self:custom.tables.collectionsTable}',
            AttributeDefinitions:[
                {
                    AttributeName: 'id',
                    AttributeType: 'S'
                }
            ],
            KeySchema:[
                {
                    AttributeName: 'id',
                    KeyType: 'HASH'
                }
            ],
            BillingMode: 'PAY_PER_REQUEST'
        }
    },
    TranslationsTable:{
        Type: 'AWS::DynamoDB::Table',
        Properties:{
            TableName: '${self:custom.tables.translationsTable}',
            AttributeDefinitions:[
                {
                    AttributeName: 'id',
                    AttributeType: 'S'
                },
                {
                    AttributeName: 'locale',
                    AttributeType: 'S'
                },
                {
                    AttributeName: 'translatedType',
                    AttributeType: 'S'
                }
            ],
            KeySchema:[
                {
                    AttributeName: 'id',
                    KeyType: 'HASH'
                },
                {
                    AttributeName: 'locale',
                    KeyType: 'RANGE'
                }
            ],
            BillingMode: 'PAY_PER_REQUEST',
            GlobalSecondaryIndexes:[
                {
                    IndexName: '${self:custom.tables.translationsByTypeIndex}',
                    KeySchema:[
                        {
                            AttributeName: 'translatedType',
                            KeyType: 'HASH'
                        },
                        {
                            AttributeName: 'id',
                            KeyType: 'RANGE'
                        }
                    ],
                    Projection: {
                        ProjectionType: 'ALL'
                    }
                }
            ],
            StreamSpecification:{
                StreamViewType: 'NEW_IMAGE'
            }
        }
    },
    StoriesTable:{
        Type: 'AWS::DynamoDB::Table',
        Properties:{
            TableName: '${self:custom.tables.storiesTable}',
            AttributeDefinitions:[
                {
                    AttributeName: 'id',
                    AttributeType: 'S'
                },
                {
                    AttributeName: 'collectionId',
                    AttributeType: 'S'
                }
            ],
            KeySchema:[
                {
                    AttributeName: 'id',
                    KeyType: 'HASH'
                }
            ],
            BillingMode: 'PAY_PER_REQUEST',
            GlobalSecondaryIndexes:[
                {
                    IndexName: '${self:custom.tables.storiesByCollectionIndex}',
                    KeySchema:[
                        {
                            AttributeName: 'collectionId',
                            KeyType: 'HASH'
                        }
                    ],
                    Projection: {
                        ProjectionType: 'ALL'
                    }
                }
            ]
        }
    },
    TagValuesTable:{
        Type: 'AWS::DynamoDB::Table',
        Properties:{
            TableName: '${self:custom.tables.tagValuesTable}',
            AttributeDefinitions:[
                {
                    AttributeName: 'storyId',
                    AttributeType: 'S'
                },
                {
                    AttributeName: 'tagId',
                    AttributeType: 'S'
                }
            ],
            KeySchema:[
                {
                    AttributeName: 'storyId',
                    KeyType: 'HASH'
                },
                {
                    AttributeName: 'tagId',
                    KeyType: 'RANGE'
                }
            ],
            BillingMode: 'PAY_PER_REQUEST',
            StreamSpecification:{
                StreamViewType: 'NEW_IMAGE'
            }
        }
    },
    StaticPagesTable:{
        Type: 'AWS::DynamoDB::Table',
        Properties:{
            TableName: '${self:custom.tables.staticPagesTable}',
            AttributeDefinitions:[
                {
                    AttributeName: 'locale',
                    AttributeType: 'S'
                },
                {
                    AttributeName: 'slug',
                    AttributeType: 'S'
                }
            ],
            KeySchema:[
                {
                    AttributeName: 'locale',
                    KeyType: 'HASH'
                },
                {
                    AttributeName: 'slug',
                    KeyType: 'RANGE'
                }
            ],
            BillingMode: 'PAY_PER_REQUEST'
        }
    }
}
export default DynamodDbResources