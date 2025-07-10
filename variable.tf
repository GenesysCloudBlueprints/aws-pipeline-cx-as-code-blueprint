variable "email" {
  type        = string
  description = "Your user email. This is used to include the given user in the queue"
}

variable "division" {
  type        = string
  description = "The Division to be used to deploy the resources"
}

variable "bot_flow_name" {
  type        = string
  description = "The Bot Flow name that is to be used in the In-Queue Call Flow."
}

variable "inbound_message_flow_name" {
  type        = string
  description = "The Inbound Message Flow name that is to be used in the Web Messenger Deployment."
}

variable "queue_name" {
  type        = string
  description = "The Queue name that is to be used in the In-Queue Call Flow."
}

variable "web_messenger_configuration_name" {
  type        = string
  description = "The name of the web messenger configuration"
}

variable "web_messenger_deployment_name" {
  type        = string
  description = "The name of the web messenger deployment"
}

variable "environment_name" {
  type        = string
  description = "The environment name to be used in the resource names"
  default     = "Dev"
}
