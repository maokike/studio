"use client";
import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';


// Secciones del portal
const secciones = [
  { id: 'inicio', nombre: 'Inicio', icono: '🏠' },
  { id: 'agenda', nombre: 'Mi Agenda', icono: '📅' },
  { id: 'pacientes', nombre: 'Pacientes Atendidos', icono: '👨‍⚕️' },
  { id: 'perfil', nombre: 'Mi Perfil', icono: '👤' },
  { id: 'disponibilidad', nombre: 'Mi Disponibilidad', icono: '⏰' },
  { id: 'notificaciones', nombre: 'Notificaciones', icono: '🔔' },
  { id: 'soporte', nombre: 'Soporte', icono: '❓' },
];

export default function PortalMedico() {
  const [seccionActiva, setSeccionActiva] = useState('inicio');
  const [medico, setMedico] = useState<any>(null);
  const [citas, setCitas] = useState<any[]>([]);
  const [citasHoy, setCitasHoy] = useState<any[]>([]);
  const [especialidades, setEspecialidades] = useState<any[]>([]);
  const [notificaciones, setNotificaciones] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const router = useRouter();

  // Cargar datos del médico y citas
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        // Obtener ID del médico del localStorage o contexto de autenticación
        const idMedico = localStorage.getItem('userId');
        
        if (!idMedico) {
          router.push('/login');
          return;
        }

        // Cargar datos del médico
        const resMedico = await fetch(`https://localhost:44314/api/Usuario/${idMedico}`);
        const dataMedico = await resMedico.json();
        setMedico(dataMedico);

        // Cargar especialidades
        const resEspecialidades = await fetch('https://localhost:44314/api/Especialidad');
        const dataEspecialidades = await resEspecialidades.json();
        setEspecialidades(dataEspecialidades);

        // Cargar citas del médico
        const hoy = new Date().toISOString().split('T')[0];
        const resCitas = await fetch(`https://localhost:44314/api/Cita?medicoId=${idMedico}&fecha=${hoy}`);
        const dataCitas = await resCitas.json();
        
        setCitas(dataCitas);
        setCitasHoy(dataCitas.filter((cita: any) => {
          const fechaCita = new Date(cita.Fecha).toISOString().split('T')[0];
          return fechaCita === hoy;
        }));

      } catch (error) {
        console.error('Error cargando datos:', error);
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, []);

  // Función para cerrar sesión
  const cerrarSesion = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    router.push('/login');
  };

  // Cambiar estado de la cita
  const cambiarEstadoCita = async (id: string, nuevoEstado: string) => {
    try {
      // Actualizar en el backend
      await fetch(`https://localhost:44314/api/Cita/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ Estado: nuevoEstado })
      });

      // Actualizar estado local
      setCitas(citas.map(cita => 
        cita.Id === id ? { ...cita, Estado: nuevoEstado } : cita
      ));
      
      setCitasHoy(citasHoy.map(cita => 
        cita.Id === id ? { ...cita, Estado: nuevoEstado } : cita
      ));
      
    } catch (error) {
      console.error('Error actualizando cita:', error);
    }
  };

  // Obtener nombre de especialidad
  const obtenerNombreEspecialidad = (id: number) => {
    const especialidad = especialidades.find(e => e.Id === id);
    return especialidad ? especialidad.Nombre : 'Especialidad no encontrada';
  };

  // Renderizar contenido según sección activa
  const renderContenido = () => {
    if (cargando) {
      return (
        <div className="flex justify-center items-center h-full">
          <p>Cargando datos...</p>
        </div>
      );
    }

    switch (seccionActiva) {
      case 'inicio':
        return (
          <div className="bg-card rounded-xl p-6 shadow">
            <h2 className="text-2xl font-bold text-primary mb-4">Resumen del Día</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-background p-4 rounded-lg border border-border flex flex-col">
                <h3 className="text-lg font-medium">Citas Programadas</h3>
                <p className="text-3xl font-bold mt-2">{citasHoy.length}</p>
              </div>
              
              <div className="bg-background p-4 rounded-lg border border-border flex flex-col">
                <h3 className="text-lg font-medium">Pacientes Totales</h3>
                <p className="text-3xl font-bold mt-2">42</p>
              </div>
              
              <div className="bg-background p-4 rounded-lg border border-border flex flex-col">
                <h3 className="text-lg font-medium">Alertas</h3>
                <p className="text-3xl font-bold mt-2">{notificaciones.filter(n => !n.leida).length}</p>
              </div>
            </div>

            <h3 className="text-xl font-semibold mb-4">Próximas Citas Hoy</h3>
            <div className="space-y-3">
              {citasHoy.map(cita => (
                <div key={cita.Id} className="border border-border rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-bold">Paciente {cita.PacienteId}</h4>
                      <p className="text-muted-foreground">
                        {obtenerNombreEspecialidad(cita.EspecialidadId)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="bg-accent text-accent-foreground px-2 py-1 rounded">
                        {cita.Hora.substring(0, 5)}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        cita.Estado === 'Pendiente' ? 'bg-yellow-100 text-yellow-800' : 
                        cita.Estado === 'Atendida' ? 'bg-green-100 text-green-800' : 
                        'bg-red-100 text-red-800'
                      }`}>
                        {cita.Estado}
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button 
                      onClick={() => cambiarEstadoCita(cita.Id, 'Atendida')}
                      className="bg-green-500 text-white px-3 py-1 rounded text-sm"
                      disabled={cita.Estado === 'Atendida'}
                    >
                      Marcar como atendida
                    </button>
                    <button 
                      onClick={() => cambiarEstadoCita(cita.Id, 'Cancelada')}
                      className="bg-red-500 text-white px-3 py-1 rounded text-sm"
                      disabled={cita.Estado === 'Cancelada'}
                    >
                      Cancelar cita
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'agenda':
        return <MiAgenda 
                 citas={citas} 
                 cambiarEstadoCita={cambiarEstadoCita}
                 obtenerNombreEspecialidad={obtenerNombreEspecialidad}
               />;
        
      case 'pacientes':
        return <PacientesAtendidos medicoId={medico?.Cedula} />;
        
      case 'perfil':
        return <MedicoForm 
                 medico={medico} 
                 especialidades={especialidades} 
                 setMedico={setMedico}
               />;
        
      case 'disponibilidad':
        return <MiDisponibilidad medicoId={medico?.Cedula} />;
        
      case 'notificaciones':
        return <Notificaciones 
                 notificaciones={notificaciones} 
                 marcarLeida={(id) => setNotificaciones(
                   notificaciones.map(n => n.id === id ? {...n, leida: true} : n)
                 )} 
               />;
        
      case 'soporte':
        return <Soporte />;
        
      default:
        return (
          <div className="bg-card rounded-xl p-6 shadow">
            <h2 className="text-2xl font-bold text-primary mb-4">
              {secciones.find(s => s.id === seccionActiva)?.nombre}
            </h2>
            <p className="text-muted-foreground">Contenido de la sección en desarrollo...</p>
          </div>
        );
    }
  };

  if (!medico && !cargando) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Error cargando datos del médico. Redirigiendo...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar */}
      <div className="w-64 bg-sidebar-background text-sidebar-foreground border-r border-sidebar-border flex flex-col">
        <div className="p-6 border-b border-sidebar-border">
          <div className="flex flex-col items-center">
            <div className="bg-gray-200 border-2 border-dashed rounded-full w-16 h-16 mb-4" />
            <h1 className="text-xl font-bold">
              {medico ? ` ${medico.Nombre} ${medico.Apellido}` : 'Cargando...'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {medico && especialidades.length 
                ? obtenerNombreEspecialidad(medico.EspecialidadId) 
                : 'Cargando especialidad...'}
            </p>
          </div>
        </div>

        <nav className="p-4 flex-1">
          <ul className="space-y-2">
            {secciones.map((seccion) => (
              <li key={seccion.id}>
                <button
                  onClick={() => setSeccionActiva(seccion.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg text-left ${
                    seccionActiva === seccion.id
                      ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                      : 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                  }`}
                >
                  <span className="text-xl">{seccion.icono}</span>
                  <span>{seccion.nombre}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
        
        {/* Botón Cerrar Sesión en el sidebar */}
        <div className="p-4 border-t border-sidebar-border">
          <button
            onClick={cerrarSesion}
            className="w-full flex items-center gap-3 p-3 rounded-lg text-left hover:bg-red-500 hover:text-white transition-colors"
          >
            <span className="text-xl">🚪</span>
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="flex-1 flex flex-col">
        <header className="bg-card border-b border-border p-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">
            {secciones.find(s => s.id === seccionActiva)?.nombre}
          </h1>
          <div className="flex items-center gap-4">
            <button className="relative p-2 rounded-full hover:bg-secondary">
              <span className="text-xl">🔔</span>
              {notificaciones.filter(n => !n.leida).length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </button>
            <div className="flex items-center gap-2">
              <div className="bg-gray-200 border-2 border-dashed rounded-full w-8 h-8" />
              <span>{medico ? medico.Nombre : 'Médico'}</span>
              
              {/* Botón Cerrar Sesión en móvil */}
              <button 
                onClick={cerrarSesion}
                className="md:hidden ml-2 text-red-500 hover:text-red-700"
              >
                <span className="text-xl">🚪</span>
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-y-auto">
          {renderContenido()}
        </main>
      </div>
    </div>
  );
}