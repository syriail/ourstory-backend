# System Architecture

Manager and Frontend are web applications built using React framework and they connect to backend by REST APIs.

The main focus of this section is the backend architecture since it contains the components and logic of the system.

![Backend Architect](./ourstory-backend-architect.png)

# DB Design

The expected read/write operations are very low and the very most of operations are to be triggered from Manger, so the only requirement to be met when choosing DB service is cost.

Dynamodb meets this only requirement since it is expected that read/write operations won't exceed the free tier.

Also since high speed IOs is not a requirement, so we don't need to complicate the design and follow one-table approch, rather a separate table will be provided for most of models as if a rational DB is to be designed.

## Collection Table

Key:

- id: String / HASH

Expected Attributes:

- managerId: String
- defaultLocale: String
- availableTranslations: [String]
- editors: [String]
- tags: [String]

## Story Table

Key:

- id: String / HASH
- collectionId / RANGE

Expected Attributes:

- defaultLocale: String
- storyType: String
- storyTellerAge: Int
- storyTellerGender: String
- availableTranslations: [String]
- mediaFiles: List of map {format, mediaPath}

## TagValue Table

Key:

- storyId: String / HASH
- tagId: String /RANGE
  tagId is in the form of collectionId#slug

Expected Attributes:

- locale: String
- name: String
- value: String

## Translation Table

Key:

- id: String / HASH
  id is the id of the item to be translated, such as projectId or storyId
- locale: String / RANGE

Possible Attributes: _Depending on what item to be translated_

- translatedType: String
- collectionName: String
- collectionDescription: String
- tagName: String
- storyTitle: String
- storyAbstraction: String
- storyTranscript: String
- storyTellerName: String
- storyTellerPlaceOfOrigin: String
- storytellerResidency: String
- collectorName: String

# Testing

The backend is ready to be unit and integration tested without the need of a Frontend

To test the backend and make sure it meets the requirements, please do the following steps:

- Checkout the project from the repository
- Then `cd our-story/ourstory-backend`
- Run `npm i --save`to install dependencies
- Add a file named `stage.ts` which is used by `serverless.ts` to specify the `profile`and `stage``
  The file should be like:

  ```
  const stage = {
    stage:'dev',
    profile: 'udacity'
  }
  export default stage

  ```

## Unit Test

- In a seperate terminal run `sls dynamodb start`. This will start local dynamodb and seed the initial data
- In current terminal run `npm test`

## Integration Test Offline and Online

The folder ourstory-backend contains Postman collection named `Our-Story.postman_collection.json`.
This collection contains all sort of required tests

- Test create, update and delete story
- Get upload url and upload file to S3 bucket
- Test get colections according to user id
- Test request validation
- Test authorization

The collection contains many tokens to test with different user id, different user's role and finally to test marlformed token.

### Test Offline

To run Postman collection offline:

- In terminal `cd ourstory-backend`
- Run `sls offline start`. This will start dynamodb local, seed the initial data in the tables, start S3 local service and create the required bucket, and start the server
- Import the collection in postman
- Set the variable {{host}} = http://localhost:3000/dev in Postman
- Run tests in at the collection level or Run each request individually

### Test Online

- Import the collection in postman
- Set the variable {{host}} = https://3c6itjpmv1.execute-api.eu-west-1.amazonaws.com/dev in Postman
- Run tests in at the collection level or Run each request individually
