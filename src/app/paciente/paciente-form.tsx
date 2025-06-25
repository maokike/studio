"use client";

import { useState, FormEvent } from "react";

interface PacienteFormProps {
  initialData?: {
    nombre: string;
    documento: string;
    telefono: string;
    email: string;
    direccion: string;
  };
}

export default function PacienteForm({ initialData }: PacienteFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    nombre: initialData?.nombre || "",
    documento: initialData?.documento || "",
    telefono: initialData?.telefono || "",
    email: initialData?.email || "",
    direccion: initialData?.direccion || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      alert("Tus datos se han guardado correctamente");
    } catch (error) {
      alert("Hubo un problema al actualizar tu perfil");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="nombre">Nombre completo</label>
        <input
          id="nombre"
          name="nombre"
          type="text"
          value={formData.nombre}
          onChange={handleChange}
          required
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="documento">Documento</label>
        <input
          id="documento"
          name="documento"
          type="text"
          value={formData.documento}
          onChange={handleChange}
          required
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="telefono">Teléfono</label>
        <input
          id="telefono"
          name="telefono"
          type="text"
          value={formData.telefono}
          onChange={handleChange}
          required
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="email">Correo electrónico</label>
        <input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="direccion">Dirección</label>
        <input
          id="direccion"
          name="direccion"
          type="text"
          value={formData.direccion}
          onChange={handleChange}
          required
        />
      </div>
      <button type="submit" disabled={isLoading} className="w-full mt-6">
        {isLoading ? "Guardando..." : "Guardar cambios"}
      </button>
    </form>
  );
}
