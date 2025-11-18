import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type SharePermission = 'owner' | 'admin' | 'editor' | 'viewer';

export interface SharedAccess {
  id: string;
  user_id: string;
  shared_by: string;
  permission: SharePermission;
  created_at: string;
  user_email?: string;
}

interface SharedAccessState {
  sharedAccess: SharedAccess[];
  sharedWith: SharedAccess[];
  loading: boolean;
  fetchSharedAccess: () => Promise<void>;
  fetchSharedWith: () => Promise<void>;
  inviteUser: (email: string, permission: SharePermission) => Promise<void>;
  updatePermission: (id: string, permission: SharePermission) => Promise<void>;
  removeAccess: (id: string) => Promise<void>;
}

export const useSharedAccessStore = create<SharedAccessState>((set, get) => ({
  sharedAccess: [],
  sharedWith: [],
  loading: false,

  fetchSharedAccess: async () => {
    try {
      set({ loading: true });
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('shared_access')
        .select('*')
        .eq('shared_by', user.id);

      if (error) throw error;

      set({ sharedAccess: data || [] });
    } catch (error) {
      console.error('Error fetching shared access:', error);
      toast.error('Erro ao carregar compartilhamentos');
    } finally {
      set({ loading: false });
    }
  },

  fetchSharedWith: async () => {
    try {
      set({ loading: true });
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('shared_access')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      set({ sharedWith: data || [] });
    } catch (error) {
      console.error('Error fetching shared with:', error);
      toast.error('Erro ao carregar compartilhamentos');
    } finally {
      set({ loading: false });
    }
  },

  inviteUser: async (email: string, permission: SharePermission) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Use email diretamente no lugar do user_id por enquanto
      // Uma abordagem melhor seria criar uma tabela de convites
      toast.info('Funcionalidade de convite em desenvolvimento. Por favor, compartilhe através do email diretamente.');
      
    } catch (error: any) {
      console.error('Error inviting user:', error);
      toast.error('Erro ao enviar convite');
    }
  },

  updatePermission: async (id: string, permission: SharePermission) => {
    try {
      const { error } = await supabase
        .from('shared_access')
        .update({ permission })
        .eq('id', id);

      if (error) throw error;

      toast.success('Permissão atualizada!');
      get().fetchSharedAccess();
    } catch (error) {
      console.error('Error updating permission:', error);
      toast.error('Erro ao atualizar permissão');
    }
  },

  removeAccess: async (id: string) => {
    try {
      const { error } = await supabase
        .from('shared_access')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Acesso removido!');
      get().fetchSharedAccess();
    } catch (error) {
      console.error('Error removing access:', error);
      toast.error('Erro ao remover acesso');
    }
  },
}));
