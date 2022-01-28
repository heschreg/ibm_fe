FROM node:14.17.0-alpine as build-step
RUN mkdir -p /feapp
WORKDIR /feapp
COPY package.json /feapp
RUN npm install
COPY . /feapp
RUN npm run build --prod

FROM nginx:latest
#ARG WORK_DIR
COPY --from=build-step /feapp/dist/ibm_fe/ /usr/share/nginx/html
#COPY ./nginx/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 4200:80
#CMD nginx -g "daemon off;"

# FROM nginx:1.17.1-alpine
# COPY /dist/ibm_fe /usr/share/nginx.html
