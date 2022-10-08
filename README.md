# RESTful API Node Server Boilerplate

## Table of Contents
- [Installation](#installation)
- [Features](#features)
- [Commands](#commands)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Error Handling](#error-handling)
- [Authorization](#authorization)

## Installation

Clone the repo:

```bash
git clone https://github.com/MuhamedMagdi/express-boilerplate.git
```
Install the dependencies:

```bash
npm i
```

Set the environment variables:

```bash
cp .env.example .env

# open .env and modify the environment variables (if needed)
```

## Features
- **NoSQL database**: [MongoDB](https://www.mongodb.com) object data modeling using [Mongoose](https://mongoosejs.com)
- **Authentication and authorization**
- **Error handling**: centralized error handling mechanism
- **API documentation**: [Postman](https://www.postman.com/) documentation
- **Santizing**: sanitize request data against xss and query injection
- **Docker support**
- **Linting**: with [ESLint](https://eslint.org) and [Prettier](https://prettier.io)

## Commands

Running locally:

```bash
npm run dev
```

Running in production:

```bash
npm start
```

Docker:
```bash
# building the server image
sudo docker build -t server:v1 .

# run docker container
sudo docker-compose up
```

Linting:
```bash
# run ESLint
npm run lint:check

# fix ESLint errors
npm run lint:fix

# run prettier
npm run format:check

# fix prettier errros
npm run format:write
```

## Project Structure

```
src/
├── config        # ENV and global configurations
├── controllers   # Route controllers
├── database      # Database connection
├── models        # Mongoose models
├── routes        # API routes
└── utils         # General purpose utility function and classes
```


## API Documentation

Go [here](https://documenter.getpostman.com/view/15164367/VUxKSUAx) to view the list of available APIs and their specifications.

## Error Handling
The app has a centralized error handling mechanism.

Controllers should try to catch the errors and forward them to the error handling middleware (by calling `next(error)`). For convenience, you can also wrap the controller inside the catchAsync utility wrapper, which forwards the error.

```javascript
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const controller = catchAsync(async (req, res, next) => {
  // this error will be forwarded to the error handling middleware
  next(new AppError('your error message', your_status_code));
});
```
When running in development mode, the error response also contains the error stack.


## Authorization

Use ``protect`` middleware protect certain route to only logged in users.

``` javascript
const { protect } = require('../controllers/authController');

router.post('/some-route-you-want-to-protect', protect, someController);
```

Use ``restrictTo`` middleware to restrict certain route to specific logged in users, ``restrictTo`` should always be used after the ``protect`` middleware.

``` javascript
const { protect, restrictTo } = require('../controllers/authController');

router.post('/some-route-you-want-to-give-access-only-to-admins-and-managers', protect, restrictTo('admin', 'manager'), someController);

```
