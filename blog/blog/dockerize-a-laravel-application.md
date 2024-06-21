---
title: Dockerize A Laravel Application
date: 2023-08-20
description: What I did to serve a laravel application with docker containers.
featured: true
---
# Dockerize A Laravel Application
What I did to serve a laravel application with docker containers.

I know that some of you have installed versions of mysql / php / whatever on your local pc to develop an application, only to need to use a different version for your application at work, or pulling in open source code that yet requires another version of something. Putting the app into docker containers allows me to easily switch between environments.

Creating this blog post is my way of remembering how I did it so I can do it again!

## Install Docker

This post assumes you have installed Docker Desktop for your machine, [https://www.docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop "https://www.docker.com/products/docker-desktop"). If you're running macos, docker compose is already brought in.

## Install Your Laravel Application

If you don't already have an application you'd like to "dockerize", go ahead and install a fresh version of Laravel just like normal. [https://laravel.com/docs/installation](https://laravel.com/docs/installation "https://laravel.com/docs/installation")

## Dockerfile

We'll create a custom docker image for our application using a Dockerfile.

Create a "docker" directory in the root of your application `mkdir docker` and add Dockerfile to it `touch Dockerfile`

Our dockerfile is using the [official php image](https://hub.docker.com/_/php) from Docker Hub. Copy the code below and paste it in your new Dockerfile.

```bash
FROM php:8.0-fpm

# Arguments defined in docker-compose.yml
ARG user
ARG uid

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip

# Clear cache
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# Install PHP extensions
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd

# Get latest Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Create system user to run Composer and Artisan Commands
RUN useradd -G www-data,root -u $uid -d /home/$user $user
RUN mkdir -p /home/$user/.composer && \
    chown -R $user:$user /home/$user

# Set working directory
WORKDIR /var/www

USER $user
```

Our Dockerfile starts by defining the base image we’re using: php:8.0-fpm.

After installing system packages and PHP extensions, we install Composer by copying the composer executable from its latest [official image](https://hub.docker.com/_/composer) to our own application image.

A new system user is then created and set up using the user and uid arguments. These values will be injected by Docker Compose at build time.

Finally, we set the default working dir as /var/www and change to the newly created user. This will make sure you’re connecting as a regular user, and that you’re on the right directory, when running composer and artisan commands on the application container.

## NGNIX Configuration

Docker compose needs to have some information about services we use in our docker container. so let's create a place for our NGNIX configuration to live.

In the "docker" directory we created earlier we need to create a new directory called nginx `mkdir -p docker/nginx` and create a file inside. i called mine app.conf `touch app.conf`

Paste the below contents into that file:

```bash
server {
    listen 80;
    index index.php index.html;
    error_log  /var/log/nginx/error.log;
    access_log /var/log/nginx/access.log;
    root /var/www/public;
    location ~ \.php$ {
        try_files $uri =404;
        fastcgi_split_path_info ^(.+\.php)(/.+)$;
        fastcgi_pass app:9000;
        fastcgi_index index.php;
        include fastcgi_params;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        fastcgi_param PATH_INFO $fastcgi_path_info;
    }
    location / {
        try_files $uri $uri/ /index.php?$query_string;
        gzip_static on;
    }
}
```

This file will configure Nginx to listen on port 80 and use index.php as default index page. It will set the document root to /var/www/public, and then configure Nginx to use the app service on port 9000 to process *.php files.

## Docker Compose Environment

To set up our service definitions, we’ll create a new file called `docker-compose.yml` at the root of the application. It defines your containerized environment, including the base images you will use to build your containers, and how your services will interact.

```yaml
version: "3.7"
services:
  app:
    build:
      args:
        user: sammy
        uid: 1000
      context: ./
      dockerfile: docker/Dockerfile
    image: app
    container_name: app
    restart: unless-stopped
    working_dir: /var/www/
    volumes:
      - ./:/var/www
    networks:
      - app
  npm:
    image: node:latest
    container_name: npm
    volumes:
      - ./:/var/www
    working_dir: /var/www/
    entrypoint: ['npm', '--no-bin-links']
    networks:
      - app
  db:
    image: mysql:5.7
    container_name: db
    restart: unless-stopped
    environment:
      MYSQL_DATABASE: ${DB_DATABASE}
      MYSQL_ROOT_PASSWORD: ${DB_PASSWORD}
      MYSQL_PASSWORD: ${DB_PASSWORD}
      MYSQL_USER: ${DB_USERNAME}
      SERVICE_TAGS: dev
      SERVICE_NAME: mysql
    volumes:
      - ./docker/mysql:/docker-entrypoint-initdb.d
    ports:
      - 3306:3306
    networks:
      - app
  nginx:
    image: nginx:1.17-alpine
    container_name: nginx
    restart: unless-stopped
    ports:
      - 8000:80
    volumes:
      - ./:/var/www
      - ./docker/nginx:/etc/nginx/conf.d
    networks:
      - app
networks:
  app:
    driver: bridge
```

The docker-compose.yml file above creates four services. "app", "npm", "db", and "ngnix", which we'll need to run our laravel application.

## The app service:

`build`: This configuration tells Docker Compose to build a local image for the app service, using the specified path (context) and Dockerfile for instructions. The arguments user and uid are injected into the Dockerfile to customize user creation commands at build time.

`image`: The name that will be used for the image being built.

`container_name`: Whatever you want the container to be called.

`restart`: Always restart, unless the service is stopped.

`working_dir`: Sets the default directory for this service as /var/www.

`volumes`: Creates a shared volume that will synchronize contents from the current directory to /var/www inside the container. Notice that this is not your document root, since that will live in the nginx container.

`networks`: Sets up this service to use a network named app.

## The npm service:

`image`: Pulls in the official node image from Docker Hub.

`container_name`: Sets up the container name for this service: npm.

## The db service:

`image`: Defines the Docker image that should be used for this container. In this case, we’re using a MySQL 5.7 image from Docker Hub.

`container_name`: Sets up the container name for this service: db.

`restart`: Always restart this service, unless it is explicitly stopped.

`environment`: Defines environment variables in the new container. We’re using values obtained from the Laravel .env file to set up our MySQL service, which will automatically create a new database and user based on the provided environment variables.

`volumes`: Creates a volume to share a .sql database dump that will be used to initialize the application database. The MySQL image will automatically import .sql files placed in the /docker/sql/docker-entrypoint-initdb.d directory inside the container.

`networks`: Sets up this service to use a network named app.

## The ngnix service:

`image`: Defines the Docker image that should be used for this container. In this case, we’re using the Alpine Nginx 1.17 image.

`container_name`: Sets up the container name for this service: ngnix

`restart`: Always restart this service, unless it is explicitly stopped.

`ports`: Sets up a port redirection that will allow external access via port 8000 to the web server running on port 80 inside the container.

`volumes`: Creates **two** shared volumes. The first one will synchronize contents from the current directory to /var/www inside the container. This way, when you make local changes to the application files, they will be quickly reflected in the application being served by Nginx inside the container. The second volume will make sure our Nginx configuration file, located at docker/nginx/app.conf, is copied to the container’s Nginx configuration folder.

`networks`: Sets up this service to use a network named app.

## Build The Containers

Build the new containers with `docker-compose build app` This should take a few minutes as everything has been downloaded into the container.

When the build has completed, start the environment with `docker-compose up -d`

To see the status of your active services, use `docker-compose ps`

You can run commands in the docker environment by prepending your commands with `docker-compose exec app` (i.e. docker-compose exec app php artisan) or by ssh'ing into the docker shell `docker exec -it app bash` then going to the application root and typing your command.

So, you'll need to run composer install `docker-compose exec app composer install`

And you'll need to generate an application key `docker-compose exec app php artisan key:generate`

Now you can go see your Laravel installation in the browser at [http://localhost:8000/](http://localhost:8000/)

If you end up needing to run NPM, you can install with `docker-compose run --rm npm install`

Run npm dev environment with `docker-compose run --rm npm run dev`

NOTE: if you do not need NPM at all, you can leave the npm portion out of docker-compose.yml.

To shut down the containers, run `docker-compose down`

## Conclusion

I hope this successfully serves its purpose as a way for me to remember how to do this in the future, and maybe even help some others as well.

Happy coding!
