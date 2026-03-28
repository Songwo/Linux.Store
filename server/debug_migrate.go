package main

import (
	"fmt"
	"log"
	"devstore/server/internal/config"
	"devstore/server/internal/pkg/mysqlx"
)

func main() {
	cfg, err := config.Load("configs/config.yaml")
	if err != nil {
		fmt.Printf("Config load failed: %v, trying example...\n", err)
		cfg, err = config.Load("configs/config.yaml.example")
		if err != nil {
			log.Fatal(err)
		}
	}

	fmt.Printf("Original DSN: %s\n", cfg.MySQL.DSN)
	
	// Test direct connection with localhost
	testDSN := "devstore:devstore123@tcp(127.0.0.1:3306)/devstore?charset=utf8mb4&parseTime=True&loc=Local"
	fmt.Printf("Testing with DSN: %s\n", testDSN)
	
	cfg.MySQL.DSN = testDSN
	db, err := mysqlx.New(cfg.MySQL)
	if err != nil {
		fmt.Printf("Connection with devstore user failed: %v\n", err)
		
		// Try root
		rootDSN := "root:root123456@tcp(127.0.0.1:3306)/devstore?charset=utf8mb4&parseTime=True&loc=Local"
		fmt.Printf("Testing with root DSN: %s\n", rootDSN)
		cfg.MySQL.DSN = rootDSN
		db, err = mysqlx.New(cfg.MySQL)
		if err != nil {
			log.Fatalf("All connections failed: %v", err)
		}
	}

	fmt.Println("Connected! Running ALTER TABLE...")
	
	db.Exec("ALTER TABLE products ADD COLUMN rating DECIMAL(3,2) NOT NULL DEFAULT 5.00 AFTER origin_price")
	db.Exec("ALTER TABLE products ADD COLUMN review_count INT NOT NULL DEFAULT 0 AFTER rating")
	db.Exec(`CREATE TABLE IF NOT EXISTS product_reviews (
		id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
		product_id BIGINT UNSIGNED NOT NULL,
		user_id BIGINT UNSIGNED NOT NULL,
		rating TINYINT NOT NULL DEFAULT 5,
		content TEXT NOT NULL,
		created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
		updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
		deleted_at DATETIME NULL,
		INDEX idx_product_id (product_id)
	)`)
	
	fmt.Println("Finished.")
}
