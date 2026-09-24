import type {NextConfig} from "next";

const csp=[
 "default-src 'self'",
 "base-uri 'self'",
 "form-action 'self'",
 "frame-ancestors 'none'",
 "object-src 'none'",
 "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.googleadservices.com https://cdn.metered.ca",
 "style-src 'self' 'unsafe-inline'",
 "img-src 'self' data: blob: https://www.google.com https://www.google.de https://*.googleusercontent.com",
 "font-src 'self' data:",
 "media-src 'self' blob: https://*.metered.ca https://*.metered.live",
 "connect-src 'self' https://www.google-analytics.com https://www.googletagmanager.com https://www.googleadservices.com https://*.metered.ca https://*.metered.live wss://*.metered.ca wss://*.metered.live",
 "frame-src https://*.metered.ca https://*.metered.live",
 "upgrade-insecure-requests"
].join("; ");

const securityHeaders=[
 {key:"Content-Security-Policy",value:csp},
 {key:"X-Content-Type-Options",value:"nosniff"},
 {key:"X-Frame-Options",value:"DENY"},
 {key:"Referrer-Policy",value:"strict-origin-when-cross-origin"},
 {key:"Permissions-Policy",value:'camera=(self "https://cafeaindoi.metered.live"), microphone=(self "https://cafeaindoi.metered.live"), geolocation=(), payment=()'},
 {key:"Cross-Origin-Opener-Policy",value:"same-origin"}
];

const config:NextConfig={async headers(){return[{source:"/:path*",headers:securityHeaders}]}};
export default config;
