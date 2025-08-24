#!/bin/bash

# AWS Deployment Script for Commit to Kids
# This script builds Docker images and pushes them to AWS ECR

set -e

# Configuration
AWS_REGION=${AWS_REGION:-us-east-1}
AWS_ACCOUNT_ID=${AWS_ACCOUNT_ID}
ECR_REGISTRY="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com"
IMAGE_TAG=${IMAGE_TAG:-latest}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting AWS deployment...${NC}"

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}AWS CLI is not installed. Please install it first.${NC}"
    exit 1
fi

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo -e "${RED}Docker is not running. Please start Docker.${NC}"
    exit 1
fi

# Check AWS Account ID
if [ -z "$AWS_ACCOUNT_ID" ]; then
    echo -e "${RED}AWS_ACCOUNT_ID is not set. Please set it in your environment.${NC}"
    exit 1
fi

# Authenticate Docker to ECR
echo -e "${YELLOW}Authenticating Docker to ECR...${NC}"
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ECR_REGISTRY

# Create ECR repositories if they don't exist
echo -e "${YELLOW}Creating ECR repositories if needed...${NC}"
aws ecr describe-repositories --repository-names commit-to-kids-backend --region $AWS_REGION 2>/dev/null || \
    aws ecr create-repository --repository-name commit-to-kids-backend --region $AWS_REGION

aws ecr describe-repositories --repository-names commit-to-kids-frontend --region $AWS_REGION 2>/dev/null || \
    aws ecr create-repository --repository-name commit-to-kids-frontend --region $AWS_REGION

# Build and push backend image
echo -e "${YELLOW}Building backend Docker image...${NC}"
docker build -t commit-to-kids-backend:$IMAGE_TAG ./backend

echo -e "${YELLOW}Tagging backend image...${NC}"
docker tag commit-to-kids-backend:$IMAGE_TAG $ECR_REGISTRY/commit-to-kids-backend:$IMAGE_TAG

echo -e "${YELLOW}Pushing backend image to ECR...${NC}"
docker push $ECR_REGISTRY/commit-to-kids-backend:$IMAGE_TAG

# Build and push frontend image
echo -e "${YELLOW}Building frontend Docker image...${NC}"
docker build -t commit-to-kids-frontend:$IMAGE_TAG ./frontend

echo -e "${YELLOW}Tagging frontend image...${NC}"
docker tag commit-to-kids-frontend:$IMAGE_TAG $ECR_REGISTRY/commit-to-kids-frontend:$IMAGE_TAG

echo -e "${YELLOW}Pushing frontend image to ECR...${NC}"
docker push $ECR_REGISTRY/commit-to-kids-frontend:$IMAGE_TAG

echo -e "${GREEN}✓ Deployment complete!${NC}"
echo -e "${GREEN}Images pushed to ECR:${NC}"
echo -e "  - $ECR_REGISTRY/commit-to-kids-backend:$IMAGE_TAG"
echo -e "  - $ECR_REGISTRY/commit-to-kids-frontend:$IMAGE_TAG"

echo -e "\n${YELLOW}Next steps:${NC}"
echo "1. Deploy using ECS, EKS, or EC2 with docker-compose.prod.yml"
echo "2. Set up Application Load Balancer (ALB) for production"
echo "3. Configure Route 53 for your domain"
echo "4. Set up SSL certificates using AWS Certificate Manager"