# Looks up the id of the user so we can associate it with the queue
data "genesyscloud_user" "user" {
  email = var.email
}
# Create Queue
module "queue" {
  source     = "./modules/queue"
  queue_name = "${var.queue_name} ${var.environment_name}"
  user_id    = data.genesyscloud_user.user.id
}

# Create Bot Flow
# A Bot Flow that asks for an email address
module "bot_flow" {
  source   = "./modules/bot-flow"
  bot_name = "${var.bot_flow_name} ${var.environment_name}"
  division = var.division
}

# Create Inbound Message Flow
module "inbound_message_flow" {
  source        = "./modules/inbound-message-flow"
  flow_name     = "${var.inbound_message_flow_name} ${var.environment_name}"
  division      = var.division
  bot_flow_name = module.bot_flow.name
  queue_name    = module.queue.queue_name
  depends_on    = [module.queue, module.bot_flow]
}

# Create Messenger Configuration
module "web_config" {
  source                           = "./modules/web-messenger-configuration"
  web_messenger_configuration_name = "${var.web_messenger_configuration_name} ${var.environment_name}"
}

# Create Messenger Deployment
module "web_deploy" {
  source                        = "./modules/web-messenger-deployment"
  web_messenger_deployment_name = "${var.web_messenger_deployment_name} ${var.environment_name}"
  flow_id                       = module.inbound_message_flow.flow_id
  config_id                     = module.web_config.config_id
  config_ver                    = module.web_config.config_ver
  depends_on                    = [module.inbound_message_flow]
}
