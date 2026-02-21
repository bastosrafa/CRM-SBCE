import { useEffect, useRef, useState } from 'react';

interface TabVisibilityState {
  isVisible: boolean;
  isActive: boolean;
  lastVisibleTime: number;
  lastActiveTime: number;
}

/**
 * Hook para detectar mudanças de visibilidade da aba e prevenir recarregamentos desnecessários
 */
export const useTabVisibility = () => {
  const [state, setState] = useState<TabVisibilityState>({
    isVisible: !document.hidden,
    isActive: document.hasFocus(),
    lastVisibleTime: Date.now(),
    lastActiveTime: Date.now()
  });

  const lastEventTime = useRef<number>(0);
  const eventCooldown = 1000; // 1 segundo de cooldown entre eventos

  useEffect(() => {
    const handleVisibilityChange = () => {
      const now = Date.now();
      
      // Evitar eventos muito frequentes
      if (now - lastEventTime.current < eventCooldown) {
        console.log('🛡️ Evento de visibilidade ignorado - muito frequente');
        return;
      }

      const isVisible = !document.hidden;
      
      setState(prev => ({
        ...prev,
        isVisible,
        lastVisibleTime: isVisible ? now : prev.lastVisibleTime
      }));

      lastEventTime.current = now;
      
      if (isVisible) {
        console.log('👁️ Aba voltou a ser visível');
      } else {
        console.log('👁️ Aba perdeu visibilidade');
      }
    };

    const handleFocus = () => {
      const now = Date.now();
      
      // Evitar eventos muito frequentes
      if (now - lastEventTime.current < eventCooldown) {
        console.log('🛡️ Evento de foco ignorado - muito frequente');
        return;
      }

      setState(prev => ({
        ...prev,
        isActive: true,
        lastActiveTime: now
      }));

      lastEventTime.current = now;
      console.log('🎯 Janela ganhou foco');
    };

    const handleBlur = () => {
      const now = Date.now();
      
      // Evitar eventos muito frequentes
      if (now - lastEventTime.current < eventCooldown) {
        console.log('🛡️ Evento de blur ignorado - muito frequente');
        return;
      }

      setState(prev => ({
        ...prev,
        isActive: false
      }));

      lastEventTime.current = now;
      console.log('😴 Janela perdeu foco');
    };

    // Adicionar event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  return {
    ...state,
    isFullyActive: state.isVisible && state.isActive,
    shouldPreventReload: state.isVisible && state.isActive
  };
};
