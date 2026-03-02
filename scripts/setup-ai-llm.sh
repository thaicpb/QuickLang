#!/bin/bash

# =============================================================================
# QuickLang - Ollama Setup & Start Script
# =============================================================================

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info()    { echo -e "${BLUE}[INFO]${NC}  $1"; }
log_success() { echo -e "${GREEN}[OK]${NC}    $1"; }
log_warn()    { echo -e "${YELLOW}[WARN]${NC}  $1"; }
log_error()   { echo -e "${RED}[ERROR]${NC} $1"; }

echo ""
echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}   QuickLang - Ollama Setup & Start        ${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""

# =============================================================================
# STEP 1: Check & Install Ollama
# =============================================================================

if command -v ollama &>/dev/null; then
  OLLAMA_VERSION=$(ollama --version 2>/dev/null | head -n1)
  log_success "Ollama đã được cài sẵn: ${OLLAMA_VERSION}"
else
  log_warn "Ollama chưa được cài. Đang tiến hành cài đặt..."
  echo ""

  # Detect macOS or Linux
  if [[ "$OSTYPE" == "darwin"* ]]; then
    if command -v brew &>/dev/null; then
      log_info "Dùng Homebrew để cài Ollama..."
      brew install ollama
    else
      log_info "Homebrew không có. Dùng script cài đặt chính thức..."
      curl -fsSL https://ollama.com/install.sh | sh
    fi
  elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    log_info "Dùng script cài đặt chính thức cho Linux..."
    curl -fsSL https://ollama.com/install.sh | sh
  else
    log_error "Hệ điều hành không được hỗ trợ: $OSTYPE"
    exit 1
  fi

  # Verify installation
  if command -v ollama &>/dev/null; then
    log_success "Cài đặt Ollama thành công!"
  else
    log_error "Cài đặt Ollama thất bại. Vui lòng thử cài thủ công tại: https://ollama.com"
    exit 1
  fi
fi

echo ""

# =============================================================================
# STEP 2: Check & Start Ollama Service
# =============================================================================

is_ollama_running() {
  curl -s --max-time 2 http://localhost:11434 &>/dev/null
}

if is_ollama_running; then
  log_success "Ollama đang chạy trên http://localhost:11434"
else
  log_warn "Ollama chưa chạy. Đang khởi động service..."

  if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS: start via brew services or background process
    if command -v brew &>/dev/null && brew list ollama &>/dev/null 2>&1; then
      brew services start ollama
    else
      nohup ollama serve > /tmp/ollama.log 2>&1 &
      OLLAMA_PID=$!
      log_info "Ollama đang khởi động (PID: $OLLAMA_PID)..."
    fi
  else
    # Linux: start in background
    nohup ollama serve > /tmp/ollama.log 2>&1 &
    OLLAMA_PID=$!
    log_info "Ollama đang khởi động (PID: $OLLAMA_PID)..."
  fi

  # Wait for service to be ready (max 15 seconds)
  echo -n "  Chờ service sẵn sàng"
  for i in $(seq 1 15); do
    sleep 1
    echo -n "."
    if is_ollama_running; then
      echo ""
      log_success "Ollama đã sẵn sàng trên http://localhost:11434"
      break
    fi
    if [[ $i -eq 15 ]]; then
      echo ""
      log_error "Ollama không phản hồi sau 15 giây. Kiểm tra log tại: /tmp/ollama.log"
      exit 1
    fi
  done
fi

echo ""

# =============================================================================
# STEP 3: Check recommended model for QuickLang (qwen2.5:7b)
# =============================================================================

RECOMMENDED_MODEL="qwen2.5:7b"
FALLBACK_MODEL="qwen2.5:3b"

log_info "Kiểm tra model AI cho QuickLang..."

INSTALLED_MODELS=$(ollama list 2>/dev/null)

if echo "$INSTALLED_MODELS" | grep -q "qwen2.5:7b"; then
  log_success "Model ${RECOMMENDED_MODEL} đã có sẵn"
elif echo "$INSTALLED_MODELS" | grep -q "qwen2.5:3b"; then
  log_success "Model ${FALLBACK_MODEL} đã có sẵn (bản nhỏ)"
else
  echo ""
  log_warn "Chưa có model nào phù hợp cho QuickLang."
  echo ""
  echo "  Gợi ý model hỗ trợ tiếng Việt tốt:"
  echo "    [1] qwen2.5:7b  - Chất lượng cao (~4.5GB)"
  echo "    [2] qwen2.5:3b  - Nhẹ hơn (~2GB)"
  echo "    [3] Bỏ qua - Tự cài sau"
  echo ""
  read -rp "  Chọn (1/2/3): " MODEL_CHOICE

  case "$MODEL_CHOICE" in
    1)
      log_info "Đang tải ${RECOMMENDED_MODEL}... (có thể mất vài phút)"
      ollama pull "$RECOMMENDED_MODEL"
      log_success "Đã tải xong ${RECOMMENDED_MODEL}"
      ;;
    2)
      log_info "Đang tải ${FALLBACK_MODEL}... (có thể mất vài phút)"
      ollama pull "$FALLBACK_MODEL"
      log_success "Đã tải xong ${FALLBACK_MODEL}"
      ;;
    *)
      log_warn "Bỏ qua bước tải model. Nhớ chạy: ollama pull qwen2.5:7b"
      ;;
  esac
fi

echo ""

# =============================================================================
# DONE
# =============================================================================

echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}   Ollama sẵn sàng cho QuickLang!          ${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""
echo "  API endpoint : http://localhost:11434"
echo "  Models đã có :"
ollama list 2>/dev/null | tail -n +2 | awk '{print "    -", $1}' || echo "    (không có)"
echo ""
