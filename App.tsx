
import React, { useState, useEffect, useMemo } from 'react';
import PhotoUpload from './components/PhotoUpload';
import SignaturePad from './components/SignaturePad';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import { MemberFormData, MaritalStatus, Group } from './types';
import { Database } from './lib/db';

const App: React.FC = () => {
  const getTodayStr = () => new Date().toISOString().split('T')[0];

  const initialFormState: MemberFormData = {
    serialNumber: '',
    photo: null,
    name: '',
    address: '',
    neighborhood: '',
    city: '',
    department: '',
    cellphone: '',
    email: '',
    birthDate: '',
    maritalStatus: '',
    baptismDate: '',
    church: 'Universal',
    timeInChurch: '',
    group: '',
    signature: null,
    updateDate: getTodayStr()
  };

  const [formData, setFormData] = useState<MemberFormData>(initialFormState);
  const [isSaving, setIsSaving] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [savedMembers, setSavedMembers] = useState<MemberFormData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGroup, setFilterGroup] = useState<string>('');

  useEffect(() => {
    loadSavedMembers();
  }, []);

  const loadSavedMembers = async () => {
    try {
      const members = await Database.getAllMembers();
      setSavedMembers(members);
    } catch (err) {
      console.error("Error al cargar miembros", err);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (photo: string | null) => {
    setFormData(prev => ({ ...prev, photo }));
  };

  const handleSignatureChange = (signature: string | null) => {
    setFormData(prev => ({ ...prev, signature }));
  };

  const handleSave = async () => {
    if (!formData.name) {
      alert("El nombre es obligatorio.");
      return;
    }
    setIsSaving(true);
    try {
      await Database.saveMember(formData);
      alert("✅ Registro guardado exitosamente.");
      setFormData({ ...initialFormState, updateDate: getTodayStr() });
      loadSavedMembers();
      setCurrentView('dashboard');
    } catch (err) {
      console.error("Error al guardar:", err);
      alert("❌ Error al guardar el registro.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("¿Seguro que deseas eliminar este registro?")) {
      await Database.deleteMember(id);
      loadSavedMembers();
    }
  };

  const handleLoadMember = (member: MemberFormData) => {
    setFormData(member);
    setCurrentView('form');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const filteredMembers = useMemo(() => {
    return savedMembers.filter(m => {
      const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesGroup = filterGroup === '' || m.group === filterGroup;
      return matchesSearch && matchesGroup;
    });
  }, [savedMembers, searchTerm, filterGroup]);

  const FieldBox = ({ label, name, value, className = '', type = 'text', placeholder = '' }: { label: string, name: string, value: string, className?: string, type?: string, placeholder?: string }) => (
    <div className={`border-2 border-blue-900 px-3 py-1 flex items-center h-14 md:h-12 ${className}`}>
      <span className="text-blue-900 font-black text-[10px] md:text-xs whitespace-nowrap mr-2 uppercase">{label}:</span>
      <input 
        type={type} 
        name={name}
        value={value}
        placeholder={placeholder}
        onChange={handleInputChange}
        autoComplete="off"
        className="flex-grow bg-transparent outline-none text-gray-800 text-sm font-bold h-full placeholder-gray-300"
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex overflow-x-hidden">
      {/* Barra Lateral Adaptativa */}
      <Sidebar 
        currentView={currentView} 
        setView={setCurrentView} 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen} 
      />

      {/* Contenido Principal */}
      <main className="flex-grow lg:ml-64 min-h-screen flex flex-col w-full transition-all">
        
        {/* Barra Superior */}
        <header className="bg-white border-b border-gray-100 px-4 md:px-8 py-3 flex items-center justify-between sticky top-0 z-40 safe-top">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-3 text-blue-900 bg-gray-50 rounded-xl"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <div className="relative w-44 md:w-96">
              <input 
                type="text" 
                placeholder="Buscar..."
                className="w-full bg-gray-50 border-none rounded-2xl py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-100 outline-none font-medium"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <svg className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
          </div>

          <div className="flex items-center gap-4">
             <button 
                onClick={() => {
                  setFormData(initialFormState);
                  setCurrentView('form');
                }}
                className="bg-blue-900 text-white px-4 py-2.5 rounded-2xl font-black text-[10px] uppercase shadow-md active:scale-95 transition-all"
             >
                NUEVO
             </button>
             <div className="w-10 h-10 bg-blue-900 rounded-2xl flex items-center justify-center text-white font-black text-sm shadow-sm hidden sm:flex">U</div>
          </div>
        </header>

        {/* Vistas Dinámicas */}
        <div className="flex-grow p-4 md:p-8">
          {currentView === 'dashboard' && <Dashboard members={savedMembers} />}

          {currentView === 'list' && (
            <div className="animate-in slide-in-from-bottom-4 duration-500">
              <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8">
                 <h2 className="text-2xl font-black text-blue-900 uppercase tracking-tighter">Miembros Registrados</h2>
                 <select 
                    value={filterGroup}
                    onChange={(e) => setFilterGroup(e.target.value)}
                    className="w-full md:w-auto bg-white border border-gray-200 px-6 py-3 rounded-2xl text-xs font-black text-blue-900 shadow-sm"
                  >
                    <option value="">TODOS LOS GRUPOS</option>
                    {Object.values(Group).map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                 {filteredMembers.map((member) => (
                   <div 
                    key={member.id}
                    onClick={() => handleLoadMember(member)}
                    className="bg-white rounded-3xl p-5 flex gap-5 border border-gray-100 shadow-sm hover:shadow-lg transition-all cursor-pointer group active:scale-[0.98]"
                   >
                     <div className="w-20 h-24 bg-gray-50 rounded-2xl flex-shrink-0 border border-gray-100 overflow-hidden shadow-inner">
                        {member.photo ? <img src={member.photo} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-200"><svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg></div>}
                     </div>
                     <div className="flex flex-col justify-between py-1 overflow-hidden flex-grow">
                        <div>
                          <h3 className="font-black text-blue-900 uppercase truncate text-sm md:text-base">{member.name}</h3>
                          <p className="text-[10px] text-gray-400 font-bold truncate uppercase mt-0.5">{member.address}</p>
                        </div>
                        <div className="flex gap-2 items-center mt-3">
                          <span className="bg-orange-100 text-orange-700 text-[9px] px-2.5 py-1 rounded-lg font-black uppercase">{member.group || 'General'}</span>
                          <span className="text-[9px] text-gray-300 font-bold uppercase tracking-widest">ID: {member.serialNumber || '000'}</span>
                        </div>
                     </div>
                     <button 
                       onClick={(e) => handleDelete(member.id!, e)}
                       className="p-2 text-red-200 hover:text-red-500 transition-colors"
                     >
                       <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                     </button>
                   </div>
                 ))}
              </div>
            </div>
          )}

          {currentView === 'form' && (
            <div className="animate-in zoom-in-95 duration-500">
               <div className="bg-white w-full max-w-4xl shadow-2xl p-6 md:p-12 relative overflow-hidden rounded-3xl mx-auto border border-gray-100">
                  <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
                    <div className="flex flex-col gap-3 w-full md:w-auto">
                      <div className="flex items-center gap-2">
                        <span className="text-blue-900 font-black text-4xl">Nº</span>
                        <input 
                          type="text" 
                          name="serialNumber" 
                          value={formData.serialNumber} 
                          onChange={handleInputChange} 
                          placeholder="000"
                          className="w-24 border-b-4 border-dotted border-blue-900 text-blue-900 font-black text-2xl outline-none bg-transparent text-center"
                        />
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-blue-900 font-black text-[10px] uppercase tracking-widest">FECHA:</span>
                        <input 
                          type="date" 
                          name="updateDate"
                          value={formData.updateDate}
                          onChange={handleInputChange}
                          className="text-[10px] font-black text-blue-900 bg-blue-50 px-3 py-1.5 rounded-lg outline-none"
                        />
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <h1 className="text-blue-900 font-black text-3xl md:text-5xl uppercase tracking-tighter leading-none">Registro de Miembros</h1>
                      <p className="text-blue-900 font-bold text-[10px] mt-2 uppercase opacity-60 tracking-[0.2em]">Censo Digital Universal</p>
                    </div>
                    <div className="hidden lg:block w-32"></div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    <div className="md:col-span-1 flex justify-center">
                      <PhotoUpload photo={formData.photo} onPhotoChange={handlePhotoChange} />
                    </div>
                    <div className="md:col-span-3 space-y-4">
                      <FieldBox label="NOMBRE COMPLETO" name="name" value={formData.name} placeholder="Ingrese nombres y apellidos" />
                      <FieldBox label="DIRECCIÓN" name="address" value={formData.address} />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FieldBox label="BARRIO" name="neighborhood" value={formData.neighborhood} />
                        <FieldBox label="CIUDAD" name="city" value={formData.city} />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FieldBox label="CELULAR / WHATSAPP" name="cellphone" value={formData.cellphone} type="tel" />
                      <FieldBox label="CORREO ELECTRÓNICO" name="email" value={formData.email} type="email" />
                    </div>

                    <div className="border-2 border-blue-900 px-3 py-3 flex flex-col sm:flex-row gap-4">
                      <div className="flex items-center flex-1">
                        <span className="text-blue-900 font-black text-[10px] uppercase mr-4 whitespace-nowrap">NACIMIENTO:</span>
                        <input type="date" name="birthDate" value={formData.birthDate} onChange={handleInputChange} className="bg-transparent outline-none text-gray-800 text-sm font-bold flex-grow" />
                      </div>
                      <div className="flex items-center flex-1 border-t sm:border-t-0 sm:border-l border-blue-900/20 pt-4 sm:pt-0 sm:pl-4">
                        <span className="text-blue-900 font-black text-[10px] uppercase mr-3 whitespace-nowrap">ESTADO CIVIL:</span>
                        <select name="maritalStatus" value={formData.maritalStatus} onChange={handleInputChange} className="bg-transparent outline-none text-gray-800 text-sm font-bold uppercase cursor-pointer flex-grow">
                          <option value="">-- SELECCIONE --</option>
                          {Object.values(MaritalStatus).map((status) => (<option key={status} value={status}>{status}</option>))}
                        </select>
                      </div>
                    </div>

                    <div className="border-2 border-blue-900 px-3 py-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="flex items-center">
                        <span className="text-blue-900 font-black text-[10px] uppercase mr-3">BAUTISMO:</span>
                        <input type="date" name="baptismDate" value={formData.baptismDate} onChange={handleInputChange} className="bg-transparent outline-none text-gray-800 text-sm font-bold w-full" />
                      </div>
                      <div className="flex items-center border-t sm:border-t-0 sm:border-l border-blue-900/20 pt-4 sm:pt-0 sm:pl-4">
                        <span className="text-blue-900 font-black text-[10px] uppercase mr-2">IGLESIA:</span>
                        <input type="text" name="church" value={formData.church} onChange={handleInputChange} className="bg-transparent border-b-2 border-blue-900/30 outline-none text-gray-800 text-sm font-bold w-full" />
                      </div>
                      <div className="flex items-center border-t sm:border-t-0 sm:border-l border-blue-900/20 pt-4 sm:pt-0 sm:pl-4">
                        <span className="text-blue-900 font-black text-[10px] uppercase mr-2">TIEMPO:</span>
                        <input type="text" name="timeInChurch" value={formData.timeInChurch} onChange={handleInputChange} placeholder="Ej: 5 meses" className="bg-transparent border-b-2 border-blue-900/30 outline-none text-gray-800 text-sm font-bold w-full" />
                      </div>
                    </div>

                    <div className="border-2 border-blue-900 px-4 py-3 flex items-center h-14">
                      <span className="text-blue-900 font-black text-[10px] uppercase mr-4 tracking-widest">GRUPO ACTUAL:</span>
                      <select name="group" value={formData.group} onChange={handleInputChange} className="flex-grow bg-transparent outline-none text-gray-800 text-sm font-black uppercase cursor-pointer">
                        <option value="">-- SELECCIONE SU GRUPO --</option>
                        {Object.values(Group).map((g) => (<option key={g} value={g}>{g}</option>))}
                      </select>
                    </div>
                  </div>

                  <div className="mt-16 flex flex-col md:flex-row justify-between items-center gap-10">
                    <span className="text-blue-900 font-black text-6xl md:text-7xl leading-none tracking-tighter opacity-10 select-none">UNIVERSAL</span>
                    <div className="w-full md:w-[400px]">
                      <SignaturePad onSignatureChange={handleSignatureChange} />
                    </div>
                  </div>

                  <div className="mt-16 flex flex-col sm:flex-row justify-center gap-6 no-print">
                     <button 
                        onClick={handleSave}
                        disabled={isSaving}
                        className="bg-blue-900 text-white px-12 py-5 rounded-3xl font-black text-xl shadow-2xl hover:bg-blue-800 active:scale-95 transition-all flex items-center justify-center gap-4 disabled:opacity-50"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                        {isSaving ? 'GUARDANDO...' : 'CONFIRMAR REGISTRO'}
                      </button>
                      <button 
                        onClick={() => setCurrentView('dashboard')}
                        className="bg-gray-100 text-gray-500 px-10 py-5 rounded-3xl font-bold text-lg hover:bg-gray-200 transition-all"
                      >
                        CANCELAR
                      </button>
                  </div>
               </div>
            </div>
          )}

          {currentView === 'config' && (
            <div className="p-12 flex flex-col items-center justify-center h-full min-h-[60vh] text-center space-y-6">
               <div className="w-24 h-24 bg-blue-50 rounded-[40px] flex items-center justify-center text-blue-900 shadow-inner">
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /></svg>
               </div>
               <div>
                  <h3 className="text-2xl font-black text-blue-900 uppercase tracking-tighter">Configuración del Sistema</h3>
                  <p className="text-gray-400 font-medium mt-2 max-w-md mx-auto">Aquí podrás gestionar la base de datos local y personalizar los campos de registro próximamente.</p>
               </div>
               <div className="flex gap-4">
                  <button onClick={() => alert("Próximamente: Exportar a Excel")} className="bg-white border-2 border-blue-900 text-blue-900 px-6 py-3 rounded-2xl font-black text-xs uppercase shadow-sm">Exportar Datos</button>
                  <button onClick={() => alert("Próximamente: Sincronizar en la Nube")} className="bg-blue-900 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase shadow-sm">Sincronizar</button>
               </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
