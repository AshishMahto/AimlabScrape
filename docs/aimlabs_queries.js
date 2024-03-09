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
 * Return a list of all plays within the last week.
 * @param {string} userId
 * @param {number} days Defaults to 7 for week. Can increase if you want more data.
 * @returns {Promise<Record<string, {ended_at: string, score: number, accuracy: number}[]>>}
 */
const allPlaysLastWeek = async (userId, days = 7) => {
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
  const data = [].concat.apply([], edges).map(({ node }) => node);
  /** @type { Record<string, {ended_at: string, score: number, accuracy: number}[]> } */
  const grouped = {};
  for (const play of data) {
    const taskId = play.task_id.replaceAll(" ", "%");
    if (!grouped[taskId]) grouped[taskId] = [];
    grouped[taskId].push({ ended_at: play.ended_at, score: play.score, accuracy: play.accuracy });
  }
  return grouped;
};

/**
 * Make a request to aimlabs' GraphQL API
 * @param {string} query
 * @param {Record<string, any>} variables
 * @returns {Promise<{data: any}>}
 */
var aimlabsGraphQL = async (query, variables = {}) => {
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
};
