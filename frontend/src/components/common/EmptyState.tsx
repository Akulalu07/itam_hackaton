import React from 'react';

export interface EmptyStateProps {
  /** Иконка (SVG или emoji) */
  icon?: React.ReactNode;
  /** Заголовок */
  title: string;
  /** Описание */
  description?: string;
  /** Текст кнопки действия */
  actionText?: string;
  /** Обработчик клика на кнопку */
  onAction?: () => void;
  /** Дополнительные CSS классы */
  className?: string;
  /** Вариант отображения */
  variant?: 'default' | 'compact' | 'card';
}

/**
 * Универсальный компонент для отображения пустых состояний.
 * Используется когда списки пусты, данные не найдены и т.д.
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionText,
  onAction,
  className = '',
  variant = 'default',
}) => {
  const variantClasses = {
    default: 'py-12 px-6',
    compact: 'py-6 px-4',
    card: 'py-8 px-6 bg-base-200 rounded-xl',
  };

  return (
    <div 
      className={`flex flex-col items-center justify-center text-center ${variantClasses[variant]} ${className}`}
    >
      {/* Иконка */}
      {icon && (
        <div className="text-5xl mb-4 opacity-60">
          {icon}
        </div>
      )}

      {/* Заголовок */}
      <h3 className="text-lg font-semibold text-base-content mb-2">
        {title}
      </h3>

      {/* Описание */}
      {description && (
        <p className="text-sm text-base-content/60 max-w-sm mb-4">
          {description}
        </p>
      )}

      {/* Кнопка действия */}
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="btn btn-primary btn-sm"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

// Предустановленные варианты для частых случаев
export const EmptyStatePresets = {
  // Нет команды
  NoTeam: (onCreateTeam?: () => void) => (
    <EmptyState
      icon="👥"
      title="У вас пока нет команды"
      description="Создайте свою команду или найдите существующую через поиск участников"
      actionText={onCreateTeam ? "Создать команду" : undefined}
      onAction={onCreateTeam}
    />
  ),

  // Нет приглашений
  NoInvites: () => (
    <EmptyState
      icon="📬"
      title="Приглашений пока нет"
      description="Начните искать участников и отправляйте им приглашения"
    />
  ),

  // Пустая колода свайпов
  NoSwipes: (onRefresh?: () => void) => (
    <EmptyState
      icon="🔍"
      title="Участников не найдено"
      description="Похоже, вы просмотрели всех доступных участников. Попробуйте позже!"
      actionText={onRefresh ? "Обновить" : undefined}
      onAction={onRefresh}
    />
  ),

  // Нет хакатонов
  NoHackathons: () => (
    <EmptyState
      icon="🏆"
      title="Хакатонов пока нет"
      description="Скоро здесь появятся новые хакатоны. Следите за обновлениями!"
    />
  ),

  // Ошибка загрузки
  LoadError: (onRetry?: () => void) => (
    <EmptyState
      icon="⚠️"
      title="Ошибка загрузки"
      description="Не удалось загрузить данные. Проверьте подключение к интернету."
      actionText={onRetry ? "Повторить" : undefined}
      onAction={onRetry}
    />
  ),

  // Нужно заполнить профиль
  ProfileIncomplete: (onSetup?: () => void) => (
    <EmptyState
      icon="✏️"
      title="Заполните профиль"
      description="Укажите свои навыки и опыт, чтобы другие участники могли вас найти"
      actionText={onSetup ? "Настроить профиль" : undefined}
      onAction={onSetup}
    />
  ),

  // Нет активных хакатонов
  NoActiveHackathon: (onBrowse?: () => void) => (
    <EmptyState
      icon="🎯"
      title="Вы не участвуете в хакатоне"
      description="Выберите хакатон, чтобы начать поиск команды"
      actionText={onBrowse ? "Выбрать хакатон" : undefined}
      onAction={onBrowse}
    />
  ),
};

export default EmptyState;
