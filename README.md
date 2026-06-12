# gojs-angular-basic

### By Northwoods Software for [GoJS 2.1](https://gojs.net)

This project provides a basic example of using GoJS in an Angular app.
Check out the [Intro page on using GoJS with Angular](https://gojs.net/latest/intro/angular.html) for more information.

It makes use of the [gojs-angular](https://github.com/NorthwoodsSoftware/gojs-angular) package to handle some boilerplate for setting up Diagram, Palette and Overview components.

When running the sample, try moving around nodes, adding / deleting nodes, editing text in the inspector, relinking, undoing (Ctrl-Z), etc. within the diagram
and you'll notice the changes are reflected in app-level data. You'll also notice that changes
made in the inspector are reflected in the diagram.

## Installation

Start by running npm install to install all necessary dependencies.

## Running the project

In the project directory, run:

### `ng serve`

Runs the app in the development mode.<br>
Open [http://localhost:4200](http://localhost:4200) to view it in the browser.

The page will reload if you make edits.<br>

## LinkedIn Email Extractor

This project also includes a small **LinkedIn Email Extractor** panel at the top
of the app. Paste the text or HTML of your LinkedIn homepage (Select-All + copy,
or "View Page Source") into the box and it extracts email addresses by searching
for `mailto:` links (`"mailto:" + "@" + "."`) plus any bare addresses in the
text. Results are de-duplicated and can be copied or downloaded as CSV. All
processing happens locally in the browser — nothing is uploaded.

## Running with Docker (Docker Desktop)

The app ships with a multi-stage `Dockerfile` (Node 14 build → nginx runtime)
and a `docker-compose.yml`. With **Docker Desktop** running:

```sh
# Build and start (serves on http://localhost:8080)
docker compose up --build

# ...or without compose:
docker build -t gojs-angular-basic .
docker run --rm -p 8080:80 gojs-angular-basic
```

Then open [http://localhost:8080](http://localhost:8080). Stop with
`docker compose down` (or Ctrl-C).

### Development inside Docker (live reload)

To develop in a container with `ng serve` and automatic reload on file
changes (uses `Dockerfile.dev` and bind-mounts your source):

```sh
docker compose up dev
```

Open [http://localhost:4200](http://localhost:4200) and edit files on the
host — the browser reloads automatically.

## Learn More

To learn Angular, check out the [Angular's official site](https://angular.io/).
To learn GoJS, check out [gojs.net](https://gojs.net).
