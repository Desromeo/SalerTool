export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const path = url.pathname;

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // 1. 获取所有客户
    if (path === '/api/customers' && request.method === 'GET') {
      const { results } = await env.DB.prepare('SELECT * FROM customers ORDER BY created_at DESC').all();
      return new Response(JSON.stringify(results), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 2. 新建客户
    if (path === '/api/customers' && request.method === 'POST') {
      const body = await request.json();
      const { company_name, credit_code, enterprise_type, industry, region, employee_count, annual_gmv } = body;
      const result = await env.DB.prepare(
        `INSERT INTO customers (company_name, credit_code, enterprise_type, industry, region, employee_count, annual_gmv)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      ).bind(company_name, credit_code, enterprise_type, industry, region, employee_count, annual_gmv).run();

      return new Response(JSON.stringify({ success: true, id: result.meta.last_row_id }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 3. 保存调研记录
    if (path === '/api/surveys' && request.method === 'POST') {
      const body = await request.json();
      const { customer_id, sales_name, visit_date, data } = body;
      const result = await env.DB.prepare(
        `INSERT INTO surveys (customer_id, sales_name, visit_date, data) VALUES (?, ?, ?, ?)`
      ).bind(customer_id, sales_name, visit_date, JSON.stringify(data)).run();

      return new Response(JSON.stringify({ success: true, id: result.meta.last_row_id }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 4. 保存报价记录
    if (path === '/api/quotes' && request.method === 'POST') {
      const body = await request.json();
      const { customer_id, quote_no, quote_data, total_settle, total_quote } = body;
      const result = await env.DB.prepare(
        `INSERT INTO quotes (customer_id, quote_no, quote_data, total_settle, total_quote) VALUES (?, ?, ?, ?, ?)`
      ).bind(customer_id, quote_no, JSON.stringify(quote_data), total_settle, total_quote).run();

      return new Response(JSON.stringify({ success: true, id: result.meta.last_row_id }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Not Found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}
