# Bronto for Playwright

`bronto-playwright` is an npm module that seamlessly integrates Bronto's visual testing tools with Playwright, enabling developers to easily implement and manage visual tests in their web applications. This integration simplifies the process of capturing and comparing visual snapshots during automated tests, helping ensure your application looks as intended on all browsers and devices.

## Features

- **Easy Integration**: Quickly set up visual testing with Playwright.
- **Snapshot Comparison**: Automatically capture and compare visual states of your app.
- **Cross-Browser Testing**: Test how your app appears across different browsers.
- **CI/CD Compatibility**: Integrate visual tests into your continuous integration and deployment pipelines.

## Installation

Install `bronto-playwright` using npm:

```bash
npm install bronto-playwright
```

## Usage

Here's a simple example to get you started with bronto-playwright:

```javascript
const { test, expect } = require("@playwright/test");
const { bronto } = require("bronto-playwright");

test("has title", async ({ page }, testInfo) => {
  await page.goto("https://playwright.dev/");

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Playwright/);

  await bronto("Test Forza Horizon UI", page, testInfo);
});
```

## Configuration

Configure bronto-playwright by setting environment variables:

`BRONTO_EMAIL`: The email you use to login into Bronto's editor
`BRONTO_PASSWORD`: You must set a password in order to use Bronto. You can do it trough the account page.

## Contributing

Contributions are welcome! Please read our Contributing Guide for details on our code of conduct, and the process for submitting pull requests.

//TODO: Add a contributing guide 👀

## License

This project is licensed under the MIT License - see the LICENSE file for details.
