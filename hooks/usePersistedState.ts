import { useState, useEffect, Dispatch, SetStateAction } from 'react';

function usePersistedState<T>(key: string, initialState: T): [T, Dispatch<SetStateAction<T>>] {
  const [state, setState] = useState<T>(() => {
    const storageValue = localStorage.getItem(key);
    if (storageValue) {
      try {
        return JSON.parse(storageValue);
      } catch (error) {
        console.error(`Error parsing localStorage key "${key}":`, error);
        return initialState;
      }
    } else {
      return initialState;
    }
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(state));
  }, [key, state]);

  return [state, setState];
}

export default usePersistedState;