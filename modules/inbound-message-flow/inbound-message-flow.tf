resource "genesyscloud_flow" "inbound_message_flow" {
  filepath          = "${path.module}/BasicMessageFlow.yaml"
  file_content_hash = filesha256("${path.module}/BasicMessageFlow.yaml")
  substitutions = {
    flow_name        = var.flow_name
    division         = var.division
    default_language = "en-us"
    queue_name       = var.queue_name
    bot_flow_name    = var.bot_flow_name
  }
}
