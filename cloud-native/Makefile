export IMAGE_REPO=astroshop/productcatalogadmin
export IMAGE_VERSION=v1
export AWS_ACCOUNT_ID=$(shell aws ecr describe-registry --query registryId --output text)
export REGION=us-east-1
export ECR_REGISTRY="${AWS_ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com"

all: repos build

repos:
	@for i in ${IMAGE_REPO}; do \
		echo "Checking if repository $${i} exists..."; \
		aws ecr describe-repositories --repository-names $${i} > /dev/null || aws ecr create-repository --repository-name $${i} --output text ; \
	done

build:
	@echo "Logging into AWS ECR registry ${ECR_REGISTRY}..."
	@aws ecr get-login-password --region ${REGION} | docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com

	docker buildx build -t ${IMAGE_REPO}:${IMAGE_VERSION} --no-cache --platform linux/amd64 --build-arg build=${GIT_BRANCH}-${BUILD_ID} --build-arg gitcommit=${GIT_COMMIT} -f Dockerfile.server .
	docker tag ${IMAGE_REPO}:${IMAGE_VERSION} ${ECR_REGISTRY}/${IMAGE_REPO}:${IMAGE_VERSION}
	docker push ${ECR_REGISTRY}/${IMAGE_REPO}:${IMAGE_VERSION}

