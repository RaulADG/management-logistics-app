import { useEffect, useMemo, useState } from 'react';
import './App.css';

type Unit = {
  id: string;
  tipo: string;
  proveedor: string;
  estatus: string;
  loc: string;
};

type RouteTemplate = {
  id: number;
  nombre: string;
  tipo: string;
  paradas: string[];
};

type Confirmation = {
  unidad: string;
  pozo: string;
  parada: string;
  ruta: string;
};

type Stop = {
  nombre: string;
  estatus: string;
  hora: string | null;
  folio: string;
};

type TrackingItem = {
  unidad: string;
  pozo: string;
  proveedor: string;
  tipo: string;
  ubicacion_actual: string;
  progreso: number;
  total_paradas: number;
  etapa: string;
  paradas: Stop[];
};

type BillingRow = {
  unidad: string;
  pozo: string;
  tipo: string;
  dias_sis?: number;
  dias_con?: number;
  tarifa?: number;
  monto_sis?: number;
  monto_fin: number;
  comentario: string;
  estado: string;
  factor_base?: string;
  monto_base?: number;
  hrs_estadia_sis?: number;
  hrs_estadia_con?: number;
  tarifa_estadia?: number;
  monto_estadia?: number;
};

type Provider = {
  id: number;
  nombre: string;
  flota_total: number;
  flota_activa: number;
};

type Well = {
  id: number;
  nombre: string;
  proyecto: string;
  tipo: string;
  unidades_activas: number;
  estatus: string;
};

type Tariff = {
  id: number;
  proveedor: string;
  pozo: string;
  tipo: string;
  factor: string;
  monto: number;
  estatus: string;
};

type User = {
  id: number;
  nombre: string;
  email: string;
  rol: string;
  estatus: string;
};

const UNIT_DATA: Unit[] = [
  { id: 'GND-101', tipo: 'Góndola', proveedor: 'Emcro', estatus: 'Activo', loc: 'Base Emcro' },
  { id: 'GND-102', tipo: 'Góndola', proveedor: 'Emcro', estatus: 'Activo', loc: 'Base Emcro' },
  { id: 'GND-103', tipo: 'Góndola', proveedor: 'NOV', estatus: 'Ocupado', loc: 'Planta Disposición Paraíso' },
  { id: 'GND-104', tipo: 'Góndola', proveedor: 'NOV', estatus: 'Fuera de servicio', loc: 'Base NOV' },
  { id: 'GND-105', tipo: 'Góndola', proveedor: 'Emcro', estatus: 'Activo', loc: 'Base Emcro' },
  { id: 'SLB-BOX-201', tipo: 'CPR', proveedor: 'Schlumberger', estatus: 'Ocupado', loc: 'Plataforma Defender B' },
  { id: 'SLB-BOX-202', tipo: 'CPR', proveedor: 'Schlumberger', estatus: 'Ocupado', loc: 'Muelle TMDB' },
  { id: 'SLB-BOX-203', tipo: 'CPR', proveedor: 'Emcro', estatus: 'Activo', loc: 'Muelle TMDB' },
  { id: 'CAN-301', tipo: 'Canastilla', proveedor: 'NOV', estatus: 'Activo', loc: 'Base NOV' },
  { id: 'CAN-302', tipo: 'Canastilla', proveedor: 'NOV', estatus: 'Sin alta', loc: '—' },
  { id: 'PRES-401', tipo: 'Presurizado', proveedor: 'Schlumberger', estatus: 'Activo', loc: 'Base SLB' },
  { id: 'PRES-402', tipo: 'Presurizado', proveedor: 'Emcro', estatus: 'Ocupado', loc: 'Plataforma Ichalkil-1' },
];

const ROUTE_TEMPLATES: RouteTemplate[] = [
  {
    id: 1,
    nombre: 'Terrestre Standard Góndolas',
    tipo: 'Terrestre',
    paradas: [
      'Base Emcro',
      'Plana de Carga',
      'Pozo Yaxche-40',
      'Planta Disposición Paraíso',
      'Base Emcro',
    ],
  },
  {
    id: 2,
    nombre: 'Marina CPR — Ruta Estándar',
    tipo: 'Marina',
    paradas: [
      'Base Schlumberger',
      'Plana de Carga',
      'Muelle TMDB',
      'Barco Pemex Express',
      'Plataforma Defender A',
      'Barco Pemex Express',
      'Muelle TMDB',
      'Base Schlumberger',
    ],
  },
  {
    id: 3,
    nombre: 'Marina CPR — Ruta Directa',
    tipo: 'Marina',
    paradas: [
      'Base NOV',
      'Muelle TMDB',
      'Plataforma Defender B',
      'Muelle TMDB',
      'Base NOV',
    ],
  },
];

const CONFIRMATIONS_DATA: Confirmation[] = [
  { unidad: 'SLB-BOX-202', pozo: 'Defender A', parada: 'Muelle TMDB', ruta: 'Marina CPR — Ruta Estándar' },
  { unidad: 'SLB-BOX-203', pozo: 'Ichalkil-1', parada: 'Muelle TMDB', ruta: 'Marina CPR — Ruta Directa' },
];

const TRACKING_DATA_INITIAL: TrackingItem[] = [
  {
    unidad: 'SLB-BOX-202',
    pozo: 'Defender A',
    proveedor: 'Schlumberger',
    tipo: 'CPR',
    ubicacion_actual: 'Muelle TMDB',
    progreso: 3,
    total_paradas: 8,
    etapa: 'Etapa 3 — Revestimiento 9 5/8',
    paradas: [
      { nombre: 'Base Schlumberger', estatus: 'Confirmado', hora: '07:30 18/May', folio: 'TR-2024-088' },
      { nombre: 'Plana en Base', estatus: 'Confirmado', hora: '08:15 18/May', folio: 'EMB-5501' },
      { nombre: 'Muelle TMDB', estatus: 'Confirmado', hora: '10:45 18/May', folio: 'PSE-0321' },
      { nombre: 'Barco de Transporte', estatus: 'Pendiente', hora: null, folio: '' },
      { nombre: 'Plataforma Defender A', estatus: 'Pendiente', hora: null, folio: '' },
      { nombre: 'Barco de Retorno', estatus: 'Pendiente', hora: null, folio: '' },
      { nombre: 'Muelle TMDB', estatus: 'Pendiente', hora: null, folio: '' },
      { nombre: 'Base Schlumberger', estatus: 'Pendiente', hora: null, folio: '' },
    ],
  },
  {
    unidad: 'GND-101',
    pozo: 'Yaxche-40',
    proveedor: 'Emcro',
    tipo: 'Góndola',
    ubicacion_actual: 'Pozo Yaxche-40',
    progreso: 3,
    total_paradas: 5,
    etapa: 'Etapa 2 — Perforación 12 1/4',
    paradas: [
      { nombre: 'Base Emcro', estatus: 'Confirmado', hora: '05:30 20/May', folio: 'TR-2024-091' },
      { nombre: 'Plana de Carga', estatus: 'Confirmado', hora: '06:50 20/May', folio: 'TR-2024-091' },
      { nombre: 'Pozo Yaxche-40', estatus: 'Confirmado', hora: '10:15 20/May', folio: 'PSE-0323' },
      { nombre: 'Planta Disposición Paraíso', estatus: 'Pendiente', hora: null, folio: '' },
      { nombre: 'Base Emcro', estatus: 'Pendiente', hora: null, folio: '' },
    ],
  },
];

const BILLING_DATA_INITIAL: BillingRow[] = [
  { unidad: 'GND-101', pozo: 'Yaxche-40', tipo: 'Terrestre', factor_base: 'Call Out', monto_base: 500, hrs_estadia_sis: 4, hrs_estadia_con: 4, tarifa_estadia: 50, monto_estadia: 200, monto_fin: 700, comentario: '', estado: 'OK' },
  { unidad: 'SLB-BOX-202', pozo: 'Defender A', tipo: 'Marina', dias_sis: 18, dias_con: 18, tarifa: 200, monto_sis: 3600, monto_fin: 3600, comentario: '', estado: 'OK' },
  { unidad: 'PRES-401', pozo: 'Pokoch-1', tipo: 'Marina', dias_sis: 20, dias_con: 10, tarifa: 350, monto_sis: 7000, monto_fin: 3500, comentario: 'Descuento 50% por acuerdo comercial', estado: 'Ajustado' },
];

const PROVIDERS_DATA: Provider[] = [
  { id: 1, nombre: 'Emcro', flota_total: 5, flota_activa: 4 },
  { id: 2, nombre: 'NOV', flota_total: 4, flota_activa: 2 },
  { id: 3, nombre: 'Schlumberger', flota_total: 3, flota_activa: 2 },
];

const WELLS_DATA: Well[] = [
  { id: 1, nombre: 'Yaxche-40', proyecto: 'Paquete Sur', tipo: 'Marina', unidades_activas: 2, estatus: 'Activo' },
  { id: 2, nombre: 'Defender A', proyecto: 'Desarrollo Marino Norte', tipo: 'Marina', unidades_activas: 1, estatus: 'Activo' },
  { id: 3, nombre: 'Macuspana-5', proyecto: 'Terrestre Sur', tipo: 'Terrestre', unidades_activas: 0, estatus: 'Inactivo' },
];

const TARIFFS_DATA: Tariff[] = [
  { id: 1, proveedor: 'Emcro', pozo: '*', tipo: 'Góndola', factor: 'Call Out + Estadía', monto: 150, estatus: 'Activa' },
  { id: 2, proveedor: 'NOV', pozo: 'Yaxche-40', tipo: 'Góndola', factor: 'Estadía', monto: 150, estatus: 'Activa' },
  { id: 3, proveedor: 'Schlumberger', pozo: '*', tipo: 'CPR', factor: 'Renta Diaria', monto: 200, estatus: 'Activa' },
];

const USERS_DATA: User[] = [
  { id: 1, nombre: 'Rafael Huerta', email: 'rhuerta@slb.com', rol: 'Logístico SLB', estatus: 'Activo' },
  { id: 2, nombre: 'Ana García', email: 'agarcia@slb.com', rol: 'Admin Financiero', estatus: 'Activo' },
];

const TYPE_ICONS: Record<string, string> = {
  'Góndola': '🚛',
  CPR: '📦',
  Canastilla: '🧺',
  Presurizado: '⚗️',
};

const viewDefaultScreen: Record<string, string> = {
  logistico: 'units',
  operador: 'confirmations',
  financiero: 'analytics',
  gerencia: 'gerencia',
};

function App() {
  const [currentView, setCurrentView] = useState<'logistico' | 'operador' | 'financiero' | 'gerencia'>('logistico');
  const [currentScreen, setCurrentScreen] = useState<string>('units');
  const [providerFilter, setProviderFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUnits, setSelectedUnits] = useState<string[]>([]);
  const [routePreviewId, setRoutePreviewId] = useState<number | null>(null);
  const [dispatchWell, setDispatchWell] = useState('');
  const [dispatchStage, setDispatchStage] = useState('');
  const [confirmations, setConfirmations] = useState<Record<number, { status: string; hora?: string; folio?: string }>>({});
  const [currentTrackingFilter, setCurrentTrackingFilter] = useState('all');
  const [trackingSearch, setTrackingSearch] = useState('');
  const [drawerUnit, setDrawerUnit] = useState<string | null>(null);
  const [toastMessages, setToastMessages] = useState<{ id: number; msg: string; type: 'success' | 'error' | 'info' }[]>([]);
  const [billingData] = useState<BillingRow[]>(BILLING_DATA_INITIAL);

  useEffect(() => {
    setCurrentScreen(viewDefaultScreen[currentView]);
  }, [currentView]);

  const filteredUnits = useMemo(() => {
    return UNIT_DATA.filter((unit) => {
      return (
        (!providerFilter || unit.proveedor === providerFilter) &&
        (!typeFilter || unit.tipo === typeFilter) &&
        (!statusFilter || unit.estatus === statusFilter) &&
        (!searchTerm || unit.id.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    });
  }, [providerFilter, typeFilter, statusFilter, searchTerm]);

  const trackingData = useMemo(() => {
    return TRACKING_DATA_INITIAL.filter((item) => {
      const matchesTab = currentTrackingFilter === 'all' || item.pozo === currentTrackingFilter;
      const q = trackingSearch.trim().toLowerCase();
      const matchesSearch =
        !q ||
        item.unidad.toLowerCase().includes(q) ||
        item.pozo.toLowerCase().includes(q) ||
        item.proveedor.toLowerCase().includes(q) ||
        item.tipo.toLowerCase().includes(q) ||
        item.ubicacion_actual.toLowerCase().includes(q) ||
        item.etapa.toLowerCase().includes(q);
      return matchesTab && matchesSearch;
    });
  }, [currentTrackingFilter, trackingSearch]);

  const routePreview = routePreviewId != null ? ROUTE_TEMPLATES.find((r) => r.id === routePreviewId) : null;

  const showToast = (msg: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToastMessages((prev) => [...prev, { id: Date.now(), msg, type }]);
  };

  useEffect(() => {
    if (!toastMessages.length) return;
    const timer = window.setTimeout(() => {
      setToastMessages((prev) => prev.slice(1));
    }, 3500);
    return () => window.clearTimeout(timer);
  }, [toastMessages]);

  const toggleUnit = (id: string) => {
    setSelectedUnits((prev) => {
      return prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
    });
  };

  const confirmDispatch = () => {
    if (!dispatchWell) {
      showToast('Selecciona un Pozo de Referencia', 'error');
      return;
    }
    if (!routePreviewId) {
      showToast('Selecciona una Plantilla de Ruta', 'error');
      return;
    }
    showToast('Despacho confirmado', 'success');
    setSelectedUnits([]);
    setCurrentScreen('tracking');
  };

  const confirmArrival = (index: number) => {
    const hora = new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }) + ' ' + new Date().toLocaleDateString('es-MX', { day: '2-digit', month: 'short' });
    setConfirmations((prev) => ({ ...prev, [index]: { status: 'guardado', hora, folio: prev[index]?.folio || '' } }));
    showToast(`Llegada confirmada para ${CONFIRMATIONS_DATA[index].unidad}`, 'success');
  };

  const clearSelection = () => setSelectedUnits([]);

  const unitBadgeClass = (estatus: string) => {
    if (estatus === 'Activo') return 'badge-activo';
    if (estatus === 'Ocupado') return 'badge-ocupado';
    if (estatus === 'Fuera de servicio') return 'badge-fuera';
    return 'badge-sinalta';
  };

  const renderTrackingCard = (item: TrackingItem) => {
    const pct = Math.round((item.progreso / item.total_paradas) * 100);
    const q = trackingSearch.trim().toLowerCase();
    const unitLabel = q && item.unidad.toLowerCase().includes(q) ? (
      <span dangerouslySetInnerHTML={{ __html: item.unidad.replace(new RegExp(`(${q})`, 'gi'), '<mark style="background:rgba(0,215,233,0.25);color:var(--accent);border-radius:2px;padding:0 2px">$1</mark>') }} />
    ) : (
      item.unidad
    );
    const nextStop = item.paradas.find((p) => p.estatus === 'Pendiente');

    return (
      <div key={item.unidad} className="tracking-card">
        <div className="tracking-unit-id">{unitLabel}</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
          <span className={`unit-type-chip ${item.tipo === 'Góndola' ? 'chip-gondola' : item.tipo === 'CPR' ? 'chip-cpr' : item.tipo === 'Canastilla' ? 'chip-canastilla' : 'chip-presurizado'}`}>{TYPE_ICONS[item.tipo]} {item.tipo}</span>
          <span style={{ fontSize: 11, color: 'var(--text2)' }}>{item.proveedor}</span>
        </div>
        <div className="tracking-location">📍 {item.ubicacion_actual}</div>
        <div style={{ fontSize: 10, color: 'var(--text3)', marginBottom: 10 }}>{item.etapa}</div>
        <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 10 }}>⏭ Próxima: <span style={{ color: 'var(--text2)' }}>{nextStop?.nombre || 'Ciclo completado'}</span></div>
        <div className="progress-wrap">
          <div className="progress-label">
            <span style={{ fontSize: 11 }}>Progreso</span>
            <span style={{ fontFamily: 'Fira Code, monospace', fontSize: 11 }}>{item.progreso}/{item.total_paradas} <span style={{ color: pct >= 80 ? 'var(--success)' : pct >= 40 ? 'var(--accent)' : 'var(--text3)' }}>({pct}%)</span></span>
          </div>
          <div className="progress-bar-bg">
            <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
          </div>
        </div>
        <div className="tracking-actions">
          <button className="btn btn-ghost" onClick={() => setDrawerUnit(item.unidad)}>🔍 Detalle</button>
        </div>
      </div>
    );
  };

  const totalBilling = billingData.reduce((sum, row) => sum + row.monto_fin, 0);

  return (
    <div className="app-shell">
      <div className="top-bar" />
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="slb-brand">SLB</div>
          <div className="sys-name">WLCS — Well Logistics Control</div>
        </div>

        <div className="view-selector">
          <label>Vista activa</label>
          <select value={currentView} onChange={(e) => setCurrentView(e.target.value as any)}>
            <option value="logistico">👷 Logístico SLB</option>
            <option value="operador">📱 Operador en Campo</option>
            <option value="financiero">💼 Admin Financiero</option>
            <option value="gerencia">👔 Gerencia</option>
          </select>
        </div>

        <nav className="nav-items">
          {[
            { id: 'units', label: 'Unidades', views: ['logistico'] },
            { id: 'dispatch', label: 'Despacho', views: ['logistico'] },
            { id: 'confirmations', label: 'Confirmaciones', views: ['logistico', 'operador'] },
            { id: 'tracking', label: 'Tracking', views: ['logistico'] },
            { id: 'billing', label: 'Billing', views: ['logistico', 'financiero'] },
            { id: 'providers', label: 'Proveedores', views: ['logistico'] },
            { id: 'wells', label: 'Pozos', views: ['logistico'] },
            { id: 'routes', label: 'Rutas', views: ['logistico'] },
            { id: 'analytics', label: 'Analytics', views: ['logistico', 'financiero', 'gerencia'] },
            { id: 'gerencia', label: 'Visión Gerencial', views: ['gerencia'] },
            { id: 'tariffs', label: 'Tarifas', views: ['logistico', 'financiero'] },
            { id: 'users', label: 'Usuarios', views: ['logistico', 'financiero'] },
          ].map((item) => (
            <div key={item.id} className={`nav-item ${currentScreen === item.id ? 'active' : ''}`} style={{ display: item.views.includes(currentView) ? 'flex' : 'none' }} onClick={() => setCurrentScreen(item.id)}>
              <span className="nav-icon">{item.label === 'Despacho' ? '🚀' : item.label === 'Unidades' ? '📦' : item.label === 'Confirmaciones' ? '✅' : item.label === 'Tracking' ? '📍' : item.label === 'Billing' ? '💰' : item.label === 'Proveedores' ? '🏢' : item.label === 'Pozos' ? '🛢' : item.label === 'Rutas' ? '🗺' : item.label === 'Analytics' ? '📊' : item.label === 'Visión Gerencial' ? '👁️' : item.label === 'Tarifas' ? '💲' : item.label === 'Usuarios' ? '👥' : '•'}</span>
              {item.label}
            </div>
          ))}
        </nav>

        <div className="nav-footer">v2.0 PROTOTYPE<br />SLB Digital Solutions</div>
      </aside>

      <main className="main">
        <div className={`screen ${currentScreen === 'units' ? 'active' : ''}`}>
          <div className="page-header">
            <div>
              <div className="page-title">Catálogo de <span>Unidades</span></div>
              <div className="page-subtitle">Inventario de activos físicos — Góndolas & CPRs</div>
            </div>
            <button className="btn btn-primary" onClick={() => setCurrentScreen('dispatch')}>+ Nuevo Despacho</button>
          </div>

          <div className="filters-row">
            <div className="filter-group">
              <span className="filter-label">Proveedor</span>
              <select className="filter-select" value={providerFilter} onChange={(e) => setProviderFilter(e.target.value)}>
                <option value="">Todos</option>
                <option value="Emcro">Emcro</option>
                <option value="NOV">NOV</option>
                <option value="Schlumberger">Schlumberger</option>
              </select>
            </div>
            <div className="filter-group">
              <span className="filter-label">Tipo</span>
              <select className="filter-select" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                <option value="">Todos</option>
                <option value="Góndola">Góndola</option>
                <option value="CPR">CPR</option>
                <option value="Canastilla">Canastilla</option>
                <option value="Presurizado">Presurizado</option>
              </select>
            </div>
            <div className="filter-group">
              <span className="filter-label">Estatus</span>
              <select className="filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="">Todos</option>
                <option value="Activo">Activo</option>
                <option value="Ocupado">Ocupado</option>
                <option value="Fuera de servicio">Fuera de servicio</option>
                <option value="Sin alta">Sin alta</option>
              </select>
            </div>
            <div className="filter-group">
              <span className="filter-label">Buscar</span>
              <input className="filter-input" value={searchTerm} placeholder="ID / Económico..." onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <div className="filter-count">Mostrando {filteredUnits.length} de {UNIT_DATA.length} unidades</div>
          </div>

          <div className="units-grid">
            {filteredUnits.map((unit) => (
              <div key={unit.id} className={`unit-card ${selectedUnits.includes(unit.id) ? 'selected' : ''}`} onClick={() => toggleUnit(unit.id)}>
                <div className="unit-card-check" />
                <div className="unit-id">{unit.id}</div>
                <div className="unit-meta">
                  <div className="unit-meta-row"><span className="unit-type-icon">{TYPE_ICONS[unit.tipo] || '📦'}</span><span>{unit.tipo}</span></div>
                  <div className="unit-meta-row"><span>🏭</span><span>{unit.proveedor}</span></div>
                  <div>{<span className={`badge ${unitBadgeClass(unit.estatus)}`}>{unit.estatus}</span>}</div>
                </div>
                <div className="unit-loc">📍 {unit.loc || '—'}</div>
              </div>
            ))}
          </div>

          <div className={`selection-banner ${selectedUnits.length > 0 ? 'visible' : ''}`}>
            <span className="selection-banner-text">{selectedUnits.length} unidad{selectedUnits.length !== 1 ? 'es' : ''} seleccionada{selectedUnits.length !== 1 ? 's' : ''}</span>
            <button className="btn btn-accent" onClick={() => setCurrentScreen('dispatch')}>Asignar Viaje →</button>
            <button className="btn btn-ghost" onClick={clearSelection}>Cancelar</button>
          </div>
        </div>

        <div className={`screen ${currentScreen === 'dispatch' ? 'active' : ''}`}>
          <div className="page-header">
            <div>
              <div className="page-title">Panel de <span>Despacho</span></div>
              <div className="page-subtitle">Asignación de ciclos logísticos</div>
            </div>
            <button className="btn btn-ghost" onClick={() => setCurrentScreen('units')}>← Volver a Unidades</button>
          </div>

          <div className="dispatch-layout">
            <div className="panel">
              <div className="section-title">Unidades a Despachar (<span>{selectedUnits.length}</span>)</div>
              <div id="dispatchChips">
                {selectedUnits.length === 0 ? (
                  <div style={{ color: 'var(--text3)', fontSize: 13, padding: '8px 0' }}>No hay unidades seleccionadas. Regresa al Catálogo para seleccionar.</div>
                ) : (
                  selectedUnits.map((id) => (
                    <div key={id} className="dispatch-unit-chip">
                      {TYPE_ICONS[UNIT_DATA.find((u) => u.id === id)?.tipo || ''] || '📦'} {id}
                      <span className="chip-remove" onClick={() => toggleUnit(id)}>×</span>
                    </div>
                  ))
                )}
              </div>
            </div>
            <div className="panel">
              <div className="section-title">Configuración del Viaje</div>
              <div className="form-group">
                <label className="form-label">Pozo de Referencia</label>
                <select className="form-select" value={dispatchWell} onChange={(e) => setDispatchWell(e.target.value)}>
                  <option value="">— Seleccionar pozo —</option>
                  <option>Yaxche-40</option>
                  <option>Yaxche-41</option>
                  <option>Defender A</option>
                  <option>Defender B</option>
                  <option>Ichalkil-1</option>
                  <option>Pokoch-1</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Etapa de Perforación</label>
                <input className="form-input" placeholder="Ej: Etapa 2 — Revestimiento 9 5/8" value={dispatchStage} onChange={(e) => setDispatchStage(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Plan de Ruta (Plantilla)</label>
                <select className="form-select" value={routePreviewId ?? ''} onChange={(e) => setRoutePreviewId(e.target.value ? Number(e.target.value) : null)}>
                  <option value="">— Seleccionar plantilla —</option>
                  {ROUTE_TEMPLATES.map((route) => (
                    <option key={route.id} value={route.id}>{route.nombre}</option>
                  ))}
                </select>
              </div>

              {routePreview ? (
                <div className="route-preview visible">
                  <div className="section-title" style={{ marginBottom: 14 }}>{routePreview.nombre}</div>
                  <div className="route-timeline-mini">
                    {routePreview.paradas.map((stop) => (
                      <div key={stop} className="route-stop-mini">
                        <div className="stop-line" />
                        <div className="stop-dot" />
                        <div className="stop-label">{stop}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              <button className="btn btn-accent" style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: 15 }} onClick={confirmDispatch}>🚀 Confirmar Despacho</button>
            </div>
          </div>
        </div>

        <div className={`screen ${currentScreen === 'confirmations' ? 'active' : ''}`}>
          <div className="page-header">
            <div>
              <div className="page-title">Centro de <span>Confirmaciones</span></div>
              <div className="page-subtitle">Vista del Operador en Campo</div>
            </div>
          </div>
          <div className="location-indicator">
            <div className="location-dot" />
            <span className="location-text">📍 Estás en: <strong>Muelle TMDB</strong></span>
          </div>
          <div className="confirm-list">
            {CONFIRMATIONS_DATA.map((item, index) => {
              const state = confirmations[index] || { status: 'pendiente' };
              const isDone = state.status === 'guardado';
              return (
                <div key={item.unidad} className={`confirm-item ${isDone ? 'done' : ''}`}>
                  <div className="confirm-header">
                    <div className="confirm-unit-id">{item.unidad}</div>
                    {isDone ? <span className="badge badge-confirmado">✓ Confirmado</span> : <button className="btn btn-accent" onClick={() => confirmArrival(index)}>✓ Confirmar Llegada</button>}
                  </div>
                  <div className="confirm-meta">
                    <div className="confirm-meta-item"><div className="label">Pozo</div><div className="value">{item.pozo}</div></div>
                    <div className="confirm-meta-item"><div className="label">Parada Actual</div><div className="value">{item.parada}</div></div>
                    <div className="confirm-meta-item"><div className="label">Ruta</div><div className="value" style={{ fontSize: 11 }}>{item.ruta}</div></div>
                  </div>
                  <div className={`confirm-expand ${isDone ? 'visible' : ''}`}>
                    {isDone ? <div className="confirm-timestamp">✅ Confirmación guardada a las {state.hora}</div> : <div className="confirm-timestamp">⌛ Esperando confirmación</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className={`screen ${currentScreen === 'tracking' ? 'active' : ''}`}>
          <div className="page-header">
            <div>
              <div className="page-title">Tracking <span>Global</span></div>
              <div className="page-subtitle">Estado de todos los ciclos activos en tiempo real</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20, flexWrap: 'wrap' }}>
            <div className="tracking-tabs">
              {['all', 'Defender A', 'Yaxche-40'].map((filter) => (
                <button key={filter} className={`tracking-tab ${currentTrackingFilter === filter ? 'active' : ''}`} onClick={() => setCurrentTrackingFilter(filter)}>
                  {filter === 'all' ? 'Ver todos' : filter} <span className="tab-badge">{trackingData.filter((item) => filter === 'all' ? true : item.pozo === filter).length}</span>
                </button>
              ))}
            </div>
            <div style={{ flex: 1, minWidth: 220, position: 'relative' }}>
              <input type="text" className="filter-input" value={trackingSearch} placeholder="🔍  Buscar por ID, pozo, proveedor, ubicación..." onChange={(e) => setTrackingSearch(e.target.value)} style={{ width: '100%', paddingLeft: 14, fontSize: 13 }} />
            </div>
            <div id="tracking-result-count" style={{ fontSize: 12, color: 'var(--text3)', whiteSpace: 'nowrap' }}>
              {trackingData.length} de {TRACKING_DATA_INITIAL.length} unidades
            </div>
          </div>
          <div className="tracking-grid">
            {trackingData.length === 0 ? (
              <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
                <div className="empty-state-icon">🔍</div>
                <div className="empty-state-text">Sin resultados</div>
              </div>
            ) : trackingData.map(renderTrackingCard)}
          </div>
        </div>

        <div className={`screen ${currentScreen === 'billing' ? 'active' : ''}`}>
          <div className="page-header">
            <div>
              <div className="page-title">Módulo de <span>Billing</span></div>
              <div className="page-subtitle">Corte financiero y conciliación de periodos</div>
            </div>
          </div>
          <div className="kpi-grid">
            <div className="kpi-card"><div className="kpi-label">Periodo Actual</div><div className="kpi-value" style={{ fontSize: 18 }}>Mayo 2026</div><div className="kpi-sub">21 Abr — 20 May · <span style={{ color: 'var(--warning)' }}>● Abierto</span></div></div>
            <div className="kpi-card"><div className="kpi-label">Unidades en Facturación</div><div className="kpi-value">{billingData.length}</div><div className="kpi-sub">activos en el periodo</div></div>
            <div className="kpi-card"><div className="kpi-label">Monto Calculado Sistema</div><div className="kpi-value">$48,250</div><div className="kpi-sub">USD calculado automático</div></div>
            <div className="kpi-card"><div className="kpi-label">Monto Conciliado</div><div className="kpi-value green" id="reconciledTotal">${totalBilling.toLocaleString()}</div><div className="kpi-sub">USD conciliado — <span style={{ color: 'var(--success)' }}>▼ 5% ajuste</span></div></div>
          </div>
          <div className="table-wrap">
            <table className="billing-table">
              <thead>
                <tr>
                  <th>Unidad</th>
                  <th>Pozo</th>
                  <th>Tipo</th>
                  <th>Monto Final</th>
                  <th>Comentario</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {billingData.map((row) => (
                  <tr key={row.unidad}>
                    <td className="mono">{row.unidad}</td>
                    <td>{row.pozo}</td>
                    <td>{row.tipo}</td>
                    <td className="mono">${row.monto_fin.toLocaleString()}</td>
                    <td>{row.comentario || '—'}</td>
                    <td><span className={`badge badge-${row.estado.toLowerCase()}`}>{row.estado}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className={`screen ${currentScreen === 'providers' ? 'active' : ''}`}>
          <div className="page-header">
            <div>
              <div className="page-title">Catálogo de <span>Proveedores</span></div>
              <div className="page-subtitle">Gestión de empresas operadoras y contactos autorizados</div>
            </div>
          </div>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr><th>ID</th><th>Nombre Proveedor</th><th>Flota Total</th><th>Unidades Activas</th></tr>
              </thead>
              <tbody>
                {PROVIDERS_DATA.map((provider) => (
                  <tr key={provider.id}>
                    <td className="mono">#{provider.id}</td>
                    <td><strong>{provider.nombre}</strong></td>
                    <td>{provider.flota_total}</td>
                    <td>{provider.flota_activa}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className={`screen ${currentScreen === 'wells' ? 'active' : ''}`}>
          <div className="page-header">
            <div>
              <div className="page-title">Catálogo de <span>Pozos</span></div>
              <div className="page-subtitle">Locaciones de perforación y plataformas activas</div>
            </div>
          </div>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr><th>ID</th><th>Nombre del Pozo</th><th>Proyecto</th><th>Tipo</th><th>Unidades Activas</th><th>Estatus</th></tr>
              </thead>
              <tbody>
                {WELLS_DATA.map((well) => (
                  <tr key={well.id}>
                    <td className="mono">{well.id}</td>
                    <td><strong>{well.nombre}</strong></td>
                    <td>{well.proyecto}</td>
                    <td>{well.tipo}</td>
                    <td>{well.unidades_activas}</td>
                    <td>{well.estatus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className={`screen ${currentScreen === 'routes' ? 'active' : ''}`}>
          <div className="page-header">
            <div>
              <div className="page-title">Plantillas de <span>Ruta</span></div>
              <div className="page-subtitle">Definición de ciclos logísticos y secuencia de paradas</div>
            </div>
          </div>
          <div className="routes-layout">
            <div className="panel" style={{ display: 'flex', flexDirection: 'column' }}>
              <div className="section-title" style={{ marginBottom: 14 }}>Plantillas Existentes</div>
              <div>
                {ROUTE_TEMPLATES.map((route) => (
                  <div key={route.id} className={`route-list-item ${routePreviewId === route.id ? 'active' : ''}`} onClick={() => setRoutePreviewId(route.id)}>
                    <div className="route-name">{route.nombre}</div>
                    <div className="route-meta">
                      <span className={`badge ${route.tipo === 'Marina' ? 'badge-marina' : 'badge-terrestre'}`}>{route.tipo}</span>
                      <span style={{ fontSize: 11, color: 'var(--text3)', marginLeft: 'auto' }}>{route.paradas.length} paradas</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="panel" id="routeEditorPanel">
              {routePreview ? (
                <div>
                  <div className="section-title" style={{ marginBottom: 16 }}>Vista previa de ruta</div>
                  <div style={{ color: 'var(--text3)', fontSize: 14 }}>
                    <strong>{routePreview.nombre}</strong>
                    <div style={{ marginTop: 10 }}>
                      {routePreview.paradas.map((stop) => (<div key={stop} style={{ marginBottom: 6 }}>• {stop}</div>))}
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ color: 'var(--text3)', textAlign: 'center', padding: '60px 0', fontSize: 14 }}>← Selecciona una plantilla para revisar</div>
              )}
            </div>
          </div>
        </div>

        <div className={`screen ${currentScreen === 'analytics' ? 'active' : ''}`}>
          <div className="page-header">
            <div>
              <div className="page-title">Dashboard de <span>Analytics</span></div>
              <div className="page-subtitle">Indicadores operativos y financieros del periodo</div>
            </div>
          </div>
          <div className="analytics-grid">
            <div className="chart-card full-width"><div className="chart-title">Unidades por Proveedor y Estatus</div><div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text3)' }}>Gráfico de barras estático</div></div>
            <div className="chart-card"><div className="chart-title">Distribución por Tipo de Unidad</div><div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text3)' }}>Gráfico donut estático</div></div>
            <div className="chart-card"><div className="chart-title">Movimientos Confirmados por Día — Mayo 2026</div><div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text3)' }}>Gráfico línea estático</div></div>
            <div className="chart-card"><div className="chart-title">Monto Facturado por Proveedor (USD)</div><div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text3)' }}>Gráfico barras estático</div></div>
            <div className="chart-card"><div className="chart-title">KPIs Operativos del Periodo</div>
              <table className="kpi-mini-table">
                <thead><tr><th>Métrica</th><th>Valor</th><th>vs Mes Anterior</th></tr></thead>
                <tbody>
                  <tr><td className="kpi-metric">Viajes completados</td><td className="kpi-val">47</td><td className="kpi-trend-up">▲ +8%</td></tr>
                  <tr><td className="kpi-metric">Promedio días por viaje</td><td className="kpi-val">4.2 días</td><td className="kpi-trend-down">▼ -0.3</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className={`screen ${currentScreen === 'gerencia' ? 'active' : ''}`}>
          <div className="page-header">
            <div>
              <div className="page-title">Panel de <span>Gerencia</span></div>
              <div className="page-subtitle">Supervisión integral de costos y logística por pozo</div>
            </div>
          </div>
          <div style={{ margin: '20px 0', display: 'flex', gap: 12 }}>
            <button className="btn btn-primary">⛴ Operaciones Marinas</button>
            <button className="btn btn-ghost">🚛 Operaciones Terrestres</button>
          </div>
          <div style={{ padding: 20, background: 'rgba(16,20,38,0.75)', borderRadius: 12, color: 'var(--text3)' }}>
            Este panel se puede extender con métricas de operación y costo por pozo.
          </div>
        </div>

        <div className={`screen ${currentScreen === 'tariffs' ? 'active' : ''}`}>
          <div className="page-header">
            <div>
              <div className="page-title">Catálogo de <span>Tarifas</span></div>
              <div className="page-subtitle">Gestión de esquemas de cobro por proveedor, pozo y tipo de unidad</div>
            </div>
          </div>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr><th>ID</th><th>Proveedor</th><th>Pozo</th><th>Tipo Unidad</th><th>Esquema</th><th>Monto</th><th>Estatus</th></tr>
              </thead>
              <tbody>
                {TARIFFS_DATA.map((tariff) => (
                  <tr key={tariff.id}>
                    <td className="mono">#{tariff.id}</td>
                    <td><strong>{tariff.proveedor}</strong></td>
                    <td>{tariff.pozo}</td>
                    <td>{tariff.tipo}</td>
                    <td>{tariff.factor}</td>
                    <td className="mono">${tariff.monto}</td>
                    <td>{tariff.estatus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className={`screen ${currentScreen === 'users' ? 'active' : ''}`}>
          <div className="page-header">
            <div>
              <div className="page-title">Catálogo de <span>Usuarios</span></div>
              <div className="page-subtitle">Control de acceso y roles del sistema</div>
            </div>
          </div>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr><th>ID</th><th>Nombre Completo</th><th>Email</th><th>Rol</th><th>Estatus</th></tr>
              </thead>
              <tbody>
                {USERS_DATA.map((user) => (
                  <tr key={user.id}>
                    <td className="mono">#{user.id}</td>
                    <td><strong>{user.nombre}</strong></td>
                    <td>{user.email}</td>
                    <td>{user.rol}</td>
                    <td>{user.estatus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="app-footer">WLCS v2.0 PROTOTYPE — SLB DIGITAL SOLUTIONS — 2026</div>
      </main>

      <div className="toast-container">
        {toastMessages.map((toast) => (
          <div key={toast.id} className={`toast ${toast.type}`}>
            <span className="toast-icon">{toast.type === 'success' ? '✅' : toast.type === 'error' ? '❌' : 'ℹ️'}</span>
            <span className="toast-msg">{toast.msg}</span>
          </div>
        ))}
      </div>

      {drawerUnit ? (
        <div className="detail-drawer open">
          <div className="drawer-header">
            <div className="drawer-title">Seguimiento — {drawerUnit}</div>
            <button className="drawer-close" onClick={() => setDrawerUnit(null)}>✕</button>
          </div>
          <div className="drawer-body">
            <p>Detalle de seguimiento para {drawerUnit}.</p>
            <button className="btn btn-ghost" onClick={() => setDrawerUnit(null)}>Cerrar</button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default App;
