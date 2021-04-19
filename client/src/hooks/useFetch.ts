import useSWR from 'swr';
import api from '../services/api';
import Cookie from 'js-cookie';

export function useFetch(url, initialData?: any) {
  const { data, error, mutate } = useSWR(
    url,
    async (url) => {
      const response = await api.get(url, {
        headers: { Authorization: `Bearer ${Cookie.get()['token']}` },
      });

      return response.data;
    },
    { initialData }
  );

  return { data, error, mutate };
}
