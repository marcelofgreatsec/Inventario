export { default } from "next-auth/middleware"

export const config = {
    matcher: [
        "/",
        "/inventario/:path*",
        "/backups/:path*",
        "/infraestrutura/:path*",
        "/administracao/:path*",
        "/api/((?!auth).*)"
    ]
}
