interface Env {
  DB: D1Database;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { searchParams } = new URL(context.request.url);
  const grouping = searchParams.get('grouping');
  const name = searchParams.get('name');

  let query = 'SELECT * FROM farmers';
  const params: string[] = [];
  const whereClauses: string[] = [];

  if (grouping) {
    whereClauses.push('grouping = ?');
    params.push(grouping);
  }

  if (name) {
    whereClauses.push('farmer_name LIKE ?');
    params.push(`%${name}%`);
  }

  if (whereClauses.length > 0) {
    query += ' WHERE ' + whereClauses.join(' AND ');
  }

  query += ' ORDER BY farmer_name ASC';

  try {
    const { results } = await context.env.DB.prepare(query).bind(...params).all();
    return new Response(JSON.stringify(results), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
};
