import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as codepipeline from "aws-cdk-lib/aws-codepipeline";
import * as codepipeline_actions from "aws-cdk-lib/aws-codepipeline-actions";
import * as codebuild from "aws-cdk-lib/aws-codebuild";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as secretsmanager from "aws-cdk-lib/aws-secretsmanager";

// Add necessary properties that you need to pass to Terraform from aws.ts (eg. variables) and set it on the environment variables
export interface GenesysTerraformPipelineStackProps extends StackProps {
  genesysClientSecretName: string;
  genesysRegion: string;
  codeConnectionArn: string;
  githubOwner: string;
  githubRepo: string;
  githubBranch?: string;
  environment: string;
}

export class GenesysTerraformPipelineStack extends Stack {
  constructor(
    scope: Construct,
    id: string,
    props: GenesysTerraformPipelineStackProps
  ) {
    super(scope, id, props);

    const stateBucket = new s3.Bucket(this, "TerraformStateBucket", {
      bucketName: `genesys-terraform-state${"-" + props.environment}`,
      versioned: true,
      encryption: s3.BucketEncryption.S3_MANAGED,
    });

    const artifactsBucket = new s3.Bucket(this, "PipelineArtifactsBucket", {
      bucketName: `genesys-pipeline-artifacts${"-" + props.environment}`,
      encryption: s3.BucketEncryption.S3_MANAGED,
    });

    const genesysSecret = secretsmanager.Secret.fromSecretNameV2(
      this,
      "GenesysSecret",
      props.genesysClientSecretName
    );

    const sourceOutput = new codepipeline.Artifact();

    // Source Stage - Connect to GitHub
    const sourceAction =
      new codepipeline_actions.CodeStarConnectionsSourceAction({
        actionName: "GitHub_Source",
        owner: props.githubOwner,
        repo: props.githubRepo,
        branch: props?.githubBranch || "main",
        connectionArn: props.codeConnectionArn,
        output: sourceOutput,
      });

    // Build Stage - Run Terraform
    const project = new codebuild.PipelineProject(this, "TerraformBuild", {
      projectName: `GenesysTerraformBuild-${props.environment}`,
      description: "Build project to run Terraform scripts for Genesys Cloud",
      environment: {
        buildImage: codebuild.LinuxArmBuildImage.AMAZON_LINUX_2023_STANDARD_3_0,
      },
      buildSpec: codebuild.BuildSpec.fromSourceFilename("buildspec.yml"),
      environmentVariables: {
        // You may also add your other values in the secret by following this format:
        GENESYSCLOUD_OAUTHCLIENT_ID: {
          type: codebuild.BuildEnvironmentVariableType.SECRETS_MANAGER,
          value: `${props.genesysClientSecretName}:GENESYSCLOUD_OAUTHCLIENT_ID`,
        },
        GENESYSCLOUD_OAUTHCLIENT_SECRET: {
          type: codebuild.BuildEnvironmentVariableType.SECRETS_MANAGER,
          value: `${props.genesysClientSecretName}:GENESYSCLOUD_OAUTHCLIENT_SECRET`,
        },
        GENESYSCLOUD_REGION: { value: props.genesysRegion },
        // Environment variables for the Terraform project.
        // You may also set/add the other variables here rather than utilizing the .tfvars file.
        TF_VAR_environment_name: { value: props.environment },
        // Environment variables for the buildspec.yml
        TF_STATE_BUCKET: { value: stateBucket.bucketName },
        AWS_DEFAULT_REGION: { value: this.region },
      },
    });

    stateBucket.grantReadWrite(project);
    genesysSecret.grantRead(project);

    const buildAction = new codepipeline_actions.CodeBuildAction({
      actionName: "Terraform_Build_and_Apply",
      project,
      input: sourceOutput,
    });

    // Create the Pipeline
    new codepipeline.Pipeline(this, "GenesysTerraformPipeline", {
      pipelineName: `Genesys-Terraform-Deployment-Pipeline${
        "-" + props.environment
      }`,
      artifactBucket: artifactsBucket,
      stages: [
        {
          stageName: "Source",
          actions: [sourceAction],
        },
        {
          stageName: "Build",
          actions: [buildAction],
        },
      ],
    });
  }
}
