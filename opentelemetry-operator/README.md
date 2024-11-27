# Installing the Open Telemtry Collector

## Requirements

1. Generate Dynatrace Access Tokens
   - Dynatrace API token (DT_API_TOKEN)
     - openTelemetryTrace.ingest
     - metrics.ingest
     - logs.ingest


$ helm repo add jetstack https://charts.jetstack.io --force-update

$ helm install \
  cert-manager jetstack/cert-manager \
  --namespace cert-manager \
  --create-namespace \
  --version v1.15.3 \
  --set crds.enabled=true


$ helm repo add open-telemetry https://open-telemetry.github.io/opentelemetry-helm-charts
$ helm repo update

$ helm install opentelemetry-operator open-telemetry/opentelemetry-operator --set "manager.collectorImage.repository=hcr.io/dynatrace/dynatrace-otel-collector/dynatrace-otel-collector:0.14.0" --create-namespace --namespace opentelemetry-operator-system --version 0.67.0

$ kubectl create secret generic dynatrace-otelcol-dt-api-credentials --from-literal=DT_ENDPOINT=https://[izs31363.dev.dynatracelabs.com|oqr47576.sprint.dynatracelabs.com]/api/v2/otlp --from-literal=DT_API_TOKEN=<DT_API_TOKEN> --namespace astroshop

$ kubectl apply -f  otel_collector_gateway.yaml --namespace astroshop

$ kubectl apply -f  otel_k8s_enrichment.yaml

## Dynatrace Open Telemtry Collector distro reccomended
https://docs.dynatrace.com/docs/extend-dynatrace/opentelemetry/collector/use-cases


# References
- https://docs.dynatrace.com/docs/extend-dynatrace/opentelemetry/collector
- https://opentelemetry.io/docs/kubernetes/operator/automatic/
- https://github.com/open-telemetry/opentelemetry-operator/blob/main/README.md#opentelemetry-auto-instrumentation-injection
- https://docs.dynatrace.com/docs/extend-dynatrace/opentelemetry/collector/use-cases/kubernetes/k8s-enrich
- https://docs.dynatrace.com/docs/extend-dynatrace/opentelemetry/collector/deployment#deployment-modes