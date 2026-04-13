export function checkAdminToken(request: Request): boolean {
  const expectedToken = process.env.ADMIN_TOKEN
  if (!expectedToken) return true
  const url = new URL(request.url)
  return url.searchParams.get('token') === expectedToken
}
