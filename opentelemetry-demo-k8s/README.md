# Installing the Open Telemtry Demo Helm Chart

1. helm repo add open-telemetry https://open-telemetry.github.io/opentelemetry-helm-charts

2. helm repo update

*** Use private Docker images ***

3. helm upgrade --install -f ./install/bring-your-own-observability-helm-values.yaml \
    astroshop \
    open-telemetry/opentelemetry-demo \
    --namespace astroshop \
    --set default.image.repository=geaksoteldemo.azurecr.io/oteldemo \
    --set default.image.tag=1.11.1 \
    --create-namespace \
    --version  0.32.8

*** Use public Docker images  ***
3. helm install -f ./install/bring-your-own-observability-helm-values.yaml \
    astroshop \
    open-telemetry/opentelemetry-demo \
    --namespace astroshop \
    --set default.image.tag=1.11.1 \
    --version  0.32.8


## Build the opentelemtery-demo application

$ git clone https://github.com/keyoke/opentelemetry-demo/tree/features/dynatrace-demo

$ export RELEASE_VERSION='1.11.1'

$ export IMAGE_NAME=geaksoteldemo.azurecr.io/oteldemo

$ export DEMO_VERSION='1.11.1'

## Update the local '.env.override' file

\# DO NOT PUSH CHANGES OF THIS FILE TO opentelemetry/opentelemetry-demo
\# PLACE YOUR .env ENVIRONMENT VARIABLES OVERRIDES IN THIS FILE
CHECKOUT_SERVICE_DOCKERFILE=./src/checkoutservice/Dockerfile.Dynatrace
CART_SERVICE_DOCKERFILE=./src/cartservice/src/Dockerfile.Dynatrace
PRODUCT_CATALOG_DOCKERFILE=./src/productcatalogservice/Dockerfile.Dynatrace

## Build the opentelemtery-demo docker images
$ make build-and-push-acr

## Patch kubernetes resources

$ kubectl create namespace ingress-nginx

$ kubectl label namespace ingress-nginx dynatrace.com/inject=true

$ helm upgrade --install \
  -f ./ingress-nginx-values.yaml \
  ingress-nginx ingress-nginx \
  --repo https://kubernetes.github.io/ingress-nginx \
  --set controller.service.externalTrafficPolicy=Local \
  --namespace ingress-nginx

$ kubectl edit configmap ingress-nginx-controller --namespace ingress-nginx

> data:
>   main-snippet: load_module /opt/dynatrace/oneagent-paas/agent/bin/current/linux-musl-x86-64/liboneagentnginx.so;

$ patch_otel_demo.sh

## References

- https://github.com/open-telemetry/opentelemetry-helm-charts
- https://docs.dynatrace.com/docs/setup-and-configuration/setup-on-k8s/guides/operation/instrument-nginx