package main

import (
	"context"
	"github.com/jackc/pgx/v5/pgxpool"
	"log"
	"net/http"
	"os"
	"os/signal"
	"starmora/human-design/internal/app"
	"syscall"
	"time"
)

func main() {
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		log.Fatal("DATABASE_URL is required")
	}
	db, err := pgxpool.New(ctx, dsn)
	if err != nil {
		log.Fatal("invalid database configuration")
	}
	defer db.Close()
	startup, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()
	if app.Migrate(startup, db) != nil {
		log.Fatal("database connection or migration failed")
	}
	var provider app.Provider
	switch os.Getenv("CALCULATION_PROVIDER") {
	case "", "local":
		provider = app.NewLocal()
	case "bodygraph":
		provider = &app.Bodygraph{Key: os.Getenv("BODYGRAPH_API_KEY")}
	default:
		log.Fatal("CALCULATION_PROVIDER must be local or bodygraph")
	}
	server := app.New(db, provider, os.Getenv("COOKIE_SECURE") == "true")
	server.TrustProxy = os.Getenv("TRUST_PROXY") == "true"
	go func() {
		ticker := time.NewTicker(time.Hour)
		defer ticker.Stop()
		for {
			cleanup, c := context.WithTimeout(ctx, 15*time.Second)
			if app.Cleanup(cleanup, db) != nil && ctx.Err() == nil {
				log.Print("expired session cleanup failed")
			}
			c()
			select {
			case <-ctx.Done():
				return
			case <-ticker.C:
			}
		}
	}()
	addr := os.Getenv("ADDR")
	if addr == "" {
		addr = "127.0.0.1:8080"
	}
	h := &http.Server{Addr: addr, Handler: server.Handler(), ReadHeaderTimeout: 5 * time.Second, ReadTimeout: 20 * time.Second, WriteTimeout: 30 * time.Second, IdleTimeout: 60 * time.Second}
	go func() {
		<-ctx.Done()
		shutdown, c := context.WithTimeout(context.Background(), 10*time.Second)
		defer c()
		_ = h.Shutdown(shutdown)
	}()
	log.Printf("Human Design API listening on %s; provider configured: %t", addr, provider.Ready())
	if err = h.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		log.Fatal("server failed")
	}
}
