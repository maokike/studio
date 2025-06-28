// import React from 'react';

// const MedicoForm = ({ medico, especialidades, setMedico }) => {
//   if (!medico) return <div>Cargando...</div>;

//   const handleChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     setMedico({
//       ...medico,
//       [name]: type === 'checkbox' ? checked : value
//     });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     try {
//       const response = await fetch(`https://localhost:44314/api/Usuario/${medico.Id}`, {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(medico)
//       });

//       if (response.ok) {
//         alert('Perfil actualizado correctamente');
//       } else {
//         throw new Error('Error actualizando perfil');
//       }
//     } catch (error) {
//       console.error('Error:', error);
//       alert('Error actualizando perfil');
//     }
//   };

//   return (
//     <div className="bg-white rounded-xl p-6 shadow">
//       <h2 className="text-2xl font-bold mb-4">Mi Perfil</h2>
//       <form onSubmit={handleSubmit}>
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
//           <div>
//             <label className="block mb-1 font-semibold">Cédula</label>
//             <input
//               type="text"
//               name="Cedula"
//               value={medico.Cedula}
//               onChange={handleChange}
//               className="w-full border rounded px-3 py-2"
//               disabled
//             />
//           </div>
//           <div>
//             <label className="block mb-1 font-semibold">Nombre</label>
//             <input
//               type="text"
//               name="Nombre"
//               value={medico.Nombre}
//               onChange={handleChange}
//               className="w-full border rounded px-3 py-2"
//             />
//           </div>
//           <div>
//             <label className="block mb-1 font-semibold">Apellido</label>
//             <input
//               type="text"
//               name="Apellido"
//               value={medico.Apellido}
//               onChange={handleChange}
//               className="w-full border rounded px-3 py-2"
//             />
//           </div>
//           <div>
//             <label className="block mb-1 font-semibold">Email</label>
//             <input
//               type="email"
//               name="Email"
//               value={medico.Email}
//               onChange={handleChange}
//               className="w-full border rounded px-3 py-2"
//             />
//           </div>
//           <div>
//             <label className="block mb-1 font-semibold">Contraseña</label>
//             <input
//               type="password"
//               name="Contrasena"
//               value={medico.Contrasena}
//               onChange={handleChange}
//               className="w-full border rounded px-3 py-2"
//             />
//           </div>
//           <div>
//             <label className="block mb-1 font-semibold">Especialidad</label>
//             <select
//               name="EspecialidadId"
//               value={medico.EspecialidadId}
//               onChange={handleChange}
//               className="w-full border rounded px-3 py-2"
//             >
//               <option value="">Seleccione una especialidad</option>
//               {especialidades.map((esp) => (
//                 <option key={esp.Id} value={esp.Id}>
//                   {esp.Nombre}
//                 </option>
//               ))}
//             </select>
//           </div>
//           <div>
//             <label className="block mb-1 font-semibold">Rol</label>
//             <input
//               type="text"
//               name="Rol"
//               value={medico.Rol}
//               onChange={handleChange}
//               className="w-full border rounded px-3 py-2"
//               disabled
//             />
//           </div>
//           <div className="flex items-center mt-6">
//             <input
//               type="checkbox"
//               name="Estatus"
//               checked={medico.Estatus}
//               onChange={handleChange}
//               className="mr-2"
//             />
//             <label className="font-semibold">Activo</label>
//           </div>
//         </div>
//         <button
//           type="submit"
//           className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
//         >
//           Guardar Cambios
//         </button>
//       </form>
//     </div>
//   );
// };

// export default MedicoForm;