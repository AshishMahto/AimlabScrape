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

var input = localStorage.getItem("440EB442239D97C8week");

/**
 * @param {ReadableStream<BlobPart>} stream
 * @returns {Promise<Blob>}
 */
async function streamToBlob(stream) {
  const reader = stream.getReader();
  const chunks = [];
  for (let { done, value } = await reader.read(); !done; { done, value } = await reader.read()) {
    chunks.push(/** @type {BlobPart} */ (value));
  }
  return new Blob(chunks);
}

/** Compress any string. */
async function compress(input) {
  const stream = new Blob([JSON.stringify(input)]).stream().pipeThrough(new CompressionStream("gzip"));
  /**
   * @param {Blob} blob
   * @returns {Promise<string>}
   */
  async function blobToBase64DataUrl(blob) {
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(/** @type {string} */ (reader.result));
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(blob);
    });
  }
  return await blobToBase64DataUrl(await streamToBlob(stream));
}

/**
 * Decompress a string from `compress`.
 * @param {string} compressed
 */
async function decompress(compressed) {
  const body = /** @type {ReadableStream<Uint8Array>} */ ((await fetch(compressed)).body);
  return JSON.parse(await (await streamToBlob(body.pipeThrough(new DecompressionStream("gzip")))).text());
}

/**
 * Get stats and set up the page.
 * @param {string} userId
 */
async function withUserId(userId) {
  sections.stats?.classList.toggle("d-none");
  const compressedNull = await compress(null);
  const timeList = getElemById("time-list");
  const benchDict = Object.fromEntries(benchmarks.map((b) => [b.id, b]));
  const mostRecent = await recentPlay(userId);

  /** @returns {Promise<Record<string, Play[]> & {data: Play[]}>} */
  const getWeekPlays = async () => await decompress(localStorage.getItem(`${userId}week`) ?? compressedNull);
  const setWeekPlays = async (value) => localStorage.setItem(`${userId}week`, await compress(value));

  /** @returns {Promise<Play[]>} */
  const getPlays = async (key) => await decompress(localStorage.getItem(key) ?? compressedNull);
  const setPlays = async (key, value) => localStorage.setItem(key, await compress(value));

  const getFreshStoredWeekData = async () => {
    const storedData = await getWeekPlays();
    if (!storedData) return null;
    if (new Date(storedData.data[0].ended_at) < new Date(mostRecent.ended_at)) {
      Object.keys(localStorage).forEach((key) => key.startsWith(userId) && localStorage.removeItem(key));
      return null;
    }
    return storedData[taskList.value];
  };

  const fetchWeekData = async () => {
    const data = await allPlaysLastWeek(userId);
    setWeekPlays(data);
    return data[taskList.value];
  };

  /**
   * @param {string} storageKey
   * @returns {Promise<Play[]>}
   */
  const fetchData = async (storageKey) => {
    const data = await allTaskPlaysSince(userId, taskList.value, /** @type {any} */ (timeList.value));
    await setPlays(storageKey, data);
    return data;
  };
  const onTask = async () => {
    /** @type {Play[]} */
    var chartData;

    const storageKey = `${userId}${timeList.value}${taskList.value}`;
    chartData =
      timeList.value === "week"
        ? (await getFreshStoredWeekData()) ?? (await fetchWeekData())
        : (await getPlays(storageKey)) ?? (await fetchData(storageKey));

    if (!chartData?.length) throw new Error(`No data found for ${taskList.value}`);
    localStorage.setItem("curTask", taskList.value);
    makeChart(chartData, benchDict[taskList.value] ?? {}, timeList.value, window);
  };
  taskList.addEventListener("change", onTask);
  timeList.addEventListener("change", onTask);
  const prevTask = localStorage.getItem("curTask");
  if (prevTask) taskList.value = prevTask;
  onTask();
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
