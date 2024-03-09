const getElemById = (/** @type {string} */ id) => /** @type {HTMLInputElement} */ (document.getElementById(id));
const currentKey = "$ current.username ?";
const sections = {
  usernameSearch: getElemById("username-search-section"),
  stats: getElemById("stats-section"),
};

const user = { param: new URLSearchParams(window.location.search).get("u") };
user.name = localStorage.getItem(currentKey);
user.id = user.name && localStorage.getItem(user.name); // invariant: if user.name exists, user.id is valid

try {
  if (user.param) {
    if (!user.id || user.param !== user.name) {
      const getParamId = localStorage.getItem(user.param);
      if (getParamId) {
        localStorage.setItem(currentKey, user.param);
        withUserId(getParamId);
      } else {
        getUserInfo(user.param).then(({ data: { aimlabProfile: profile } }) => {
          localStorage.setItem(profile.username, profile.id);
          localStorage.setItem(currentKey, profile.username);
          withUserId(profile.id);
        });
      }
    } else {
      withUserId(user.id);
    }
  } else {
    withoutUserId();
  }
} catch (e) {
  handleError(e);
}

/**
 * Get stats and set up the page.
 * @param {string} userId
 */
async function withUserId(userId) {
  sections.stats?.classList.toggle("d-none");
  const storedData = localStorage.getItem(userId);
  const data = storedData ? JSON.parse(storedData) : await allPlaysLastWeek(userId);
  localStorage.setItem(userId, JSON.stringify(data));

  const w = /** @type {any} */ (window);
  makeWeekChart(w.am4charts, w.am4core, data, benchmarks[2], w);
}

/**
 * Set up search functionality instead.
 */
function withoutUserId() {
  sections.usernameSearch?.classList.toggle("d-none");
  const input = getElemById("username-search");
  if (user.name) {
    input.value = user.name;
    input.focus();
  }
  var submitUsername = (/** @type {Event} */ e) => {
    e.preventDefault();
    window.location.search = `?u=${encodeURIComponent(input.value)}`;
  };

  getElemById("username-form")?.addEventListener("submit", submitUsername);
}
