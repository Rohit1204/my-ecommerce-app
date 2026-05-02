export function getApiBase(): string {
  return (
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ??
    "http://127.0.0.1:8000"
  );
}
