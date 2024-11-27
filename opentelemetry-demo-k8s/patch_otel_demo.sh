#!/bin/bash
echo "Patching OpenTelemetry Demo Kubernetes resources"

# Make sure we label the k8s namespace for OA injection
kubectl label namespace astroshop dynatrace.com/inject=true

# Add the private container registry secret to the service account
kubectl patch serviceaccount astroshop -p '{"imagePullSecrets": [{"name": "docker-registry-secret"}]}' --namespace astroshop

# Created the kubernetes PVC for the product catalog service
kubectl apply -f ./patches/pvc-product-catalog.yaml --namespace astroshop

# Wait for the PVC to be bound
kubectl wait -f ./patches/pvc-product-catalog.yaml --for=jsonpath='{.status.phase}'=Bound --timeout=300s --namespace astroshop

### TODO -  AZCOPY the product.json to the created Storage Account

# Patch the otel-demo deployments
kubectl patch deployment astroshop-accountingservice --patch-file  ./patches/deployment-accountingservice-patch.yaml --namespace astroshop
kubectl patch deployment astroshop-adservice --patch-file ./patches/deployment-adservice-patch.yaml --namespace astroshop
kubectl patch deployment astroshop-cartservice --patch-file ./patches/deployment-cartservice-patch.yaml --namespace astroshop
kubectl patch deployment astroshop-checkoutservice --patch-file ./patches/deployment-checkoutservice-patch.yaml --namespace astroshop
kubectl patch deployment astroshop-currencyservice --patch-file ./patches/deployment-currencyservice-patch.yaml --namespace astroshop
kubectl patch deployment astroshop-emailservice --patch-file ./patches/deployment-emailservice-patch.yaml --namespace astroshop
kubectl patch deployment astroshop-frauddetectionservice --patch-file ./patches/deployment-frauddetectionservice-patch.yaml --namespace astroshop
kubectl patch deployment astroshop-frontend --patch-file ./patches/deployment-frontend-patch.yaml --namespace astroshop
kubectl patch deployment astroshop-imageprovider --patch-file ./patches/deployment-imageprovider-patch.yaml --namespace astroshop
kubectl patch deployment astroshop-kafka --patch-file ./patches/deployment-kafka-patch.yaml --namespace astroshop
kubectl patch deployment astroshop-flagd --patch-file ./patches/deployment-flagd-patch.yaml --namespace astroshop
kubectl patch configmap astroshop-flagd-config --patch-file ./patches/config-map-flagd-patch.yaml --namespace astroshop
# kubectl patch deployment astroshop-loadgenerator --patch-file ./patches/deployment-loadgenerator-patch-dev.yaml --namespace astroshop
# kubectl patch deployment astroshop-loadgenerator --patch-file ./patches/deployment-loadgenerator-patch-stg.yaml --namespace astroshop
kubectl patch deployment astroshop-paymentservice --patch-file ./patches/deployment-paymentservice-patch.yaml --namespace astroshop
kubectl patch deployment astroshop-productcatalogservice --patch-file ./patches/deployment-productcatalogservice-patch.yaml --namespace astroshop
kubectl patch deployment astroshop-quoteservice --patch-file ./patches/deployment-quoteservice-patch.yaml --namespace astroshop
kubectl patch deployment astroshop-recommendationservice --patch-file ./patches/deployment-recommendationservice-patch.yaml --namespace astroshop
kubectl patch deployment astroshop-shippingservice --patch-file ./patches/deployment-shippingservice-patch.yaml --namespace astroshop
kubectl patch deployment astroshop-valkey --patch-file ./patches/deployment-valkey-patch.yaml --namespace astroshop
kubectl patch statefulset otel-demo-opensearch --patch-file ./patches/statefulset-opensearch.yaml --namespace astroshop
kubectl delete deployment astroshop-frontendproxy --namespace astroshop
kubectl delete service astroshop-frontendproxy --namespace astroshop

# Re-deploy all deployments
# kubectl get deployments --namespace astroshop -o custom-columns=NAME:.metadata.name | grep -iv NAME | while read LINE; do kubectl rollout restart deployment $LINE -n astroshop ; done;

# Re-deploy only the micro service deployments
# kubectl get deployments --namespace astroshop -o custom-columns=NAME:.metadata.name | grep -iv NAME | while read LINE; do if [ "$LINE" != "astroshop-kafka" ] && [ "$LINE" != "dynatrace-otel-gateway-collector" ] && [ "$LINE" != "astroshop-flagd" ] && [ "$LINE" != "astroshop-loadgenerator" ] && [ "$LINE" != "astroshop-valkey" ]; then kubectl rollout restart deployment $LINE -n astroshop ; fi; done;

# Created the ingress rules to allow inbound traffic to the frontend
# kubectl apply -f ./patches/ingress-frontendproxy-dev.yaml --namespace astroshop
# kubectl apply -f ./patches/ingress-frontendproxy-stg.yaml --namespace astroshop

# Created the kubernetes CronJobs for problem simulator
# kubectl apply -f ./jobs/oteldemo-trigger-manual-jobs-stg.yaml --namespace astroshop
# kubectl apply -f ./jobs/oteldemo-trigger-manual-jobs-dev.yaml --namespace astroshop

# We should be all done at this point
echo "Done."
