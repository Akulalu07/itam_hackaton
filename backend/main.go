package main

import (
	_ "backend/docs"
	"backend/internal/handlers"
)

func main() {
	handlers.Start_server()
}
