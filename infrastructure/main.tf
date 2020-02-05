variable "region" {
  default = "ap-northeast-1"
}

terraform {
  backend "s3" {
    bucket  = "sicfler-terraform-state"
    region  = "ap-northeast-1"
    key     = "terraform.tfstate"
    encrypt = true
    profile = "sicfler"
  }
}

provider "aws" {
  region  = "${var.region}"
  profile = "sicfler"
}

resource "aws_s3_bucket" "terraform_state" {
  bucket = "sicfler-terraform-state"
  versioning {
    enabled = true
  }
}

module "base" {
  source = "./modules"
}
