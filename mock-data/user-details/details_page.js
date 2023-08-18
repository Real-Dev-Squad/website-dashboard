const detail = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="icon" href="/images/index.ico" type="image/x-icon" />
    <title>User Management | Real Dev Squad</title>
    <link rel="stylesheet" href="/global.css" />
    <link rel="stylesheet" href="/users/details/style.css" />
    <script src="/constants.js"></script>
    <script src="/utils.js"></script>
    <script src="/users/details/constants.js" defer></script>
    <script src="/users/details/utils.js" defer></script>
    <script src="/users/details/script.js" defer></script>
  </head>

  <body>
    <header class="header hide">
      <h1>User Management</h1>
    </header>
    <section id="main-section" class="hide">
      <div class="user-details">
        <div class="user-details-header"></div>
        <ul class="accordion hide">
          <li class="accordion-academic">
            <div class="visible-content">
              <h2 class="accordian-heading">Professional Details</h2>
              <div class="icon-div">
                <img
                  src="/users/images/arrow-icon.svg"
                  alt="expand"
                  class="accordion-icon"
                />
              </div>
            </div>
          </li>
          <li class="accordion-skills">
            <div class="visible-content">
              <h2 class="accordian-heading">Skills</h2>
              <div class="icon-div">
                <img
                  src="/users/images/arrow-icon.svg"
                  alt="expand"
                  class="accordion-icon"
                />
              </div>
            </div>
          </li>
          <li class="accordion-availability">
            <div class="visible-content">
              <h2 class="accordian-heading">Availability</h2>
              <div class="icon-div">
                <img
                  src="/users/images/arrow-icon.svg"
                  alt="expand"
                  class="accordion-icon"
                />
              </div>
            </div>
          </li>
          <li class="accordion-tasks">
            <div class="visible-content">
              <h2 class="accordian-heading">Tasks</h2>
              <div class="icon-div">
                <img
                  src="/users/images/arrow-icon.svg"
                  alt="expand"
                  class="accordion-icon"
                />
              </div>
            </div>
          </li>
          <li class="accordion-prs">
            <div class="visible-content">
              <h2 class="accordian-heading">PR's</h2>
              <div class="icon-div">
                <img
                  src="/users/images/arrow-icon.svg"
                  alt="expand"
                  class="accordion-icon"
                />
              </div>
            </div>
          </li>
        </ul>
      </div>
    </section>
    <footer class="hide">
      <p class="info-repo">
        The contents of this website are deployed from this
        <a
          href="https://github.com/Real-Dev-Squad/website-dashboard"
          target="_blank"
          rel="noopener noreferrer"
        >
          open sourced repo
        </a>
      </p>
    </footer>
  <!-- Code injected by live-server -->
<script>
	// <![CDATA[  <-- For SVG support
	if ('WebSocket' in window) {
		(function () {
			function refreshCSS() {
				var sheets = [].slice.call(document.getElementsByTagName("link"));
				var head = document.getElementsByTagName("head")[0];
				for (var i = 0; i < sheets.length; ++i) {
					var elem = sheets[i];
					var parent = elem.parentElement || head;
					parent.removeChild(elem);
					var rel = elem.rel;
					if (elem.href && typeof rel != "string" || rel.length == 0 || rel.toLowerCase() == "stylesheet") {
						var url = elem.href.replace(/(&|\?)_cacheOverride=\d+/, '');
						elem.href = url + (url.indexOf('?') >= 0 ? '&' : '?') + '_cacheOverride=' + (new Date().valueOf());
					}
					parent.appendChild(elem);
				}
			}
			var protocol = window.location.protocol === 'http:' ? 'ws://' : 'wss://';
			var address = protocol + window.location.host + window.location.pathname + '/ws';
			var socket = new WebSocket(address);
			socket.onmessage = function (msg) {
				if (msg.data == 'reload') window.location.reload();
				else if (msg.data == 'refreshcss') refreshCSS();
			};
			if (sessionStorage && !sessionStorage.getItem('IsThisFirstTime_Log_From_LiveServer')) {
				console.log('Live reload enabled.');
				sessionStorage.setItem('IsThisFirstTime_Log_From_LiveServer', true);
			}
		})();
	}
	else {
		console.error('Upgrade your browser. This Browser is NOT supported WebSocket for Live-Reloading.');
	}
	// ]]>
</script>
</body>
</html>
`

module.exports={detail};