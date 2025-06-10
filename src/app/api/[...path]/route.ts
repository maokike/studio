
import { NextResponse } from 'next/server';
import fetch from 'node-fetch'; // Asegúrate de que node-fetch esté instalado
import { Agent } from 'https';   // Asegúrate de que https esté disponible (es built-in en Node.js)

// URL de tu backend ASP.NET Web API (¡CONFIRMA QUE ESTA ES LA URL CORRECTA DE TU API!)
const API_BASE_URL = 'https://localhost:44314';

// Agente HTTPS para ignorar certificados auto-firmados (SOLO PARA DESARROLLO)
const httpsAgent = new Agent({
  rejectUnauthorized: false, 
});

// Función genérica para manejar cualquier solicitud de proxy
async function proxyRequest(req: Request, context: { params: { path: string[] } }) {
  
  const { path } = await context.params; // <--- Añade 'await' aquí
  const targetPath = path.join('/');

  const url = new URL(req.url);
  const searchParams = url.search;

  const finalTargetUrl = `${API_BASE_URL}/api/${targetPath}${searchParams}`;

  const headers = new Headers(req.headers);
  headers.delete('host');
  headers.delete('referer');
  headers.delete('x-forwarded-for');
  headers.delete('content-length');

  let body: BodyInit | null | undefined = undefined;
  if (req.method !== 'GET' && req.method !== 'HEAD' && req.method !== 'DELETE') {
    try {
      const rawBody = await req.text();
      body = rawBody;
    } catch (e) {
      console.error("Error al leer el cuerpo de la solicitud en el proxy:", e);
    }
  }

  try {
    const response = await fetch(finalTargetUrl, {
      method: req.method,
      headers: headers,
      body: body,
      redirect: 'manual',
      agent: httpsAgent,
    });

    const responseHeaders = new Headers(response.headers);
    responseHeaders.delete('set-cookie');

    return new NextResponse(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });

  } catch (error: any) {
    console.error(`Error del proxy al reenviar solicitud a ${finalTargetUrl} (${req.method}):`, error);
    return NextResponse.json(
      { message: `Error de conexión con el backend: ${error.message}` },
      { status: 500 }
    );
  }
}


export async function GET(req: Request, context: { params: { path: string[] } }) { // Asegúrate de que el segundo parámetro sea 'context'
  return proxyRequest(req, context);
}

export async function POST(req: Request, context: { params: { path: string[] } }) { // Asegúrate de que el segundo parámetro sea 'context'
  return proxyRequest(req, context);
}

export async function PUT(req: Request, context: { params: { path: string[] } }) { // Asegúrate de que el segundo parámetro sea 'context'
  return proxyRequest(req, context);
}

export async function DELETE(req: Request, context: { params: { path: string[] } }) { // Asegúrate de que el segundo parámetro sea 'context'
  return proxyRequest(req, context);
}

export async function OPTIONS(req: Request, context: { params: { path: string[] } }) { // Asegúrate de que el segundo parámetro sea 'context'
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': req.headers.get('Access-Control-Request-Headers') || '*',
      'Access-Control-Max-Age': '86400',
    },
  });
}