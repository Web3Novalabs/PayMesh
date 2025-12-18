variable "IMAGE_TAG" {
  default = "latest"
}

target "default" {
  dockerfile = "Dockerfile"
  context = "./server"
  tags = [
    "paymesh/server:${IMAGE_TAG}",
    "paymesh/server:latest"
  ]
  platforms = ["linux/amd64"]
}