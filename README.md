# Crown

micro-segmentation rulesets managed from Check Point SmartConsole

### Description

Edit policy in Check Point SmartConsole, enforce as Azure NSGs or Kubernetes Pod
Network Policies.

### Requirements

- Deno - JavaScript/TypeScript runtime -
  [install](https://docs.deno.com/runtime/manual/getting_started/installation)
- Azure Service Principal -
  [create](https://gist.github.com/mkol5222/2e48e283c96fd6958583b4c828e09624)

### Setup

Configure CP Security Management access using .env similar to example:

```shell
CPSERVER="yourown-za8upq50.maas.checkpoint.com"
CPTENANT="ccae851f-tttt-4fcf-a0da-c50788f1dde3"
CPAPIKEY="useyourownkey"
```

Configure Azure access using SP in terraform.tfvars similar to example:

```shell
client_secret="ucJ---use-your-own-SP"
client_id="451---use-your-own-SP"
tenant_id="016---use-your-own-SP"
subscription_id="f4a---use-your-own-SP"
```

### Usage

```shell
deno task start
```

### Explore NSGs with aztfexport tool

```powershell
# IMPORTANT!
mkdir tmp; cd tmp
# discover your own NSG in Azure Portal and replace ID below
aztfexport res /subscriptions/f4ad5e85-ec75-4321-8854-ed7eb611f61d/resourceGroups/rg-test-nsg101/providers/Microsoft.Network/networkSecurityGroups/Default
# look at it
code terraform.tfstate
```

### Explore NGSs in TF state with Powershell

```powershell
# list resources in a terraform state file
gc ./tmp/terraform.tfstate | ConvertFrom-Json | select -ExpandProperty resources

# focus on NSGs
$nsgs = gc ./tmp/terraform.tfstate | ConvertFrom-Json | select -ExpandProperty resources | where {$_.type -eq "azurerm_network_security_group"}
$nsgs

# first one
$nsgs[0].instances[0].attributes

# rules
$nsgs[0].instances[0].attributes.security_rule
```

### Install Policy to NSG

Rulebase in SmartConsole:
![SmartConsole rulebase](./img/rulebase_s1c.png)

Converted to NSG using:
```powershell
deno task start | Set-Content .\nsg.tf.json

terraform apply
```

![NSG rulebase](./img/rulebase_nsg.png)


### Review generated rulebase with Powershell

```powershell
# see NSG
gc nsg.tf.json | ConvertFrom-Json | % { $_.resource.azurerm_network_security_group."example-nsg-2"} | fl

# list rules
gc nsg.tf.json | ConvertFrom-Json | % { $_.resource.azurerm_network_security_group."example-nsg-2".security_rule} | ft *

gc nsg.tf.json | ConvertFrom-Json | % { $_.resource.azurerm_network_security_group."example-nsg-2".security_rule} | fl
```