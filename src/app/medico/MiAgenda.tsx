// import React, { useState } from 'react';

// const MiAgenda = ({ citas, cambiarEstadoCita, especialidades }) => {
//   const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);

//   const obtenerNombreEspecialidad = (id: number) => {
//     const especialidad = especialidades.find(e => e.Id === id);
//     return especialidad ? especialidad.Nombre : 'Especialidad';
//   };

//   const citasFiltradas = citas.filter(cita => 
//     new Date(cita.Fecha).toISOString().split('T')[0] === fecha
//   );

//   return (
//     <div className="bg-white rounded-xl p-6 shadow">
//       <h2 className="text-2xl font-bold mb-4">Mi Agenda</h2>
      
//       <div className="mb-4">
//         <label className="block mb-2">Filtrar por fecha: </label>
//         <input 
//           type="date" 
//           value={fecha}
//           onChange={(e) => setFecha(e.target.value)}
//           className="p-2 border rounded"
//         />
//       </div>

//       <div className="space-y-3">
//         {citasFiltradas.map(cita => (
//           <div key={cita.Id} className="border rounded-lg p-4">
//             <div className="flex justify-between">
//               <div>
//                 <h4 className="font-bold">Paciente #{cita.PacienteId}</h4>
//                 <p className="text-gray-600">{obtenerNombreEspecialidad(cita.EspecialidadId)}</p>
//                 <p>{new Date(cita.Fecha).toLocaleDateString()} - {cita.Hora.substring(0,5)}</p>
//               </div>
//               <div>
//                 <span className={`px-2 py-1 rounded text-xs ${
//                   cita.Estado === 'Pendiente' ? 'bg-yellow-100' : 
//                   cita.Estado === 'Atendida' ? 'bg-green-100' : 'bg-red-100'
//                 }`}>
//                   {cita.Estado}
//                 </span>
//               </div>
//             </div>
//             <div className="mt-3 flex gap-2">
//               <button 
//                 onClick={() => cambiarEstadoCita(cita.Id, 'Atendida')}
//                 className="bg-green-500 text-white px-3 py-1 rounded text-sm"
//                 disabled={cita.Estado === 'Atendida'}
//               >
//                 Marcar como atendida
//               </button>
//               <button 
//                 onClick={() => cambiarEstadoCita(cita.Id, 'Cancelada')}
//                 className="bg-red-500 text-white px-3 py-1 rounded text-sm"
//                 disabled={cita.Estado === 'Cancelada'}
//               >
//                 Cancelar cita
//               </button>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default MiAgenda;