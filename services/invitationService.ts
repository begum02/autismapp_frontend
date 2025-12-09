import api from './api';

// ============= INTERFACES =============
interface Invitation {
  id: number;
  support_required_user: number;
  support_required_user_name: string;
  support_required_user_email: string;
  responsible_email: string;
  responsible_user: number | null;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  created_at: string;
  accepted_at: string | null;
  is_expired: boolean;
}

interface InviteResponse {
  message: string;
  invitation: Invitation;
}

interface AcceptInvitationResponse {
  message: string;
  invitation: Invitation;
  support_required_user: {
    id: number;
    name: string;
    email: string;
  };
}

// ============= INVITATION SERVICE =============
class InvitationService {
  /**
   * Sorumlu kişiye davet gönder (Destek Gereksinimli Birey)
   */
  async inviteResponsiblePerson(responsibleEmail: string): Promise<InviteResponse> {
    try {
      console.log('📧 Sorumlu kişi davet ediliyor:', responsibleEmail);
      
      const response = await api.post<InviteResponse>('/otp/invite/', {
        responsible_email: responsibleEmail,
      });
      
      console.log('✅ Davet gönderildi');
      return response.data;
    } catch (error: any) {
      console.error('❌ Davet gönderme hatası:', error.response?.data || error.message);
      
      if (error.response?.status === 429) {
        throw new Error('Çok fazla davet gönderdiniz. Lütfen bekleyin');
      }
      
      if (error.response?.data?.detail) {
        throw new Error(error.response.data.detail);
      }
      
      if (error.response?.data?.responsible_email) {
        throw new Error(error.response.data.responsible_email[0]);
      }
      
      throw new Error('Davet gönderilemedi');
    }
  }

  /**
   * Daveti kabul et (Sorumlu Kişi)
   */
  async acceptInvitation(email: string, code: string): Promise<AcceptInvitationResponse> {
    try {
      console.log('✅ Davet kabul ediliyor:', email);
      
      const response = await api.post<AcceptInvitationResponse>('/otp/accept-invitation/', {
        email,
        code,
      });
      
      console.log('✅ Davet kabul edildi');
      return response.data;
    } catch (error: any) {
      console.error('❌ Davet kabul hatası:', error.response?.data || error.message);
      
      if (error.response?.data?.detail) {
        throw new Error(error.response.data.detail);
      }
      
      throw new Error('Davet kabul edilemedi');
    }
  }

  /**
   * Davetleri listele
   */
  async listInvitations(): Promise<Invitation[]> {
    try {
      console.log('📋 Davetler listeleniyor');
      
      const response = await api.get<Invitation[]>('/otp/invitations/');
      
      console.log(`✅ ${response.data.length} davet bulundu`);
      return response.data;
    } catch (error: any) {
      console.error('❌ Davet listeleme hatası:', error.response?.data || error.message);
      throw new Error('Davetler listelenemedi');
    }
  }

  /**
   * Daveti yeniden gönder
   */
  async resendInvitation(invitationId: number): Promise<InviteResponse> {
    try {
      console.log('🔄 Davet yeniden gönderiliyor:', invitationId);
      
      const response = await api.post<InviteResponse>(`/otp/invitations/${invitationId}/resend/`);
      
      console.log('✅ Davet yeniden gönderildi');
      return response.data;
    } catch (error: any) {
      console.error('❌ Davet yeniden gönderme hatası:', error.response?.data || error.message);
      
      if (error.response?.status === 429) {
        throw new Error('Lütfen 1 dakika bekleyin');
      }
      
      throw new Error(error.response?.data?.detail || 'Davet yeniden gönderilemedi');
    }
  }
}

export default new InvitationService();

export type { Invitation, InviteResponse, AcceptInvitationResponse };