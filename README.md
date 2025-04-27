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
# development
./api $ yarn test

# with coverage
./api $ yarn test:cov
```

## Build image
<p>App runs on port 3000</p>
```bash
docker build -t soxo .
```

## Postman
<p>Using app with the authorization might be annoying, so Postman collection is available in repository with authorization already set up.</p>
