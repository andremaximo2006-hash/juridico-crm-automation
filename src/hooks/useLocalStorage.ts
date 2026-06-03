import { useState, useEffect } from 'react';

/**
 * Hook customizado para persistência em localStorage
 * Sincroniza estado com localStorage automaticamente
 */
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  // Estado para armazenar valor
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      // Obter do localStorage por chave
      if (typeof window === 'undefined') {
        return initialValue;
      }

      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Erro ao ler localStorage [${key}]:`, error);
      return initialValue;
    }
  });

  // Retornar versão wrapada de setState que persiste em localStorage
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);

      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Erro ao salvar localStorage [${key}]:`, error);
    }
  };

  return [storedValue, setValue];
}
