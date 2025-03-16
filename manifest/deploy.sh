#!/bin/bash

# Variables
INSTANCE_NAME="instance-20250310-191214"
ZONE="asia-south1-c"  # Added zone
USER="cssjava1"
REMOTE_PATH="/home/apps/doc_genie/ui"
CONTAINER_NAME="doc_genie_ui"
LOCAL_BUILD_PATH="C:/Users/chirag/Documents/python/DocGenie/doc_genie_frontend/build"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print status
print_status() {
    echo -e "${GREEN}[INFO]${NC} \$1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} \$1"
}

# Function to check if last command was successful
check_status() {
    if [ $? -eq 0 ]; then
        print_status "\$1 successful"
    else
        print_error "\$1 failed"
        exit 1
    fi
}

# 1. Copy build to Remote VM
print_status "Copying build folder to remote VM..."
gcloud compute scp --recurse "${LOCAL_BUILD_PATH}" ${USER}@${INSTANCE_NAME}:${REMOTE_PATH} --zone=${ZONE}
check_status "Copy"

# 2. Connect to VM and execute Docker commands
print_status "Connecting to VM and executing Docker commands..."
gcloud compute ssh ${USER}@${INSTANCE_NAME} --zone=${ZONE} --command "
    # Switch to root user
    sudo su <<'EOF'

    # Stop container if running
    if docker ps -a | grep -q ${CONTAINER_NAME}; then
        echo 'Stopping container...'
        docker stop ${CONTAINER_NAME}
        docker rm ${CONTAINER_NAME}
    fi

    # Start new container
    echo 'Starting new container...'
    docker run -d \
        --name ${CONTAINER_NAME} \
        -p 3000:80 \
        -v ${REMOTE_PATH}/build:/usr/share/nginx/html \
        -v ${REMOTE_PATH}/nginx.conf:/etc/nginx/conf.d/default.conf \
        nginx:alpine

    # Check if container is running
    if docker ps | grep -q ${CONTAINER_NAME}; then
        echo 'Container started successfully'
    else
        echo 'Container failed to start'
        exit 1
    fi
EOF
"
check_status "Docker operations"

print_status "Deployment completed successfully!"
print_status "UI should be accessible at http://<vm-ip>:3000"