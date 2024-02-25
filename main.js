console.log("hello world!", { 1: 3 });

const graphql = JSON.stringify({
  query: `
query TaskHistory($limit: Int, $offset: Int, $order_by: AimlabPlayOrderBy!, $where: AimlabPlayWhere!) {
  aimlab {
    plays(limit:$limit, offset:$offset, order_by:$order_by, where:$where) {
      totalCount
      edges {
        node {
          steam_id
          ended_at
          play_id
          score
          task_duration
          targets
          kills
          shots_fired
          shots_hit
          shots_hit_head
          shots_hit_body
          accuracy
          shots_missed
          settings_fov
        }
      }
    }
  }
}
`,
  variables: {
    limit: 20,
    offset: 0,
    order_by: { ended_at: "desc" },
    where: {
      task_id: { _like: "CsLevel.Lowgravity56.VT%x%WHJ.RWEZ9J" },
      user_id: { _eq: "440EB442239D97C8" },
    },
  },
});
