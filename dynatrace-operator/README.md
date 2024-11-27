# Installing the Dynatrace Operator

## Requirements

1. Generate Dynatrace Access Tokens
   - Dynatrace Operator token (DT_API_TOKEN)
     - Read settings
     - Write settings
     - Read entities
     - Installer download
     - Access problem and event feed, metrics, and topology
     - Create ActiveGate tokens
   - Data ingest token (DT_INGEST_TOKEN)
      - Ingest metrics
   - Fluent Bit token (DT_INGEST_TOKEN)
      - Ingest logs

1. helm upgrade --install dynatrace-operator oci://public.ecr.aws/dynatrace/dynatrace-operator \
   --create-namespace \
   --namespace dynatrace \
   --atomic \
   --version 1.3.0

2. kubectl -n dynatrace create secret generic [DYNAKUBE_NAME] --from-literal="apiToken=<DT_API_TOKEN>" --from-literal="dataIngestToken=<DT_INGEST_TOKEN>"

3. kubectl apply -f dynakube-oteldemo-[dev|stg].yaml --namespace dynatrace
   
4. helm repo add fluent https://fluent.github.io/helm-charts

5. helm repo update

6. helm upgrade --install fluent-bit fluent/fluent-bit -f fluent-bit-values.yaml `
--create-namespace `
--namespace dynatrace-fluent-bit `
--set 'env[0].value=aks' `
--set 'env[1].value=<DT_INGEST_TOKEN>' `
--set 'env[2].value=<DT_INGEST_HOST>' `
--version 3.1.4

# References
- https://docs.dynatrace.com/docs/setup-and-configuration/setup-on-k8s/installation/cloud-native-fullstack#helm
- https://docs.dynatrace.com/docs/setup-and-configuration/setup-on-k8s/guides/operation/annotate#monitor-only-specific-namespaces
- https://github.com/fluent/helm-charts/tree/main/charts
- https://github.com/Dynatrace/dynatrace-operator
