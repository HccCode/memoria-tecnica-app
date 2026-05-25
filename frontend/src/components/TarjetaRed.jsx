import React from 'react';

/**
 * Componente: TarjetaRed
 * Muestra la información técnica detallada del puerto seleccionado en el HUB.
 * Separa explícitamente el direccionamiento IP del Core (Hub) y del Cliente (CPE).
 */
export default function TarjetaRed({ puertoSeleccionado }) {
  
  // Estado inicial: Si no hay ningún puerto seleccionado en el Dashboard todavía
  if (!puertoSeleccionado) {
    return (
      <div className="bg-[#0b132b] p-6 rounded-xl border border-slate-800 shadow-lg text-center">
        <p className="text-slate-400 text-sm italic">
          Selecciona un puerto del listado para desplegar el direccionamiento de red y telemetría.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#0b132b] p-5 rounded-xl border border-slate-800 shadow-lg transition-all duration-200 hover:border-slate-700 w-full">
      
      {/* Encabezado de la Tarjeta */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-4">
        <div>
          <h3 className="text-white font-semibold text-sm tracking-wide">
            Infraestructura de Red - Puerto {puertoSeleccionado.PUERTO}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            ID MCA: {puertoSeleccionado.ID_MCA || puertoSeleccionado["ID MCA"] || "N/A"}
          </p>
        </div>
        
        {/* Badge de Estatus Operacional */}
        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
          String(puertoSeleccionado.ESTATUS).toUpperCase().includes('ACTIVO') || String(puertoSeleccionado.ESTATUS).toUpperCase().includes('OCUPADO')
            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
            : String(puertoSeleccionado.ESTATUS).toUpperCase().includes('TRONCAL')
            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
            : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
        }`}>
          {puertoSeleccionado.ESTATUS || "DESCONOCIDO"}
        </span>
      </div>

      {/* BLOQUE SEPARADO: DIRECCIONAMIENTO IP */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-800/60">
        
        {/* Columna Izquierda: IP Router Hub (Core Nodo Central) */}
        <div className="flex flex-col pr-3">
          <div className="flex items-center gap-1.5 text-slate-400">
            <div className="w-1.5 h-1.5 rounded-full bg-slate-500"></div>
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              IP Router Hub
            </span>
          </div>
          <span className="text-white text-base font-bold tracking-wide mt-1.5 font-mono">
            {puertoSeleccionado.IP_ROUTER_HUB || "No asignada"}
          </span>
        </div>

        {/* Columna Derecha: IP Gestión CPE (Cliente Remoto) */}
        <div className="flex flex-col pt-3 sm:pt-0 sm:pl-5">
          <div className="flex items-center gap-1.5 text-slate-400">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400"></div>
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              IP Gestión (CPE)
            </span>
          </div>
          <span className="text-cyan-400 text-base font-bold tracking-wide mt-1.5 font-mono">
            {puertoSeleccionado.IP_GESTION_CPE || "No asignada"}
          </span>
        </div>

      </div>

      {/* Sección Opcional: Información Adicional del Cliente si existe */}
      {puertoSeleccionado.DATOS_CONTACTO && (
        <div className="mt-4 pt-3 border-t border-slate-800/40">
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
            Cliente Asignado
          </span>
          <span className="text-xs text-slate-300 font-medium mt-0.5 block">
            {puertoSeleccionado.DATOS_CONTACTO.empresa_nombre} — {puertoSeleccionado.DATOS_CONTACTO.contacto_nombre}
          </span>
        </div>
      )}

    </div>
  );
}