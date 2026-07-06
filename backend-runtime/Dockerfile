FROM php:8.2-cli

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    unzip \
    zip \
    libzip-dev \
    libpq-dev \
    libpng-dev \
    libjpeg62-turbo-dev \
    libfreetype6-dev \
    libicu-dev \
    libxml2-dev \
    libonig-dev \
    libxslt1-dev \
    libcurl4-openssl-dev \
    libssl-dev \
    && rm -rf /var/lib/apt/lists/*

# Configure GD
RUN docker-php-ext-configure gd \
    --with-freetype \
    --with-jpeg

# Install PHP Extensions
RUN docker-php-ext-install \
    pdo \
    pdo_pgsql \
    gd \
    zip \
    intl \
    bcmath \
    exif \
    pcntl \
    opcache

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Copy project
COPY . .

# Install Laravel dependencies
RUN composer install \
    --no-dev \
    --prefer-dist \
    --optimize-autoloader \
    --no-interaction

# Laravel folders
RUN mkdir -p \
    storage/framework/cache \
    storage/framework/sessions \
    storage/framework/views \
    storage/framework/testing \
    storage/logs \
    bootstrap/cache

RUN chmod -R 775 storage bootstrap/cache

EXPOSE 8080

CMD php artisan migrate --force && \
    php artisan storage:link || true && \
    php artisan config:cache && \
    php artisan route:cache && \
    php artisan view:cache && \
    php artisan serve --host=0.0.0.0 --port=${PORT:-8080}
