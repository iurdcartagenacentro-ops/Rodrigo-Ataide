
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
    serialNumber: '000',
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
      console.error("Error loading members", err);
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
      alert("Por favor, ingrese al menos el nombre del miembro.");
      return;
    }
    setIsSaving(true);
    try {
      await Database.saveMember(formData);
      alert("Registro guardado exitosamente.");
      setFormData({ ...initialFormState, updateDate: getTodayStr() });
      loadSavedMembers();
      setCurrentView('dashboard');
    } catch (err) {
      console.error("Error saving member", err);
      alert("Error al guardar el registro.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("¿Está seguro de eliminar este registro?")) {
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

  const FieldBox = ({ label, name, value, className = '', type = 'text' }: { label: string, name: string, value: string, className?: string, type?: string }) => (
    <div className={`border-2 border-blue-900 px-3 py-1 flex items-center h-12 md:h-10 ${className}`}>
      <span className="text-blue-900 font-bold text-xs whitespace-nowrap mr-2 uppercase">{label}:</span>
      <input 
        type={type} 
        name={name}
        value={value}
        onChange={handleInputChange}
        className="flex-grow bg-transparent outline-none text-gray-800 text-sm font-medium h-full"
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex overflow-x-hidden">
      {/* Sidebar Navigation */}
      <Sidebar 
        currentView={currentView} 
        setView={setCurrentView} 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen} 
      />

      {/* Main Content Area */}
      <main className={`flex-grow transition-all duration-300 ${currentView !== 'form' ? 'lg:ml-64' : 'lg:ml-64'} min-h-screen flex flex-col w-full`}>
        
        {/* Top Navigation Bar */}
        <header className="bg-white border-b border-gray-100 px-4 md:px-8 py-3 md:py-4 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-blue-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <div className="relative w-40 md:w-96 group">
              <svg className="w-4 h-4 absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input 
                type="text" 
                placeholder="Buscar..."
                className="w-full bg-gray-50 border-none rounded-xl py-2 md:py-3 pl-9 md:pl-12 pr-4 text-xs md:text-sm focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  if (currentView !== 'list' && e.target.value.length > 0) setCurrentView('list');
                }}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-6">
            <button 
              onClick={() => setCurrentView('form')}
              className="bg-[#2b4c7e] text-white px-3 md:px-6 py-2 rounded-xl font-bold text-[10px] md:text-xs flex items-center gap-1 md:gap-2 hover:bg-[#1e3a8a] transition-colors shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="hidden sm:inline">NUEVO MIEMBRO</span>
              <span className="sm:hidden">NUEVO</span>
            </button>
            <div className="flex items-center gap-2 md:gap-3 border-l border-gray-100 pl-2 md:pl-6">
               <div className="text-right hidden sm:block">
                  <p className="text-[10px] font-black text-gray-400 uppercase leading-none">Admin</p>
                  <p className="text-sm font-bold text-blue-900">Universal</p>
               </div>
               <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-900 rounded-xl flex items-center justify-center text-white font-black text-xs md:text-base">U</div>
            </div>
          </div>
        </header>

        {/* Dynamic View Content */}
        <div className="flex-grow overflow-x-hidden">
          {currentView === 'dashboard' && <Dashboard members={savedMembers} />}

          {currentView === 'list' && (
            <div className="p-4 md:p-8 animate-in slide-in-from-bottom-4 duration-500">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                 <h2 className="text-xl md:text-2xl font-black text-blue-900 uppercase tracking-tighter">Registro de Miembros</h2>
                 <select 
                    value={filterGroup}
                    onChange={(e) => setFilterGroup(e.target.value)}
                    className="w-full md:w-auto bg-white border border-gray-100 px-4 py-2 rounded-xl text-xs font-bold text-blue-900 outline-none shadow-sm"
                  >
                    <option value="">TODOS LOS GRUPOS</option>
                    {Object.values(Group).map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                 {filteredMembers.map((member) => (
                   <div 
                    key={member.id}
                    onClick={() => handleLoadMember(member)}
                    className="bg-white rounded-3xl p-4 md:p-5 flex gap-4 md:gap-5 border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer group relative"
                   >
                     <div className="w-16 h-20 md:w-20 md:h-24 bg-gray-50 rounded-2xl flex-shrink-0 border border-gray-100 overflow-hidden">
                        {member.photo ? <img src={member.photo} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-200"><svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg></div>}
                     </div>
                     <div className="flex flex-col justify-between py-1 overflow-hidden">
                        <h3 className="font-black text-blue-900 uppercase truncate leading-tight text-sm md:text-base">{member.name}</h3>
                        <p className="text-[10px] text-gray-400 font-medium truncate uppercase">{member.address}</p>
                        <div className="flex gap-2 items-center mt-2">
                          <span className="bg-orange-50 text-orange-600 text-[9px] px-2 py-1 rounded-lg font-black uppercase">{member.group || 'Sin Grupo'}</span>
                          <span className="text-[9px] text-gray-300 font-bold">ID: {member.serialNumber}</span>
                        </div>
                     </div>
                     <button 
                       onClick={(e) => handleDelete(member.id!, e)}
                       className="absolute top-3 right-3 text-red-100 hover:text-red-500 transition-colors p-1"
                     >
                       <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                     </button>
                   </div>
                 ))}
                 {filteredMembers.length === 0 && (
                   <div className="col-span-full py-20 text-center text-gray-300 font-bold uppercase tracking-widest">No se encontraron miembros</div>
                 )}
              </div>
            </div>
          )}

          {currentView === 'form' && (
            <div className="p-4 md:p-8 flex justify-center animate-in zoom-in-95 duration-500">
               <div className="bg-white w-full max-w-4xl shadow-xl p-6 md:p-10 relative overflow-hidden border border-gray-100 rounded-lg md:rounded-none">
                  {/* Header Form Section */}
                  <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <div className="flex flex-col gap-2 w-full md:w-auto">
                      <div className="flex items-center gap-2">
                        <span className="text-blue-900 font-bold text-3xl">Nº</span>
                        <div className="border-b-2 border-dotted border-blue-900 w-full md:w-16 text-center text-blue-900 font-bold text-lg">
                          <input 
                            type="text" 
                            name="serialNumber" 
                            value={formData.serialNumber} 
                            onChange={handleInputChange} 
                            className="w-full text-center outline-none bg-transparent"
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-2 border-b border-blue-900/30 pb-1">
                        <span className="text-blue-900 font-bold text-[10px] uppercase">ACTUALIZACIÓN:</span>
                        <input 
                          type="date" 
                          name="updateDate"
                          value={formData.updateDate}
                          onChange={handleInputChange}
                          className="text-[10px] font-bold text-blue-900 bg-transparent outline-none flex-grow"
                        />
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <h1 className="text-blue-900 font-extrabold text-2xl md:text-4xl uppercase tracking-tighter">Registro de Miembros</h1>
                      <p className="text-blue-900 font-bold text-[10px] mt-1 uppercase leading-none">(Por favor escribir con letra legible)</p>
                    </div>

                    <div className="w-32 hidden lg:block"></div>
                  </div>

                  {/* Form Body */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                    <div className="md:col-span-1 flex justify-center md:justify-start">
                      <PhotoUpload photo={formData.photo} onPhotoChange={handlePhotoChange} />
                    </div>
                    <div className="md:col-span-3 space-y-4">
                      <FieldBox label="NOMBRE" name="name" value={formData.name} />
                      <FieldBox label="DIRECCIÓN" name="address" value={formData.address} />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FieldBox label="BARRIO" name="neighborhood" value={formData.neighborhood} />
                        <FieldBox label="CIUDAD" name="city" value={formData.city} />
                      </div>
                      <FieldBox label="DEPARTAMENTO" name="department" value={formData.department} />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FieldBox label="CELULAR" name="cellphone" value={formData.cellphone} />
                      <FieldBox label="EMAIL" name="email" value={formData.email} />
                    </div>

                    <div className="border-2 border-blue-900 px-3 py-2 flex flex-col md:flex-row items-stretch md:items-center min-h-[44px] gap-2">
                      <div className="flex items-center">
                        <span className="text-blue-900 font-bold text-xs uppercase mr-4 whitespace-nowrap">FECHA DE NACIMIENTO:</span>
                        <input 
                          type="date" 
                          name="birthDate" 
                          value={formData.birthDate} 
                          onChange={handleInputChange} 
                          className="bg-transparent outline-none text-gray-800 text-sm font-medium flex-grow md:flex-grow-0"
                        />
                      </div>
                      
                      <div className="flex items-center flex-grow border-t md:border-t-0 md:border-l border-blue-900/20 pt-2 md:pt-0 md:pl-4">
                        <span className="text-blue-900 font-bold text-xs uppercase mr-2 whitespace-nowrap">ESTADO CIVIL:</span>
                        <select
                          name="maritalStatus"
                          value={formData.maritalStatus}
                          onChange={handleInputChange}
                          className="bg-transparent outline-none text-gray-800 text-sm font-bold uppercase cursor-pointer flex-grow"
                        >
                          <option value="">SELECCIONE...</option>
                          {Object.values(MaritalStatus).map((status) => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="border-2 border-blue-900 px-3 py-2 flex flex-col md:flex-row items-stretch md:items-center min-h-[44px] gap-3">
                      <div className="flex items-center">
                        <span className="text-blue-900 font-bold text-xs uppercase mr-4 whitespace-nowrap">FECHA BAUTISMO:</span>
                        <input 
                          type="date" 
                          name="baptismDate" 
                          value={formData.baptismDate} 
                          onChange={handleInputChange} 
                          className="bg-transparent outline-none text-gray-800 text-sm font-medium flex-grow md:flex-grow-0"
                        />
                      </div>
                      
                      <div className="flex items-center border-t md:border-t-0 md:border-l border-blue-900/20 pt-2 md:pt-0 md:pl-4">
                        <span className="text-blue-900 font-bold text-xs uppercase mr-2">IGLESIA:</span>
                        <input 
                          type="text" 
                          name="church" 
                          value={formData.church} 
                          onChange={handleInputChange} 
                          className="bg-transparent border-b border-blue-900 outline-none text-gray-800 text-sm font-medium w-full md:w-24"
                        />
                      </div>

                      <div className="flex items-center border-t md:border-t-0 md:border-l border-blue-900/20 pt-2 md:pt-0 md:pl-4 flex-grow">
                        <span className="text-blue-900 font-bold text-xs uppercase mr-2 whitespace-nowrap">TIEMPO:</span>
                        <input 
                          type="text" 
                          name="timeInChurch" 
                          value={formData.timeInChurch} 
                          onChange={handleInputChange} 
                          placeholder="Ej. 5 años"
                          className="bg-transparent border-b border-blue-900 outline-none text-gray-800 text-sm font-medium w-full"
                        />
                      </div>
                    </div>

                    <div className="border-2 border-blue-900 px-3 py-2 flex items-center h-12 md:h-11">
                      <span className="text-blue-900 font-bold text-xs uppercase mr-4">GRUPO:</span>
                      <select
                        name="group"
                        value={formData.group}
                        onChange={handleInputChange}
                        className="flex-grow bg-transparent outline-none text-gray-800 text-sm font-bold uppercase cursor-pointer h-full"
                      >
                        <option value="">SELECCIONE UN GRUPO...</option>
                        {Object.values(Group).map((g) => (
                          <option key={g} value={g}>{g}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="mt-12 flex flex-col md:flex-row justify-between items-center md:items-end gap-10">
                    <div className="flex items-center gap-4 order-2 md:order-1">
                      <span className="text-blue-900 font-black text-5xl md:text-6xl leading-none tracking-tight">UNIVERSAL</span>
                    </div>

                    <div className="w-full md:w-[400px] order-1 md:order-2">
                      <SignaturePad onSignatureChange={handleSignatureChange} />
                    </div>
                  </div>

                  <div className="mt-12 flex flex-col sm:flex-row justify-center gap-4 md:gap-6">
                     <button 
                        onClick={handleSave}
                        disabled={isSaving}
                        className="bg-blue-900 text-white px-8 md:px-16 py-4 rounded-2xl font-black text-lg md:text-xl shadow-xl hover:bg-blue-800 transition-all flex items-center justify-center gap-3 transform hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                        {isSaving ? 'GUARDANDO...' : 'GUARDAR REGISTRO'}
                      </button>
                      <button 
                        onClick={() => setCurrentView('dashboard')}
                        className="bg-gray-100 text-gray-500 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-gray-200 transition-colors"
                      >
                        CANCELAR
                      </button>
                  </div>
               </div>
            </div>
          )}

          {currentView === 'config' && (
            <div className="p-8 flex items-center justify-center h-full min-h-[60vh]">
               <div className="text-center space-y-4">
                  <div className="w-20 h-20 bg-gray-100 rounded-3xl mx-auto flex items-center justify-center text-gray-300">
                     <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                     </svg>
                  </div>
                  <h3 className="text-xl font-bold text-blue-900 uppercase">Configuración</h3>
                  <p className="text-gray-400 font-medium">Próximamente: Ajustes de base de datos y personalización.</p>
               </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
