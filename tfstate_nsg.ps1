# list resources in a terraform state file
gc ./tmp/terraform.tfstate | ConvertFrom-Json | select -ExpandProperty resources

# focus on NSGs
$nsgs = gc ./tmp/terraform.tfstate | ConvertFrom-Json | select -ExpandProperty resources | where {$_.type -eq "azurerm_network_security_group"}
$nsgs

# first one
$nsgs[0].instances[0].attributes

# rules
$nsgs[0].instances[0].attributes.security_rule