target "default" {
  dockerfile = "Dockerfile"
  context = "./server"
  tags = ["paymesh/server:latest"]
  platforms = ["linux/amd64"]
}
