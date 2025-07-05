const sharedConfig = require("@repo/tailwind-config/tailwind.config");

/** @type {import('tailwindcss').Config} */
const config = {
  presets: [sharedConfig],
};

module.exports = config;
