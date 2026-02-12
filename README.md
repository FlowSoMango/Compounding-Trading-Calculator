# Compounding Trading Calculator

This is a simple web-based calculator that demonstrates how compounding returns can grow a trading account over time. Users enter an initial capital amount, an expected return per period (expressed as a percentage), and the number of periods. The app calculates the ending balance after each period and displays a results table along with a summary.

## Getting started locally

To run the calculator locally on your machine:

1. Ensure you have a modern web browser installed.
2. Clone or download this repository.
3. Open `index.html` in your browser.

No build step or package manager is required; it is a purely static site using plain HTML, CSS, and JavaScript.

## Deploying to Vercel

This project is designed to be deployed on [Vercel](https://vercel.com/) as a static site. Since there is no build step, you can leave the **Build Command** empty in your project settings. Set the **Output Directory** to the root of the repository (i.e. `.`) because `index.html` lives at the top level.

If you are using Vercel’s GitHub integration, make sure you commit all files in this directory to your repository. Once connected, Vercel will detect the static project and deploy it automatically. You can also upload the files directly via the Vercel dashboard if preferred.

## License

This project is licensed under the MIT License. See the `LICENSE` file for more details.