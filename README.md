# RESTful Cloud Storage API

RESTful cloud storage server built with express that uses [Firebase  Cloud Storage](https://firebase.google.com/docs/storage) as cloud provider.

## Table of Contents
-   [Installation](#installation)
-   [Features](#features)
-   [Commands](#commands)
-   [Project Structure](#project-structure)
-   [API Documentation](#api-documentation)

## Installation

Clone the repo:

```bash
git https://github.com/MuhamedMagdi/CloudStorage.git
```

Install the dependencies:

```bash
npm i
```

Set the environment variables:

```bash
cp .env.example .env

# open .env and modify the environment variables
```

## Features

-   **Authentication and Authorization**
-   **File CRUD**
-   **API documentation**: [swagger](https://www.swagger.io/) documentation
-   **Dockerized**
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

Go to `/api/v1/api-docs` view the list of available APIs endpoints and their specifications.-
