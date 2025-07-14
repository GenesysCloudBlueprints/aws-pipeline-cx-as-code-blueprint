#!/usr/bin/env node
import { App } from "aws-cdk-lib";
import {
  GenesysTerraformPipelineStack,
  GenesysTerraformPipelineStackProps,
} from "../lib/genesys-terraform-pipeline-stack";

const app = new App();

// Adjust the environment names as needed
// Ensure that the environment is specified in the cdk.json or via command line context
// Example: cdk deploy --context env=dev
const environments = ["dev", "prod"];
const deploymentEnvironment = app.node.tryGetContext("env");

if (!environments.includes(deploymentEnvironment)) {
  throw new Error(
    `Invalid environment: ${deploymentEnvironment}. Valid options are: ${environments.join(
      ", "
    )}. Please specify a valid environment using the --context flag, e.g., --context env=dev.`
  );
}

// You may need to add or adjust the context variables based on your requirements. Values are stored in cdk.json
const contextEnv = app.node.tryGetContext(deploymentEnvironment);
const githubOwner = app.node.tryGetContext("infrastrucureRepoOwner");
const githubRepo = app.node.tryGetContext("infrastrucureRepoName");
const codeConnectionArn = app.node.tryGetContext("codeConnectionArn");
const genesysClientSecretName = app.node.tryGetContext(
  "genesysClientSecretName"
);
const genesysRegion = app.node.tryGetContext("genesysRegion");

const props: GenesysTerraformPipelineStackProps = {
  ...contextEnv,
  githubOwner,
  githubRepo,
  codeConnectionArn,
  genesysClientSecretName,
  genesysRegion,
};

new GenesysTerraformPipelineStack(
  app,
  `GenesysTerraformPipelineStack-${deploymentEnvironment}`,
  props
);
