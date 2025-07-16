# # stage 1: build
# FROM node:20-alpine AS build

# WORKDIR /app

# # copy only lock file and package.json for caching
# COPY package.json pnpm-lock.yaml ./

# # install pnpm globally
# RUN npm install -g pnpm

# # install dependencies
# RUN pnpm install

# # copy the rest of the source
# COPY . .

# # build Vite
# RUN pnpm run build

# # stage 2: nginx
# FROM nginx:alpine

# # copy production build
# COPY --from=build /app/dist /usr/share/nginx/html

# # copy nginx config if needed (optional)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# EXPOSE 80

# CMD ["nginx", "-g", "daemon off;"]

# stage 1: build
FROM node:20-alpine AS build

WORKDIR /app

# copy only lock file and package.json for caching
COPY package.json pnpm-lock.yaml ./

# install pnpm globally
RUN npm install -g pnpm

# install dependencies
RUN pnpm install

# copy the rest of the source
COPY . .

# Accept build arguments for environment variables
ARG VITE_API_URL
ARG VITE_GOOGLE_CLIENT_ID

# Set environment variables for build (Vite needs these during build time)
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID

# Debug: Print environment variables (remove in production)
RUN echo "Building with VITE_API_URL: $VITE_API_URL"
RUN echo "Building with VITE_GOOGLE_CLIENT_ID: $VITE_GOOGLE_CLIENT_ID"

# build Vite
RUN pnpm run build

# stage 2: nginx
FROM nginx:alpine

# copy production build
COPY --from=build /app/dist /usr/share/nginx/html

# copy nginx config if needed (optional)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]