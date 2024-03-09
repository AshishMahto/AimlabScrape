const { off } = require("process");
var aimlabsGraphql = require("./aimlabsGraphql.js");

/**
 * helps with clearing up graphql introspection succinctly
 * @param {any[]} a
 */
f = (a) => {
  function getType({ kind, name, ofType }, nonNull = "") {
    return !ofType ? name + nonNull : kind === "NON_NULL" ? getType(ofType, "!") : kind + nonNull + `[${getType(ofType)}]`;
  }
  return Object.fromEntries(
    a
      .filter(({ isDeprecated }) => !isDeprecated)
      .map((x) => {
        var [name, type] = [x.name, getType(x.type)];
        if (x.args.length > 0) name = `${name}[${x.args.map(({ name }) => name)}]`;
        return [name, type];
      })
  );
};

const userInfo = () => {
  return aimlabsGraphql(
    `query ($input: String) {
      aimlabProfile (username: $input) { username, id }
    }`,
    { input: "waf9000" }
  );
};

const userId = "440EB442239D97C8";
const basicTaskStats = `ended_at
score
accuracy`;

/**
 * Return a list of all plays within the last week.
 * @param {number} days Defaults to 7 for week. Can increase if you want more data.
 * @returns {Promise<{ task_id: string; task_name: string; ended_at: string; score: number; accuracy: number; }[]>}
 */
const allPlaysLastWeek = async (days = 7) => {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const edges = [],
    limit = 200,
    order_by = { ended_at: "desc" },
    where = { ended_at: { _gt: cutoff.toISOString() }, user_id: { _eq: userId } };
  for (let offset = 0, hasNextPage = true; hasNextPage; offset += limit) {
    const resp = await aimlabsGraphql(
      `query ($limit: Int, $offset: Int, $order_by: AimlabPlayOrderBy!, $where: AimlabPlayWhere!) {
        aimlab {
          plays(limit: $limit, offset: $offset, order_by: $order_by, where: $where) {
            totalCount
            pageInfo { hasNextPage }
            edges { node { 
              task_id, task_name,
              ${basicTaskStats}
            } }
          }
        }
      }`,
      { limit, offset, order_by, where }
    );
    hasNextPage = resp.data.aimlab.plays.pageInfo.hasNextPage;
    edges.push(resp.data.aimlab.plays.edges);
  }
  return [].concat.apply([], edges).map(({ node }) => node);
};

allPlaysLastWeek().then((d) => console.dir(d, { depth: null }));
