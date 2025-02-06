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

## MongoDB

- Connect to mongo:
```bash
docker exec -it mongodb mongosh -u root -p spacey --authenticationDatabase admin
```

- Create a new database:
```bash
use spacey
```

- Create a new collection:
```bash
db.createCollection('Users')
```

## Next.js + Schadcn/ui

- Create a new Next.js project:
```bash
npx create-next-app@latest 
/*
✔ What is your project named? … my-app
✔ Would you like to use TypeScript? … No
✔ Would you like to use ESLint? … Yes
✔ Would you like to use Tailwind CSS? … Yes
✔ Would you like your code inside a `src/` directory? … No
✔ Would you like to use App Router? (recommended) … Yes
✔ Would you like to use Turbopack for `next dev`? … No
✔ Would you like to customize the import alias (`@/*` by default)? … No
*/
```

- Initialize Schadcn/ui:
```bash
cd <project-name>
npx shadcn@latest init -d // Use --force
```

- Run the project:
```bash
npm run dev
```

- Add a new component:
```bash
npx shadcn@latest add <component-name> // Use --force
```