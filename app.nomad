variable "tag" {
  type = string
  default = "ghcr.io/viperml/numpex-stack"
}

job "numpex-stack" {
  datacenters = ["dc1"]

  group "group" {
    network {
      port "http" {
        to = 8080
      }
    }

    task "main" {
      driver = "docker"

      config {
        image = var.tag
        ports = ["http"]
      }

      resources {
        cpu    = 100
        memory = 64
      }

      service {
        tags     = ["shiva"]
        provider = "consul"
        port     = "http"

        meta {
          location = "/numpex-stack"
        }
      }
    }
  }
}
