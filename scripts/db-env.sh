#!/bin/bash
# Database Environment Helper
# Usage: source scripts/db-env.sh [local|dev|qa|prod]

set -e

# Load .env file
if [ -f .env ]; then
  export $(cat .env | grep -v '^#' | xargs)
fi

# Function to show current database info
show_db_info() {
  local app_id=$1
  local env_name=$2

  echo ""
  echo "🗄️  Database Environment: $env_name"
  echo "📋 App ID: ${app_id:0:8}...${app_id: -4}"
  echo ""
}

# Switch environment based on argument
case "${1:-local}" in
  local)
    export INSTANT_APP_ID="${INSTANT_APP_ID}"
    show_db_info "$INSTANT_APP_ID" "LOCAL"
    ;;
  dev)
    if [ -z "$INSTANT_APP_ID_DEV" ]; then
      echo "❌ INSTANT_APP_ID_DEV not set in .env"
      exit 1
    fi
    export INSTANT_APP_ID="$INSTANT_APP_ID_DEV"
    show_db_info "$INSTANT_APP_ID" "DEV"
    ;;
  qa)
    if [ -z "$INSTANT_APP_ID_QA" ]; then
      echo "❌ INSTANT_APP_ID_QA not set in .env"
      exit 1
    fi
    export INSTANT_APP_ID="$INSTANT_APP_ID_QA"
    show_db_info "$INSTANT_APP_ID" "QA"
    ;;
  prod)
    if [ -z "$INSTANT_APP_ID_PROD" ]; then
      echo "❌ INSTANT_APP_ID_PROD not set in .env"
      exit 1
    fi
    export INSTANT_APP_ID="$INSTANT_APP_ID_PROD"
    show_db_info "$INSTANT_APP_ID" "PRODUCTION"
    echo "⚠️  WARNING: You are targeting PRODUCTION database!"
    echo "⚠️  Make sure you've tested in LOCAL/DEV/QA first!"
    echo ""
    ;;
  *)
    echo "Usage: source scripts/db-env.sh [local|dev|qa|prod]"
    exit 1
    ;;
esac

echo "✅ Environment loaded. Now you can run:"
echo "   yarn db:check       # Check schema changes"
echo "   yarn db:push        # Push schema to $1"
echo "   yarn db:verify      # Verify data integrity"
echo "   yarn db:export      # Export database backup"
echo ""
