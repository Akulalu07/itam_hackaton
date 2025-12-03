package handlers

import (
	"fmt"
	"log"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/gomodule/redigo/redis"
	"github.com/joho/godotenv"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

var REDISUSER string
var REDISPASS string
var redisConn redis.Conn

func Start_server() {
	r := gin.Default()
	LoadEnv()
	r.POST("/api/token", takeToken)
	r.POST("/admin/api/login", adminLogin)

	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	connectToRedis()
	defer redisConn.Close()
	r.Run("0.0.0.0:8080")
}

func connectToRedis() {
	var err error
	redisConn, err = redis.Dial("tcp", "localhost:6379",
		redis.DialUsername(REDISUSER),
		redis.DialPassword(REDISPASS),
	)
	if err != nil {
		panic(fmt.Sprintf("err with connect to redis; err %s", err))
	}

}

func LoadEnv() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	REDISUSER = getFromEnv("REDISUSER", "admin")

	REDISPASS = getFromEnv("REDISPASS", "some_pass")
}

func getFromEnv(variadle string, defaultVariable string) string {
	variab := os.Getenv(variadle)
	if variab == "" {
		variab = defaultVariable
	}
	fmt.Printf("%s:%s", variadle, variab)
	return variab
}
