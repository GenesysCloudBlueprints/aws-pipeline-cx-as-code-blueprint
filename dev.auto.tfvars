# Provide the values for the variables used in the Terraform configuration.
# This file is used to provide the values for the variables defined in the main.tf and other module files.
email    = "useremail@genesys.com"
division = "your-division-name"

# Resource Names
bot_flow_name                    = "AWS Pipeline Basic Email Bot Flow"
queue_name                       = "AWS Pipeline Test Queue"
inbound_message_flow_name        = "AWS Pipeline Inbound Message Flow"
web_messenger_configuration_name = "AWS Pipeline Web Messenger Configuration"
web_messenger_deployment_name    = "AWS Pipeline Web Messenger Deployment"
