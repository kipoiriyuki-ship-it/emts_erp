FROM php:8.2-cli
RUN apt-get update && apt-get install -y \
    git unzip curl zip libpq-dev \
    && docker-php-ext-install pdo pdo_pgsql
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
WORKDIR /var/www/html
COPY backend-runtime/ .
RUN composer install --no-dev --optimize-autoloader
RUN chmod -R 775 storage bootstrap/cache
EXPOSE 8080
CMD php artisan migrate --force && php artisan serve --host=0.0.0.0 --port=${PORT:-8080}
