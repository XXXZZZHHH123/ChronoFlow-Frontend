#!/bin/bash
set -e

TARGET_URL="https://chronoflow-frontend-production.up.railway.app"
REPORT_FILE="zap_baseline_report.html"

echo "Running OWASP ZAP Baseline Scan against $TARGET_URL"

docker run --rm -v "$(pwd):/zap/wrk:rw" -t owasp/zap2docker-stable zap-baseline.py \
  -t "$TARGET_URL" \
  -r "$REPORT_FILE" \
  -m 5 \
  -I

echo "ZAP scan completed. Report saved to $REPORT_FILE"