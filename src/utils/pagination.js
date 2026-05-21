function parsePagination(query) {
  const limit = Math.min(Number(query.limit || 20), 100);
  const cursor = query.cursor || undefined;
  return { limit, cursor };
}

function paginated(data, limit) {
  const hasNextPage = data.length > limit;
  const items = hasNextPage ? data.slice(0, limit) : data;
  const nextCursor = hasNextPage ? items[items.length - 1].id : null;
  return { data: items, pageInfo: { hasNextPage, nextCursor } };
}

module.exports = { parsePagination, paginated };
