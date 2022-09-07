import type { AWS } from '@serverless/typescript';
import DynamodDbResources from 'resources/dynamodb'
import GatewayResources from 'resources/gateway'
import S3Resources from 'resources/s3'
import CognitoResources from 'resources/cognito'

import stage from './stage'
import {
  getCollections,
  createStory,
  createCollection,
  updateStory,
  getStories,
  deleteStory,
  getStory,
  authorize,
  getUploadUrl,
  getEmployee,
  getEmployeesByRole,
  updateCollection,
  getCollection,
  translateCollection,
  getDownloadUrl,
  syncSearchIndex,
  getTags,
  deleteMedia,
  translateStory,
  createPage,
  updatePage,
  getPagesNames,
  getPages,
  getPageDetails,
  getPageContent,
  deletePage,
  createEmployee,
  getEmployees
} from '@functions'


const serverlessConfiguration: AWS = {
  service: 'ourstory-backend',
  frameworkVersion: '3',
  plugins: [
    'serverless-esbuild',
    'serverless-iam-roles-per-function',
    'serverless-plugin-tracing',
    'serverless-dynamodb-local',
    'serverless-offline',
    'serverless-s3-local'
  ],
  provider: {
    name: 'aws',
    runtime: 'nodejs14.x',
    profile: stage.profile,
    region: 'eu-west-1',
    stage: stage.stage,
    tracing:{
      lambda: true,
      apiGateway: true
    },
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
      EMPLOYEES_TABLE: '${self:custom.tables.employeesTable}',
      COLLECTIONS_TABLE: '${self:custom.tables.collectionsTable}',
      STORIES_TABLE: '${self:custom.tables.storiesTable}',
      TRANSLATIONS_TABLE: '${self:custom.tables.translationsTable}',
      TAG_VALUES_TABLE: '${self:custom.tables.tagValuesTable}',
      STATIC_PAGES_TABLE:'${self:custom.tables.staticPagesTable}',
      TRANSLATION_BY_TYPE_INDEX: '${self:custom.tables.translationsByTypeIndex}',
      STORIES_BY_COLLECTION_INDEX: '${self:custom.tables.storiesByCollectionIndex}'
      
    },
    iam:{
      role:{
        statements:[
          {
            Effect: 'Allow',
            Action:[
              'xray:PutTelemetryRecords',
              'xray:PutTraceSegments'
            ],
            Resource: '*'
          }
        ]
      },
    },
    logs:{
      restApi: true
    }
  },
  // import the function via paths
  functions: {
    getCollections,
    createStory,
    createCollection,
    updateStory,
    getStories,
    deleteStory,
    getStory,
    authorize,
    getUploadUrl,
    getEmployee,
    getEmployeesByRole,
    updateCollection,
    getCollection,
    translateCollection,
    getDownloadUrl,
    syncSearchIndex,
    getTags,
    deleteMedia,
    translateStory,
    createPage,
    updatePage,
    getPagesNames,
    getPages,
    getPageDetails,
    getPageContent,
    deletePage,
    createEmployee,
    getEmployees
  },
  resources:{
    Resources:{
      ...DynamodDbResources,
      ...GatewayResources,
      ...S3Resources,
      ...CognitoResources
    }
  },
  package: { individually: true },
  custom: {
    tables:{
      employeesTable: 'employees-${self:provider.stage}',
      collectionsTable: 'collections-${self:provider.stage}',
      storiesTable: 'stories-${self:provider.stage}',
      storiesByCollectionIndex: 'stories-by-collection-index-${self:provider.stage}',
      translationsTable: 'translations-${self:provider.stage}',
      translationsByTypeIndex: 'translation-by-type-index-${self:provider.stage}',
      tagValuesTable: 'tag-values-${self:provider.stage}',
      staticPagesTable: 'static-pages-${self:provider.stage}'
    },
    cognito:{
      userPoolName: 'ourstory-user-pool-${self:provider.stage}',
      userPoolClientName: 'ourstory-user-pool-client-${self:provider.stage}'
    },
    s3Buckets:{
      mediaBucket: 'ourstory-media-${self:provider.stage}'
    },
    s3:{
      host: 'localhost',
      port: '4569'
    },
    'serverless-offline':{
      port: 3000
    },
    dynamodb:{
      start:{
        port: 8000,
        inMemory: true,
        migrate: true,
        seed: true
      },
      seed:{
        test:{
          sources:[
            {
              table: '${self:custom.tables.employeesTable}',
              sources: ['./db-seeds/employees.json']
            },
            {
              table: '${self:custom.tables.collectionsTable}',
              sources: ['./db-seeds/collections.json']
            },
            {
              table: '${self:custom.tables.storiesTable}',
              sources: ['./db-seeds/stories.json']
            },
            {
              table: '${self:custom.tables.translationsTable}',
              sources: ['./db-seeds/translations.json']
            },
            {
              table: '${self:custom.tables.tagValuesTable}',
              sources: ['./db-seeds/tag-values.json']
            }
          ]
        }
      },
      stages: ['dev']
    },
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ['aws-sdk'],
      target: 'node14',
      define: { 'require.resolve': undefined },
      platform: 'node',
      concurrency: 10,
    },
  },
  
};

module.exports = serverlessConfiguration;
