FROM nginx:alpine

RUN adduser -D -g '' appuser

COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf
COPY . /usr/share/nginx/html/

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
