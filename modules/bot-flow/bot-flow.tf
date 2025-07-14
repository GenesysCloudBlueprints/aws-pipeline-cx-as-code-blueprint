resource "genesyscloud_flow" "bot_flow" {
  filepath          = "${path.module}/BasicBot.yaml"
  file_content_hash = filesha256("${path.module}/BasicBot.yaml")
  substitutions = {
    bot_name         = var.bot_name
    division         = var.division
    default_language = "en-us"
  }
}
