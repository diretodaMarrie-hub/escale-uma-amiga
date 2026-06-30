import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Participant } from '../types';
import { format, isToday, isThisWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Download, LogOut, Trash2, Search, Eye, X } from 'lucide-react';
import logo from '../assets/logo.png';

export default function Admin() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterState, setFilterState] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    checkUser();
    fetchParticipants();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/login');
    }
  };

  const fetchParticipants = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('participants')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setParticipants(data);
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este registro?')) {
      await supabase.from('participants').delete().eq('id', id);
      setParticipants(participants.filter(p => p.id !== id));
      if (selectedParticipant?.id === id) {
        setSelectedParticipant(null);
      }
    }
  };

  const handleExportCSV = () => {
    if (participants.length === 0) return;
    
    const headers = [
      'Data', 'Nome Participante', 'Email', 'WhatsApp Participante', 
      'Cidade', 'Estado', 'Nome Amiga', 'WhatsApp Amiga', 'Status'
    ];
    
    const csvContent = [
      headers.join(','),
      ...participants.map(p => [
        format(new Date(p.created_at), 'dd/MM/yyyy HH:mm'),
        `"${p.participant_name}"`,
        p.participant_email,
        p.participant_phone,
        `"${p.participant_city}"`,
        p.participant_state,
        `"${p.friend_name}"`,
        p.friend_phone,
        p.status
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `participantes_${format(new Date(), 'yyyyMMdd_HHmm')}.csv`;
    link.click();
  };

  // Derived state for dashboard
  const totalParticipants = participants.length;
  const totalFriends = participants.length; // 1 friend per participant
  const registeredToday = participants.filter(p => isToday(new Date(p.created_at))).length;
  const registeredThisWeek = participants.filter(p => isThisWeek(new Date(p.created_at))).length;

  // Filtering
  const filteredParticipants = participants.filter(p => {
    const searchLower = search.toLowerCase();
    const matchesSearch = 
      p.participant_name.toLowerCase().includes(searchLower) ||
      p.friend_name.toLowerCase().includes(searchLower) ||
      p.participant_email.toLowerCase().includes(searchLower) ||
      p.participant_phone.includes(search) ||
      p.friend_phone.includes(search);
      
    const matchesState = filterState ? p.participant_state === filterState : true;
    const matchesStatus = filterStatus ? p.status === filterStatus : true;

    return matchesSearch && matchesState && matchesStatus;
  });

  const uniqueStates = Array.from(new Set(participants.map(p => p.participant_state))).sort();
  const uniqueStatuses = Array.from(new Set(participants.map(p => p.status))).sort();

  if (loading) {
    return <div className="min-h-screen bg-neutral-50 flex items-center justify-center">Carregando...</div>;
  }

  return (
    <div className="min-h-screen bg-neutral-50 font-sans text-neutral-800">
      <header className="bg-white border-b border-neutral-200 px-6 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <img 
            src={logo} 
            alt="Marrie for Babies" 
            className="h-10 w-auto object-contain"
          />
          <span className="text-neutral-300 font-light">|</span>
          <h1 className="text-base font-semibold text-neutral-700">Painel Admin</h1>
        </div>
        <button 
          onClick={handleLogout}
          className="text-sm font-medium text-neutral-600 hover:text-neutral-900 flex items-center"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sair
        </button>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100">
            <div className="text-sm font-medium text-neutral-500 mb-1">Total de Participantes</div>
            <div className="text-3xl font-bold text-neutral-900">{totalParticipants}</div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100">
            <div className="text-sm font-medium text-neutral-500 mb-1">Amigas Indicadas</div>
            <div className="text-3xl font-bold text-neutral-900">{totalFriends}</div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100">
            <div className="text-sm font-medium text-neutral-500 mb-1">Cadastros Hoje</div>
            <div className="text-3xl font-bold text-emerald-600">{registeredToday}</div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100">
            <div className="text-sm font-medium text-neutral-500 mb-1">Cadastros na Semana</div>
            <div className="text-3xl font-bold text-emerald-600">{registeredThisWeek}</div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6 items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-neutral-100">
          <div className="flex flex-1 gap-4 w-full lg:w-auto">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input 
                type="text"
                placeholder="Buscar por nome, email ou WhatsApp..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <select 
              value={filterState}
              onChange={(e) => setFilterState(e.target.value)}
              className="px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">Todos os Estados</option>
              {uniqueStates.map(st => <option key={st} value={st}>{st}</option>)}
            </select>
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">Todos os Status</option>
              {uniqueStatuses.map(st => <option key={st} value={st}>{st}</option>)}
            </select>
          </div>
          <button 
            onClick={handleExportCSV}
            className="flex items-center px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors whitespace-nowrap w-full lg:w-auto justify-center"
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar CSV
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-neutral-600">
              <thead className="bg-neutral-50 text-neutral-500 font-medium border-b border-neutral-200">
                <tr>
                  <th className="px-6 py-4">Data</th>
                  <th className="px-6 py-4">Participante</th>
                  <th className="px-6 py-4">WhatsApp</th>
                  <th className="px-6 py-4">Amiga Indicada</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredParticipants.map(p => (
                  <tr key={p.id} className="hover:bg-neutral-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {format(new Date(p.created_at), "dd/MM/yyyy HH:mm")}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-neutral-900">{p.participant_name}</div>
                      <div className="text-xs text-neutral-400">{p.participant_email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{p.participant_phone}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-neutral-900">{p.friend_name}</div>
                      <div className="text-xs text-neutral-400">{p.friend_phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                        {p.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => setSelectedParticipant(p)}
                          className="p-1 text-neutral-400 hover:text-emerald-600 transition-colors"
                          title="Visualizar detalhes"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(p.id)}
                          className="p-1 text-neutral-400 hover:text-red-600 transition-colors"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredParticipants.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-neutral-500">
                      Nenhum registro encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Detail Modal */}
      {selectedParticipant && (
        <div className="fixed inset-0 bg-neutral-900/50 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center px-6 py-4 border-b border-neutral-100">
              <h2 className="text-lg font-bold text-neutral-900">Detalhes do Cadastro</h2>
              <button onClick={() => setSelectedParticipant(null)} className="text-neutral-400 hover:text-neutral-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-3">Dados da Participante</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-neutral-500 mb-1">Nome</div>
                    <div className="font-medium text-neutral-900">{selectedParticipant.participant_name}</div>
                  </div>
                  <div>
                    <div className="text-neutral-500 mb-1">E-mail</div>
                    <div className="font-medium text-neutral-900">{selectedParticipant.participant_email}</div>
                  </div>
                  <div>
                    <div className="text-neutral-500 mb-1">WhatsApp</div>
                    <div className="font-medium text-neutral-900">{selectedParticipant.participant_phone}</div>
                  </div>
                  <div>
                    <div className="text-neutral-500 mb-1">Localização</div>
                    <div className="font-medium text-neutral-900">{selectedParticipant.participant_city} - {selectedParticipant.participant_state}</div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-neutral-100">
                <h3 className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-3">Dados da Amiga Indicada</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-neutral-500 mb-1">Nome</div>
                    <div className="font-medium text-neutral-900">{selectedParticipant.friend_name}</div>
                  </div>
                  <div>
                    <div className="text-neutral-500 mb-1">WhatsApp</div>
                    <div className="font-medium text-neutral-900">{selectedParticipant.friend_phone}</div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-neutral-100">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-neutral-500 mb-1">Data do Cadastro</div>
                    <div className="font-medium text-neutral-900">{format(new Date(selectedParticipant.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}</div>
                  </div>
                  <div>
                    <div className="text-neutral-500 mb-1">Status</div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                      {selectedParticipant.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-100 flex justify-end">
              <button 
                onClick={() => setSelectedParticipant(null)}
                className="px-4 py-2 bg-white border border-neutral-200 text-neutral-700 rounded-lg text-sm font-medium hover:bg-neutral-50 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
