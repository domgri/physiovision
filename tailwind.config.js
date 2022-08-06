module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      height: theme => ({
        "120": "30rem",
        "128": "32rem",
      })
    },
  },
  plugins: [],
}
