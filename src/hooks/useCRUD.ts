import { useLocalStorage } from './useLocalStorage';

/**
 * Hook genérico para operações CRUD
 * Gerencia adicionar, editar, deletar, duplicar
 */
interface CRUDItem {
  id: string;
}

export function useCRUD<T extends CRUDItem>(
  key: string,
  initialValue: T[]
) {
  const [items, setItems] = useLocalStorage<T[]>(key, initialValue);

  // Adicionar novo item
  const add = (item: Omit<T, 'id'>) => {
    const newItem = {
      ...item,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    } as T;
    setItems([...items, newItem]);
    return newItem;
  };

  // Atualizar item existente
  const update = (id: string, updates: Partial<T>) => {
    setItems(items.map(item => (item.id === id ? { ...item, ...updates } : item)));
  };

  // Deletar item
  const remove = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  // Duplicar item
  const duplicate = (id: string) => {
    const itemToDuplicate = items.find(item => item.id === id);
    if (!itemToDuplicate) return null;

    const duplicated = {
      ...itemToDuplicate,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    } as T;
    setItems([...items, duplicated]);
    return duplicated;
  };

  // Obter item por ID
  const getById = (id: string) => items.find(item => item.id === id);

  // Limpar todos os itens
  const clear = () => setItems([]);

  return {
    items,
    add,
    update,
    remove,
    duplicate,
    getById,
    clear,
    setItems,
  };
}
