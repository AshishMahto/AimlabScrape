/**
 *
 * @param {string} username Username to get aimlabs ID for
 * @returns {Promise<{data: {aimlabProfile: { username: string, id: string }}}>}
 */
var getUserInfo = (username) =>
  aimlabsGraphQL(
    `query ($username: String) {
      aimlabProfile (username: $username) { username, id }
    }`,
    { username }
  );

const basicTaskStats = ["ended_at", "score", "accuracy"];

/**
 * @typedef {{ended_at: string, score: number, accuracy: number}} Play
 */

/**
 * Return a list of all plays within the last week.
 * @param {string} userId
 * @param {number} days Defaults to 7 for week. Can increase if you want more data.
 * @returns {Promise<Record<string, Play[]> & {data: Play[]}>}
 */
async function allPlaysLastWeek(userId, days = 7) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const edges = [],
    limit = 200,
    order_by = { ended_at: "desc" },
    where = { ended_at: { _gt: cutoff.toISOString() }, user_id: { _eq: userId } };
  for (let offset = 0, hasNextPage = true; hasNextPage; offset += limit) {
    const { data } = await aimlabsGraphQL(
      `query ($limit: Int, $offset: Int, $order_by: AimlabPlayOrderBy!, $where: AimlabPlayWhere!) {
        aimlab {
          plays(limit: $limit, offset: $offset, order_by: $order_by, where: $where) {
            totalCount
            pageInfo { hasNextPage }
            edges { node { task_id,task_name,${basicTaskStats} } }
          }
        }
      }`,
      { limit, offset, order_by, where }
    );
    hasNextPage = data.aimlab.plays.pageInfo.hasNextPage;
    edges.push(data.aimlab.plays.edges);
  }
  /** @type {({task_id: string} & Play)[]} */
  const data = [].concat.apply([], edges).map(({ node }) => node);
  /** @type { Record<string, Play[]> & {data: Play[]} } */
  const grouped = { data };
  for (const play of data) {
    if (!grouped[play.task_id]) grouped[play.task_id] = [];
    grouped[play.task_id].push({ ended_at: play.ended_at, score: play.score, accuracy: play.accuracy });
  }
  return grouped;
}

/**
 * Get all plays within a timeframe for a specific task.
 * @param {string} userId
 * @param {string} taskId
 * @param {"month" | "year"} time
 * @returns {Promise<Play[]>}
 */
async function allTaskPlaysSince(userId, taskId, time) {
  const cutoff = new Date();
  if (time === "month") cutoff.setMonth(cutoff.getMonth() - 1);
  else if (time === "year") cutoff.setFullYear(cutoff.getFullYear() - 1);
  else cutoff.setDate(cutoff.getDate() - Number.parseInt(time));
  const edges = [],
    limit = 200,
    order_by = { ended_at: "desc" },
    where = {
      ended_at: { _gt: cutoff.toISOString() },
      user_id: { _eq: userId },
      task_id: { _like: taskId.replaceAll(" ", "%") },
    };
  for (let offset = 0, hasNextPage = true; hasNextPage; offset += limit) {
    const { data } = await aimlabsGraphQL(
      `query ($limit: Int, $offset: Int, $order_by: AimlabPlayOrderBy!, $where: AimlabPlayWhere!) {
        aimlab {
          plays(limit: $limit, offset: $offset, order_by: $order_by, where: $where) {
            totalCount
            pageInfo { hasNextPage }
            edges { node { ${basicTaskStats} } }
          }
        }
      }`,
      { limit, offset, order_by, where }
    );
    hasNextPage = data.aimlab.plays.pageInfo.hasNextPage;
    edges.push(data.aimlab.plays.edges);
  }
  return [].concat.apply([], edges).map(({ node }) => node);
}

/**
 * Return the most recent play. Good for checking if storage is stale.
 * @param {string} userId
 * @returns {Promise<Play>}
 */
async function recentPlay(userId) {
  const { data } = await aimlabsGraphQL(
    `query ($userId: String) {
      aimlab {
        plays(limit: 1, order_by: {ended_at: desc}, where: {user_id: {_eq: $userId}}) {
          edges { node { task_id,task_name,${basicTaskStats} } }
        }
      }
    }`,
    { userId }
  );
  return data.aimlab.plays.edges[0].node;
}

/**
 * Make a request to aimlabs' GraphQL API
 * @param {string} query
 * @param {Record<string, any>} variables
 * @returns {Promise<{data: any}>}
 */
async function aimlabsGraphQL(query, variables = {}) {
  const resp = await fetch("https://api.aimlab.gg/graphql", {
    headers: {
      accept: "*/*",
      "accept-encoding": "gzip, deflate, br",
      "content-type": "application/json",
    },
    body: JSON.stringify({ query, variables }),
    method: "POST",
    mode: "cors",
    credentials: "omit",
  });
  if (!resp.ok) {
    const body = await resp.text();
    throw newAimlabsError(resp, body);
  }
  return await resp.json();
}
