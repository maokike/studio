// studio/src/app/api/auth/register/route.ts

import { NextResponse } from 'next/server';

const ASP_NET_API_BASE_URL = 'https://localhost:44314/api/Usuario'; // Asegúrate de que esta URL sea correcta

export async function POST(req: Request) {
  const { cedula, nombre, apellido, email, password, rol, especialidadId } = await req.json();

  if (!cedula || !nombre || !apellido || !email || !password || !rol) {
    return NextResponse.json({ success: false, message: 'Todos los campos obligatorios deben ser completados.' }, { status: 400 });
  }

  if (rol === 'Médico' && (especialidadId === undefined || especialidadId === null)) {
    return NextResponse.json({ success: false, message: 'Para el rol de Médico, la especialidad es obligatoria.' }, { status: 400 });
  }

  try {
    const requestBody = {
      Cedula: parseInt(cedula),
      Nombre: nombre,
      Apellido: apellido,
      Email: email,
      Contrasena: password,
      Rol: rol,
      EspecialidadId: rol === 'Médico' ? especialidadId : null,
      Estatus: true,
    };

    const apiResponse = await fetch(ASP_NET_API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    // ¡CAMBIO CLAVE AQUÍ! Ahora solo verificamos el estado HTTP
    if (apiResponse.ok) { // Esto será true para 200 OK o 201 Created
      return NextResponse.json({ success: true, message: 'Usuario registrado exitosamente.' }, { status: 201 });
    } else if (apiResponse.status === 400) {
      // Si el backend devuelve 400, es por datos inválidos o reglas de negocio
      // Aquí podrías intentar leer apiResponse.json() si el backend envía un cuerpo de error
      // Pero si no envía nada o el formato es simple, puedes usar un mensaje fijo
      return NextResponse.json({ success: false, message: 'Error en los datos enviados o usuario ya existe.' }, { status: 400 });
    } else if (apiResponse.status === 409) { // Por ejemplo, si el backend devuelve Conflict para duplicados
        return NextResponse.json({ success: false, message: 'El correo electrónico o la cédula ya están registrados.' }, { status: 409 });
    }
    else {
      // Para cualquier otro error (ej. 500 Internal Server Error)
      return NextResponse.json({ success: false, message: 'Error del servidor al registrar.' }, { status: apiResponse.status || 500 });
    }

  } catch (error) {
    console.error('Error al comunicarse con la API de ASP.NET:', error);
    return NextResponse.json({ success: false, message: 'No se pudo conectar con el servicio de registro. Inténtalo de nuevo más tarde.' }, { status: 500 });
  }
}