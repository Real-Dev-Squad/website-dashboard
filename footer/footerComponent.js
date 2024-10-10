// footerComponent.js

// Define the loadFooter function that takes an href argument
function loadFooter(href) {
  const footerHTML = `
      <footer class="footer" data-test-id="footer">
        <p class="info-repo" data-test-id="info-repo">
          The contents of this website are deployed from this
          <a
            href="${href}"
            target="_blank"
            rel="noopener noreferrer"
            data-test-id="repo-link"
          >
            open sourced repo
          </a>
        </p>
      </footer>
    `;

  // Insert the footer into the DOM
  document.body.insertAdjacentHTML('beforeend', footerHTML);
}
