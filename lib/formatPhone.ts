// Korean phone number auto-hyphenation
// Supports: 010/011/016/017/018/019, 02, 0XX (3-digit area codes)
export function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 11)

  if (digits.startsWith('02')) {
    // Seoul: 02-XXXX-XXXX or 02-XXX-XXXX
    if (digits.length <= 2) return digits
    if (digits.length <= 5) return `${digits.slice(0, 2)}-${digits.slice(2)}`
    if (digits.length <= 9) return `${digits.slice(0, 2)}-${digits.slice(2, 5)}-${digits.slice(5)}`
    return `${digits.slice(0, 2)}-${digits.slice(2, 6)}-${digits.slice(6)}`
  }

  // 010/011/016~019, 031~099 (3-digit prefix)
  if (digits.length <= 3) return digits
  if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`
  if (digits.length <= 10) return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`
}
