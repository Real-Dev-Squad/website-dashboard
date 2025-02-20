const addNavbartoPage = async () => {
  const navbar = document?.getElementById('tasksNav');
  const navbarParams = new URLSearchParams(window?.location?.search);
  navbar.innerHTML = `
        <div class="logo">
            <a href="/index.html">
                <img src="/images/Real-Dev-Squad@1x.png" alt="logo" />
            </a>
        </div>
        <div class="nav-links">
            <div class="hamburger">
            <div class="line"></div>
            <div class="line"></div>
            <div class="line"></div>
            </div>
            <div class="links">
            <a href="https://welcome.realdevsquad.com/">Welcome</a>
            <a href="https://www.realdevsquad.com/events">Events</a>
            <a href="https://members.realdevsquad.com/">Members</a>
            <a href="https://status.realdevsquad.com/tasks">Status</a>
            </div>
        </div>
        <div class="sign-in-btn">
            <button onclick="goToAuthPage()">
            Sign In <span>With GitHub</span>
            <img src="/images/github.png" class="user-avatar" />
            </button>
        </div>
        <div class="user-info">
            <span id="user-name"></span>
            <span>
            <img id="user-img" src="" alt="" />
            </span>
            <span>
              <svg id="chevron-down" class="svg-inline--fa fa-chevron-down" data-prefix="fas" data-icon="chevron-down" aria-hidden="true" focusable="false"   role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" data-test-icon="" style="
                  height: 1rem;
                  width: 1.4rem;
                  margin-left: 0.2rem;
                  ">
                    <path fill="currentColor" d="M233.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L256 338.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z"></path>
              </svg>
            </span>
        </div>
        <div id="dropdown" data-testid="dropdown-menu"></div>
    `;

  const hamburgerDiv = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.links');
  let toggle = true;

  hamburgerDiv?.addEventListener('click', function () {
    if (toggle) {
      navLinks.classList.add('active');
      toggle = false;
    } else {
      navLinks.classList.remove('active');
      toggle = true;
    }
  });

  if (navbarParams?.get('dev') === 'true') {
    let navActive = document?.querySelector('.nav-links');
    const navLinks = document?.querySelector('.links');
    document?.addEventListener('click', function (event) {
      if (!navActive?.contains(event.target)) {
        navLinks?.classList?.remove('active');
        toggle = true;
      }
    });
  }
};
