import themes from "daisyui/src/theming/themes";
import { ConfigProps } from "./types/config";

const config = {
  // REQUIRED
  appName: "Timeback",
  // REQUIRED: a short description of your app for SEO tags (can be overwritten)
  appDescription:
    "AI-powered personalized learning platform where students achieve 99th percentile test scores in just 2 hours daily. Proven homeschool curriculum with adaptive tutoring for K-12 students.",
  // REQUIRED (no https://, not trailing slash at the end, just the naked domain)
  domainName: "timebacklearn.com",
  crisp: {
    // Crisp website ID. IF YOU DON'T USE CRISP: just remove this => Then add a support email in this config file (resend.supportEmail) otherwise customer support won't work.
    id: "",
    // Hide Crisp by default, except on route "/". Crisp is toggled with <ButtonSupport/>. If you want to show Crisp on every routes, just remove this below
    onlyShowOnRoutes: ["/"],
  },
  stripe: {
    // Stripe configuration removed - Timeback is not selling yet
    plans: [],
  },
  aws: {
    // If you use AWS S3/Cloudfront, put values in here
    bucket: "bucket-name",
    bucketUrl: `https://bucket-name.s3.amazonaws.com/`,
    cdn: "https://cdn-id.cloudfront.net/",
  },
  resend: {
    // REQUIRED - Email 'From' field to be used when sending magic login links
    fromNoReply: `Timeback <noreply@timebacklearn.com>`,
    // REQUIRED - Email 'From' field to be used when sending other emails, like abandoned carts, updates etc..
    fromAdmin: `Timeback Team <hello@timebacklearn.com>`,
    // Email shown to customer if they need support. Leave empty if not needed => if empty, set up Crisp above, otherwise you won't be able to offer customer support."
    supportEmail: "support@timebacklearn.com",
  },
  colors: {
    // REQUIRED - The DaisyUI theme to use (added to the main layout.js). Leave blank for default (light & dark mode). If you use any theme other than light/dark, you need to add it in config.tailwind.js in daisyui.themes.
    theme: "light",
    // REQUIRED - This color will be reflected on the whole app outside of the document (loading bar, Chrome tabs, etc..). By default it takes the primary color from your DaisyUI theme (make sure to update your the theme name after "data-theme=")
    // OR you can just do this to use a custom color: main: "#f37055". HEX only.
    main: "#123BB6", // Timeback primary blue
  },
  auth: {
    // REQUIRED - the path to log in users. It's use to protect private routes (like /dashboard). It's used in apiClient (/libs/api.js) upon 401 errors from our API
    loginUrl: "/api/auth/signin",
    // REQUIRED - the path you want to redirect users to after a successful login (i.e. /dashboard, /private). This is normally a private page for users to manage their accounts. It's used in apiClient (/libs/api.js) upon 401 errors from our API & in ButtonSignin.js
    callbackUrl: "/dashboard",
  },
} as ConfigProps;

export default config;
