import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';

interface Vehicle {
  id: number;
  make: string;
  model: string;
  year: number;
  vin: string;
  licensePlate: string;
  numeroEconomico?: string;
  color?: string;
  status: string;
  boxNumber?: string;
  titlePhotoUrl?: string;
}

interface Refaccion {
  id: number;
  nombre: string;
  numeroParte: string;
  fotoUrl?: string;
  fechaCambio?: string;
}

const VehiclesPage: React.FC = () => {
  const { user } = useAuth();
  const [trucks, setTrucks] = useState<Vehicle[]>([]);
  const [cajas, setCajas] = useState<Vehicle[]>([]);
  const [newTruckName, setNewTruckName] = useState('');
  const [newCajaName, setNewCajaName] = useState('');
  const [truckFile, setTruckFile] = useState<{ [id: number]: File | null }>({});
  const [cajaFile, setCajaFile] = useState<{ [id: number]: File | null }>({});
  const [titleFile, setTitleFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'add-truck' | 'add-caja' | 'edit-truck' | 'edit-caja' | null>(null);
  const [editData, setEditData] = useState<Partial<Vehicle>>({});
  // Estado para refacciones
  const [refModalOpen, setRefModalOpen] = useState<{[id:number]:boolean}>({});
  const [refForm, setRefForm] = useState<{[id:number]:{nombre:string, numeroParte:string, foto:File|null, fechaCambio:string}}>({});
  const [refacciones, setRefacciones] = useState<{[id:number]:Refaccion[]}>({});
  const [editingRefId, setEditingRefId] = useState<number|null>(null);

  const handleTitleFileChange = (file: File | null) => {
    setTitleFile(file);
  };

  const handleUploadTitlePhoto = async () => {
    setLoading(true);
    if (!titleFile) return;
    try {
      const formData = new FormData();
      formData.append('titlePhoto', titleFile);
      formData.append('vehicleId', 'new'); // Para backend, puedes ajustar
      formData.append('type', modalType === 'add-truck' ? 'truck' : 'caja');
      const res = await fetch('/api/vehicles/upload-title', {
        method: 'POST',
        body: formData
      });
      const uploaded = await res.json();
      setEditData({ ...editData, titlePhotoUrl: uploaded.url });
      setTitleFile(null);
    } catch (err) {}
    setLoading(false);
  };

  const fetchRefacciones = async (vehicleId:number) => {
    try {
      const res = await fetch(`/api/refacciones/${vehicleId}`);
      const data = await res.json();
      setRefacciones((prev) => ({...prev, [vehicleId]:data}));
    } catch {}
  };

  const handleOpenRefModal = async (id:number) => {
    setRefModalOpen((prev) => ({...prev, [id]:true}));
    setRefForm((prev) => ({...prev, [id]:{nombre:"", numeroParte:"", foto:null, fechaCambio:""}}));
    await fetchRefacciones(id);
  };
  const handleCloseRefModal = (id:number) => {
    setRefModalOpen((prev) => ({...prev, [id]:false}));
  };
  const handleRefFormChange = (id:number, e:React.ChangeEvent<HTMLInputElement>) => {
    const {name, value, files} = e.target;
    setRefForm((prev) => ({
      ...prev,
      [id]:{
        ...prev[id],
        [name]: files ? files[0] : value
      }
    }));
  };
  const handleAddRefaccion = async (id:number) => {
    const {nombre, numeroParte, foto, fechaCambio} = refForm[id] || {};
    if (!nombre || !numeroParte) return;
    let fotoUrl = "";
    if (foto) {
      fotoUrl = URL.createObjectURL(foto);
    }
    try {
      await fetch('/api/refacciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vehicleId: id, nombre, numeroParte, fotoUrl, fechaCambio })
      });
      await fetchRefacciones(id);
      setRefForm((prev) => ({...prev, [id]:{nombre:"", numeroParte:"", foto:null, fechaCambio:""}}));
      setRefModalOpen((prev) => ({...prev, [id]:false}));
    } catch {}
  };
  const handleEditRefaccion = async (vehicleId:number, ref:Refaccion) => {
    setRefModalOpen((prev) => ({...prev, [vehicleId]:false})); // Cierra el modal si está abierto
    setTimeout(() => {
      setRefForm((prev) => ({
        ...prev,
        [vehicleId]: {
          nombre: ref.nombre,
          numeroParte: ref.numeroParte,
          foto: null,
          fechaCambio: ref.fechaCambio || ""
        }
      }));
      setRefModalOpen((prev) => ({...prev, [vehicleId]:true})); // Vuelve a abrir el modal con los datos correctos
      setEditingRefId(ref.id);
    }, 50);
  };
  const handleSaveEditRefaccion = async (vehicleId:number) => {
    const {nombre, numeroParte, foto, fechaCambio} = refForm[vehicleId] || {};
    if (!nombre || !numeroParte) return;
    let fotoUrl = "";
    if (foto) {
      fotoUrl = URL.createObjectURL(foto);
    }
    try {
      await fetch(`/api/refacciones/${editingRefId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, numeroParte, fotoUrl, fechaCambio })
      });
      await fetchRefacciones(vehicleId);
      setRefForm((prev) => ({...prev, [vehicleId]:{nombre:"", numeroParte:"", foto:null, fechaCambio:""}}));
      setRefModalOpen((prev) => ({...prev, [vehicleId]:false}));
      setEditingRefId(null);
    } catch {}
  };
  const handleDeleteRefaccion = async (vehicleId:number, refId:number) => {
    try {
      await fetch(`/api/refacciones/${refId}`, { method: 'DELETE' });
      await fetchRefacciones(vehicleId);
    } catch {}
  };
  const fetchVehicles = async () => {
    try {
      const trucksRes = await fetch('/api/vehicles?type=truck');
      const cajasRes = await fetch('/api/vehicles?type=caja');
      const trucksData = await trucksRes.json();
      const cajasData = await cajasRes.json();
      setTrucks(trucksData);
      setCajas(cajasData);
    } catch (err) {
      setTrucks([]);
      setCajas([]);
    }
  };
  useEffect(() => {
    fetchVehicles();
  }, []);
  if (!user || user.role !== 'admin') {
    return <div className="p-8 text-center text-zinc-500">Acceso solo para administradores.</div>;
  }
  // --- RETURN PRINCIPAL ÚNICO Y LIMPIO ---
  return (
    <div className="min-h-screen bg-white py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-semibold text-gray-900 mb-8">Gestión de Vehículos</h1>
        {/* Sección de Camiones */}
        <section className="bg-white border border-gray-200 p-6 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
            <h2 className="text-xl font-medium text-gray-900">Camiones</h2>
            <button className="bg-gray-900 text-white px-4 py-2 font-medium hover:bg-gray-800 transition-colors" onClick={() => setModalType('add-truck')}>+ Agregar Camión</button>
          </div>
          {trucks.length === 0 ? (
            <p className="text-gray-500">No hay camiones registrados.</p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {trucks.map((truck) => (
                <li key={truck.id} className="py-4">
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-4">
                    <span className="font-medium text-gray-900">{truck.make} - {truck.numeroEconomico}</span>
                    <span className="text-gray-600">Modelo: <span className="font-medium">{truck.model}</span></span>
                    <span className="text-gray-600">Año: <span className="font-medium">{truck.year}</span></span>
                    <span className="text-gray-600">Estado: <span className="font-medium">{truck.status}</span></span>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button className="text-sm bg-gray-100 text-gray-700 px-3 py-1 hover:bg-gray-200 transition-colors" onClick={() => { setModalType('edit-truck'); setEditData(truck); setModalOpen(true); }}>Editar</button>
                    <button className="text-sm bg-red-100 text-red-700 px-3 py-1 hover:bg-red-200 transition-colors" onClick={() => handleDelete(truck.id, 'truck')}>Eliminar</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
        {/* Sección de Cajas */}
        <section className="bg-white border border-gray-200 p-6 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
            <h2 className="text-xl font-medium text-gray-900">Cajas</h2>
            <button className="bg-gray-900 text-white px-4 py-2 font-medium hover:bg-gray-800 transition-colors" onClick={() => setModalType('add-caja')}>+ Agregar Caja</button>
          </div>
          {cajas.length === 0 ? (
            <p className="text-gray-500">No hay cajas registradas.</p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {cajas.map((caja) => (
                <li key={caja.id} className="py-4">
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-4">
                    <span className="font-medium text-gray-900">{caja.make} - {caja.numeroEconomico}</span>
                    <span className="text-gray-600">Modelo: <span className="font-medium">{caja.model}</span></span>
                    <span className="text-gray-600">Año: <span className="font-medium">{caja.year}</span></span>
                    <span className="text-gray-600">Estado: <span className="font-medium">{caja.status}</span></span>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button className="text-sm bg-gray-100 text-gray-700 px-3 py-1 hover:bg-gray-200 transition-colors" onClick={() => { setModalType('edit-caja'); setEditData(caja); setModalOpen(true); }}>Editar</button>
                    <button className="text-sm bg-red-100 text-red-700 px-3 py-1 hover:bg-red-200 transition-colors" onClick={() => handleDelete(caja.id, 'caja')}>Eliminar</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
        {/* Modal de agregar/editar (simplificado) */}
        {modalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 px-1 sm:px-2">
            <div className="bg-white rounded-xl shadow-lg p-4 w-full max-w-lg overflow-auto">
              <h2 className="text-xl font-bold mb-4">
                {modalType === 'add-truck' && 'Agregar Camión'}
                {modalType === 'add-caja' && 'Agregar Caja'}
                {modalType === 'edit-truck' && 'Editar Camión'}
                {modalType === 'edit-caja' && 'Editar Caja'}
              </h2>
              <form className="space-y-4" onSubmit={e => { e.preventDefault(); handleSave(); }}>
                <input type="text" className="border border-zinc-200 p-2 w-full rounded" placeholder="Marca" value={editData.make || ''} onChange={e => setEditData({ ...editData, make: e.target.value })} required />
                <input type="text" className="border border-zinc-200 p-2 w-full rounded" placeholder="Modelo" value={editData.model || ''} onChange={e => setEditData({ ...editData, model: e.target.value })} required />
                <input type="number" className="border border-zinc-200 p-2 w-full rounded" placeholder="Año" value={editData.year !== undefined ? editData.year : ''} onChange={e => setEditData({ ...editData, year: e.target.value !== '' ? Number(e.target.value) : undefined })} required />
                <input type="text" className="border border-zinc-200 p-2 w-full rounded" placeholder="VIN" value={editData.vin || ''} onChange={e => setEditData({ ...editData, vin: e.target.value })} required />
                <input type="text" className="border border-zinc-200 p-2 w-full rounded" placeholder="Placas" value={editData.licensePlate || ''} onChange={e => setEditData({ ...editData, licensePlate: e.target.value })} required />
                <input type="text" className="border border-zinc-200 p-2 w-full rounded" placeholder="Número económico" value={editData.numeroEconomico || ''} onChange={e => setEditData({ ...editData, numeroEconomico: e.target.value })} required />
                <input type="text" className="border border-zinc-200 p-2 w-full rounded" placeholder="Color" value={editData.color || ''} onChange={e => setEditData({ ...editData, color: e.target.value })} />
                <input type="text" className="border border-zinc-200 p-2 w-full rounded" placeholder="Estado" value={editData.status || ''} onChange={e => setEditData({ ...editData, status: e.target.value })} required />
                <div className="flex gap-2 justify-end mt-6">
                  <button type="button" className="bg-zinc-300 px-4 py-2 rounded" onClick={() => { setModalOpen(false); setEditData({}); setModalType(null); }}>Cancelar</button>
                  <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Guardar</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
  const handleAddTruck = async () => {
    setLoading(true);
    try {
      const yearValue = editData.year && !isNaN(Number(editData.year)) ? Number(editData.year) : undefined;
      const body: any = {
        vehicleNumber: editData.numeroEconomico,
        make: editData.make,
        model: editData.model,
        year: yearValue,
        vin: editData.vin,
        licensePlate: editData.licensePlate,
        numeroEconomico: editData.numeroEconomico,
        color: editData.color,
        status: editData.status,
        type: 'truck',
        titlePhotoUrl: editData.titlePhotoUrl || '',
      };
      Object.keys(body).forEach(key => (body as any)[key] === undefined && delete (body as any)[key]);
      const res = await fetch('/api/vehicles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      await res.json();
      await fetchVehicles();
      closeModal();
    } catch (err) {}
    setLoading(false);
  };
  const handleAddCaja = async () => {
    setLoading(true);
    try {
      const yearValue = editData.year && !isNaN(Number(editData.year)) ? Number(editData.year) : undefined;
      const body: any = {
        vehicleNumber: editData.numeroEconomico,
        make: editData.make,
        model: editData.model,
        year: yearValue,
        vin: editData.vin,
        licensePlate: editData.licensePlate,
        numeroEconomico: editData.numeroEconomico,
        color: editData.color,
        status: editData.status,
        type: 'caja',
        boxNumber: editData.boxNumber,
        titlePhotoUrl: editData.titlePhotoUrl || '',
      };
      Object.keys(body).forEach(key => (body as any)[key] === undefined && delete (body as any)[key]);
      const res = await fetch('/api/vehicles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      await res.json();
      await fetchVehicles();
      closeModal();
    } catch (err) {}
    setLoading(false);
  };
  const handleFileChange = (type: 'truck' | 'caja', id: number, file: File | null) => {
    if (type === 'truck') {
      setTruckFile({ ...truckFile, [id]: file });
    } else {
      setCajaFile({ ...cajaFile, [id]: file });
    }
  };
  const handleUploadFile = async (type: 'truck' | 'caja', id: number) => {
    setLoading(true);
    const file = type === 'truck' ? truckFile[id] : cajaFile[id];
    if (!file) return;
    try {
      const formData = new FormData();
      formData.append('vehicleId', String(id));
      formData.append('type', type);
      formData.append('file', file);
      const res = await fetch('/api/vehicles/upload', {
        method: 'POST',
        body: formData
      });
      const uploaded = await res.json();
      if (type === 'truck') {
        setTrucks(trucks.map(truck => truck.id === id ? {
          ...truck
        } : truck));
        setTruckFile({ ...truckFile, [id]: null });
      } else {
        setCajas(cajas.map(caja => caja.id === id ? {
          ...caja
        } : caja));
        setCajaFile({ ...cajaFile, [id]: null });
      }
    } catch (err) {}
    setLoading(false);
  };
  const openModal = (type: typeof modalType, data?: Partial<Vehicle>) => {
    setModalType(type);
    setEditData(data || {});
    setModalOpen(true);
  };
  const closeModal = () => {
    setModalOpen(false);
    setEditData({});
  };
  const handleSave = async () => {
    setLoading(true);
    try {
      const isEdit = modalType === 'edit-truck' || modalType === 'edit-caja';
      const isTruck = modalType === 'add-truck' || modalType === 'edit-truck';
      const url = isEdit ? `/api/vehicles/${editData.id}` : '/api/vehicles';
      const method = isEdit ? 'PUT' : 'POST';
      // Mapeo correcto de campos para el backend
      const yearValue = editData.year && !isNaN(Number(editData.year)) ? Number(editData.year) : undefined;
      const body: any = {
        vehicleNumber: editData.numeroEconomico,
        make: editData.make,
        model: editData.model,
        year: yearValue,
        vin: editData.vin,
        licensePlate: editData.licensePlate,
        numeroEconomico: editData.numeroEconomico,
        color: editData.color,
        status: editData.status,
        type: isTruck ? 'truck' : 'caja',
        ...(isTruck ? {} : { boxNumber: editData.boxNumber }),
        titlePhotoUrl: editData.titlePhotoUrl || '',
      };
      // Elimina campos undefined
      Object.keys(body).forEach(key => {
        if ((body as any)[key] === undefined) {
          delete (body as any)[key];
        }
      });
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      await res.json();
      await fetchVehicles();
      closeModal();
    } catch (err) {
      // Manejo de error
    }
    setLoading(false);
  };
  const handleDelete = async (id: number, type: 'truck' | 'caja') => {
    setLoading(false);
  };
};

export default VehiclesPage;
