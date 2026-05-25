import { useState, useEffect } from 'react';
import { Server, Search, RefreshCw, LogOut, FileSpreadsheet, Trash2, Edit, Users, UploadCloud, BarChart3, Activity, Layers, MapPin, AlertTriangle, Copy, X, Eye } from 'lucide-react';

function App() {
  const [token, setToken] = useState(localStorage.getItem('mcm_token') || null);
  const [usuario, setUsuario] = useState(JSON.parse(localStorage.getItem('mcm_user')) || null);
  
  // ================= SISTEMA DE PERMISOS GRANULARES =================
  const roleStr = String(usuario?.role).trim().toUpperCase();
  const userStr = String(usuario?.username).trim().toLowerCase();
  
  const esAdmin = userStr === 'admin' || roleStr === 'ADMIN';
  const esMcmNoc = roleStr === 'MCM NOC';
  const esMcmIng = roleStr === 'MCM INGENIERIA';
  const esRnoc = roleStr === 'RNOC';

  const puedeEditar = esAdmin || esMcmNoc || esMcmIng;
  const puedeCargar = esAdmin || esMcmIng;
  // ==================================================================

  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState(null);

  // LA PESTAÑA INVENTARIO AHORA ES LA PRIMERA Y LA QUE CARGA POR DEFECTO
  const [tabActiva, setTabActiva] = useState('inventario'); 
  const [subTabResumen, setSubTabResumen] = useState('equipos'); 

  // ÁRBOL GEOGRÁFICO BASE
  const [estructuraGeografica, setEstructuraGeografica] = useState({});

  // 📋 ESTADOS GEOGRÁFICOS EXCLUSIVOS PARA SERVICIOS DEDICADOS
  const [inventarioReg, setInventarioReg] = useState(localStorage.getItem('mcm_inv_reg') || '');
  const [inventarioCd, setInventarioCd] = useState(localStorage.getItem('mcm_inv_cd') || '');
  const [inventarioHub, setInventarioHub] = useState(localStorage.getItem('mcm_inv_hub') || 'TODOS');

  // 📥 NUEVOS ESTADOS EXCLUSIVOS PARA CARGA MASIVA (SIN MEMORIA)
  const [cargaReg, setCargaReg] = useState('');
  const [cargaCd, setCargaCd] = useState('');
  const [cargaHub, setCargaHub] = useState('');

  // Efecto para reiniciar los selectores de Carga Masiva siempre que se abra la pestaña
  useEffect(() => {
    if (tabActiva === 'carga_excel') {
      setCargaReg('');
      setCargaCd('');
      setCargaHub('');
    }
  }, [tabActiva]);

  // 📊 ESTADOS GEOGRÁFICOS EXCLUSIVOS PARA DISPONIBILIDAD DE PUERTOS
  const [resumenReg, setResumenReg] = useState(localStorage.getItem('mcm_res_reg') || '');
  const [resumenCd, setResumenCd] = useState(localStorage.getItem('mcm_res_cd') || '');
  const [resumenHub, setResumenHub] = useState(localStorage.getItem('mcm_res_hub') || '');

  // 🔎 ESTADOS PARA BÚSQUEDA EN CONFIGURACIÓN DE RED
  const [filtroBusquedaRegion, setFiltroBusquedaRegion] = useState('');
  const [filtroBusquedaCiudad, setFiltroBusquedaCiudad] = useState('');
  const [filtroBusquedaHub, setFiltroBusquedaHub] = useState('');
  const [filtroBusquedaHubCiudad, setFiltroBusquedaHubCiudad] = useState('');

  // Efectos para guardar automáticamente la selección en la memoria del navegador
  useEffect(() => { localStorage.setItem('mcm_inv_reg', inventarioReg); }, [inventarioReg]);
  useEffect(() => { localStorage.setItem('mcm_inv_cd', inventarioCd); }, [inventarioCd]);
  useEffect(() => { localStorage.setItem('mcm_inv_hub', inventarioHub); }, [inventarioHub]);
  useEffect(() => { localStorage.setItem('mcm_res_reg', resumenReg); }, [resumenReg]);
  useEffect(() => { localStorage.setItem('mcm_res_cd', resumenCd); }, [resumenCd]);
  useEffect(() => { localStorage.setItem('mcm_res_hub', resumenHub); }, [resumenHub]);

  const [datosHub, setDatosHub] = useState(null);
  const [puertoDetalle, setPuertoDetalle] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [errorApp, setErrorApp] = useState(null);
  const [filtroTexto, setFiltroTexto] = useState('');
  const [filtroEstatus, setFiltroEstatus] = useState('TODOS');
  const [filtroEquipo, setFiltroEquipo] = useState('TODOS'); 
  
  const [guardando, setGuardando] = useState(false);
  const [subiendoExcel, setSubiendoExcel] = useState(false);
  const [editCampos, setEditCampos] = useState({});

  // CONTROL USUARIOS
  const [listaUsuarios, setListaUsuarios] = useState([]);
  const [filtroUserTexto, setFiltroUserTexto] = useState('');
  const [idUserEditando, setIdUserEditando] = useState(null);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newNombreCompleto, setNewNombreCompleto] = useState('');
  const [newRole, setNewRole] = useState('RNOC');
  
  const [newNumEmpleado, setNewNumEmpleado] = useState('');
  const [newCorreo, setNewCorreo] = useState('');
  const [newArea, setNewArea] = useState('');
  const [newRegionUsuario, setNewRegionUsuario] = useState('');
  const [newPuesto, setNewPuesto] = useState('');
  const [newPlazas, setNewPlazas] = useState(['*']);
  const [msgUser, setMsgUser] = useState('');

  // CAMPOS GEOGRAFÍA (CREACIÓN/EDICIÓN)
  const [idRegionEditando, setIdRegionEditando] = useState(null);
  const [idCiudadEditando, setIdCiudadEditando] = useState(null);
  const [idHubEditando, setIdHubEditando] = useState(null); 
  
  const [regName, setRegName] = useState('');
  const [citCode, setCitCode] = useState(''); 
  const [citName, setCitName] = useState('');
  const [citRegId, setCitRegId] = useState('');
  
  const [hubName, setHubName] = useState('');
  const [hubCitId, setHubCitId] = useState('');
  const [hubDireccion, setHubDireccion] = useState('');
  const [hubCoordenadas, setHubCoordenadas] = useState('');

  // ESTADOS PARA MÉTRICAS DE RESUMEN Y LISTADO DE CLIENTES
  const [resumenEquiposData, setResumenEquiposData] = useState([]);
  const [resumenAnchoBandaData, setResumenAnchoBandaData] = useState([]);
  const [listaClientesActivos, setListaClientesActivos] = useState([]);
  const [listaClientesSuspendidos, setListaClientesSuspendidos] = useState([]);
  const [cargandoResumen, setCargandoResumen] = useState(false);

  // ESTADO QUE CONTROLA EL DESPLIEGUE INDIVIDUAL DE LAS TABLAS DE CLIENTES POR CADA HUB
  const [detallesClientesHub, setDetallesClientesHub] = useState({}); 

  // ================= ESTADOS Y FUNCIONES: MODAL DESPLIEGUE DE FALLA Y VISUALIZACIÓN =================
  const [mostrarModalFalla, setMostrarModalFalla] = useState(false);
  const [mostrarModalVisualizar, setMostrarModalVisualizar] = useState(false);
  
  const [fallaOperador, setFallaOperador] = useState('');
  const [fallaTT, setFallaTT] = useState('');
  const [fallaOT, setFallaOT] = useState('');
  const [fallaInfo, setFallaInfo] = useState('');
  const [fallaEnergizado, setFallaEnergizado] = useState('SI');
  const [fallaAlarmasEq, setFallaAlarmasEq] = useState('NO');
  const [fallaConexiones, setFallaConexiones] = useState('SI');
  const [fallaStatusPuerto, setFallaStatusPuerto] = useState('UP');
  
  const [fallaPing, setFallaPing] = useState('NO');
  const [fallaAccesosSel, setFallaAccesosSel] = useState('NO');


  useEffect(() => {
    if (usuario) {
      // Intenta usar el nombre completo, si no existe usa el username
      const nombreParaMostrar = usuario.nombre_completo || usuario.username;
      setFallaOperador(nombreParaMostrar.toUpperCase());
    }
  }, [usuario]);

  const generarTextoFalla = () => {
    if (!puertoDetalle) return '';
    
    // Variables Manuales
    const op = fallaOperador || 'OPERADOR';
    const tt = fallaTT || '_____';
    const ot = fallaOT || '_____';
    const infoF = fallaInfo || '...';

    // Variables Automáticas de la BD
    const sucursal = puertoDetalle.SERVICIO || 'N/A';
    const parcheo = puertoDetalle.PARCHEO || 'N/A';
    const dist = puertoDetalle.DISTANCIA_CLIENTE || 'N/A';
    const ruta = puertoDetalle.RUTA || 'N/A';
    const hilos = puertoDetalle.HILOS || 'N/A';
    const lambdas = puertoDetalle.LAMBDAS || 'N/A';
    const potCPE = puertoDetalle.POTENCIA_CPE || 'N/A';
    const potHub = puertoDetalle.POTENCIA_HUB || 'N/A';
    const coords = puertoDetalle.COORDENADAS || 'N/A';
    const dir = puertoDetalle.DIRECCION || 'N/A';
    const contactoNombre = puertoDetalle.CONTACTO_NOMBRE || 'SIN REGISTRO';
    const contactoTel = puertoDetalle.CONTACTO_TELEFONO || 'SIN REGISTRO';

    return `RNOC ${op} INFORMA INICIO DE FALLA MCA\n \nTT - ${tt}\nOT - ${ot}\n\nSERVICIO:\n${sucursal}\n \nCOMENTARIO ADICIONAL:\n${infoF}\n \nVALIDACIONES INICIALES:\n- Equipo Energizado: ${fallaEnergizado}\n- Alarmas en Equipos: ${fallaAlarmasEq}\n- Conexiones Correctas: ${fallaConexiones}\n- Status Puerto: ${fallaStatusPuerto}\n- Ping exitoso a CPE: ${fallaPing}\n- Falla Accesos: ${fallaAccesosSel}\n\nCONTACTO EN SITIO: ${contactoNombre} \nTELEFONO: ${contactoTel}\n\nPARCHEO:\n${parcheo}\nDistancias:\n${dist}\nRuta:\n${ruta}\nHilos fibra:\n${hilos}\nEtiquetas lambdas:\n${lambdas}\nPOTENCIA ANTERIOR CLIENTE:\n${potCPE}\nPOTENCIA ANTERIOR HUB:\n${potHub}\nUBICACION:\n${coords}\n${dir}\n\nAL MOMENTO DE LOCALIZAR AFECTACION, DE SU APOYO CON MEDICION EN AMBOS SENTIDOS PARA DESCARTAR SEGUNDOS DAÑOS*\n\n\nDE SU APOYO PARA ATENCION Y SEGUIMIENTO`;
  };

  const handleCopiarFalla = () => {
    navigator.clipboard.writeText(generarTextoFalla()).then(() => {
      alert("¡Formato de Despliegue de Falla copiado exitosamente!");
      setMostrarModalFalla(false);
    }).catch(() => {
      alert("Error al copiar automáticamente. Por favor, selecciona el texto y cópialo.");
    });
  };
  // ==================================================================================

  const generarUrlGoogleMaps = (queryStr) => {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(queryStr)}`;
  };

  const formatFechaParaInput = (fechaStr) => {
    if (!fechaStr) return '';
    const s = String(fechaStr).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s.substring(0, 10);
    const partes = s.split(/[\/\-]/);
    if (partes.length === 3) {
      const p1 = partes[0].padStart(2, '0');
      const p2 = partes[1].padStart(2, '0');
      let p3 = partes[2].substring(0, 4); 
      if (p3.length === 2) p3 = `20${p3}`; 
      if (p1.length === 4) return `${p1}-${p2}-${p3}`; 
      return `${p3}-${p2}-${p1}`; 
    }
    const d = new Date(s);
    if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];
    return '';
  };

  const obtenerCiudadesOrdenadas = (region) => {
    if (!region || !estructuraGeografica[region]?.ciudades) return [];
    return Object.keys(estructuraGeografica[region].ciudades).map(nombre => ({
        id: estructuraGeografica[region].ciudades[nombre].id,
        nombre: nombre
    })).sort((a, b) => a.nombre.localeCompare(b.nombre));
  };

  const hubActivoDatos = inventarioHub === 'TODOS' ? null : (estructuraGeografica[inventarioReg]?.ciudades?.[inventarioCd]?.hubs || []).find(h => h.id === inventarioHub);

  const handleLogout = () => {
    localStorage.clear(); 
    setToken(null); 
    setUsuario(null); 
    setPuertoDetalle(null); 
    setTabActiva('inventario');
    setEstructuraGeografica({});
  };

  const cargarUsuariosDB = async () => {
    if (!token || !esAdmin) return;
    try {
      const res = await fetch('http://127.0.0.1:8000/api/users', { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.status === 401) { handleLogout(); return; }
      if (res.ok) { setListaUsuarios(await res.json()); }
    } catch (e) { console.error(e); }
  };

  const cargarGeographyDB = async (forzarReset = false) => {
    if (!token) return; 
    try {
      const res = await fetch('http://127.0.0.1:8000/api/geography', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.status === 401) { handleLogout(); return; }
      if (!res.ok) return;

      const data = await res.json(); 
      setEstructuraGeografica(data);
      
      const regiones = Object.keys(data);
      if (regiones.length === 0) return;

      let rInv = inventarioReg;
      if (!rInv || forzarReset || !data[rInv]) { 
        rInv = regiones[0]; setInventarioReg(rInv); 
      }
      
      const cdsInv = Object.keys(data[rInv]?.ciudades || {});
      let cInv = inventarioCd;
      if (cdsInv.length > 0) {
        if (!cInv || forzarReset || !data[rInv].ciudades[cInv]) { 
          cInv = cdsInv[0]; setInventarioCd(cInv); 
        }
        const hInv = data[rInv].ciudades[cInv]?.hubs || [];
        if (hInv.length > 0) {
          if (!inventarioHub || forzarReset || (!hInv.map(h => h.id).includes(inventarioHub) && inventarioHub !== 'TODOS')) {
             setInventarioHub('TODOS');
          }
        } else { setInventarioHub('TODOS'); }
      } else { setInventarioCd(''); setInventarioHub('TODOS'); }

      let rRes = resumenReg;
      if (!rRes || forzarReset || !data[rRes]) { 
        rRes = regiones[0]; setResumenReg(rRes); 
      }
      const cdsRes = Object.keys(data[rRes]?.ciudades || {});
      let cRes = resumenCd;
      if (cdsRes.length > 0) {
        if (!cRes || forzarReset || !data[rRes].ciudades[cRes]) { 
          cRes = cdsRes[0]; setResumenCd(cRes); 
        }
        const hRes = data[rRes].ciudades[cRes]?.hubs || [];
        if (hRes.length > 0) {
          if (!resumenHub || forzarReset || !hRes.map(h => h.id).includes(resumenHub)) setResumenHub('');
        } else { setResumenHub(''); }
      } else { setResumenCd(''); setResumenHub(''); }

    } catch (e) { console.error(e); }
  };

  const cargarResumenDashboardEquipos = async () => {
    let hubs = estructuraGeografica[resumenReg]?.ciudades?.[resumenCd]?.hubs || [];
    if (hubs.length === 0) { 
        setResumenEquiposData([]); 
        setResumenAnchoBandaData([]); 
        setListaClientesActivos([]);
        setListaClientesSuspendidos([]);
        setDetallesClientesHub({});
        return; 
    }
    if (resumenHub) hubs = hubs.filter(h => h.id === resumenHub);

    setCargandoResumen(true);
    setDetallesClientesHub({}); 
    try {
      const mapaEquipos = {};
      const mapaSitiosBanda = {};
      
      let activosTemp = [];
      let suspendidosTemp = [];

      const promesas = hubs.map(async (h) => {
        const res = await fetch(`http://127.0.0.1:8000/api/hubs?id_hub=${h.id}`);
        if (!res.ok) return;
        const data = await res.json();
        return { hubId: h.id, hubNombre: h.nombre, puertos: data.puertos || [] };
      });

      const listadoHubsData = await Promise.all(promesas);

      listadoHubsData.forEach(hubData => {
        if (!hubData) return;

        if (!mapaSitiosBanda[hubData.hubId]) {
          mapaSitiosBanda[hubData.hubId] = { hubId: hubData.hubId, hubNombre: hubData.hubNombre, anchoBandaTotal: 0, puertosActivos: 0, puertosSuspendidos: 0 };
        }
        
        hubData.puertos.forEach(p => {
          let equipoId = String(p.EQUIPO_HOTEL_ID || '').trim();
          if (!equipoId) equipoId = "SIN EQUIPO ASIGNADO";

          const puertoName = String(p.PUERTO || '').toLowerCase().trim();
          const estatus = String(p.ESTATUS || '').toUpperCase().trim();
          const mbpsPort = parseFloat(p.MBPS) || 0;

          // FORZAR LA CLASIFICACIÓN DE VELOCIDAD SI EL ESTATUS LO INDICA EXPRESAMENTE
          let forceSpeed = null;
          if (estatus.includes('100')) forceSpeed = 'HU';
          else if (estatus.includes('25')) forceSpeed = 'TF';
          else if (estatus.includes('TE')) forceSpeed = 'TE';
          else if (estatus.includes('GI')) forceSpeed = 'GI';

          // CLASIFICACIÓN FINAL DE PUERTOS
          const isHu = forceSpeed === 'HU' || puertoName.includes('hundred') || puertoName.includes('100g') || puertoName.startsWith('hu');
          const isTf = forceSpeed === 'TF' || (!isHu && (puertoName.includes('twentyfive') || puertoName.includes('25g') || puertoName.startsWith('tf') || puertoName.startsWith('twe')));
          const isTe = forceSpeed === 'TE' || (!isHu && !isTf && (puertoName.includes('tengigabit') || puertoName.includes('tengige') || puertoName.includes('10g') || puertoName.startsWith('te') || puertoName.startsWith('xe') || puertoName.startsWith('xge')));
          const isGi = forceSpeed === 'GI' || (!isHu && !isTf && !isTe); // Fallback nativo a GigabitEthernet
           
          
          if (!mapaEquipos[equipoId]) {
            mapaEquipos[equipoId] = {
              equipoId: equipoId, hubId: hubData.hubId, hubNombre: hubData.hubNombre,
              giLibres: 0, giOcupados: 0, 
              teLibres: 0, teOcupados: 0, 
              tfLibres: 0, tfOcupados: 0, // 25G
              huLibres: 0, huOcupados: 0, // 100G
              totalPuertos: 0
            };
          }

          mapaEquipos[equipoId].totalPuertos++;

          // FILTROS DE ESTADO EXPLICITOS
          const esLibre = estatus.includes('DISPONIBLE');
          const esOcupado = estatus === 'ACTIVO' || estatus.includes('TRONCAL') || estatus === 'SUSPENDIDO';

          // ASIGNACIÓN DE ESTATUS POR VELOCIDAD
          if (isGi) {
            if (esLibre) mapaEquipos[equipoId].giLibres++;
            else if (esOcupado) mapaEquipos[equipoId].giOcupados++;
          } else if (isTe) {
            if (esLibre) mapaEquipos[equipoId].teLibres++;
            else if (esOcupado) mapaEquipos[equipoId].teOcupados++;
          } else if (isTf) {
            if (esLibre) mapaEquipos[equipoId].tfLibres++;
            else if (esOcupado) mapaEquipos[equipoId].tfOcupados++;
          } else if (isHu) {
            if (esLibre) mapaEquipos[equipoId].huLibres++;
            else if (esOcupado) mapaEquipos[equipoId].huOcupados++;
          }

          // CÁLCULO GLOBAL DE ANCHO DE BANDA Y CLIENTES ACTIVOS
          if (estatus === 'ACTIVO') {
            mapaSitiosBanda[hubData.hubId].puertosActivos++;
            mapaSitiosBanda[hubData.hubId].anchoBandaTotal += mbpsPort;
            activosTemp.push({...p, hubId: hubData.hubId, HUB_NOMBRE: hubData.hubNombre});
          } else if (estatus === 'SUSPENDIDO') {
            mapaSitiosBanda[hubData.hubId].puertosSuspendidos++;
            suspendidosTemp.push({...p, hubId: hubData.hubId, HUB_NOMBRE: hubData.hubNombre});
          } else if (estatus === 'TRONCAL' || estatus === 'TRONCAL GI' || estatus === 'TRONCAL TE') {
            mapaSitiosBanda[hubData.hubId].anchoBandaTotal += mbpsPort;
          }
        });
      });

      const listaEquiposFinal = Object.values(mapaEquipos).map(eq => {
        const totalGi = eq.giLibres + eq.giOcupados;
        const totalTe = eq.teLibres + eq.teOcupados;
        const totalTf = eq.tfLibres + eq.tfOcupados;
        const totalHu = eq.huLibres + eq.huOcupados;
        return {
          ...eq, totalGi, totalTe, totalTf, totalHu,
          giPct: totalGi > 0 ? Math.round((eq.giLibres / totalGi) * 100) : 0,
          tePct: totalTe > 0 ? Math.round((eq.teLibres / totalTe) * 100) : 0,
          tfPct: totalTf > 0 ? Math.round((eq.tfLibres / totalTf) * 100) : 0,
          huPct: totalHu > 0 ? Math.round((eq.huLibres / totalHu) * 100) : 0
        };
      });

      setResumenEquiposData(listaEquiposFinal);
      setResumenAnchoBandaData(Object.values(mapaSitiosBanda));
      setListaClientesActivos(activosTemp);
      setListaClientesSuspendidos(suspendidosTemp);

    } catch (e) { console.error(e); } finally { setCargandoResumen(false); }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault(); setLoginError(null);
    try {
      const res = await fetch('http://127.0.0.1:8000/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: usernameInput, password: passwordInput }) });
      const data = await res.json(); if (!res.ok) throw new Error(data.detail);
      localStorage.setItem('mcm_token', data.token); localStorage.setItem('mcm_user', JSON.stringify(data.user));
      
      // LIMPIEZA DE FILTROS CADA INICIO DE SESIÓN
      localStorage.removeItem('mcm_inv_reg');
      localStorage.removeItem('mcm_inv_cd');
      localStorage.removeItem('mcm_inv_hub');
      localStorage.removeItem('mcm_res_reg');
      localStorage.removeItem('mcm_res_cd');
      localStorage.removeItem('mcm_res_hub');
      
      setInventarioReg('');
      setInventarioCd('');
      setInventarioHub('TODOS');
      
      setResumenReg('');
      setResumenCd('');
      setResumenHub('');

      setToken(data.token); setUsuario(data.user);
    } catch (err) { setLoginError(err.message); }
  };

  const cargarDatosSistemas = async () => {
    if (!token || !inventarioCd || !inventarioHub) { setDatosHub(null); return; }
    setCargando(true); setErrorApp(null);
    try {
      if (inventarioHub === 'TODOS') {
        const hubs = estructuraGeografica[inventarioReg]?.ciudades?.[inventarioCd]?.hubs || [];
        if (hubs.length === 0) {
          setDatosHub({ resumen: { total: 0, disponibles: 0, activos: 0, suspendidos: 0, troncales: 0 }, puertos: [] });
          return;
        }
        
        const promesas = hubs.map(h => fetch(`http://127.0.0.1:8000/api/hubs?id_hub=${h.id}`).then(res => res.json()));
        const resultados = await Promise.all(promesas);
        
        let todosPuertos = [];
        let resumenGlobal = { total: 0, disponibles: 0, activos: 0, suspendidos: 0, troncales: 0 };
        
        resultados.forEach(data => {
          if (data.puertos) {
            const puertosMarcados = data.puertos.map(p => ({...p, HUB_PERTENENCIA: data.hub}));
            todosPuertos = [...todosPuertos, ...puertosMarcados];
          }
          if (data.resumen) {
            resumenGlobal.total += data.resumen.total || 0;
            resumenGlobal.activos += data.resumen.activos || 0;
            resumenGlobal.suspendidos += data.resumen.suspendidos || 0;
            resumenGlobal.troncales += data.resumen.troncales || 0;
          }
        });

        // Recálculo frontend nativo para captar TODOS los "DISPONIBLES" (GI, TE, 25, 100) en el contador global
        resumenGlobal.disponibles = todosPuertos.filter(p => String(p.ESTATUS || '').toUpperCase().includes('DISPONIBLE')).length;
        
        setDatosHub({ resumen: resumenGlobal, puertos: todosPuertos });
      } else {
        const respuesta = await fetch(`http://127.0.0.1:8000/api/hubs?id_hub=${inventarioHub}`);
        if (respuesta.status === 401) { handleLogout(); return; }
        
        const data = await respuesta.json();
        if(data.puertos && data.resumen) {
          // Recálculo frontend nativo
          data.resumen.disponibles = data.puertos.filter(p => String(p.ESTATUS || '').toUpperCase().includes('DISPONIBLE')).length;
        }
        setDatosHub(data);
      }
    } catch { setErrorApp("Error"); } finally { setCargando(false); }
  };

  const handleGuardarCambios = async () => {
    if (!puertoDetalle?.ID) return;
    setGuardando(true);
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/ports/${puertoDetalle.ID}`, { 
        method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(editCampos) 
      });
      if (res.status === 401) { handleLogout(); return; }
      if (res.ok) { setPuertoDetalle(editCampos); await cargarDatosSistemas(); alert("Modificación física guardada exitosamente en MT_DB."); } 
      else { alert("Error al procesar los datos en el servidor."); }
    } catch (err) { console.error(err); alert("Fallo de red al intentar actualizar el puerto."); } finally { setGuardando(false); }
  };

  const handleCancelarEdicionRegion = () => { setIdRegionEditando(null); setRegName(''); };
  const handleCancelarEdicionCiudad = () => { setIdCiudadEditando(null); setCitCode(''); setCitName(''); setCitRegId(''); };
  const handleCancelarEdicionHub = () => { setIdHubEditando(null); setHubName(''); setHubCitId(''); setHubDireccion(''); setHubCoordenadas(''); };

  const cancelarEdicionUser = () => {
    setIdUserEditando(null);
    setNewUsername('');
    setNewPassword('');
    setNewNombreCompleto('');
    setNewRole('RNOC');
    setNewPlazas(['*']);
    setNewNumEmpleado('');
    setNewCorreo('');
    setNewArea('');
    setNewRegionUsuario('');
    setNewPuesto('');
    setMsgUser('');
  };

  const handleProcesarUsuario = async (e) => {
    e.preventDefault(); setMsgUser('');
    const url = idUserEditando ? `http://127.0.0.1:8000/api/users/${idUserEditando}` : 'http://127.0.0.1:8000/api/auth/register';
    const plazasString = newPlazas.length === 0 ? "" : newPlazas.includes('*') ? '*' : newPlazas.join(',');

    try {
      const res = await fetch(url, { 
        method: idUserEditando ? 'PUT' : 'POST', 
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, 
        body: JSON.stringify({ 
          username: newUsername, password: newPassword, role: newRole, plazas: plazasString,
          nombre_completo: newNombreCompleto,num_empleado: newNumEmpleado, correo: newCorreo, area_org: newArea,
          region_asignacion: newRegionUsuario, puesto: newPuesto
        }) 
      });
      if (res.status === 401) { handleLogout(); return; }
      if (res.ok) { setMsgUser('Operación exitosa.'); cancelarEdicionUser(); await cargarUsuariosDB(); }
    } catch { setMsgUser('Fallo en servidor.'); }
  };

  const handleEliminarUsuario = async (id, name) => {
    if (!window.confirm(`¿Retirar accesos a '${name}'?`)) return;
    const res = await fetch(`http://127.0.0.1:8000/api/users/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
    if (res.status === 401) { handleLogout(); return; }
    if (res.ok) await cargarUsuariosDB();
  };

  const handleActivarModoEdicionUser = (u) => {
    setIdUserEditando(u.id); 
    setNewUsername(u.username || ''); 
    setNewRole(u.role || 'RNOC'); 
    setNewPassword('');
    setNewNombreCompleto(u.nombre_completo || '');
    setNewPlazas(u.plazas ? u.plazas.split(',') : []);
    
    setNewNumEmpleado(u.num_empleado || '');
    setNewCorreo(u.correo || '');
    setNewArea(u.area_org || '');
    setNewRegionUsuario(u.region_asignacion || '');
    setNewPuesto(u.puesto || '');
  };

  const procesarRegion = async (e) => {
    e.preventDefault();
    const url = idRegionEditando ? `http://127.0.0.1:8000/api/geography/regions/${idRegionEditando}` : 'http://127.0.0.1:8000/api/geography/regions';
    const method = idRegionEditando ? 'PUT' : 'POST';
    try {
      const res = await fetch(url, { 
        method, 
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, 
        body: JSON.stringify({ nombre: regName.trim() }) 
      });
      if (res.status === 401) { handleLogout(); return; }
      if (res.ok) { 
        setRegName(''); 
        setIdRegionEditando(null);
        alert(idRegionEditando ? "Región actualizada con éxito." : "Región creada con éxito."); 
        await cargarGeographyDB(); 
      }
    } catch { alert("Error de comunicación con el servidor."); }
  };

  const handleActivarModoEdicionRegion = (rId, rNombre) => {
    setIdRegionEditando(rId);
    setRegName(rNombre);
  };

  const handleEliminarRegion = async (id, nombre) => {
    if (!window.confirm(`⚠️ ADVERTENCIA ⚠️\n\n¿Estás seguro de borrar la región '${nombre}'?\n\nEsta acción eliminará EN CASCADA todas las ciudades, HUBs y el inventario de puertos asociados a esta región. ES IRREVERSIBLE.`)) return;
    const res = await fetch(`http://127.0.0.1:8000/api/geography/regions/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
    if (res.status === 401) { handleLogout(); return; }
    if (res.ok) await cargarGeographyDB(true);
  };

  const crearCiudad = async (e) => {
    e.preventDefault();
    if (!citCode) { alert("Especifica un ID compacto para la ciudad."); return; }
    try {
      const method = idCiudadEditando ? 'PUT' : 'POST';
      const url = idCiudadEditando ? `http://127.0.0.1:8000/api/geography/cities/${idCiudadEditando}` : 'http://127.0.0.1:8000/api/geography/cities';
      
      const payload = idCiudadEditando ? { nombre: citName.trim(), region_id: parseInt(citRegId) } : { id: citCode.trim().toUpperCase(), nombre: citName.trim(), region_id: parseInt(citRegId) };
      
      const res = await fetch(url, { 
        method, headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(payload) 
      });
      
      if (res.status === 401) { handleLogout(); return; }
      if (res.ok) { setCitCode(''); setCitName(''); setCitRegId(''); setIdCiudadEditando(null); alert(idCiudadEditando ? "Ciudad actualizada." : "Ciudad e ID creados con éxito."); await cargarGeographyDB(); } 
    } catch { alert("Error de comunicación con el servidor."); }
  };

  const asignarHub = async (e) => {
    e.preventDefault();
    if (!hubCitId) { alert("Por favor, selecciona una Ciudad Destino."); return; }
    const nombreLimpio = hubName.trim().replace(/[^A-Za-z0-9]/g, '_').toUpperCase();
    const idParaGuardar = idHubEditando ? idHubEditando : `${hubCitId.trim().toUpperCase()}_${nombreLimpio}_${Math.floor(Math.random() * 1000)}`;

    try {
      const res = await fetch('http://127.0.0.1:8000/api/geography/hubs', { 
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ id: idParaGuardar, nombre: hubName.trim(), ciudad_id: hubCitId, direccion: hubDireccion.trim(), coordenadas: hubCoordenadas.trim() }) 
      });
      if (res.status === 401) { handleLogout(); return; }
      if (res.ok) { const ciudadGuardada = hubCitId; handleCancelarEdicionHub(); alert("HUB guardado correctamente."); await cargarGeographyDB(); setHubCitId(ciudadGuardada); }
    } catch { alert("Error de comunicación."); }
  };

  const handleActivarModoEdicionHub = (h, ciudadId) => { setIdHubEditando(h.id); setHubName(h.nombre); setHubCitId(String(ciudadId)); setHubDireccion(h.direccion || ''); setHubCoordenadas(h.coordenadas || ''); };

  const handleEliminarCiudad = async (id, nombre) => {
    if (!window.confirm(`¿Borrar la ciudad '${nombre}'?`)) return;
    const res = await fetch(`http://127.0.0.1:8000/api/geography/cities/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
    if (res.status === 401) { handleLogout(); return; }
    if (res.ok) await cargarGeographyDB(true);
  };

  const handleEliminarHub = async (id, nombre) => {
    if (!window.confirm(`¿Borrar '${nombre}'?`)) return;
    const res = await fetch(`http://127.0.0.1:8000/api/geography/hubs/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
    if (res.status === 401) { handleLogout(); return; }
    if (res.ok) await cargarGeographyDB(true);
  };

  useEffect(() => { cargarGeographyDB(); cargarUsuariosDB(); }, [token]);
  
  useEffect(() => { if (tabActiva === 'inventario') { cargarDatosSistemas(); setFiltroEquipo('TODOS'); } }, [inventarioHub, tabActiva]);
  useEffect(() => { if (tabActiva === 'resumen') cargarResumenDashboardEquipos(); }, [tabActiva, resumenCd, resumenHub, resumenReg, estructuraGeografica]);

  useEffect(() => {
    if (tabActiva === 'carga_excel') return; 
    const hbs = estructuraGeografica[inventarioReg]?.ciudades?.[inventarioCd]?.hubs || [];
    if (hbs.length === 1 && inventarioHub !== hbs[0].id) {
      setInventarioHub(hbs[0].id);
    }
  }, [estructuraGeografica, inventarioReg, inventarioCd, inventarioHub, tabActiva]);

  useEffect(() => {
    const hbs = estructuraGeografica[resumenReg]?.ciudades?.[resumenCd]?.hubs || [];
    if (hbs.length === 1 && resumenHub !== hbs[0].id) {
      setResumenHub(hbs[0].id);
    }
  }, [estructuraGeografica, resumenReg, resumenCd, resumenHub]);

  const seleccionarPuerto = (p) => { setPuertoDetalle(p); setEditCampos(p); };

  const handleInventarioRegionChange = (r) => {
    setInventarioReg(r); 
    setInventarioCd(''); 
    setInventarioHub('TODOS'); 
  };

  const handleInventarioCiudadChange = (c) => {
    setInventarioCd(c); 
    setInventarioHub('TODOS'); 
  };

  const handleResumenRegionChange = (r) => {
    setResumenReg(r); 
    setResumenCd(''); 
    setResumenHub(''); 
  };
  
  const handleResumenCiudadChange = (c) => {
    setResumenCd(c); 
    setResumenHub(''); 
  };

  const usuariosFiltrados = listaUsuarios.filter(u => u.username.toLowerCase().includes(filtroUserTexto.toLowerCase()) || (u.num_empleado || '').includes(filtroUserTexto));
  const equiposDisponibles = Array.from(new Set(datosHub?.puertos?.map(p => String(p.EQUIPO_HOTEL_ID || '').trim()).filter(Boolean) || [])).sort();

  const puertosFiltrados = datosHub?.puertos?.filter(p => {
    const est = String(p.ESTATUS || '').toUpperCase().trim();
    const eqId = String(p.EQUIPO_HOTEL_ID || '').trim();
    
    if (filtroEstatus !== 'TODOS') {
      if (filtroEstatus === 'DISPONIBLE' && !est.includes('DISPONIBLE')) return false;
      if (filtroEstatus === 'ACTIVO' && est !== 'ACTIVO') return false;
      if (filtroEstatus === 'SUSPENDIDO' && est !== 'SUSPENDIDO') return false;
      if (filtroEstatus === 'TRONCAL' && !est.includes('TRONCAL')) return false;
    }
    if (filtroEquipo !== 'TODOS' && eqId !== filtroEquipo) return false;
    
    return (
      String(p.PUERTO || '').toLowerCase().includes(filtroTexto.toLowerCase()) || 
      String(p.SERVICIO || '').toLowerCase().includes(filtroTexto.toLowerCase()) || 
      String(p.EQUIPO_HOTEL_ID || '').toLowerCase().includes(filtroTexto.toLowerCase()) ||
      String(p.DIRECCION || '').toLowerCase().includes(filtroTexto.toLowerCase()) ||
      String(p.COORDENADAS || '').toLowerCase().includes(filtroTexto.toLowerCase()) ||
      String(p.IP_GESTION || '').toLowerCase().includes(filtroTexto.toLowerCase()) ||
      String(p.IP_CLIENTE || '').toLowerCase().includes(filtroTexto.toLowerCase()) ||
      String(p.BDI || '').toLowerCase().includes(filtroTexto.toLowerCase())
    );
  }) || [];

  let todosLosHubsGlobal = [];
  Object.keys(estructuraGeografica).forEach(r => {
    Object.keys(estructuraGeografica[r]?.ciudades || {}).forEach(c => {
      const cityData = estructuraGeografica[r].ciudades[c];
      (cityData.hubs || []).forEach(h => {
        todosLosHubsGlobal.push({ ...h, nombreCiudad: c, idCiudad: cityData.id, nombreRegion: r });
      });
    });
  });

  const regionFiltroCiudad = Object.keys(estructuraGeografica).find(r => estructuraGeografica[r].id === parseInt(citRegId));
  const hubActualResumen = (estructuraGeografica[resumenReg]?.ciudades?.[resumenCd]?.hubs || []).find(h => h.id === resumenHub);

  const obtenerNombresPlazas = (plazasStr) => {
    if (!plazasStr || plazasStr === '*') return 'ACCESO GLOBAL A TODAS LAS CIUDADES';
    return plazasStr.split(',').join(', ');
  };

  if (!token) {
    return (
      <div className="h-screen bg-[#050814] flex items-center justify-center p-4">
        <form onSubmit={handleLoginSubmit} className="bg-[#0b132b] border border-slate-800 p-8 rounded-2xl w-full max-w-sm space-y-5 shadow-2xl">
          <div className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 bg-blue-500/10 border border-blue-500/30 rounded-xl flex items-center justify-center text-blue-400"><Server className="w-6 h-6" /></div>
            <h2 className="text-xl font-bold text-white tracking-tight">MT_DB Console</h2>
          </div>
          {loginError && <div className="bg-red-950/40 border border-red-500/40 p-3 rounded-lg text-xs text-red-300">{loginError}</div>}
          <div className="space-y-3">
            <input type="text" value={usernameInput} onChange={e => setUsernameInput(e.target.value)} required className="w-full bg-[#1c2541] border border-slate-700 text-sm p-2 rounded-lg text-white" placeholder="Usuario" />
            <input type="password" value={passwordInput} onChange={e => setPasswordInput(e.target.value)} required className="w-full bg-[#1c2541] border border-slate-700 text-sm p-2 rounded-lg text-white" placeholder="Contraseña" />
          </div>
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 font-medium py-2 rounded-lg text-sm text-white cursor-pointer">Conectar</button>
        </form>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-[#070b19] text-slate-100 font-sans flex flex-col overflow-hidden">
      {/* NAVBAR */}
      <header className="bg-[#0b132b] border-b border-slate-800 px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg border border-blue-500/20"><Server className="w-6 h-6" /></div>
          <div><h1 className="text-lg font-bold text-white">MT_DB Manager</h1>

            <p className="text-[10px] text-slate-500 font-mono">ROOT@{usuario?.username}</p>
            <p className="text-[10px] text-slate-500 font-mono">{usuario?.nombre_completo || 'Operador'}</p>
          </div>
        </div>

        <div className="flex bg-[#050814] p-1 rounded-xl border border-slate-800 flex-wrap justify-center gap-2.5">
          {/* BOTONES REORDENADOS: SERVICIOS DEDICADOS ES EL PRIMERO Y TODOS LO VEN */}
          <button onClick={() => setTabActiva('inventario')} className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${tabActiva === 'inventario' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>📋 Servicios Dedicados</button>
          
          {/* RNOC NO VERÁ ESTO */}
          {!esRnoc && (
            <button onClick={() => setTabActiva('resumen')} className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${tabActiva === 'resumen' ? 'bg-[#d97706] text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>📊 Disponibilidad de Puertos</button>
          )}
          
          {esAdmin && (
            <button onClick={() => setTabActiva('geografia')} className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${tabActiva === 'geografia' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>🌐 Configuración Red</button>
          )}
          
          {/* SOLO INGENIERÍA Y ADMIN VEN LA CARGA MASIVA */}
          {puedeCargar && (
            <button onClick={() => setTabActiva('carga_excel')} className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${tabActiva === 'carga_excel' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>📤 Carga Masiva</button>
          )}

          {esAdmin && (
            <button onClick={() => setTabActiva('usuarios')} className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${tabActiva === 'usuarios' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>👥 Usuarios</button>
          )}
        </div>
        <button onClick={handleLogout} className="p-2 bg-red-950/30 border border-red-900/40 rounded-lg text-red-400 hover:bg-red-900/50 cursor-pointer transition-colors"><LogOut className="w-4 h-4" /></button>
      </header>

      {/* CONTENEDOR CENTRAL */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* 📊 PESTAÑA: DISPONIBILIDAD */}
        {tabActiva === 'resumen' && !esRnoc && (
          <div className="flex-1 flex flex-col overflow-hidden bg-[#04060f]">
            <div className="bg-[#130e06] border-b border-amber-900/40 px-6 py-3 flex flex-col lg:flex-row justify-between items-center gap-3 shrink-0">
              <div className="flex flex-wrap items-center gap-3 text-xs font-medium">
                <span className="px-3 py-1 rounded-md text-amber-500 border border-amber-600/60 shadow-sm uppercase tracking-wider font-bold">FILTROS MÉTRICAS</span>
                
                <select value={resumenReg} onChange={(e) => handleResumenRegionChange(e.target.value)} className="bg-transparent border border-slate-600 px-3 py-1.5 rounded-md text-slate-200 focus:outline-none focus:border-amber-500 transition-colors cursor-pointer">
                  <option value="" className="bg-[#0b132b]">-- REGIÓN --</option>
                  {Object.keys(estructuraGeografica).map(r => <option key={r} value={r} className="bg-[#0b132b]">{r}</option>)}
                </select>
                
                <span className="text-amber-600/80 text-[10px]">➔</span>
                
                <select value={resumenCd} onChange={(e) => handleResumenCiudadChange(e.target.value)} disabled={!resumenReg} className="bg-transparent border border-slate-600 px-3 py-1.5 rounded-md text-slate-200 disabled:opacity-50 focus:outline-none focus:border-amber-500 transition-colors cursor-pointer">
                  <option value="" className="bg-[#0b132b]">-- CIUDAD --</option>
                  {resumenReg && obtenerCiudadesOrdenadas(resumenReg).map(c => <option key={c.id} value={c.nombre} className="bg-[#0b132b]">{c.nombre}</option>)}
                </select>
                
                <span className="text-amber-600/80 text-[10px]">➔</span>
                
                <select value={resumenHub} onChange={(e) => setResumenHub(e.target.value)} disabled={!resumenCd} className="bg-transparent border border-slate-600 px-3 py-1.5 rounded-md text-amber-400 font-bold w-48 disabled:opacity-50 focus:outline-none focus:border-amber-500 transition-colors cursor-pointer">
                  <option value="" className="bg-[#0b132b]">-- TODOS LOS HUBs --</option>
                  {resumenReg && resumenCd && (estructuraGeografica[resumenReg]?.ciudades[resumenCd]?.hubs || []).map(h => <option key={h.id} value={h.id} className="bg-[#0b132b]">{h.nombre}</option>)}
                </select>
              </div>
            </div>

            <div className="p-6 border-b border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
              <div>
                <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2.5">
                  <BarChart3 className="w-6 h-6 text-amber-400" /> PANEL ANALÍTICO DE INFRAESTRUCTURA
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Localización actual: <span className="text-amber-400 font-black uppercase">{resumenCd}</span> {hubActualResumen && <span>➔ Nodo: <span className="text-blue-400 font-bold">{hubActualResumen.nombre}</span></span>}
                </p>
              </div>

              <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 shadow-inner shrink-0">
                <button onClick={() => setSubTabResumen('equipos')} className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-2 cursor-pointer ${subTabResumen === 'equipos' ? 'bg-amber-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-300'}`}>
                  <Layers className="w-3.5 h-3.5" /> Disponibilidad por Equipo
                </button>
                <button onClick={() => setSubTabResumen('ancho_banda')} className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-2 cursor-pointer ${subTabResumen === 'ancho_banda' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-300'}`}>
                  <Activity className="w-3.5 h-3.5" /> Ancho de Banda Total
                </button>
              </div>

              <button onClick={cargarResumenDashboardEquipos} className="p-2.5 bg-slate-900 border border-slate-800 hover:border-slate-600 rounded-xl text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0">
                <RefreshCw className={`w-3.5 h-3.5 ${cargandoResumen ? 'animate-spin' : ''}`} /> Recalcular Todo
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              {cargandoResumen ? (
                <div className="text-center py-48 text-sm text-slate-400 font-mono tracking-widest bg-[#0b132b]/20 border-2 border-dashed border-slate-800 rounded-2xl animate-pulse">
                  🚀 ESCANEANDO Y PROCESANDO PROTOCOLOS ÓPTICOS EN LA CIUDAD...
                </div>
              ) : (
                <>
                  {/* SUB PESTAÑA: EQUIPOS */}
                  {subTabResumen === 'equipos' && (
                    (!resumenReg || !resumenCd) ? (
                      <div className="text-center py-36 text-xs text-slate-500 italic bg-[#0b132b]/10 border border-dashed border-slate-800 rounded-2xl flex flex-col items-center gap-3 shadow-inner">
                        <span className="text-3xl">📊</span>
                        Selecciona la Región y Ciudad en la barra superior para visualizar la disponibilidad de puertos.
                      </div>
                    ) : resumenEquiposData.length === 0 ? (
                      <div className="text-center py-36 text-xs text-slate-500 italic bg-[#0b132b]/10 border border-dashed border-slate-800 rounded-2xl">
                        No se encontraron puertos registrados para estructurar chasis en esta localización.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {resumenEquiposData.map((eq, idx) => (
                          <div key={idx} className="bg-slate-950/90 border-2 border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-5 hover:border-blue-500/40 transition-all shadow-2xl relative">
                            <div className="border-b border-slate-900 pb-3">
                              <span className="bg-amber-950/60 px-2.5 py-1 rounded-md text-[10px] font-mono font-black text-amber-400 border border-amber-800/60 uppercase tracking-wider">
                                {eq.hubNombre}
                              </span>
                              <h3 className="text-base font-black text-white mt-3 truncate tracking-tight text-blue-400 font-mono">
                                ⚙️ {eq.equipoId}
                              </h3>
                            </div>

                           {/* CAJAS SUPERIORES DINÁMICAS (Solo renderizan si > 0) */}
                          <div className="flex justify-evenly gap-2 bg-slate-900/40 p-3 rounded-xl border border-slate-900">
                            {eq.totalGi > 0 && (
                              <div className="text-center flex-1 border-r border-slate-800/60 last:border-0">
                                <p className="text-[10px] text-slate-500 font-bold uppercase">BASE GIGABIT</p>
                                <p className="text-lg font-mono font-black text-white mt-1">{eq.totalGi}</p>
                              </div>
                            )}
                            {eq.totalTe > 0 && (
                              <div className="text-center flex-1 border-r border-slate-800/60 last:border-0">
                                <p className="text-[10px] text-slate-500 font-bold uppercase">BASE TENGIGABIT</p>
                                <p className="text-lg font-mono font-black text-white mt-1">{eq.totalTe}</p>
                              </div>
                            )}
                            {eq.totalTf > 0 && (
                              <div className="text-center flex-1 border-r border-slate-800/60 last:border-0">
                                <p className="text-[10px] text-slate-500 font-bold uppercase">BASE 25G</p>
                                <p className="text-lg font-mono font-black text-white mt-1">{eq.totalTf}</p>
                              </div>
                            )}
                            {eq.totalHu > 0 && (
                              <div className="text-center flex-1 border-r border-slate-800/60 last:border-0">
                                <p className="text-[10px] text-slate-500 font-bold uppercase">BASE 100G</p>
                                <p className="text-lg font-mono font-black text-white mt-1">{eq.totalHu}</p>
                              </div>
                            )}
                          </div>  

                            {/* BARRAS DE PROGRESO DINÁMICAS */}
                            <div className="space-y-5">
                              
                              {eq.totalGi > 0 && (
                                <div className="space-y-1.5">
                                  <div className="flex justify-between text-xs">
                                    <span className="text-slate-400 font-bold">GigabitEthernet</span>
                                    <span className="font-mono text-green-400 font-black">
                                      {eq.giLibres} Libres <span className="text-slate-600 font-normal">/ {eq.giOcupados} Ocup.</span>
                                    </span>
                                  </div>
                                  <div className="w-full bg-slate-900 h-6 rounded-xl overflow-hidden border border-slate-800 p-1">
                                    <div 
                                      className="bg-gradient-to-r from-green-600 to-emerald-400 h-full rounded-lg flex items-center justify-end transition-all duration-500" 
                                      style={{ width: `${eq.giPct}%`, opacity: eq.giPct > 0 ? 1 : 0, paddingRight: eq.giPct > 15 ? '8px' : '0' }}
                                    >
                                      {eq.giPct > 15 && <span className="text-[10px] font-black text-black font-mono">{eq.giPct}% Disp</span>}
                                    </div>
                                  </div>
                                </div>
                              )}

                              {eq.totalTe > 0 && (
                                <div className="space-y-1.5">
                                  <div className="flex justify-between text-xs">
                                    <span className="text-slate-400 font-bold">TenGigabitEthernet (10G)</span>
                                    <span className="font-mono text-purple-400 font-black">
                                      {eq.teLibres} Libres <span className="text-slate-600 font-normal">/ {eq.teOcupados} Ocup.</span>
                                    </span>
                                  </div>
                                  <div className="w-full bg-slate-900 h-6 rounded-xl overflow-hidden border border-slate-800 p-1">
                                    <div 
                                      className="bg-gradient-to-r from-purple-600 to-fuchsia-400 h-full rounded-lg flex items-center justify-end transition-all duration-500" 
                                      style={{ width: `${eq.tePct}%`, opacity: eq.tePct > 0 ? 1 : 0, paddingRight: eq.tePct > 15 ? '8px' : '0' }}
                                    >
                                      {eq.tePct > 15 && <span className="text-[10px] font-black text-black font-mono">{eq.tePct}% Disp</span>}
                                    </div>
                                  </div>
                                </div>
                              )}

                              {eq.totalTf > 0 && (
                                <div className="space-y-1.5">
                                  <div className="flex justify-between text-xs">
                                    <span className="text-slate-400 font-bold">TwentyFiveGig (25G)</span>
                                    <span className="font-mono text-cyan-400 font-black">
                                      {eq.tfLibres} Libres <span className="text-slate-600 font-normal">/ {eq.tfOcupados} Ocup.</span>
                                    </span>
                                  </div>
                                  <div className="w-full bg-slate-900 h-6 rounded-xl overflow-hidden border border-slate-800 p-1">
                                    <div 
                                      className="bg-gradient-to-r from-cyan-600 to-sky-400 h-full rounded-lg flex items-center justify-end transition-all duration-500" 
                                      style={{ width: `${eq.tfPct}%`, opacity: eq.tfPct > 0 ? 1 : 0, paddingRight: eq.tfPct > 15 ? '8px' : '0' }}
                                    >
                                      {eq.tfPct > 15 && <span className="text-[10px] font-black text-black font-mono">{eq.tfPct}% Disp</span>}
                                    </div>
                                  </div>
                                </div>
                              )}

                              {eq.totalHu > 0 && (
                                <div className="space-y-1.5">
                                  <div className="flex justify-between text-xs">
                                    <span className="text-slate-400 font-bold">HundredGig (100G)</span>
                                    <span className="font-mono text-amber-500 font-black">
                                      {eq.huLibres} Libres <span className="text-slate-600 font-normal">/ {eq.huOcupados} Ocup.</span>
                                    </span>
                                  </div>
                                  <div className="w-full bg-slate-900 h-6 rounded-xl overflow-hidden border border-slate-800 p-1">
                                    <div 
                                      className="bg-gradient-to-r from-amber-600 to-yellow-400 h-full rounded-lg flex items-center justify-end transition-all duration-500" 
                                      style={{ width: `${eq.huPct}%`, opacity: eq.huPct > 0 ? 1 : 0, paddingRight: eq.huPct > 15 ? '8px' : '0' }}
                                    >
                                      {eq.huPct > 15 && <span className="text-[10px] font-black text-black font-mono">{eq.huPct}% Disp</span>}
                                    </div>
                                  </div>
                                </div>
                              )}

                            </div>
                          </div>
                        ))}
                      </div>
                    )
                  )}

                  {/* SUB PESTAÑA: ANCHO DE BANDA Y CLIENTES EN LÍNEA */}
                  {subTabResumen === 'ancho_banda' && (
                    (!resumenReg || !resumenCd) ? (
                      <div className="text-center py-36 text-xs text-slate-500 italic bg-[#0b132b]/10 border border-dashed border-slate-800 rounded-2xl flex flex-col items-center gap-3 shadow-inner">
                        <span className="text-3xl">⚡</span>
                        Selecciona la Región y Ciudad en la barra superior para visualizar el ancho de banda y clientes.
                      </div>
                    ) : resumenAnchoBandaData.length === 0 ? (
                      <div className="text-center py-36 text-xs text-slate-500 italic bg-[#0b132b]/10 border border-dashed border-slate-800 rounded-2xl">
                        No hay asignaciones activas calculadas en este nodo geográfico.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                        {resumenAnchoBandaData.map((sitio, idx) => {
                          const totalGbps = (sitio.anchoBandaTotal / 1000).toFixed(2);
                          const tipoExpandido = detallesClientesHub[sitio.hubId]; 
                          const isExpandidoActivo = tipoExpandido === 'ACTIVO';
                          const isExpandidoSuspendido = tipoExpandido === 'SUSPENDIDO';

                          return (
                            <div key={idx} className="bg-[#0b132b]/40 border-2 border-slate-800 rounded-2xl p-6 space-y-4 hover:border-blue-500/30 transition-all shadow-xl h-fit">
                              <div className="flex justify-between items-start border-b border-slate-800/80 pb-3">
                                <div>
                                  <span className="text-[10px] font-mono font-black px-2 py-0.5 bg-blue-950 text-blue-400 border border-blue-900 rounded uppercase">SITIO CENTRAL HUB</span>
                                  <h3 className="text-lg font-black text-white mt-1.5 font-mono">⚡ {sitio.hubNombre}</h3>
                                </div>
                                <div className="text-right">
                                  <p className="text-[10px] text-slate-500 font-bold uppercase">Tráfico Agregado</p>
                                  <p className="text-2xl font-mono font-black text-emerald-400 mt-0.5">{totalGbps} <span className="text-xs font-bold text-slate-400">Gbps</span></p>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                <div 
                                  onClick={() => setDetallesClientesHub(prev => ({ ...prev, [sitio.hubId]: isExpandidoActivo ? null : 'ACTIVO' }))}
                                  className={`p-4 rounded-xl border text-center cursor-pointer transition-all ${isExpandidoActivo ? 'bg-blue-900/30 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.15)]' : 'bg-slate-950 border-slate-900/60 hover:border-blue-500/30'}`}
                                >
                                  <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest">CLIENTES ACTIVOS</p>
                                  <p className="text-3xl font-mono font-black text-white mt-1">{sitio.puertosActivos}</p>
                                </div>
                                <div 
                                  onClick={() => setDetallesClientesHub(prev => ({ ...prev, [sitio.hubId]: isExpandidoSuspendido ? null : 'SUSPENDIDO' }))}
                                  className={`p-4 rounded-xl border text-center cursor-pointer transition-all ${isExpandidoSuspendido ? 'bg-purple-900/30 border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.15)]' : 'bg-slate-950 border-slate-900/60 hover:border-purple-500/30'}`}
                                >
                                  <p className="text-[11px] text-purple-500 font-bold uppercase tracking-widest">EN SUSPENSIÓN</p>
                                  <p className="text-3xl font-mono font-black text-purple-400 mt-1">{sitio.puertosSuspendidos || 0}</p>
                                </div>
                              </div>

                              {/* TABLA DINÁMICA DE CLIENTES INDIVIDUAL POR HUB */}
                              {tipoExpandido && (
                                <div className="mt-4 bg-[#0b132b] rounded-xl border border-slate-800 overflow-hidden shadow-inner">
                                  <div className={`px-4 py-2.5 text-[10px] font-black tracking-widest flex justify-between items-center ${tipoExpandido === 'SUSPENDIDO' ? 'bg-purple-950/60 text-purple-400 border-b border-purple-900/40' : 'bg-blue-950/60 text-blue-400 border-b border-blue-900/40'}`}>
                                    <span>{tipoExpandido === 'SUSPENDIDO' ? '🔴 LISTA DE CLIENTES EN SUSPENSIÓN' : '🟢 LISTA DE CLIENTES ACTIVOS'}</span>
                                    <span className="bg-slate-950 px-2 py-0.5 rounded-full border border-slate-800 text-slate-400">
                                      {tipoExpandido === 'SUSPENDIDO' ? listaClientesSuspendidos.filter(c => c.hubId === sitio.hubId).length : listaClientesActivos.filter(c => c.hubId === sitio.hubId).length} REGISTROS
                                    </span>
                                  </div>
                                  <div className="max-h-[250px] overflow-y-auto custom-scrollbar">
                                    <table className="w-full text-left text-xs text-slate-300 table-fixed">
                                      <thead className="bg-[#050814] text-slate-500 sticky top-0 border-b border-slate-800">
                                        <tr>
                                          <th className="p-2.5 font-bold w-1/3">Cliente / Servicio</th>
                                          <th className="p-2.5 font-bold w-1/3">IP Cliente</th>
                                          <th className="p-2.5 font-bold w-1/3">Equipo / Interfaz</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-slate-800/40">
                                        {(tipoExpandido === 'SUSPENDIDO' ? listaClientesSuspendidos : listaClientesActivos)
                                          .filter(c => c.hubId === sitio.hubId)
                                          .map((c, i) => (
                                            <tr key={i} className="hover:bg-slate-800/30 transition-colors">
                                              <td className="p-2.5 font-semibold text-white truncate pr-2" title={c.SERVICIO || c.CLIENTE}>{c.SERVICIO || c.CLIENTE || '-'}</td>
                                              <td className="p-2.5 font-mono text-[11px] text-slate-400 truncate">{c.IP_CLIENTE || '-'}</td>
                                              <td className="p-2.5 font-mono text-[10px] truncate">{c.EQUIPO_HOTEL_ID}<br/><span className="text-slate-500">{c.PUERTO}</span></td>
                                            </tr>
                                          ))
                                        }
                                        {(tipoExpandido === 'SUSPENDIDO' ? listaClientesSuspendidos : listaClientesActivos).filter(c => c.hubId === sitio.hubId).length === 0 && (
                                          <tr><td colSpan="3" className="p-4 text-center text-slate-500 italic">No hay registros para mostrar.</td></tr>
                                        )}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              )}

                              <div className="space-y-1 pt-1">
                                <div className="flex justify-between text-[11px] text-slate-400">
                                  <span>Capacidad de Carga Estimada (Backbone 40G)</span>
                                  <span className="font-mono font-bold text-slate-300">{Math.round((sitio.anchoBandaTotal / 40000) * 100)}%</span>
                                </div>
                                <div className="w-full bg-slate-950 h-3 rounded-full border border-slate-900 p-0.5 overflow-hidden">
                                  <div className="bg-gradient-to-r from-blue-600 to-indigo-400 h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, Math.round((sitio.anchoBandaTotal / 40000) * 100))}%` }} />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* 📋 PESTAÑA: SERVICIOS DEDICADOS (INVENTARIO) */}
        {tabActiva === 'inventario' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="bg-[#090f24] border-b border-slate-800/60 px-6 py-3 flex flex-col lg:flex-row justify-between items-center gap-3 shrink-0">
              <div className="flex flex-wrap items-center gap-3 text-xs font-medium">
                <span className="px-3 py-1 rounded-md text-blue-500 border border-blue-600/60 shadow-sm uppercase tracking-wider font-bold">FILTROS LISTADO</span>
                
                <select value={inventarioReg} onChange={(e) => handleInventarioRegionChange(e.target.value)} className="bg-transparent border border-slate-600 px-3 py-1.5 rounded-md text-slate-200 focus:outline-none focus:border-blue-500 transition-colors cursor-pointer">
                  <option value="" className="bg-[#0b132b]">-- REGIÓN --</option>
                  {Object.keys(estructuraGeografica).map(r => <option key={r} value={r} className="bg-[#0b132b]">{r}</option>)}
                </select>
                
                <span className="text-blue-600/80 text-[10px]">➔</span>
                
                <select value={inventarioCd} onChange={(e) => handleInventarioCiudadChange(e.target.value)} disabled={!inventarioReg} className="bg-transparent border border-slate-600 px-3 py-1.5 rounded-md text-slate-200 disabled:opacity-50 focus:outline-none focus:border-blue-500 transition-colors cursor-pointer">
                  <option value="" className="bg-[#0b132b]">-- CIUDAD --</option>
                  {inventarioReg && obtenerCiudadesOrdenadas(inventarioReg).map(c => <option key={c.id} value={c.nombre} className="bg-[#0b132b]">{c.nombre}</option>)}
                </select>
                
                <span className="text-blue-600/80 text-[10px]">➔</span>
                
                <select value={inventarioHub} onChange={(e) => setInventarioHub(e.target.value)} disabled={!inventarioCd} className="bg-transparent border border-slate-600 px-3 py-1.5 rounded-md text-blue-400 font-bold w-48 disabled:opacity-50 focus:outline-none focus:border-blue-500 transition-colors cursor-pointer">
  <option value="TODOS" className="bg-[#0b132b]">-- TODOS LOS HUBs --</option>
  {inventarioReg && inventarioCd && (estructuraGeografica[inventarioReg]?.ciudades[inventarioCd]?.hubs || []).map(h => 
    <option key={h.id} value={h.id} className="bg-[#0b132b]">{h.nombre}</option>
  )}
</select>
              </div>

              {inventarioHub !== 'TODOS' && hubActivoDatos && (hubActivoDatos.direccion || hubActivoDatos.coordenadas) && (
                <div className="bg-[#0b132b] border border-slate-800 rounded-full px-4 py-1.5 text-[11px] flex items-center text-slate-300 shadow-sm">
                  {hubActivoDatos.direccion && (
                    <a href={generarUrlGoogleMaps(hubActivoDatos.direccion)} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-blue-400 transition-colors cursor-pointer" title="Ver en Google Maps">
                      <span className="text-pink-500 text-sm">📍</span> <span className="hover:underline">{hubActivoDatos.direccion}</span>
                    </a>
                  )}
                  {hubActivoDatos.direccion && hubActivoDatos.coordenadas && (
                    <div className="w-px h-4 bg-slate-700 mx-4"></div>
                  )}
                  {hubActivoDatos.coordenadas && (
                    <a href={generarUrlGoogleMaps(hubActivoDatos.coordenadas)} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-amber-400 transition-colors cursor-pointer" title="Ver en Google Maps">
                      <MapPin className="w-3.5 h-3.5 text-amber-500" /> <span className="text-amber-500 font-mono hover:underline">{hubActivoDatos.coordenadas}</span>
                    </a>
                  )}
                </div>
              )}
            </div>

            {datosHub?.resumen && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 px-6 mt-4 shrink-0">
                <div onClick={() => setFiltroEstatus('TODOS')} className={`cursor-pointer p-4 rounded-xl border transition-all ${filtroEstatus === 'TODOS' ? 'bg-[#1c2541] border-slate-400 shadow-xl' : 'bg-[#0b132b]/60 border-slate-800'}`}><p className="text-xs text-slate-400 font-bold">CAPACIDAD GLOBAL</p><p className="text-2xl font-black mt-1">{datosHub.resumen.total}</p></div>
                <div onClick={() => setFiltroEstatus('DISPONIBLE')} className={`cursor-pointer p-4 rounded-xl border transition-all ${filtroEstatus === 'DISPONIBLE' ? 'bg-green-950/40 border-green-500 shadow-xl' : 'bg-[#0b132b]/60 border-slate-800'}`}><p className="text-xs text-green-400 font-bold">PUERTOS DISPONIBLES</p><p className="text-2xl font-black text-green-400 mt-1">{datosHub.resumen.disponibles}</p></div>
                <div onClick={() => setFiltroEstatus('ACTIVO')} className={`cursor-pointer p-4 rounded-xl border transition-all ${filtroEstatus === 'ACTIVO' ? 'bg-blue-950/40 border-blue-500 shadow-xl' : 'bg-[#0b132b]/60 border-slate-800'}`}><p className="text-xs text-blue-400 font-bold">PUERTOS ACTIVOS</p><p className="text-2xl font-black text-blue-400 mt-1">{datosHub.resumen.activos}</p></div>
                <div onClick={() => setFiltroEstatus('SUSPENDIDO')} className={`cursor-pointer p-4 rounded-xl border transition-all ${filtroEstatus === 'SUSPENDIDO' ? 'bg-purple-950/40 border-purple-500 shadow-xl' : 'bg-[#0b132b]/60 border-slate-800'}`}><p className="text-xs text-purple-400 font-bold">SUSPENDIDOS</p><p className="text-2xl font-black text-purple-400 mt-1">{datosHub.resumen.suspendidos}</p></div>
                <div onClick={() => setFiltroEstatus('TRONCAL')} className={`cursor-pointer p-4 rounded-xl border transition-all ${filtroEstatus === 'TRONCAL' ? 'bg-amber-950/40 border-amber-500 shadow-xl' : 'bg-[#0b132b]/60 border-slate-800'}`}><p className="text-xs text-amber-400 font-bold">ENLACES TRONCALES</p><p className="text-2xl font-black text-amber-400 mt-1">{datosHub.resumen.troncales}</p></div>
              </div>
            )}

            <div className="flex-1 grid grid-cols-1 xl:grid-cols-3 gap-6 p-6 overflow-hidden">
              <div className="xl:col-span-2 flex flex-col bg-[#0b132b]/30 border border-slate-800 rounded-xl overflow-hidden">
                <div className="p-4 bg-[#0b132b]/80 border-b border-slate-800 flex flex-col sm:flex-row items-center gap-4 shrink-0">
                  <div className="flex items-center gap-3 w-full">
                    <Search className="w-4 h-4 text-slate-500 shrink-0" />
                    <input type="text" placeholder="Buscar por interfaz, servicio, IP, BDI, chasis o ubicación..." value={filtroTexto} onChange={(e) => setFiltroTexto(e.target.value)} className="bg-transparent text-sm text-white focus:outline-none w-full" />
                  </div>
                  <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                    <span className="text-[10px] uppercase font-bold text-slate-500 whitespace-nowrap">Equipo ID:</span>
                    <select value={filtroEquipo} onChange={(e) => setFiltroEquipo(e.target.value)} className="bg-[#1c2541] border border-slate-700 text-xs p-1.5 rounded text-white min-w-[150px] max-w-[220px] truncate outline-none focus:border-blue-500">
                      <option value="TODOS">-- TODOS --</option>
                      {equiposDisponibles.map(eq => <option key={eq} value={eq}>{eq}</option>)}
                    </select>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                  <table className="w-full text-xs text-slate-300 text-left border-collapse table-fixed">
                    <thead className="bg-[#0b132b] text-slate-400 uppercase font-bold sticky top-0 border-b border-slate-800 z-10">
                      <tr><th className="p-3 w-32">ESTATUS</th><th className="p-3 w-40">INTERFAZ</th><th className="p-3 w-56">EQUIPO ID</th><th className="p-3">SERVICIO</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/40">
                      {cargando ? <tr><td colSpan="4" className="p-12 text-center text-slate-500 font-mono">Cargando base de datos de ingenieria...</td></tr> :
                      puertosFiltrados.length === 0 ? <tr><td colSpan="4" className="p-12 text-center text-slate-500 italic">No se encontraron puertos que coincidan con los filtros seleccionados.</td></tr> :
                      puertosFiltrados.map((p, idx) => {
                        const est = String(p.ESTATUS || '').toUpperCase().trim();
                        const isDisponible = est.includes('DISPONIBLE');
                        return (
                          <tr key={idx} onClick={() => seleccionarPuerto(p)} className={`hover:bg-slate-800/20 cursor-pointer ${puertoDetalle?.ID === p.ID ? 'bg-blue-600/10 border-l-4 border-l-blue-500' : ''}`}>
                            <td className="p-3">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-black border ${
                                isDisponible ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                                est === 'ACTIVO' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 
                                est === 'SUSPENDIDO' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 
                                'bg-amber-500/10 text-amber-400 border-amber-500/20'
                              }`}>
                                {p.ESTATUS}
                              </span>
                            </td>
                            <td className="p-3 font-mono text-white truncate">{p.PUERTO}</td>
                            <td className="p-3 text-slate-400 font-mono truncate">
                              {p.EQUIPO_HOTEL_ID || '-'}
                              {inventarioHub === 'TODOS' && p.HUB_PERTENENCIA && (
                                <div className="text-[9px] text-blue-400 mt-0.5 font-bold">NODO: {p.HUB_PERTENENCIA}</div>
                              )}
                            </td>
                            <td className="p-3 text-slate-200 truncate font-medium">{p.SERVICIO || '-'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* FICHA TÉCNICA LATERAL */}
              <div className="bg-[#0b132b]/40 border border-slate-800 rounded-xl p-5 flex flex-col overflow-hidden shadow-xl">
                {puertoDetalle ? (
                  <div className="flex flex-col h-full space-y-4 overflow-hidden">
                    <div className="shrink-0 flex justify-between items-center border-b border-slate-800 pb-3">
                      <div className="flex items-center gap-3">
                        <h3 className="text-xs font-black text-blue-400 tracking-widest">FICHA TÉCNICA DE INGENIERÍA</h3>
                        
                        <button 
                          onClick={() => setMostrarModalVisualizar(true)} 
                          className="bg-blue-900/30 hover:bg-blue-600 border border-blue-800 text-blue-300 text-[10px] px-2.5 py-1 rounded transition-colors flex items-center gap-1 font-bold cursor-pointer"
                          title="Ver ficha completa de solo lectura"
                        >
                          <Eye className="w-3.5 h-3.5" /> Visualizar
                        </button>

                        {(esRnoc || esMcmNoc || esAdmin) && (
                          <button 
                            onClick={() => setMostrarModalFalla(true)} 
                            className="bg-red-900/30 hover:bg-red-600 border border-red-800 text-red-300 text-[10px] px-2.5 py-1 rounded transition-colors flex items-center gap-1 font-bold cursor-pointer"
                            title="Generar formato de Despliegue de Falla"
                          >
                            <AlertTriangle className="w-3.5 h-3.5" /> Desplegar Falla
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto pr-2 space-y-6 text-xs custom-scrollbar">
                      
                      {/* 1. INTERFAZ */}
                      <div className="space-y-2">
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-900 pb-1">1. Interfaz Física</h4>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] text-slate-500 block font-bold mb-1">STATUS</label>
                            <select disabled={!puedeEditar} value={editCampos.ESTATUS || ''} onChange={e=>setEditCampos({...editCampos, ESTATUS: e.target.value.toUpperCase()})} className="w-full bg-slate-950 p-2 rounded border border-slate-800 text-white font-bold">
                              <option value="DISPONIBLE GI">DISPONIBLE GI</option>
                              <option value="DISPONIBLE TE">DISPONIBLE TE</option>
                              <option value="DISPONIBLE 25">DISPONIBLE 25</option>
                              <option value="DISPONIBLE 100">DISPONIBLE 100</option>
                              <option value="ACTIVO">ACTIVO</option>
                              <option value="SUSPENDIDO">SUSPENDIDO</option>
                              <option value="TRONCAL">TRONCAL</option>
                              <option value="TRONCAL GI">TRONCAL GI</option>
                              <option value="TRONCAL TE">TRONCAL TE</option>
                              <option value="TRONCAL 25">TRONCAL 25</option>
                              <option value="TRONCAL 100">TRONCAL 100</option>
                            </select>
                          </div>
                          <div><label className="text-[10px] text-slate-500 block font-bold mb-1">PUERTO</label><input type="text" disabled={!puedeEditar} value={editCampos.PUERTO || ''} onChange={e=>setEditCampos({...editCampos, PUERTO: e.target.value})} className="w-full bg-slate-950 font-mono p-2 rounded border border-slate-800 text-white" /></div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div><label className="text-[10px] text-slate-500 block font-bold mb-1">EQUIPO ID (CHASIS)</label><input type="text" disabled={!puedeEditar} value={editCampos.EQUIPO_HOTEL_ID || ''} onChange={e=>setEditCampos({...editCampos, EQUIPO_HOTEL_ID: e.target.value})} className="w-full bg-slate-950 font-mono p-2 rounded border border-slate-800 text-white" /></div>
                          <div><label className="text-[10px] text-slate-500 block font-bold mb-1">IP HUB</label><input type="text" disabled={!puedeEditar} value={editCampos.IP_HUB || ''} onChange={e=>setEditCampos({...editCampos, IP_HUB: e.target.value})} className="w-full bg-slate-950 font-mono p-2 rounded border border-slate-800 text-white" /></div>
                        </div>
                      </div>

                      {/* 2. ENRUTAMIENTO Y LÓGICA */}
                      <div className="space-y-2">
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-900 pb-1">2. Lógica y Enrutamiento</h4>
                        <div className="grid grid-cols-2 gap-3">
                          <div><label className="text-[10px] text-slate-500 block font-bold mb-1">IP GESTIÓN</label><input type="text" disabled={!puedeEditar} value={editCampos.IP_GESTION || ''} onChange={e=>setEditCampos({...editCampos, IP_GESTION: e.target.value})} className="w-full bg-slate-950 font-mono p-2 rounded border border-slate-800 text-white" /></div>
                          <div><label className="text-[10px] text-slate-500 block font-bold mb-1">IP CLIENTE</label><input type="text" disabled={!puedeEditar} value={editCampos.IP_CLIENTE || ''} onChange={e=>setEditCampos({...editCampos, IP_CLIENTE: e.target.value})} className="w-full bg-slate-950 font-mono p-2 rounded border border-slate-800 text-white" /></div>
                        </div>
                        <div><label className="text-[10px] text-slate-500 block font-bold mb-1">BDI</label><input type="text" disabled={!puedeEditar} value={editCampos.BDI || ''} onChange={e=>setEditCampos({...editCampos, BDI: e.target.value})} className="w-full bg-slate-950 font-mono p-2 rounded border border-slate-800 text-white" /></div>
                      </div>

                      {/* 3. PARÁMETROS ÓPTICOS */}
                      <div className="space-y-2">
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-900 pb-1">3. Parámetros Ópticos</h4>
                        <div className="grid grid-cols-2 gap-3">
                          <div><label className="text-[10px] text-slate-500 block font-bold mb-1">POTENCIA HUB</label><input type="text" disabled={!puedeEditar} value={editCampos.POTENCIA_HUB || ''} onChange={e=>setEditCampos({...editCampos, POTENCIA_HUB: e.target.value})} className="w-full bg-slate-950 p-2 rounded border border-slate-800 text-amber-400 font-mono" /></div>
                          <div><label className="text-[10px] text-slate-500 block font-bold mb-1">POTENCIA CPE</label><input type="text" disabled={!puedeEditar} value={editCampos.POTENCIA_CPE || ''} onChange={e=>setEditCampos({...editCampos, POTENCIA_CPE: e.target.value})} className="w-full bg-slate-950 p-2 rounded border border-slate-800 text-amber-400 font-mono" /></div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div><label className="text-[10px] text-slate-500 block font-bold mb-1">SERIE SFP HUB</label><input type="text" disabled={!puedeEditar} value={editCampos.SERIE_SFP_HUB || ''} onChange={e=>setEditCampos({...editCampos, SERIE_SFP_HUB: e.target.value})} className="w-full bg-slate-950 p-2 rounded border border-slate-800 text-slate-300" /></div>
                          <div><label className="text-[10px] text-slate-500 block font-bold mb-1">SERIE SFP CPE</label><input type="text" disabled={!puedeEditar} value={editCampos.SERIE_SFP_CLIENTE || ''} onChange={e=>setEditCampos({...editCampos, SERIE_SFP_CLIENTE: e.target.value})} className="w-full bg-slate-950 p-2 rounded border border-slate-800 text-slate-300" /></div>
                        </div>
                      </div>

                      {/* 4. PLANTA EXTERNA Y FIBRA */}
                      <div className="space-y-2">
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-900 pb-1">4. Planta Externa y Fibra</h4>
                        <div className="grid grid-cols-3 gap-3">
                          <div><label className="text-[10px] text-slate-500 block font-bold mb-1">RUTA</label><input type="text" disabled={!puedeEditar} value={editCampos.RUTA || ''} onChange={e=>setEditCampos({...editCampos, RUTA: e.target.value})} className="w-full bg-slate-950 p-2 rounded border border-slate-800 text-white" /></div>
                          <div><label className="text-[10px] text-slate-500 block font-bold mb-1">DISTANCIA CLIENTE</label><input type="text" disabled={!puedeEditar} value={editCampos.DISTANCIA_CLIENTE || ''} onChange={e=>setEditCampos({...editCampos, DISTANCIA_CLIENTE: e.target.value})} className="w-full bg-slate-950 p-2 rounded border border-slate-800 text-white" /></div>
                          <div><label className="text-[10px] text-slate-500 block font-bold mb-1">LAMBDAS</label><input type="text" disabled={!puedeEditar} value={editCampos.LAMBDAS || ''} onChange={e=>setEditCampos({...editCampos, LAMBDAS: e.target.value})} className="w-full bg-slate-950 font-mono p-2 rounded border border-slate-800 text-white" /></div>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          <div><label className="text-[10px] text-slate-500 block font-bold mb-1">BUFFER</label><input type="text" disabled={!puedeEditar} value={editCampos.BUFFER || ''} onChange={e=>setEditCampos({...editCampos, BUFFER: e.target.value})} className="w-full bg-slate-950 p-2 rounded border border-slate-800 text-white" /></div>
                          <div><label className="text-[10px] text-slate-500 block font-bold mb-1">HILOS</label><input type="text" disabled={!puedeEditar} value={editCampos.HILOS || ''} onChange={e=>setEditCampos({...editCampos, HILOS: e.target.value})} className="w-full bg-slate-950 p-2 rounded border border-slate-800 text-white" /></div>
                          <div><label className="text-[10px] text-slate-500 block font-bold mb-1">PARCHEO</label><input type="text" disabled={!puedeEditar} value={editCampos.PARCHEO || ''} onChange={e=>setEditCampos({...editCampos, PARCHEO: e.target.value})} className="w-full bg-slate-950 p-2 rounded border border-slate-800 text-white" /></div>
                        </div>
                      </div>

                      {/* 5. EQUIPAMIENTO (CPE) */}
                      <div className="space-y-2">
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-900 pb-1">5. Equipamiento Cliente (CPE)</h4>
                        <div className="grid grid-cols-3 gap-3">
                          <div><label className="text-[10px] text-slate-500 block font-bold mb-1">MARCA</label><input type="text" disabled={!puedeEditar} value={editCampos.MARCA_CPE || ''} onChange={e=>setEditCampos({...editCampos, MARCA_CPE: e.target.value})} className="w-full bg-slate-950 p-2 rounded border border-slate-800 text-white truncate" /></div>
                          <div><label className="text-[10px] text-slate-500 block font-bold mb-1">MODELO</label><input type="text" disabled={!puedeEditar} value={editCampos.MODELO_CPE || ''} onChange={e=>setEditCampos({...editCampos, MODELO_CPE: e.target.value})} className="w-full bg-slate-950 p-2 rounded border border-slate-800 text-white truncate" /></div>
                          <div><label className="text-[10px] text-slate-500 block font-bold mb-1">SERIE CPE</label><input type="text" disabled={!puedeEditar} value={editCampos.SERIE_CPE || ''} onChange={e=>setEditCampos({...editCampos, SERIE_CPE: e.target.value})} className="w-full bg-slate-950 font-mono p-2 rounded border border-slate-800 text-slate-300 truncate" /></div>
                        </div>
                      </div>

                      {/* 6. SERVICIO Y UBICACIÓN */}
                      <div className="space-y-2">
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-900 pb-1">6. Servicio, Ubicación y Administrativo</h4>
                        <div><label className="text-[10px] text-slate-500 block font-bold mb-1">CLIENTE / SERVICIO</label><input type="text" disabled={!puedeEditar} value={editCampos.SERVICIO || ''} onChange={e=>setEditCampos({...editCampos, SERVICIO: e.target.value})} className="w-full bg-slate-950 p-2 rounded border border-slate-800 text-slate-200" /></div>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div><label className="text-[10px] text-slate-500 block font-bold mb-1">TIPO SERVICIO</label><input type="text" disabled={!puedeEditar} value={editCampos.TIPO_SERVICIO || ''} onChange={e=>setEditCampos({...editCampos, TIPO_SERVICIO: e.target.value})} className="w-full bg-slate-950 p-2 rounded border border-slate-800 text-white" /></div>
                          <div><label className="text-[10px] text-slate-500 block font-bold mb-1">ANCHO BANDA (MBPS)</label><input type="text" disabled={!puedeEditar} value={editCampos.MBPS || ''} onChange={e=>setEditCampos({...editCampos, MBPS: e.target.value})} className="w-full bg-slate-950 p-2 rounded border border-slate-800 text-white font-mono" /></div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] text-slate-500 block font-bold mb-1">DIRECCIÓN SERVICIO</label>
                            <div className="flex bg-slate-950 border border-slate-800 rounded overflow-hidden focus-within:border-blue-500 transition-colors">
                              <input type="text" disabled={!puedeEditar} value={editCampos.DIRECCION || ''} onChange={e=>setEditCampos({...editCampos, DIRECCION: e.target.value})} className="w-full bg-transparent p-2 text-white truncate outline-none" />
                              {editCampos.DIRECCION && (
                                <a href={generarUrlGoogleMaps(editCampos.DIRECCION)} target="_blank" rel="noreferrer" title="Abrir en Google Maps" className="px-3 bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center cursor-pointer transition-colors border-l border-slate-800">
                                  <MapPin className="w-4 h-4" />
                                </a>
                              )}
                            </div>
                          </div>

                          <div>
                            <label className="text-[10px] text-slate-500 block font-bold mb-1">COORDENADAS</label>
                            <div className="flex bg-slate-950 border border-slate-800 rounded overflow-hidden focus-within:border-amber-500 transition-colors">
                              <input type="text" disabled={!puedeEditar} value={editCampos.COORDENADAS || ''} onChange={e=>setEditCampos({...editCampos, COORDENADAS: e.target.value})} className="w-full bg-transparent p-2 text-amber-500 font-mono truncate outline-none" />
                              {editCampos.COORDENADAS && (
                                <a href={generarUrlGoogleMaps(editCampos.COORDENADAS)} target="_blank" rel="noreferrer" title="Abrir en Google Maps" className="px-3 bg-amber-600 hover:bg-amber-500 text-white flex items-center justify-center cursor-pointer transition-colors border-l border-slate-800">
                                  <MapPin className="w-4 h-4" />
                                </a>
                              )}
                            </div>
                          </div>
                        </div>

                          {/* NUEVOS CAMPOS DE CONTACTO */}
                        <div className="grid grid-cols-2 gap-3 mb-2">
                          <div>
                            <label className="text-[10px] text-slate-500 block font-bold mb-1">NOMBRE DE CONTACTO</label>
                            <input type="text" disabled={!puedeEditar} value={editCampos.CONTACTO_NOMBRE || ''} onChange={e=>setEditCampos({...editCampos, CONTACTO_NOMBRE: e.target.value})} className="w-full bg-slate-950 p-2 rounded border border-slate-800 text-white" placeholder="Ej. Juan Pérez" />
                          </div>
                          <div>
                            <label className="text-[10px] text-slate-500 block font-bold mb-1">TELÉFONO DE CONTACTO</label>
                            <input type="text" disabled={!puedeEditar} value={editCampos.CONTACTO_TELEFONO || ''} onChange={e=>setEditCampos({...editCampos, CONTACTO_TELEFONO: e.target.value})} className="w-full bg-slate-950 p-2 rounded border border-slate-800 text-white font-mono" placeholder="Ej. 555-1234" />
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] text-slate-500 block font-bold mb-1">FECHA DE ENTREGA</label>
                          <input 
                            type="date" 
                            disabled={!puedeEditar} 
                            value={formatFechaParaInput(editCampos.FECHA_ENTREGA)} 
                            onChange={e=>setEditCampos({...editCampos, FECHA_ENTREGA: e.target.value})} 
                            className="w-full bg-slate-950 p-2 rounded border border-slate-800 text-white" 
                          />
                        </div>

                        <div><label className="text-[10px] text-slate-500 block font-bold mb-1">COMENTARIOS</label><textarea rows="2" disabled={!puedeEditar} value={editCampos.COMENTARIOS || ''} onChange={e=>setEditCampos({...editCampos, COMENTARIOS: e.target.value})} className="w-full bg-slate-950 p-2 rounded border border-slate-800 text-white resize-none" /></div>
                      </div>
                    </div>
                    {puedeEditar && (<button onClick={handleGuardarCambios} disabled={guardando} className="w-full bg-[#00a86b] hover:bg-[#008f5d] text-white text-xs font-black py-3 rounded-lg cursor-pointer shrink-0 uppercase tracking-widest mt-2">💾 Guardar Ficha</button>)}
                  </div>
                ) : (
                  <div className="h-full flex flex-col justify-center items-center text-center p-4 text-slate-600">
                    <Server className="w-8 h-8 mb-2 stroke-1" />
                    <p className="text-xs">Selecciona un puerto óptico para auditar o modificar sus variables en MT_DB.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 🌐 PESTAÑA: CONFIGURACIÓN GEOGRÁFICA RED */}
        {tabActiva === 'geografia' && esAdmin && (
          <main className="flex-1 p-6 space-y-6 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* BLOQUE DE REGIONES */}
              <div className="bg-[#0b132b]/50 border border-slate-800 rounded-xl p-5 space-y-4">
                <form onSubmit={procesarRegion} className="space-y-3">
                  <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider">{idRegionEditando ? '✏️ Editar Región' : '1. Alta Región'}</h3>
                  <input type="text" placeholder="Nombre Región" value={regName} onChange={e=>setRegName(e.target.value)} required className="w-full bg-[#1c2541] border border-slate-700 text-xs p-2 rounded text-white" />
                  
                  {idRegionEditando ? (
                    <div className="flex gap-2 mt-2">
                      <button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs py-2 rounded font-semibold cursor-pointer transition-colors">Actualizar</button>
                      <button type="button" onClick={handleCancelarEdicionRegion} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white text-xs py-2 rounded font-semibold cursor-pointer transition-colors">Cancelar</button>
                    </div>
                  ) : (
                    <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs py-2 rounded font-semibold cursor-pointer transition-colors">Añadir</button>
                  )}
                </form>

                {/* BÚSQUEDA REGIONES */}
                <div className="relative mt-4">
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1.5" />
                  <input type="text" placeholder="Buscar región..." value={filtroBusquedaRegion} onChange={e=>setFiltroBusquedaRegion(e.target.value)} className="w-full bg-[#050814] border border-slate-800 text-xs py-1.5 pl-8 pr-2 rounded text-slate-300 focus:outline-none focus:border-indigo-500 transition-colors" />
                </div>

                <div className="max-h-36 overflow-y-auto space-y-1.5 border-t border-slate-800 pt-3 mt-3 custom-scrollbar">
                  {Object.keys(estructuraGeografica)
                    .filter(r => r.toLowerCase().includes(filtroBusquedaRegion.toLowerCase()))
                    .map(r => (
                    <div key={estructuraGeografica[r].id} className="flex justify-between items-center bg-slate-950/60 p-2 rounded text-[11px] group">
                      <span className="font-bold text-white truncate pr-2">{r}</span>
                      <div className="flex gap-1.5 shrink-0">
                        <button type="button" onClick={() => handleActivarModoEdicionRegion(estructuraGeografica[r].id, r)} title="Editar Región" className="p-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded transition-colors cursor-pointer">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button type="button" onClick={() => handleEliminarRegion(estructuraGeografica[r].id, r)} title="Eliminar Región" className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded transition-colors cursor-pointer">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* BLOQUE DE CIUDADES */}
              <div className="bg-[#0b132b]/50 border border-slate-800 rounded-xl p-5 space-y-4">
                <form onSubmit={crearCiudad} className="space-y-3">
                  <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">{idCiudadEditando ? '✏️ Editar Ciudad' : '2. Alta Ciudad'}</h3>
                  <select value={citRegId} onChange={e=>setCitRegId(e.target.value)} required className="w-full bg-[#1c2541] border border-slate-700 text-xs p-2 rounded text-slate-200">
                    <option value="">-- Elige Región --</option>
                    {Object.keys(estructuraGeografica).map(r => <option key={estructuraGeografica[r].id} value={estructuraGeografica[r].id}>{r}</option>)}
                  </select>
                  <div className="grid grid-cols-2 gap-2">
                    <input type="text" placeholder="ID (MXL)" value={citCode} onChange={e=>setCitCode(e.target.value)} required disabled={!!idCiudadEditando} className="bg-[#1c2541] border border-slate-700 text-xs p-2 rounded text-white uppercase disabled:opacity-50 disabled:cursor-not-allowed" />
                    <input type="text" placeholder="Nombre" value={citName} onChange={e=>setCitName(e.target.value)} required className="bg-[#1c2541] border border-slate-700 text-xs p-2 rounded text-white" />
                  </div>
                  <div className="flex gap-2">
                    <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs py-2 rounded font-semibold cursor-pointer transition-colors">{idCiudadEditando ? 'Guardar Cambios' : 'Inyectar'}</button>
                    {idCiudadEditando && <button type="button" onClick={handleCancelarEdicionCiudad} className="w-full bg-slate-700 hover:bg-slate-600 text-white text-xs py-2 rounded font-semibold cursor-pointer transition-colors">Cancelar</button>}
                  </div>
                </form>
                {/* LISTADO CIUDADES */}
                {regionFiltroCiudad && (
                  <>
                    <div className="relative mt-4">
                      <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1.5" />
                      <input type="text" placeholder="Buscar ciudad..." value={filtroBusquedaCiudad} onChange={e=>setFiltroBusquedaCiudad(e.target.value)} className="w-full bg-[#050814] border border-slate-800 text-xs py-1.5 pl-8 pr-2 rounded text-slate-300 focus:outline-none focus:border-emerald-500 transition-colors" />
                    </div>
                    <div className="max-h-36 overflow-y-auto space-y-1.5 border-t border-slate-800 pt-3 mt-3 custom-scrollbar">
                      {Object.keys(estructuraGeografica[regionFiltroCiudad]?.ciudades || {})
                        .filter(c => c.toLowerCase().includes(filtroBusquedaCiudad.toLowerCase()) || estructuraGeografica[regionFiltroCiudad].ciudades[c].id.toLowerCase().includes(filtroBusquedaCiudad.toLowerCase()))
                        .map(c => {
                        const cityData = estructuraGeografica[regionFiltroCiudad].ciudades[c];
                        return (
                          <div key={cityData.id} className="flex justify-between items-center bg-slate-950/60 p-2 rounded text-[11px] group">
                            <span className="font-bold text-white truncate pr-2">
                              {c}
                            </span>
                            <div className="flex gap-1.5 shrink-0">
                              <button type="button" onClick={() => { setIdCiudadEditando(cityData.id); setCitCode(cityData.id); setCitName(c); setCitRegId(estructuraGeografica[regionFiltroCiudad].id.toString()); }} className="text-blue-400 hover:bg-blue-500/20 p-2 rounded cursor-pointer transition-colors" title="Editar"><Edit className="w-4 h-4" /></button>
                              <button type="button" onClick={() => handleEliminarCiudad(cityData.id, c)} className="text-red-400 hover:bg-red-500/20 p-2 rounded cursor-pointer transition-colors" title="Eliminar"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </>
                )}
              </div>
              
              {/* BLOQUE DE HUBS */}
              <div className="bg-[#0b132b]/50 border border-slate-800 rounded-xl p-5 space-y-2 flex flex-col max-h-full overflow-hidden">
                <form onSubmit={asignarHub} className="space-y-2 shrink-0">
                  <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider">{idHubEditando ? '✏️ Editar HUB' : '3. Instalar HUB'}</h3>
                  <select value={hubCitId} onChange={e=>setHubCitId(e.target.value)} required className="w-full bg-[#1c2541] border border-slate-700 text-xs p-2 rounded text-slate-200">
                    <option value="">-- Ciudad Destino --</option>
                    {Object.keys(estructuraGeografica).map(r => Object.keys(estructuraGeografica[r]?.ciudades || {}).map(c => (
                      <option key={estructuraGeografica[r].ciudades[c].id} value={estructuraGeografica[r].ciudades[c].id}>{r} ➔ {c}</option>
                    )))}
                  </select>
                  <input type="text" placeholder="Nombre del HUB / Hotel" value={hubName} onChange={e=>setHubName(e.target.value)} required className="w-full bg-[#1c2541] border border-slate-700 text-xs p-2 rounded text-white" />
                  <input type="text" placeholder="Dirección" value={hubDireccion} onChange={e=>setHubDireccion(e.target.value)} className="w-full bg-[#1c2541] border border-slate-700 text-xs p-2 rounded text-white" />
                  <input type="text" placeholder="GPS" value={hubCoordenadas} onChange={e=>setHubCoordenadas(e.target.value)} className="w-full bg-[#1c2541] border border-slate-700 text-xs p-2 rounded text-amber-500 font-mono" />
                  
                  <div className="flex gap-2">
                    <button type="submit" className="w-full bg-amber-600 hover:bg-amber-500 text-white text-xs py-2 rounded font-semibold cursor-pointer transition-colors">{idHubEditando ? 'Guardar Cambios' : 'Guardar HUB'}</button>
                    {idHubEditando && <button type="button" onClick={handleCancelarEdicionHub} className="w-full bg-slate-700 hover:bg-slate-600 text-white text-xs py-2 rounded font-semibold cursor-pointer transition-colors">Cancelar</button>}
                  </div>
                </form>

                {/* LISTADO HUBS GLOBAL E INDEPENDIENTE */}
                <div className="border-t border-slate-800 pt-3 mt-3 flex-1 flex flex-col min-h-[200px] overflow-hidden">
                  <h4 className="text-[10px] font-bold text-slate-500 uppercase mb-2 shrink-0">Directorio de HUBs</h4>
                  
                  {/* BARRAS DE BÚSQUEDA */}
                  <div className="space-y-2 mb-2 shrink-0">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1.5" />
                      <input type="text" placeholder="Buscar por ciudad..." value={filtroBusquedaHubCiudad} onChange={e=>setFiltroBusquedaHubCiudad(e.target.value)} className="w-full bg-[#050814] border border-slate-800 text-xs py-1.5 pl-8 pr-2 rounded text-slate-300 focus:outline-none focus:border-amber-500 transition-colors" />
                    </div>
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1.5" />
                      <input type="text" placeholder="Buscar por nombre de HUB..." value={filtroBusquedaHub} onChange={e=>setFiltroBusquedaHub(e.target.value)} className="w-full bg-[#050814] border border-slate-800 text-xs py-1.5 pl-8 pr-2 rounded text-slate-300 focus:outline-none focus:border-amber-500 transition-colors" />
                    </div>
                  </div>
                  
                  {/* LISTA RENDERIZADA */}
                  <div className="flex-1 overflow-y-auto space-y-1.5 custom-scrollbar pr-1">
                    {todosLosHubsGlobal
                      .filter(h => 
                         (filtroBusquedaHubCiudad === '' || h.nombreCiudad.toLowerCase().includes(filtroBusquedaHubCiudad.toLowerCase())) &&
                         (filtroBusquedaHub === '' || h.nombre.toLowerCase().includes(filtroBusquedaHub.toLowerCase()) || h.id.toLowerCase().includes(filtroBusquedaHub.toLowerCase()))
                      )
                      .map(h => (
                      <div key={h.id} className="bg-slate-950/60 p-2 rounded text-[11px] flex justify-between items-center group border border-slate-800/50 hover:border-amber-900/50 transition-colors">
                        <div className="flex flex-col truncate pr-2">
                          <span className="font-bold text-amber-400 truncate">{h.nombre}</span>
                          <span className="text-[9px] text-slate-500 font-mono truncate">{h.nombreCiudad}</span>
                        </div>
                        <div className="flex gap-1.5 shrink-0">
                          <button type="button" onClick={() => handleActivarModoEdicionHub(h, h.idCiudad)} title="Editar HUB" className="p-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded transition-colors cursor-pointer">
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button type="button" onClick={() => handleEliminarHub(h.id, h.nombre)} title="Eliminar HUB" className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded transition-colors cursor-pointer">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                    {todosLosHubsGlobal.length > 0 && todosLosHubsGlobal.filter(h => (filtroBusquedaHubCiudad === '' || h.nombreCiudad.toLowerCase().includes(filtroBusquedaHubCiudad.toLowerCase())) && (filtroBusquedaHub === '' || h.nombre.toLowerCase().includes(filtroBusquedaHub.toLowerCase()) || h.id.toLowerCase().includes(filtroBusquedaHub.toLowerCase()))).length === 0 && (
                       <div className="text-center text-slate-600 text-xs italic py-4">No hay resultados que coincidan.</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </main>
        )}

        {/* 📤 PESTAÑA: CARGA MASIVA EXCEL */}
        {tabActiva === 'carga_excel' && puedeCargar && (
          <main className="flex-1 p-6 space-y-6 overflow-y-auto">
            <div className="border-b border-slate-800 pb-2"><h2 className="text-base font-bold text-white flex items-center gap-2"><FileSpreadsheet className="w-5 h-5 text-emerald-400" /> Aprovisionamiento Masivo de Inventario Óptico</h2></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#0b132b]/50 border border-slate-800 rounded-xl p-5 space-y-4">
                <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">1. Nodo Central Destino</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] text-slate-500 flex items-center mb-1">Región {!cargaReg && <span className="text-red-400 font-bold ml-1.5">(⚠️ REQUERIDO)</span>}</label>
                    <select 
                      value={cargaReg} 
                      onChange={(e) => {
                        setCargaReg(e.target.value);
                        setCargaCd('');
                        setCargaHub('');
                      }} 
                      className={`w-full bg-[#1c2541] border text-xs p-2 rounded text-slate-200 transition-colors ${!cargaReg ? 'border-red-500/80 focus:border-red-500 focus:ring-1 focus:ring-red-500' : 'border-slate-700'}`}
                    >
                      <option value="">-- SELECCIONE UNA REGIÓN --</option>
                      {Object.keys(estructuraGeografica).map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                  
                  <div>
                    <label className="text-[10px] text-slate-500 flex items-center mb-1">Ciudad {!cargaCd && <span className="text-red-400 font-bold ml-1.5">(⚠️ REQUERIDO)</span>}</label>
                    <select 
                      value={cargaCd} 
                      onChange={(e) => {
                        setCargaCd(e.target.value);
                        setCargaHub('');
                      }} 
                      disabled={!cargaReg}
                      className={`w-full bg-[#1c2541] border text-xs p-2 rounded text-slate-200 transition-colors ${!cargaCd ? 'border-red-500/80 focus:border-red-500 focus:ring-1 focus:ring-red-500' : 'border-slate-700'} disabled:opacity-50`}
                    >
                      <option value="">-- SELECCIONE UNA CIUDAD --</option>
                      {cargaReg && obtenerCiudadesOrdenadas(cargaReg).map(c => <option key={c.id} value={c.nombre}>{c.nombre}</option>)}
                    </select>
                  </div>
                  
                  <div>
                    <label className="text-[10px] text-slate-500 flex items-center mb-1">HUB Activo {!cargaHub && <span className="text-red-400 font-bold ml-1.5">(⚠️ REQUERIDO)</span>}</label>
                    <select 
                      value={cargaHub} 
                      onChange={(e) => setCargaHub(e.target.value)}
                      disabled={!cargaCd}
                      className={`w-full bg-[#1c2541] border text-xs p-2 rounded font-bold font-mono transition-colors ${!cargaHub ? 'border-red-500/80 text-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500' : 'border-slate-700 text-blue-400'} disabled:opacity-50`}
                    >
                      <option value="">-- SELECCIONE UN HUB --</option>
                      {(estructuraGeografica[cargaReg]?.ciudades?.[cargaCd]?.hubs || []).map(h => <option key={h.id} value={h.id}>{h.nombre}</option>)}
                    </select>
                  </div>
                </div>
              </div>
              <div className="md:col-span-2 bg-[#0b132b]/20 border border-slate-800 rounded-xl p-8 flex flex-col justify-center items-center text-center">
                {cargaReg && cargaCd && cargaHub ? (
                  <div className="max-w-md space-y-6">
                    <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-400 mx-auto shadow-lg"><UploadCloud className={`w-8 h-8 ${subiendoExcel ? 'animate-bounce' : ''}`} /></div>
                    <div>
                      <h3 className="text-base font-bold text-white">Subir archivo de Excel al HUB <span className="font-bold text-emerald-400">[{estructuraGeografica[cargaReg]?.ciudades?.[cargaCd]?.hubs.find(h => h.id === cargaHub)?.nombre || cargaHub}]</span></h3>
                      <p className="text-xs text-slate-400 mt-2">El motor inyectará todas las columnas y preservará la metadata de ingeniería en la base de datos MT_DB.</p>
                    </div>
                    <label className={`w-full flex flex-col items-center justify-center px-4 py-6 border border-dashed rounded-xl cursor-pointer transition-all ${subiendoExcel ? 'bg-amber-500/5 border-amber-500/40 text-amber-400 pointer-events-none' : 'bg-slate-950 border-slate-800 hover:bg-slate-900/60 text-slate-300'}`}>
                      <span className="text-xs font-bold uppercase tracking-wider">{subiendoExcel ? '⚙️ Inyectando filas en MT_DB...' : '📁 Seleccionar Archivo .xlsx / .xls'}</span>
                      <input type="file" accept=".xlsx, .xls" disabled={subiendoExcel} onChange={async (e) => {
                        const file = e.target.files[0]; if (!file) return;
                        const hubObj = estructuraGeografica[cargaReg]?.ciudades?.[cargaCd]?.hubs.find(h => h.id === cargaHub);
                        const nombreHubVisual = hubObj?.nombre || cargaHub;
                        const continuar = window.confirm(`⚠️ ALERTA DE REESCRITURA DE DATOS ⚠️\n\n¿Estás seguro de que deseas cargar el archivo "${file.name}"?\n\nEsta acción ELIMINARÁ por completo el inventario existente del HUB [${nombreHubVisual}].`);
                        if (!continuar) { e.target.value = ''; return; }

                        setSubiendoExcel(true); const formData = new FormData(); formData.append('file', file);
                        try {
                          const res = await fetch(`http://127.0.0.1:8000/api/hubs/upload-excel?id_hub=${cargaHub}`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` }, body: formData });
                          if (res.status === 401) { handleLogout(); return; }
                          const data = await res.json(); alert(data.detail); if (res.ok) await cargarDatosSistemas(); 
                        } catch { alert("Error inyectando inventario."); } finally { setSubiendoExcel(false); e.target.value = ''; }
                      }} className="hidden" />
                    </label>
                  </div>
                ) : (
                  <div className="text-xs text-red-400/80 italic flex flex-col items-center gap-2">
                    <span className="text-2xl">⚠️</span>
                    {(!cargaReg || !cargaCd) 
                      ? "Selecciona la Región y Ciudad para comenzar."
                      : "Selecciona un HUB específico en el panel izquierdo para habilitar la carga masiva."
                    }
                  </div>
                )}
              </div>
            </div>
          </main>
        )}

        {/* 👥 PESTAÑA: USUARIOS */}
        {tabActiva === 'usuarios' && esAdmin && (
          <main className="flex-1 p-6 space-y-6 overflow-y-auto">
            <div className="border-b border-slate-800 pb-2"><h2 className="text-base font-bold text-white flex items-center gap-2"><Users className="w-5 h-5 text-purple-400" /> Control de Accesos Console</h2></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              
              {/* PANEL IZQUIERDO: FORMULARIO */}
              <div className="md:col-span-1 bg-[#0b132b]/50 border border-slate-800 rounded-xl p-5 space-y-4">
                <form onSubmit={handleProcesarUsuario} className="space-y-3" autoComplete="off">
                  <h3 className="text-xs font-bold text-purple-400 uppercase tracking-wider border-b border-slate-800 pb-2">{idUserEditando ? '✏️ Editar Operador' : '➕ Nuevo Operador'}</h3>
                  
                  {/* NUEVO INPUT OBLIGATORIO */}
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-1">Nombre Completo *</label>
                    <input type="text" value={newNombreCompleto} onChange={e => setNewNombreCompleto(e.target.value)} required className="w-full bg-[#1c2541] border border-slate-700 text-xs p-2 rounded text-white focus:outline-none focus:border-blue-500" placeholder="Ej. Juan Pérez" />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-slate-500 block mb-1">Username *</label>
                      <input type="text" value={newUsername} onChange={e => setNewUsername(e.target.value)} required autoComplete="off" data-lpignore="true" className="w-full bg-[#1c2541] border border-slate-700 text-xs p-2 rounded text-white focus:outline-none focus:border-blue-500" />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 block mb-1">Contraseña *</label>
                      <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required={!idUserEditando} placeholder={idUserEditando ? "Opcional" : "Obligatorio"} autoComplete="new-password" data-lpignore="true" className="w-full bg-[#1c2541] border border-slate-700 text-xs p-2 rounded text-white focus:outline-none focus:border-blue-500" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-slate-500 block mb-1">No. Empleado *</label>
                      <input type="text" value={newNumEmpleado} onChange={e => setNewNumEmpleado(e.target.value)} required className="w-full bg-[#1c2541] border border-slate-700 text-xs p-2 rounded text-white focus:outline-none focus:border-blue-500" />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 block mb-1">Rol Sistema *</label>
                      <select value={newRole} onChange={e => setNewRole(e.target.value)} required className="w-full bg-[#1c2541] border border-slate-700 text-xs p-2 rounded text-white focus:outline-none focus:border-blue-500">
                        <option value="">Seleccione...</option>
                        <option value="RNOC">RNOC (Solo Lectura - Inv)</option>
                        <option value="MCM NOC">MCM NOC (Lectura/Escritura - Inv)</option>
                        <option value="MCM INGENIERIA">MCM INGENIERIA (L/E Inv + Carga Excel)</option>
                        <option value="ADMIN">ADMIN (Superusuario)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-500 block mb-1">Correo Electrónico *</label>
                    <input type="email" value={newCorreo} onChange={e => setNewCorreo(e.target.value)} required className="w-full bg-[#1c2541] border border-slate-700 text-xs p-2 rounded text-white focus:outline-none focus:border-blue-500" />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-slate-500 block mb-1">Área Org. *</label>
                      <input type="text" value={newArea} onChange={e => setNewArea(e.target.value)} required className="w-full bg-[#1c2541] border border-slate-700 text-xs p-2 rounded text-white focus:outline-none focus:border-blue-500" />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 block mb-1">Puesto *</label>
                      <input type="text" value={newPuesto} onChange={e => setNewPuesto(e.target.value)} required className="w-full bg-[#1c2541] border border-slate-700 text-xs p-2 rounded text-white focus:outline-none focus:border-blue-500" />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-500 block mb-1">Región Asignada (RRHH) *</label>
                    <input type="text" value={newRegionUsuario} onChange={e => setNewRegionUsuario(e.target.value)} required className="w-full bg-[#1c2541] border border-slate-700 text-xs p-2 rounded text-white focus:outline-none focus:border-blue-500" />
                  </div>
                  
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-1">Visibilidad de Ciudades *</label>
                    <div className={`bg-[#1c2541] border ${newPlazas.length === 0 ? 'border-red-500' : 'border-slate-700'} rounded p-2 max-h-40 overflow-y-auto space-y-2`}>
                      <label className="flex items-center gap-2 text-xs text-slate-200 cursor-pointer hover:bg-slate-800/50 p-1 rounded transition-colors">
                        <input type="checkbox" checked={newPlazas.includes('*')} onChange={(e) => {
                          if(e.target.checked) setNewPlazas(['*']);
                          else setNewPlazas([]);
                        }} className="accent-amber-500" />
                        <span className="font-bold text-amber-400">ACCESO GLOBAL (*)</span>
                      </label>
                      <div className="border-t border-slate-700 my-1"></div>
                      
                      {Object.keys(estructuraGeografica).map(r => (
                        <div key={r} className="ml-1 space-y-1">
                          <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">{r}</span>
                          <div className="ml-2 flex flex-col gap-0.5">
                            {obtenerCiudadesOrdenadas(r).map(c => {
                              const cityId = String(c.id);
                              return (
                                <label key={cityId} className={`flex items-center gap-2 text-[11px] cursor-pointer hover:bg-slate-800/50 p-1 rounded transition-colors ${newPlazas.includes('*') ? 'text-slate-500 opacity-50' : 'text-slate-300'}`}>
                                  <input type="checkbox" 
                                    checked={newPlazas.includes(cityId) && !newPlazas.includes('*')} 
                                    disabled={newPlazas.includes('*')}
                                    onChange={(e) => {
                                      if(e.target.checked) {
                                        setNewPlazas(prev => [...prev.filter(p => p !== '*'), cityId]);
                                      } else {
                                        setNewPlazas(prev => prev.filter(p => p !== cityId));
                                      }
                                    }} 
                                    className="accent-blue-500"
                                  />
                                  {c.nombre} <span className="text-[9px] text-slate-500 font-mono">({cityId})</span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {idUserEditando ? (
                    <div className="flex gap-2 mt-2">
                      <button type="submit" disabled={newPlazas.length === 0} className="flex-1 bg-purple-600 hover:bg-purple-500 text-white text-xs py-2 rounded font-semibold cursor-pointer transition-colors disabled:opacity-50">Actualizar</button>
                      <button type="button" onClick={cancelarEdicionUser} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white text-xs py-2 rounded font-semibold cursor-pointer transition-colors">Cancelar</button>
                    </div>
                  ) : (
                    <button type="submit" disabled={newPlazas.length === 0} className="w-full bg-purple-600 hover:bg-purple-500 text-white text-xs py-2 rounded font-semibold cursor-pointer transition-colors mt-2 disabled:opacity-50">Registrar Nuevo Usuario</button>
                  )}
                </form>
              </div>

              {/* PANEL DERECHO: TABLA */}
              <div className="md:col-span-3 bg-[#0b132b]/30 border border-slate-800 rounded-xl p-5 flex flex-col space-y-4">
                <div className="flex justify-between items-center bg-slate-950/60 border border-slate-800 px-4 py-2 rounded-xl">
                  <div className="flex items-center gap-3 w-full">
                    <Search className="w-4 h-4 text-slate-500" />
                    <input type="text" placeholder="Filtrar por usuario o número de empleado..." value={filtroUserTexto} onChange={e => setFiltroUserTexto(e.target.value)} className="bg-transparent text-sm text-white focus:outline-none w-full" />
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <div className="inline-block min-w-full overflow-hidden align-middle">
                    <div className="overflow-y-auto max-h-[500px] border border-slate-800 rounded-lg">
                      <table className="min-w-full text-xs text-left whitespace-nowrap">
                        <thead className="bg-[#0b132b] text-slate-500 border-b border-slate-800 sticky top-0 z-10">
                          <tr>
                            <th className="p-3 font-bold">Username</th>
                            <th className="p-3 font-bold">Role</th>
                            <th className="p-3 font-bold">No. Empleado</th>
                            <th className="p-3 font-bold">Área / Puesto</th>
                            <th className="p-3 font-bold">Visibilidad Ciudades</th>
                            <th className="p-3 font-bold text-right sticky right-0 bg-[#0b132b]">Acciones</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                          {usuariosFiltrados.map(u => {
                            const uRole = String(u.role).trim().toUpperCase();
                            const isUserAdmin = u.username.toLowerCase() === 'admin' || uRole === 'ADMIN';
                            
                            return (
                              <tr key={u.id} className="hover:bg-slate-900/30">
                                <td className="p-3 font-medium text-slate-200">
                                  {/* MOSTRAR NOMBRE Y USERNAME */}
                                  <div className="font-bold text-white">{u.nombre_completo || 'Sin nombre'}</div>
                                  <div className="text-[10px] text-slate-400">@{u.username}</div>
                                  {u.correo && <div className="text-[9px] text-slate-500 mt-0.5">{u.correo}</div>}
                                </td>
                                <td className="p-3">
                                  <span className={`px-2 py-0.5 rounded text-[10px] ${
                                    isUserAdmin ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 
                                    uRole === 'MCM INGENIERIA' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                                    uRole === 'MCM NOC' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 
                                    'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                                  }`}>
                                    {uRole}
                                  </span>
                                </td>
                                <td className="p-3 text-slate-400 font-mono">{u.num_empleado || '-'}</td>
                                <td className="p-3 text-slate-300">
                                  {u.area_org || '-'}
                                  {u.puesto && <div className="text-[10px] text-slate-500 mt-0.5">{u.puesto}</div>}
                                </td>
                                <td className="p-3 text-[10px] text-slate-400">
                                  <div className="max-w-[150px] truncate" title={obtenerNombresPlazas(u.plazas)}>
                                    {obtenerNombresPlazas(u.plazas)}
                                  </div>
                                </td>
                                <td className="p-3 text-right sticky right-0 bg-transparent backdrop-blur-sm">
                                  <div className="flex justify-end gap-1.5">
                                    <button type="button" onClick={() => handleActivarModoEdicionUser(u)} title="Editar Usuario" className="p-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded transition-colors cursor-pointer">
                                      <Edit className="w-5 h-5" />
                                    </button>
                                    <button type="button" onClick={() => handleEliminarUsuario(u.id, u.username)} disabled={usuario?.username === u.username} title="Eliminar Usuario" className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded transition-colors cursor-pointer disabled:opacity-20">
                                      <Trash2 className="w-5 h-5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        )}

      </div>

      {/* ================= MODAL DESPLIEGUE DE FALLA (FLOTANTE) ================= */}
      {mostrarModalFalla && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
           <div className="bg-[#0b132b] border border-slate-700 rounded-xl shadow-2xl w-full max-w-5xl flex flex-col max-h-[90vh]">
              
              <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 rounded-t-xl shrink-0">
                 <h2 className="text-lg font-black text-red-400 flex items-center gap-2">
                   <AlertTriangle className="w-5 h-5" /> DESPLIEGUE DE FALLA (RNOC)
                 </h2>
                 <button onClick={() => setMostrarModalFalla(false)} className="text-slate-500 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors cursor-pointer">
                   <X className="w-5 h-5" />
                 </button>
              </div>

              <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
                 {/* PANEL IZQUIERDO: LLENADO MANUAL */}
                 <div className="w-full md:w-1/2 p-5 overflow-y-auto space-y-4 border-r border-slate-800 custom-scrollbar">
                    <div className="space-y-4">
                       <h3 className="text-[11px] font-bold text-red-300 uppercase tracking-widest border-b border-red-900/30 pb-2">Captura Manual</h3>
                       
                       <div className="grid grid-cols-2 gap-3">
                          <div className="col-span-2">
                            <label className="text-[10px] text-slate-500 font-bold block mb-1">OPERADOR RNOC</label>
                            <input type="text" value={fallaOperador} onChange={e=>setFallaOperador(e.target.value)} placeholder="EJ. ELIZABETH RUGERIO" className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-white outline-none focus:border-red-500" />
                          </div>
                          <div>
                            <label className="text-[10px] text-slate-500 font-bold block mb-1">TT (Ticket)</label>
                            <input type="text" value={fallaTT} onChange={e=>setFallaTT(e.target.value)} placeholder="Ej. 11947829" className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-white focus:border-red-500 outline-none" />
                          </div>
                          <div>
                            <label className="text-[10px] text-slate-500 font-bold block mb-1">OT</label>
                            <input type="text" value={fallaOT} onChange={e=>setFallaOT(e.target.value)} placeholder="Ej. 18220" className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-white focus:border-red-500 outline-none" />
                          </div>
                       </div>

                       <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] text-slate-500 font-bold block mb-1">Equipo Energizado</label>
                            <select value={fallaEnergizado} onChange={e=>setFallaEnergizado(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-white outline-none focus:border-red-500">
                              <option value="SI">SI</option>
                              <option value="NO">NO</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-[10px] text-slate-500 font-bold block mb-1">Alarmas en Equipos</label>
                            <select value={fallaAlarmasEq} onChange={e=>setFallaAlarmasEq(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-white outline-none focus:border-red-500">
                              <option value="SI">SI</option>
                              <option value="NO">NO</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-[10px] text-slate-500 font-bold block mb-1">Conexiones Correctas</label>
                            <select value={fallaConexiones} onChange={e=>setFallaConexiones(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-white outline-none focus:border-red-500">
                              <option value="SI">SI</option>
                              <option value="NO">NO</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-[10px] text-slate-500 font-bold block mb-1">Status Puerto</label>
                            <select value={fallaStatusPuerto} onChange={e=>setFallaStatusPuerto(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-white outline-none focus:border-red-500">
                              <option value="UP">UP</option>
                              <option value="DOWN">DOWN</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-[10px] text-slate-500 font-bold block mb-1">Ping exitoso a CPE</label>
                            <select value={fallaPing} onChange={e=>setFallaPing(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-white outline-none focus:border-red-500">
                              <option value="SI">SI</option>
                              <option value="NO">NO</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-[10px] text-slate-500 font-bold block mb-1">Accesos</label>
                            <select value={fallaAccesosSel} onChange={e=>setFallaAccesosSel(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-white outline-none focus:border-red-500">
                              <option value="SI">SI</option>
                              <option value="NO">NO</option>
                            </select>
                          </div>                          
                       </div>
                     <div>
                          <label className="text-[10px] text-slate-500 font-bold block mb-1">INFORMACIÓN ADICIONAL</label>
                          <textarea rows="2" value={fallaInfo} onChange={e=>setFallaInfo(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-white focus:border-red-500 outline-none resize-none" placeholder="COMENTARIOS ADICIONALES..." />
                       </div>


                    </div>
                 </div>
                 
                 {/* PANEL DERECHO: VISTA PREVIA (SE LLENA AUTOMÁTICO) */}
                 <div className="w-full md:w-1/2 p-5 bg-[#050814] overflow-y-auto custom-scrollbar flex flex-col relative">
                    <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-800 pb-2 mb-3 shrink-0 flex justify-between">
                      <span>Vista Previa del Reporte</span>
                      <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">Auto-Calculado</span>
                    </h3>
                    
                    <pre className="text-[11px] leading-relaxed text-slate-300 font-mono whitespace-pre-wrap flex-1 bg-transparent selection:bg-red-900/50">
                       {generarTextoFalla()}
                    </pre>
                 </div>
              </div>
              
              <div className="p-4 border-t border-slate-800 bg-slate-900/50 rounded-b-xl flex justify-end gap-3 shrink-0">
                 <button onClick={() => setMostrarModalFalla(false)} className="px-5 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition-colors cursor-pointer">
                   CANCELAR
                 </button>
                 <button onClick={handleCopiarFalla} className="px-5 py-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-xs font-bold text-white transition-colors flex items-center gap-2 shadow-lg shadow-red-900/20 cursor-pointer">
                   <Copy className="w-4 h-4" /> COPIAR TEXTO
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* ================= MODAL VISUALIZACIÓN DE FICHA ================= */}
      {mostrarModalVisualizar && puertoDetalle && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-[#0b132b] border border-slate-700 rounded-xl shadow-2xl w-full max-w-4xl flex flex-col max-h-[90vh]">
            
            {/* CABECERA DEL MODAL */}
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 rounded-t-xl shrink-0">
              <h2 className="text-lg font-black text-blue-400 flex items-center gap-2">
                <Eye className="w-5 h-5" /> INFORMACIÓN DE PUERTO: {puertoDetalle.EQUIPO_HOTEL_ID} - {puertoDetalle.PUERTO}
              </h2>
              <button onClick={() => setMostrarModalVisualizar(false)} className="text-slate-500 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* CONTENIDO DEL MODAL (GRID DE DATOS) */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar text-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                
                <div className="space-y-3 bg-[#050814] p-4 rounded-lg border border-slate-800/60 shadow-inner">
                  <h4 className="text-blue-500 font-bold border-b border-slate-800 pb-1 text-[11px] uppercase tracking-wider">General</h4>
                  <div><span className="text-slate-500 text-[10px] block font-bold">ESTATUS</span><span className="text-slate-200 font-mono font-bold">{puertoDetalle.ESTATUS || '-'}</span></div>
                  <div><span className="text-slate-500 text-[10px] block font-bold">EQUIPO ID</span><span className="text-slate-200 font-mono">{puertoDetalle.EQUIPO_HOTEL_ID || '-'}</span></div>
                  <div><span className="text-slate-500 text-[10px] block font-bold">CLIENTE / SERVICIO</span><span className="text-slate-200">{puertoDetalle.SERVICIO || '-'}</span></div>
                </div>

                <div className="space-y-3 bg-[#050814] p-4 rounded-lg border border-slate-800/60 shadow-inner">
                  <h4 className="text-blue-500 font-bold border-b border-slate-800 pb-1 text-[11px] uppercase tracking-wider">Red Lógica</h4>
                  <div><span className="text-slate-500 text-[10px] block font-bold">IP HUB / GESTIÓN / CLIENTE</span><span className="text-slate-200 font-mono text-xs">{puertoDetalle.IP_HUB || '-'} / {puertoDetalle.IP_GESTION || '-'} / {puertoDetalle.IP_CLIENTE || '-'}</span></div>
                  <div><span className="text-slate-500 text-[10px] block font-bold">ANCHO DE BANDA</span><span className="text-slate-200 font-mono">{puertoDetalle.MBPS || '0'} Mbps</span></div>
                  <div><span className="text-slate-500 text-[10px] block font-bold">BDI</span><span className="text-slate-200 font-mono">{puertoDetalle.BDI || '-'}</span></div>
                </div>

                <div className="space-y-3 bg-[#050814] p-4 rounded-lg border border-slate-800/60 shadow-inner">
                  <h4 className="text-blue-500 font-bold border-b border-slate-800 pb-1 text-[11px] uppercase tracking-wider">Planta Externa / Óptica</h4>
                  <div><span className="text-slate-500 text-[10px] block font-bold">POTENCIA HUB / CPE</span><span className="text-amber-400 font-mono">{puertoDetalle.POTENCIA_HUB || '-'} / {puertoDetalle.POTENCIA_CPE || '-'}</span></div>
                  <div><span className="text-slate-500 text-[10px] block font-bold">HILOS / LAMBDAS</span><span className="text-slate-200 font-mono">{puertoDetalle.HILOS || '-'} / {puertoDetalle.LAMBDAS || '-'}</span></div>
                  <div><span className="text-slate-500 text-[10px] block font-bold">DISTANCIA CLIENTE</span><span className="text-slate-200 font-mono">{puertoDetalle.DISTANCIA_CLIENTE || '-'}</span></div>
                </div>

                <div className="space-y-3 bg-[#050814] p-4 rounded-lg border border-slate-800/60 shadow-inner md:col-span-2 lg:col-span-3">
                  <h4 className="text-blue-500 font-bold border-b border-slate-800 pb-1 text-[11px] uppercase tracking-wider">Ubicación y Equipamiento</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-slate-500 text-[10px] block font-bold">DIRECCIÓN</span>
                      <span className="text-slate-200">{puertoDetalle.DIRECCION || '-'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block font-bold">COORDENADAS</span>
                      <span className="text-amber-500 font-mono">{puertoDetalle.COORDENADAS || '-'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block font-bold">EQUIPO CPE (MARCA / MODELO / SERIE)</span>
                      <span className="text-slate-200 font-mono">{puertoDetalle.MARCA_CPE || '-'} / {puertoDetalle.MODELO_CPE || '-'} / {puertoDetalle.SERIE_CPE || '-'}</span>
                    </div>
                    {/* NUEVO BLOQUE DE CONTACTO PARA EL MODAL */}
                    <div>
                      <span className="text-slate-500 text-[10px] block font-bold">CONTACTO DEL CLIENTE</span>
                      <span className="text-slate-200">{puertoDetalle.CONTACTO_NOMBRE || '-'} {puertoDetalle.CONTACTO_TELEFONO ? `(${puertoDetalle.CONTACTO_TELEFONO})` : ''}</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3 bg-[#050814] p-4 rounded-lg border border-slate-800/60 shadow-inner md:col-span-2 lg:col-span-3">
                  <h4 className="text-blue-500 font-bold border-b border-slate-800 pb-1 text-[11px] uppercase tracking-wider">Comentarios Operativos</h4>
                  <p className="text-slate-300 italic">{puertoDetalle.COMENTARIOS || 'Sin comentarios registrados.'}</p>
                </div>
              </div>
            </div>

            {/* PIE DEL MODAL */}
            <div className="p-4 border-t border-slate-800 bg-slate-900/50 rounded-b-xl flex justify-end shrink-0">
              <button onClick={() => setMostrarModalVisualizar(false)} className="px-6 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-xs font-bold text-white transition-colors cursor-pointer">
                CERRAR
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;