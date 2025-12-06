import { useState, useMemo } from 'react';
import { 
  Search, 
  Filter,
  ChevronDown,
  ChevronUp,
  MoreVertical,
  Eye,
  Ban,
  Mail,
  Trophy,
  Star,
  Download
} from 'lucide-react';
import { User } from '../../types';
import { mockUsers } from '../../data/mockData';

// Status badge styles
const statusStyles: Record<string, string> = {
  looking: 'badge-success',
  in_team: 'badge-info',
  inactive: 'badge-ghost',
};

const statusLabels: Record<string, string> = {
  looking: 'Ищет команду',
  in_team: 'В команде',
  inactive: 'Неактивен',
};

// Role badge styles
const roleStyles: Record<string, string> = {
  participant: 'badge-outline',
  captain: 'badge-primary',
  admin: 'badge-secondary',
};

type SortField = 'name' | 'pts' | 'mmr' | 'createdAt';
type SortOrder = 'asc' | 'desc';

/**
 * UserTable - Таблица пользователей (Admin)
 */
export function UserTable() {
  const [users] = useState<User[]>(mockUsers);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());

  // Filter and sort users
  const filteredUsers = useMemo(() => {
    let result = users.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.skills.some(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      return matchesSearch && matchesStatus && matchesRole;
    });

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'pts':
          comparison = a.pts - b.pts;
          break;
        case 'mmr':
          comparison = a.mmr - b.mmr;
          break;
        case 'createdAt':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [users, searchQuery, statusFilter, roleFilter, sortField, sortOrder]);

  // Toggle sort
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  // Select all
  const toggleSelectAll = () => {
    if (selectedUsers.size === filteredUsers.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(filteredUsers.map(u => u.id)));
    }
  };

  // Toggle single selection
  const toggleSelect = (userId: string) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  // Export CSV
  const exportCSV = () => {
    const headers = ['Имя', 'Email', 'Роль', 'Статус', 'PTS', 'MMR', 'Навыки'];
    const rows = filteredUsers.map(u => [
      u.name,
      u.email || '-',
      u.role,
      u.status,
      u.pts.toString(),
      u.mmr.toString(),
      u.skills.map(s => s.name).join('; ')
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `users_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortOrder === 'asc' 
      ? <ChevronUp className="w-4 h-4 inline ml-1" />
      : <ChevronDown className="w-4 h-4 inline ml-1" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Пользователи</h1>
          <p className="text-base-content/60">
            Всего: {users.length} | Показано: {filteredUsers.length}
            {selectedUsers.size > 0 && ` | Выбрано: ${selectedUsers.size}`}
          </p>
        </div>
        <button className="btn btn-outline" onClick={exportCSV}>
          <Download className="w-4 h-4" />
          Экспорт CSV
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center bg-base-200 p-4 rounded-lg flex-wrap">
        <div className="form-control flex-1 min-w-64">
          <div className="join w-full">
            <span className="join-item btn btn-ghost btn-disabled">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Поиск по имени или навыкам..."
              className="input input-bordered join-item w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex gap-2 items-center">
          <Filter className="w-4 h-4 text-base-content/60" />
          <select 
            className="select select-bordered select-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Все статусы</option>
            <option value="looking">Ищет команду</option>
            <option value="in_team">В команде</option>
            <option value="inactive">Неактивен</option>
          </select>
          
          <select 
            className="select select-bordered select-sm"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="all">Все роли</option>
            <option value="participant">Участник</option>
            <option value="captain">Капитан</option>
            <option value="admin">Админ</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-base-200 rounded-lg overflow-x-auto">
        <table className="table table-zebra">
          <thead>
            <tr className="bg-base-300">
              <th>
                <input 
                  type="checkbox" 
                  className="checkbox checkbox-sm"
                  checked={selectedUsers.size === filteredUsers.length && filteredUsers.length > 0}
                  onChange={toggleSelectAll}
                />
              </th>
              <th 
                className="cursor-pointer hover:bg-base-content/5"
                onClick={() => handleSort('name')}
              >
                Пользователь <SortIcon field="name" />
              </th>
              <th>Навыки</th>
              <th>Статус</th>
              <th 
                className="cursor-pointer hover:bg-base-content/5"
                onClick={() => handleSort('pts')}
              >
                <Trophy className="w-4 h-4 inline mr-1" />
                PTS <SortIcon field="pts" />
              </th>
              <th 
                className="cursor-pointer hover:bg-base-content/5"
                onClick={() => handleSort('mmr')}
              >
                <Star className="w-4 h-4 inline mr-1" />
                MMR <SortIcon field="mmr" />
              </th>
              <th className="w-20">Действия</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user.id} className="hover">
                <td>
                  <input 
                    type="checkbox" 
                    className="checkbox checkbox-sm"
                    checked={selectedUsers.has(user.id)}
                    onChange={() => toggleSelect(user.id)}
                  />
                </td>
                <td>
                  <div className="flex items-center gap-3">
                    <div className="avatar">
                      <div className="w-10 h-10 rounded-lg">
                        <img src={user.avatar} alt={user.name} />
                      </div>
                    </div>
                    <div>
                      <div className="font-semibold">{user.name}</div>
                      <div className="text-xs text-base-content/60 flex items-center gap-2">
                        <span className={`badge badge-xs ${roleStyles[user.role]}`}>
                          {user.role}
                        </span>
                        <span>{user.title}</span>
                      </div>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="flex flex-wrap gap-1 max-w-xs">
                    {user.skills.slice(0, 3).map(skill => (
                      <span key={skill.id} className="badge badge-sm badge-outline">
                        {skill.name}
                      </span>
                    ))}
                    {user.skills.length > 3 && (
                      <span className="badge badge-sm badge-ghost">
                        +{user.skills.length - 3}
                      </span>
                    )}
                  </div>
                </td>
                <td>
                  <span className={`badge ${statusStyles[user.status]}`}>
                    {statusLabels[user.status]}
                  </span>
                </td>
                <td>
                  <span className="font-mono font-semibold">{user.pts.toLocaleString()}</span>
                </td>
                <td>
                  <span className="font-mono font-semibold">{user.mmr.toLocaleString()}</span>
                </td>
                <td>
                  <div className="dropdown dropdown-end">
                    <label tabIndex={0} className="btn btn-ghost btn-sm btn-square">
                      <MoreVertical className="w-4 h-4" />
                    </label>
                    <ul tabIndex={0} className="dropdown-content z-10 menu p-2 shadow bg-base-100 rounded-box w-44">
                      <li>
                        <button>
                          <Eye className="w-4 h-4" />
                          Профиль
                        </button>
                      </li>
                      <li>
                        <button>
                          <Mail className="w-4 h-4" />
                          Написать
                        </button>
                      </li>
                      <li>
                        <button className="text-error">
                          <Ban className="w-4 h-4" />
                          Заблокировать
                        </button>
                      </li>
                    </ul>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredUsers.length === 0 && (
          <div className="p-8 text-center text-base-content/60">
            <p>Пользователи не найдены</p>
          </div>
        )}
      </div>

      {/* Pagination placeholder */}
      <div className="flex justify-center">
        <div className="join">
          <button className="join-item btn btn-sm">«</button>
          <button className="join-item btn btn-sm btn-active">1</button>
          <button className="join-item btn btn-sm">2</button>
          <button className="join-item btn btn-sm">3</button>
          <button className="join-item btn btn-sm">»</button>
        </div>
      </div>
    </div>
  );
}
