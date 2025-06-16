// studio/src/app/api/auth/forgot-password/route.ts

import { NextResponse } from 'next/server';

// URL de tu API web ASP.NET para la recuperación de contraseña
// **¡IMPORTANTE!** En producción, esta URL DEBE ser una variable de entorno.
// Asumo que tu API ASP.NET tendrá un endpoint POST como api/Usuario/SolicitarRestablecimiento
const ASP_NET_FORGOT_PASSWORD_URL = 'https://localhost:44314/api/Usuario/SolicitarRestablecimiento'; 

export async function POST(req: Request) {
  const { email } = await req.json();

  if (!email) {
    return NextResponse.json({ success: false, message: 'El correo electrónico es obligatorio.' }, { status: 400 });
  }

  try {
    // Realiza la solicitud POST a tu API web ASP.NET
    const apiResponse = await fetch(ASP_NET_FORGOT_PASSWORD_URL, {
      method: 'POST', // Asumo que este endpoint en tu API ASP.NET es un POST
      headers: {
        'Content-Type': 'application/json',
        // Agrega otros headers si tu API ASP.NET los requiere (ej. Authorization)
      },
      body: JSON.stringify({ email }), // Envía el correo electrónico al backend de ASP.NET
    });

    // Parsea la respuesta de tu API ASP.NET
    const contentType = apiResponse.headers.get("content-type");
    const apiData = contentType && contentType.includes("application/json") ? await apiResponse.json() : { message: apiResponse.statusText };

    // Verifica si la solicitud a tu API ASP.NET fue exitosa (código 2xx)
    if (apiResponse.ok) {
      // Asumimos que tu API ASP.NET devuelve un { success: true/false, message: "..." }
      if (apiData && apiData.success) {
        return NextResponse.json({ success: true, message: apiData.message || 'Instrucciones de recuperación enviadas.' }, { status: 200 });
      } else {
        // Si la API de ASP.NET devuelve 200 OK pero con un "success: false" en el body
        return NextResponse.json({ success: false, message: apiData.message || 'Error al procesar la solicitud en el backend.' }, { status: 400 });
      }
    } else {
      // Si tu API ASP.NET devuelve un código de estado de error (ej. 400, 404, 500)
      const errorMessage = apiData.message || `Error del servidor ASP.NET: ${apiResponse.statusText}`;
      return NextResponse.json({ success: false, message: errorMessage }, { status: apiResponse.status || 500 });
    }

  } catch (error) {
    console.error('Error al comunicarse con la API de ASP.NET (forgot-password):', error);
    return NextResponse.json({ success: false, message: 'No se pudo conectar con el servicio de recuperación. Inténtalo de nuevo más tarde.' }, { status: 500 });
  }
}