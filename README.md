# ING1GIA_WebFinalProject

## Running the project

Need to download Docker and Docker Compose.

Then, run the following command in the root directory of the project:

```bash
docker-compose up --build -d # -d is for detached mode
or
docker compose up --build -d # -d is for detached mode
```
or
```bash
docker-compose up --build # Will run frontend and backend in the same terminal
or
docker compose up --build # Will run frontend and backend in the same terminal
```
or
```bash
docker-compose up --build frontend # Will run only the frontend
docker-compose up --build backend # Will run only the backend
or 
docker compose up --build frontend # Will run only the frontend
docker compose up --build backend # Will run only the backend
```