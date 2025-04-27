## Project setup

```bash
./api $ yarn install
```

## Compile and run the project

```bash
# development
./api $ yarn start

# watch mode
./api $ yarn start:dev

# production mode
./api $ yarn start:prod
```

## Run unit tests

```bash
./api $ yarn test

# with coverage
./api $ yarn test:cov
```

## Build and run image
```bash
#build
./api $ docker build -t soxo .

#run
./api $ docker-compose -p soxo up
```

## Postman
<p>Using app with the authorization might be annoying, so Postman collection is available in repository with authorization already set up.</p>
