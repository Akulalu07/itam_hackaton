import { useState, useEffect } from 'react';
import { 
  UserPlus, 
  Check, 
  X, 
  Clock,
  Trophy,
  Star
} from 'lucide-react';
import { teamService, JoinRequest } from '../../api/services';

interface JoinRequestsProps {
  teamId: string;
  onRequestHandled?: () => void;
}

interface RequestCardProps {
  request: JoinRequest;
  onAccept: () => void;
  onReject: () => void;
  isLoading: boolean;
}

function RequestCard({ request, onAccept, onReject, isLoading }: RequestCardProps) {
  const user = request.user;

  return (
    <div className="card bg-base-200">
      <div className="card-body p-4">
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="avatar">
            <div className="w-12 h-12 rounded-xl">
              <img 
                src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`} 
                alt={user.name} 
              />
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h4 className="font-bold">{user.name}</h4>
            
            {/* Stats */}
            <div className="flex items-center gap-3 mt-1 text-sm text-base-content/60">
              <div className="flex items-center gap-1">
                <Trophy className="w-4 h-4 text-warning" />
                <span>{user.pts || 0}</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4" />
                <span>{user.mmr || 1000} MMR</span>
              </div>
            </div>

            {/* Skills */}
            {user.skills && user.skills.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {user.skills.slice(0, 4).map((skill: any) => (
                  <span key={skill.id || skill.name} className="badge badge-sm badge-ghost">
                    {skill.name}
                  </span>
                ))}
                {user.skills.length > 4 && (
                  <span className="badge badge-sm badge-ghost">+{user.skills.length - 4}</span>
                )}
              </div>
            )}

            {/* Role */}
            {user.role && (
              <p className="text-sm text-base-content/50 mt-1">
                {user.role}
              </p>
            )}
          </div>
        </div>

        {/* Time */}
        <div className="flex items-center gap-1 text-xs text-base-content/40 mt-2">
          <Clock className="w-3 h-3" />
          <span>{new Date(request.createdAt).toLocaleDateString('ru-RU')}</span>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-3">
          <button 
            onClick={onReject}
            className="btn btn-ghost btn-sm flex-1"
            disabled={isLoading}
          >
            <X className="w-4 h-4" />
            Отклонить
          </button>
          <button 
            onClick={onAccept}
            className="btn btn-success btn-sm flex-1"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="loading loading-spinner loading-xs" />
            ) : (
              <>
                <Check className="w-4 h-4" />
                Принять
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * JoinRequests - Список запросов на вступление (для капитана)
 */
export function JoinRequests({ teamId, onRequestHandled }: JoinRequestsProps) {
  const [requests, setRequests] = useState<JoinRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);

  useEffect(() => {
    loadRequests();
  }, [teamId]);

  const loadRequests = async () => {
    setIsLoading(true);
    try {
      const data = await teamService.getJoinRequests(teamId);
      setRequests(data);
    } catch (error) {
      console.error('Failed to load requests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequest = async (requestId: number, action: 'accept' | 'reject') => {
    setProcessingId(requestId);
    try {
      await teamService.handleJoinRequest(requestId, action);
      // Remove from list
      setRequests(prev => prev.filter(r => r.id !== requestId));
      onRequestHandled?.();
    } catch (error: any) {
      console.error('Failed to handle request:', error);
      alert(error.response?.data?.error || 'Не удалось обработать запрос');
    } finally {
      setProcessingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <span className="loading loading-spinner loading-md text-primary" />
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="text-center py-8 text-base-content/50">
        <UserPlus className="w-10 h-10 mx-auto mb-2 opacity-30" />
        <p>Нет активных заявок</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <UserPlus className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">Заявки на вступление ({requests.length})</h3>
      </div>
      
      {requests.map(request => (
        <RequestCard
          key={request.id}
          request={request}
          onAccept={() => handleRequest(request.id, 'accept')}
          onReject={() => handleRequest(request.id, 'reject')}
          isLoading={processingId === request.id}
        />
      ))}
    </div>
  );
}
