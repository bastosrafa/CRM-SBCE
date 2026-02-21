import { useEffect, useRef, useState } from 'react';

interface UseActiveStateOptions {
  preventReloadOnFocus?: boolean;
  preventReloadOnVisibility?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
  onVisible?: () => void;
  onHidden?: () => void;
}

/**
 * Hook para gerenciar o estado ativo da aplicação e evitar recarregamentos desnecessários
 * quando o usuário troca de aba ou janela
 */
export const useActiveState = (options: UseActiveStateOptions = {}) => {
  const {
    preventReloadOnFocus = true,
    preventReloadOnVisibility = true,
    onFocus,
    onBlur,
    onVisible,
    onHidden
  } = options;

  const [isActive, setIsActive] = useState(true);
  const [isVisible, setIsVisible] = useState(!document.hidden);
  const lastActiveTime = useRef<number>(Date.now());
  const lastVisibleTime = useRef<number>(Date.now());

  useEffect(() => {
    const handleFocus = () => {
      const now = Date.now();
      const timeSinceLastFocus = now - lastActiveTime.current;
      
      // Só considerar como foco se passou mais de 1 segundo desde o último foco
      // Isso evita múltiplos eventos de foco em sequência
      if (timeSinceLastFocus > 1000) {
        console.log('🎯 Janela ganhou foco');
        setIsActive(true);
        lastActiveTime.current = now;
        
        if (onFocus) {
          onFocus();
        }
      }
    };

    const handleBlur = () => {
      console.log('😴 Janela perdeu foco');
      setIsActive(false);
      
      if (onBlur) {
        onBlur();
      }
    };

    const handleVisibilityChange = () => {
      const isNowVisible = !document.hidden;
      const now = Date.now();
      
      if (isNowVisible) {
        const timeSinceLastVisible = now - lastVisibleTime.current;
        
        // Só considerar como visível se passou mais de 1 segundo desde a última mudança
        if (timeSinceLastVisible > 1000) {
          console.log('👁️ Aba voltou ao foco');
          setIsVisible(true);
          lastVisibleTime.current = now;
          
          if (onVisible) {
            onVisible();
          }
        }
      } else {
        console.log('👁️ Aba perdeu foco');
        setIsVisible(false);
        
        if (onHidden) {
          onHidden();
        }
      }
    };

    // Adicionar event listeners apenas se as opções estão habilitadas
    if (preventReloadOnFocus) {
      window.addEventListener('focus', handleFocus);
      window.addEventListener('blur', handleBlur);
    }

    if (preventReloadOnVisibility) {
      document.addEventListener('visibilitychange', handleVisibilityChange);
    }

    return () => {
      if (preventReloadOnFocus) {
        window.removeEventListener('focus', handleFocus);
        window.removeEventListener('blur', handleBlur);
      }

      if (preventReloadOnVisibility) {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      }
    };
  }, [preventReloadOnFocus, preventReloadOnVisibility, onFocus, onBlur, onVisible, onHidden]);

  return {
    isActive,
    isVisible,
    isFullyActive: isActive && isVisible
  };
};

/**
 * Hook para evitar recarregamentos desnecessários de dados
 * quando o usuário volta para a aba/janela
 */
export const usePreventUnnecessaryReloads = <T>(
  data: T[],
  shouldPreventReload: (data: T[]) => boolean = (data) => data.length > 0
) => {
  const { isActive, isVisible } = useActiveState({
    onFocus: () => {
      if (shouldPreventReload(data)) {
        console.log('🛡️ Prevenindo reload desnecessário - dados já carregados');
      }
    },
    onVisible: () => {
      if (shouldPreventReload(data)) {
        console.log('🛡️ Prevenindo reload desnecessário - dados já carregados');
      }
    }
  });

  return {
    shouldReload: !shouldPreventReload(data) || (!isActive && !isVisible),
    isActive,
    isVisible
  };
};
