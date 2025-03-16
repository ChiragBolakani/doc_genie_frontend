## Copy build to Remote VM
```bash
gcloud compute scp --recurse build cssjava1@instance-20250310-191214:/home/apps/doc_genie/ui
```

## stop nginx container
```bash
docker stop doc_genie_ui
```

## remove container
```bash
docker rm doc_genie_ui
```

## Start nginx on port 3000
```bash
docker run -d \
    --name doc_genie_ui \
    -p 3000:80 \
    -v /home/apps/doc_genie/ui/build:/usr/share/nginx/html \
    -v /home/apps/doc_genie/ui/nginx.conf:/etc/nginx/conf.d/default.conf \
    nginx:alpine
```