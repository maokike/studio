"use client";

import { useState } from "react";
import Image from "next/image";
import PacienteForm from "./paciente-form";

const sections = [
  { id: "inicio", label: "Inicio" },
  { id: "mis-citas", label: "Mis Citas" },
  { id: "reservar-cita", label: "Reservar Nueva Cita" },
  { id: "mi-perfil", label: "Mi Perfil" },
  { id: "historial-citas", label: "Historial de Citas" },
  { id: "notificaciones", label: "Notificaciones" },
  { id: "soporte", label: "Soporte / Ayuda" },
];

export default function PacientePortal() {
  const [activeSection, setActiveSection] = useState("inicio");

  const proximaCita = "15/07/2025";
  const totalCitas = 3;
  const notificaciones = ["No hay notificaciones nuevas."];
  const mensajes = ["¡Bienvenido al portal!"];
  const citas = [
    {
      fecha: "15/07/2025",
      hora: "10:00",
      medico: "Dr. Pérez",
      especialidad: "Cardiología",
      estado: "Pendiente",
    },
  ];
  const historial = [
    "10/06/2025 - Dr. Pérez - Cardiología - Atendida",
    "25/05/2025 - Dra. Gómez - Pediatría - Cancelada",
  ];
  const recordatorios = ["Recordatorio: Cita el 15/07/2025"];

  const ofertas = [
    "Descuento en consulta de nutrición",
    "2x1 en exámenes de laboratorio este mes",
    "Chequeo dental gratis con tu próxima cita"
  ];
  const medicamentos = [
    "Paracetamol 500mg",
    "Ibuprofeno 400mg",
    "Omeprazol 20mg"
  ];
  const loQueSomos = [
    "Somos una clínica dedicada a tu bienestar.",
    "Más de 20 años de experiencia.",
    "Atención personalizada y tecnología de punta."
  ];

  const handleMenuClick = (id: string) => {
    setActiveSection(id);
  };

  return (
    <div className="portal-bg">
      <nav className="portal-nav">
        <div className="logo-title">
          <Image
            src="/Imagenes/real_logo.jpeg"
            alt="Logo"
            className="logo"
            width={60}
            height={60}
          />
          <span className="brand">HEALTH_M&J</span>
        </div>
        <ul>
          {sections.map((section) => (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  handleMenuClick(section.id);
                }}
                className={activeSection === section.id ? "active" : ""}
              >
                {section.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <main className="portal-main">
        {/* INICIO */}
        <section
          id="inicio"
          className={activeSection === "inicio" ? "active" : "hidden"}
        >
          <div className="welcome-card">
            <h1>Bienvenido, Paciente</h1>
            <div className="cita-resumen">
              <div>
                <span className="cita-label">Próxima cita:</span>
                <span className="cita-dato">{proximaCita}</span>
              </div>
              <div>
                <span className="cita-label">Total de citas:</span>
                <span className="cita-dato">{totalCitas}</span>
              </div>
            </div>
            <div className="noti-mensajes">
              <div>
                <strong>Notificaciones recientes:</strong>
                <ul>
                  {notificaciones.map((n, i) => (
                    <li key={i}>{n}</li>
                  ))}
                </ul>
              </div>
              <div>
                <strong>Mensajes del sistema:</strong>
                <ul>
                  {mensajes.map((m, i) => (
                    <li key={i}>{m}</li>
                  ))}
                </ul>
              </div>
            </div>
            {/* 3 columnas de información */}
            <div className="info-columns">
              <div className="info-column">
                <h3>Ofertas</h3>
                <ul>
                  {ofertas.map((oferta, i) => (
                    <li key={i}>{oferta}</li>
                  ))}
                </ul>
              </div>
              <div className="info-column">
                <h3>Medicamentos</h3>
                <ul>
                  {medicamentos.map((med, i) => (
                    <li key={i}>{med}</li>
                  ))}
                </ul>
              </div>
              <div className="info-column">
                <h3>Lo que somos</h3>
                <ul>
                  {loQueSomos.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* MIS CITAS */}
        <section
          id="mis-citas"
          className={activeSection === "mis-citas" ? "active" : "hidden"}
        >
          <div className="card">
            <h2>Mis Citas</h2>
            <table>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Hora</th>
                  <th>Médico</th>
                  <th>Especialidad</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {citas.map((cita, i) => (
                  <tr key={i}>
                    <td>{cita.fecha}</td>
                    <td>{cita.hora}</td>
                    <td>{cita.medico}</td>
                    <td>{cita.especialidad}</td>
                    <td>{cita.estado}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* RESERVAR CITA */}
        <section
          id="reservar-cita"
          className={activeSection === "reservar-cita" ? "active" : "hidden"}
        >
          <div className="card">
            <h2>Reservar Nueva Cita</h2>
            <form>
              <label>
                Especialidad:
                <select>
                  <option>Cardiología</option>
                  <option>Pediatría</option>
                  <option>Dermatología</option>
                </select>
              </label>
              <br />
              <label>
                Médico:
                <select>
                  <option>Dr. Pérez</option>
                  <option>Dra. Gómez</option>
                </select>
              </label>
              <br />
              <label>
                Fecha:
                <input type="date" />
              </label>
              <br />
              <label>
                Hora:
                <input type="time" />
              </label>
              <br />
              <button type="submit" className="btn-primary">Reservar</button>
            </form>
          </div>
        </section>

        {/* MI PERFIL */}
        <section
          id="mi-perfil"
          className={activeSection === "mi-perfil" ? "active" : "hidden"}
        >
          <div className="card">
            <h2>Mi Perfil</h2>
            <PacienteForm
              initialData={{
                nombre: "Paciente Ejemplo",
                documento: "123456789",
                telefono: "3001234567",
                email: "paciente@correo.com",
                direccion: "Calle 123",
              }}
            />
          </div>
        </section>

        {/* HISTORIAL DE CITAS */}
        <section
          id="historial-citas"
          className={activeSection === "historial-citas" ? "active" : "hidden"}
        >
          <div className="card">
            <h2>Historial de Citas</h2>
            <ul>
              {historial.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        </section>

        {/* NOTIFICACIONES */}
        <section
          id="notificaciones"
          className={activeSection === "notificaciones" ? "active" : "hidden"}
        >
          <div className="card">
            <h2>Notificaciones</h2>
            <ul>
              {recordatorios.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </div>
        </section>

        {/* SOPORTE */}
        <section
          id="soporte"
          className={activeSection === "soporte" ? "active" : "hidden"}
        >
          <div className="card">
            <h2>Soporte / Ayuda</h2>
            <p>¿Tienes dudas? Escribe a soporte@salud.com</p>
          </div>
        </section>
      </main>
      <style jsx>{`
        .portal-bg {
          min-height: 100vh;
          background: #f4f8fb;
          font-family: 'Segoe UI', 'Arial', sans-serif;
        }
        .portal-nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #fff;
          padding: 16px 32px;
          border-bottom: 1px solid #e0e0e0;
        }
        .logo-title {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .brand {
          font-weight: bold;
          font-size: 1.3rem;
          color: #1a7f64;
          letter-spacing: 1px;
        }
        .portal-nav ul {
          list-style: none;
          display: flex;
          gap: 22px;
          margin: 0;
          padding: 0;
        }
        .portal-nav a {
          text-decoration: none;
          color: #222;
          font-weight: 500;
          font-size: 1.05rem;
          padding-bottom: 2px;
          border-bottom: 2px solid transparent;
          transition: color 0.2s, border-bottom 0.2s;
        }
        .portal-nav a.active {
          color: #1a7f64;
          border-bottom: 2px solid #1a7f64;
        }
        .portal-main {
          max-width: 1100px;
          margin: 36px auto 0 auto;
          padding: 0 24px 40px 24px;
        }
        .welcome-card {
          background: #fff;
          border-radius: 16px;
          box-shadow: 0 2px 16px rgba(0,0,0,0.06);
          padding: 32px 32px 24px 32px;
          margin-bottom: 32px;
        }
        .welcome-card h1 {
          font-size: 2.1rem;
          color: #1a7f64;
          margin-bottom: 18px;
        }
        .cita-resumen {
          display: flex;
          gap: 48px;
          margin-bottom: 12px;
        }
        .cita-label {
          font-weight: 500;
          color: #888;
          margin-right: 8px;
        }
        .cita-dato {
          font-weight: bold;
          color: #1a7f64;
        }
        .noti-mensajes {
          display: flex;
          gap: 40px;
          margin-bottom: 24px;
        }
        .noti-mensajes strong {
          color: #1a7f64;
        }
        .info-columns {
          display: flex;
          gap: 32px;
          margin-top: 32px;
        }
        .info-column {
          flex: 1;
          background: #f5f5f5;
          padding: 18px 18px 12px 18px;
          border-radius: 12px;
          box-shadow: 0 1px 6px rgba(0,0,0,0.04);
        }
        .info-column h3 {
          margin-top: 0;
          color: #1a7f64;
          font-size: 1.09rem;
        }
        .card {
          background: #fff;
          border-radius: 14px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.04);
          padding: 26px 28px;
          margin-bottom: 28px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 14px;
          background: #f9f9f9;
        }
        th, td {
          padding: 10px 12px;
          border-bottom: 1px solid #e0e0e0;
          text-align: left;
        }
        th {
          background: #1a7f64;
          color: #fff;
          font-weight: 600;
        }
        tr:last-child td {
          border-bottom: none;
        }
        .btn-primary {
          background: #1a7f64;
          color: #fff;
          border: none;
          border-radius: 6px;
          padding: 8px 22px;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          margin-top: 10px;
          transition: background 0.2s;
        }
        .btn-primary:hover {
          background: #155c49;
        }
        section {
          display: none;
        }
        section.active {
          display: block;
        }
        @media (max-width: 900px) {
          .info-columns {
            flex-direction: column;
            gap: 16px;
          }
        }
        @media (max-width: 600px) {
          .portal-nav, .portal-main, .welcome-card, .card {
            padding: 10px;
          }
          .info-columns {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}