interface Env {
  DB: D1Database;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const { id, field, value } = await context.request.json() as { id: number, field: string, value: boolean };

    // Validate field name to prevent SQL injection
    const allowedFields = ['planting', 'dry_1', 'wet_1', 'harvest'];
    if (!allowedFields.includes(field)) {
      return new Response(JSON.stringify({ error: 'Invalid field' }), { status: 400 });
    }

    const intValue = value ? 1 : 0;
    const query = `UPDATE farmers SET ${field} = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    
    await context.env.DB.prepare(query).bind(intValue, id).run();

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
};
