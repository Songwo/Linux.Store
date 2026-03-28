package bootstrap

import (
	"fmt"

	"gorm.io/gorm"
)

func ensureSchema(db *gorm.DB) error {
	statements := []string{
		`CREATE TABLE IF NOT EXISTS card_secret_profiles (
			id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
			product_id BIGINT UNSIGNED NOT NULL,
			sku_id BIGINT UNSIGNED NOT NULL,
			profile_name VARCHAR(128) NOT NULL DEFAULT '',
			product_url VARCHAR(500) NOT NULL DEFAULT '',
			redeem_url VARCHAR(500) NOT NULL DEFAULT '',
			guide_text TEXT NOT NULL,
			privacy_note TEXT NOT NULL,
			support_contact VARCHAR(255) NOT NULL DEFAULT '',
			status TINYINT NOT NULL DEFAULT 1,
			created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
			updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
			UNIQUE KEY uk_card_secret_profiles_sku_id (sku_id),
			KEY idx_card_secret_profiles_product_id (product_id),
			KEY idx_card_secret_profiles_status (status)
		) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
		`CREATE TABLE IF NOT EXISTS card_secret_items (
			id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
			profile_id BIGINT UNSIGNED NOT NULL,
			product_id BIGINT UNSIGNED NOT NULL,
			sku_id BIGINT UNSIGNED NOT NULL,
			batch_no VARCHAR(64) NOT NULL DEFAULT '',
			masked_summary VARCHAR(255) NOT NULL DEFAULT '',
			secret_hash CHAR(64) NOT NULL,
			encrypted_payload LONGTEXT NOT NULL,
			status TINYINT NOT NULL DEFAULT 10,
			order_no VARCHAR(64) NOT NULL DEFAULT '',
			order_item_id BIGINT UNSIGNED NULL,
			user_id BIGINT UNSIGNED NULL,
			assigned_at DATETIME NULL,
			revealed_at DATETIME NULL,
			reveal_count INT NOT NULL DEFAULT 0,
			redeemed_at DATETIME NULL,
			disabled_at DATETIME NULL,
			created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
			updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
			UNIQUE KEY uk_card_secret_items_hash (secret_hash),
			KEY idx_card_secret_items_profile_status (profile_id, status),
			KEY idx_card_secret_items_order_no (order_no),
			KEY idx_card_secret_items_user_id (user_id),
			KEY idx_card_secret_items_sku_status (sku_id, status)
		) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
		`CREATE TABLE IF NOT EXISTS card_secret_access_logs (
			id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
			card_secret_item_id BIGINT UNSIGNED NOT NULL,
			profile_id BIGINT UNSIGNED NOT NULL,
			user_id BIGINT UNSIGNED NOT NULL,
			action VARCHAR(32) NOT NULL DEFAULT '',
			ip VARCHAR(64) NOT NULL DEFAULT '',
			user_agent VARCHAR(500) NOT NULL DEFAULT '',
			created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
			KEY idx_card_secret_access_logs_item_action (card_secret_item_id, action),
			KEY idx_card_secret_access_logs_user_id (user_id)
		) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
	}
	for _, statement := range statements {
		if err := db.Exec(statement).Error; err != nil {
			return fmt.Errorf("apply schema failed: %w", err)
		}
	}
	return nil
}
