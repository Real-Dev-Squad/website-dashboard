# RDS Website Dashboard

[Live Dashboard](https://dashboard.realdevsquad.com/)

## Overview

The RDS Website Dashboard is a tool for authorized members to create, assign, and track tasks. It provides a clear view of tasks assigned to each member and streamlines team collaboration.

---

## 🚀 Quick Start

You can run the dashboard locally in just a few steps:

### Prerequisites

- [Visual Studio Code](https://code.visualstudio.com/) installed on your machine.
- [Live Server extension](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) for VS Code.

### Running the Dashboard Locally

1.  **Clone this repository** to your local machine.
2.  **Open the project folder** in VS Code.
3.  **Install yarn dependencies** by running the following command in your project directory:

    ```bash
    yarn install
    ```

    This will install all required packages for the proxy server and other tooling.

4.  **Start the proxy server** by running:

    ```bash
    yarn dev
    ```

    This command starts the proxy server, which is necessary for API calls from the frontend to the backend (see the "Proxying API Requests" section below for more details).

5.  **Start the frontend server:** Click the **"Go Live" button** in the bottom-right corner of VS Code.
    - This will open the dashboard in your browser and automatically reload when you make changes.
    - If you don't see the "Go Live" button, ensure the Live Server extension is installed and enabled.
    - **Important:** For full functionality, especially API calls, make sure both the proxy server (`yarn dev` started in step 4) and the Live Server are running concurrently.

> **Note:** If you only start Live Server without the proxy server, API requests from the frontend may fail due to CORS issues. Always run both servers for a complete local development experience.

---

## 🤝 Contributing

We welcome contributions! Please read our [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

### Proxying API Requests (Handling CORS Issues)

When running the dashboard locally, you may encounter CORS (Cross-Origin Resource Sharing) errors if you try to call backend APIs directly from your browser. This happens because your frontend (served from `localhost`) is on a different origin than the backend API.

To solve this, you can set up a proxy that forwards your API requests from the frontend to the backend, bypassing CORS restrictions. The Real Dev Squad provides a detailed guide for this process:

- [How to set up a proxy for local development (dev-url-cors)](https://github.com/Real-Dev-Squad/docs/tree/main/docs/dev/https-dev-url-cors)

This guide explains step-by-step how to configure a proxy so your local dashboard can communicate with backend APIs without CORS issues. It covers different approaches and tools you can use, depending on your setup.

#### Accessing the Dashboard via the Proxy URL

> **Important:** After setting up the proxy as described in the [dev-url-cors documentation](https://github.com/Real-Dev-Squad/docs/tree/main/docs/dev/https-dev-url-cors), you should access the dashboard using the custom proxy URL in your browser (for example: `https://dev.realdevsquad.com`).
>
> This ensures that all API requests from the frontend are properly forwarded to the backend, and that CORS and authentication work as expected. The proxy setup guide explains how to configure this custom domain and HTTPS locally.
>
> If you continue to use the default Live Server URL (e.g., `http://localhost:5500`), API requests may fail due to CORS issues.

---

## 🛠️ Troubleshooting

- If the dashboard does not open automatically, check the Live Server output in VS Code or open the provided local URL manually in your browser.
- Make sure you are opening the correct `index.html` file (usually at the root or in the `src/` folder).
- For any issues, feel free to open an issue or reach out to the maintainers.
