// Helper: send a command to a specific terminal via socket (writes text, user must press Enter)
export function sendCmd(socket, termId, cmd) {
  if (socket && termId) {
    socket.emit('terminal:write', { id: termId, data: cmd });
  }
}

// Helper: copy text to clipboard
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

// Format file size
export function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1024 / 1024).toFixed(1) + ' MB';
}

// Get file extension
export function getExt(name) {
  return name.split('.').pop().toLowerCase();
}
