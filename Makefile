.PHONY: help dev build test run clean docker native

# Variables
APP_NAME := psych-api
VERSION := 1.0.0-SNAPSHOT
JAR_TARGET := target/quarkus-app/quarkus-run.jar
NATIVE_TARGET := target/${APP_NAME}-${VERSION}-runner

# Default target
help:
	@echo "Makefile"
	@echo "  dev"
	@echo "  build"
	@echo "  start"
	@echo "  install"

# Development mode dengan hot reload
dev:
	npm run dev

# Build aplikasi
build: clean
	npm run build

# Run tests
start:
	npm start

# Run tests
install:
	npm i