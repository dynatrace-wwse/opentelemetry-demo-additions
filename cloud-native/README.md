## cloud-native

# Deploy dynatrace-aws-appobs-demo solution

$ git submodule init

$ git submodule update

[Deploy the AWS resources](./dynatrace-aws-appobs-demo/README.md)

# Download th AWS Lambda Layer for Dynatrace

$ curl $(aws --region us-east-1 lambda get-layer-version-by-arn --arn 'arn:aws:lambda:us-east-1:725887861453:layer:Dynatrace_OneAgent_1_287_2_20240223-044013_with_collector_nodejs:1' --query 'Content.Location' --output text) --output layer.zip

# Building the OpenTelemetry Demo Product Catalog Admin image

$ docker build -t 512220559759.dkr.ecr.us-east-1.amazonaws.com/oteldemo-productcatalogadmin:server-v1 --platform linux/amd64 --build-arg build=${GIT_BRANCH}-${BUILD_ID} --build-arg gitcommit=${GIT_COMMIT} -f Dockerfile.server .

$ docker push 512220559759.dkr.ecr.us-east-1.amazonaws.com/oteldemo-productcatalogadmin:server-v1

# deploy the productcatalogbackend

$ Create a new secret in AWS Secrets Manager or re-use existing with all the required Dynatrace metadata and access tokens. The content of the secret should look like the following:

    ```json
    {
      "DT_CLUSTER_ID": "1228725359",
      "DT_TENANT": "utc83716",
      "DT_URL": "https://utc83716.sprint.dynatracelabs.com",
      "DT_CONNECTION_AUTH_TOKEN": "dt0a01.utc83716.xxx",     # AWS Lambda token
      "DT_LOG_COLLECTION_AUTH_TOKEN": "dt0c01.LWLF3U5KRUV5LH4HKCQKWLIN.xxx",  # Access Token with log ingest scope
      "DT_PAAS_TOKEN": "dt0c01.G467JI7PZQHCWWJJ3HJUBVTA.xxx", # PaaS token
      "DT_OTEL_COLLECTOR_TOKEN": "dt0c01.2N5TMNEEQMPDNBJFFSR4RYYD.xxx",    # Access token with Opentelemetry ingest scopes
      "DT_FLUENT_BIT_URI": "/api/v2/logs/ingest?api-token=dt0c01.LWLF3U5KRUV5LH4HKCQKWLIN.xxx" # Same token as DT_LOG_COLLECTION_AUTH_TOKEN
    }
    ```

    To create the secret, execute the following AWS CLI command:

    ```bash
    aws secretsmanager create-secret --name your-secret-name --secret-string '{"DT_CLUSTER_ID":"1228725359","DT_TENANT":"utc83716","DT_URL":"https://utc83716.sprint.   dynatracelabs.com","DT_CONNECTION_AUTH_TOKEN":"dt0a01.utc83716.xxx","DT_LOG_COLLECTION_AUTH_TOKEN":"dt0c01.LWLF3U5KRUV5LH4HKCQKWLIN.xxx","DT_PAAS_TOKEN":"dt0c01.  G467JI7PZQHCWWJJ3HJUBVTA.xxx","DT_OTEL_COLLECTOR_TOKEN":"dt0c01.2N5TMNEEQMPDNBJFFSR4RYYD.xxx","DT_FLUENT_BIT_URI":"/api/v2/logs/ingest?api-token=dt0c01.LWLF3U5KRUV5LH4HKCQKWLIN.xxx"}'
    ```

$ Create a secret in AWS Secrets Manager with the Astro shop Admin and Azure Storage Account credentials. The content of the secret should look like the following:

    ```json
    {
      "PRODUCT_ADMIN_USER": "",
      "PRODUCT_ADMIN_PASSWORD": "",
      "AZURE_STORAGE_ACCOUNT_NAME": "",
      "AZURE_STORAGE_ACCOUNT_KEY": "",
      "AZURE_STORAGE_CONTAINER_NAME": ""
    }
    ```

    To create the secret, execute the following AWS CLI command:

    ```bash
    aws secretsmanager create-secret --name your-secret-name --secret-string '{"PRODUCT_ADMIN_USER":"product_admin","PRODUCT_ADMIN_PASSWORD":"P@$$w0rd","AZURE_STORAGE_ACCOUNT_NAME":"xxx","AZURE_STORAGE_ACCOUNT_KEY":"xxx-xxx","AZURE_STORAGE_CONTAINER_NAME": "pvc-XXX"}'
    ```

  $ aws cloudformation deploy \
    --stack-name oteldemoproductcatalogadmin \
    --template-file template.yml \
    --parameter-overrides EnableXray=false \
    StageName=Dev \
    ImageRepo='astroshop/productcatalogadmin' \
    ImageTag=v1 \
    TranslationAPIEndpointURL='https://fumxh1dirf.execute-api.us-east-1.amazonaws.com/prod/' \
    TranslationRegionalAPIGWArn='arn:aws:execute-api:us-east-1:512220559759:fumxh1dirf' \
    TranslationDataProcessingS3BucketARN='arn:aws:s3:::astroshoptranslation-dataprocessings3bucket-uqvkckpijdxn' \ AstroshopSecretArn='arn:aws:secretsmanager:us-east-1:512220559759:secret:astroshop-product-admin-jh11h8' \
    DynatraceSecretArn='arn:aws:secretsmanager:us-east-1:512220559759:secret:oteldemoproductcatalogadm-TgYSOC' \
    VpcPrivateSubnetId='' \
    VpcSecurityGroupId='' \
    --tags dt_owner_team=edp dt_owner_email=gareth.emslie@dynatrace.com \
    --capabilities CAPABILITY_IAM \
    --profile hyperscaler-innovation