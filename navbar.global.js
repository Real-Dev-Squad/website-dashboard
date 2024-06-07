const navbar = document.getElementById('tasksNav');

const addNavbartoPage = () => {
  console.log('navbar?.innerHTML?.length===>', navbar?.innerHTML?.length);
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
};

setTimeout(() => {
  addNavbartoPage();
}, 1000);
