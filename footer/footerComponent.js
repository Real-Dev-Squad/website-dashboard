function loadFooter() {
  const footerHTML = `
      <footer class="footer" data-test-id="footer">
        <p class="info-repo" data-test-id="info-repo">
          The contents of this website are deployed from this
          <a
            href="https://github.com/Real-Dev-Squad/website-dashboard"
            target="_blank"
            rel="noopener noreferrer"
            data-test-id="repo-link"
          >
            open sourced repo
          </a>
        </p>
      </footer>
    `;

  document.body.insertAdjacentHTML('beforeend', footerHTML);
}
