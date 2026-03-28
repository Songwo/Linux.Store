package main

import (
	"context"
	"flag"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"path/filepath"
	"syscall"
	"time"

	"devstore/server/internal/bootstrap"
)

func main() {
	configPath := flag.String("config", defaultConfigPath(), "config file path")
	flag.Parse()

	app, err := bootstrap.New(context.Background(), *configPath)
	if err != nil {
		log.Fatalf("bootstrap app failed: %v", err)
	}

	server := &http.Server{Addr: fmt.Sprintf(":%d", app.Config.App.Port), Handler: app.Router, ReadTimeout: app.Config.App.ReadTimeout, WriteTimeout: app.Config.App.WriteTimeout, ReadHeaderTimeout: 5 * time.Second}
	go func() {
		app.Logger.Info("server started")
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			app.Logger.Fatal("listen failed")
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	shutdownCtx, cancel := context.WithTimeout(context.Background(), app.Config.App.ShutdownTimeout)
	defer cancel()
	if err := server.Shutdown(shutdownCtx); err != nil {
		app.Logger.Error("server shutdown failed")
	}
	if err := app.ShutdownTrace(shutdownCtx); err != nil {
		app.Logger.Error("trace shutdown failed")
	}
}

func defaultConfigPath() string {
	for _, path := range []string{
		"configs/config.local.yaml",
		"configs/config.yaml",
		"configs/config.yaml.example",
	} {
		if _, err := os.Stat(filepath.Clean(path)); err == nil {
			return path
		}
	}
	return "configs/config.yaml.example"
}
