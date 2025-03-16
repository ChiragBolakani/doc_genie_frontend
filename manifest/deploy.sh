#!/bin/bash

# Variables
LOCAL_BUILD_PATH="C:/Users/chirag/Documents/python/DocGenie/doc_genie_frontend/build"
REMOTE_USER="cssjava1"
INSTANCE_NAME="instance-20250310-191214"
REMOTE_HOST="$REMOTE_USER@$INSTANCE_NAME"
REMOTE_BUILD_PATH="/home/apps/doc_genie/ui/build"

# Ensure the local build path exists
if [ ! -d "$LOCAL_BUILD_PATH" ]; then
    echo "Error: Local build path does not exist."
    exit 1
fi

echo "Copying build files to remote server..."
gcloud compute scp --recurse "$LOCAL_BUILD_PATH" "$REMOTE_HOST:$REMOTE_BUILD_PATH"

# Run docker commands on the remote instance
echo "Checking for existing container and deploying the new one..."
gcloud compute ssh "$REMOTE_HOST" --command "
    # Check if container is running
    if docker ps -q --filter 'name=doc_genie_ui' | grep -q .; then
        echo 'Stopping and removing existing doc_genie_ui container...'
        docker stop doc_genie_ui && docker rm doc_genie_ui
    fi

    echo 'Starting new doc_genie_ui container...'
    docker run -d \
        --name doc_genie_ui \
        -p 3000:80 \
        -v /home/apps/doc_genie/ui/build:/usr/share/nginx/html \
        -v /home/apps/doc_genie/ui/nginx.conf:/etc/nginx/conf.d/default.conf \
        nginx:alpine
"

echo "Deployment complete!"
