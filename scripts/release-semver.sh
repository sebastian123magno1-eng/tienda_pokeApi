#!/bin/bash
# Semantic Versioning (SemVer) Release Script for Docker Hub
# Standard: vMAJOR.MINOR.PATCH with environment tags

USERNAME="sebas11221"
IMAGE_NAME="tienda-pokeapi"
VERSION="v1.0.0"

echo "=== Building Docker image with SemVer: ${VERSION} ==="
docker build -t ${USERNAME}/${IMAGE_NAME}:${VERSION} .

echo "=== Tagging images for multi-environment release ==="
# QA Environment
docker tag ${USERNAME}/${IMAGE_NAME}:${VERSION} ${USERNAME}/${IMAGE_NAME}:${VERSION}-qa

# Production Environment
docker tag ${USERNAME}/${IMAGE_NAME}:${VERSION} ${USERNAME}/${IMAGE_NAME}:${VERSION}-prod

# Latest convenience pointer
docker tag ${USERNAME}/${IMAGE_NAME}:${VERSION} ${USERNAME}/${IMAGE_NAME}:latest

echo "=== Tagging complete ==="
echo "Images ready to push:"
echo "  - ${USERNAME}/${IMAGE_NAME}:${VERSION}"
echo "  - ${USERNAME}/${IMAGE_NAME}:${VERSION}-qa"
echo "  - ${USERNAME}/${IMAGE_NAME}:${VERSION}-prod"
echo "  - ${USERNAME}/${IMAGE_NAME}:latest"
