const navbar = document?.getElementById('tasksNav');
const navbarParams = new URLSearchParams(window?.location?.search);

const addNavbartoPage = async () => {
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
        </div>
        <div id="dropdown"></div>
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
