/**
 * Support Hook
 * 
 * Hook untuk mengelola tiket support.
 * Menggunakan localStorage sebagai primary storage (tidak wajib Supabase)
 * Tetap mencoba kirim ke Telegram & Email jika tersedia
 */

import { useState, useCallback } from 'react';
import { TelegramBot } from '@/lib/telegram';
import { EmailService } from '@/lib/emailjs';
import { useAppStore } from '@/store/appStore';
import { toast } from 'sonner';

// ============================================
// Types
// ============================================

export interface SupportTicket {
  id: string;
  user_id?: string;
  subject: string;
  category: string;
  email: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  created_at: string;
  updated_at?: string;
}

export interface TicketFormData {
  subject: string;
  category: string;
  email: string;
  description: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
}

// ============================================
// Local Storage Keys
// ============================================

const TICKETS_STORAGE_KEY = 'layanan_digital_tickets';

// ============================================
// Helper Functions
// ============================================

function generateTicketId(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `TKT-${timestamp}-${random}`;
}

function getStoredTickets(): SupportTicket[] {
  try {
    const stored = localStorage.getItem(TICKETS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveTicket(ticket: SupportTicket): void {
  try {
    const tickets = getStoredTickets();
    tickets.unshift(ticket); // Add to beginning
    localStorage.setItem(TICKETS_STORAGE_KEY, JSON.stringify(tickets));
  } catch (error) {
    console.error('[useSupport] Failed to save ticket:', error);
  }
}

// ============================================
// Hook
// ============================================

export const useSupport = () => {
  const { user } = useAppStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);

  /**
   * Submit new ticket
   * Selalu berhasil menyimpan ke localStorage
   * Mencoba kirim notifikasi ke Telegram & Email (tidak wajib)
   */
  const submitTicket = useCallback(async (formData: TicketFormData): Promise<SupportTicket> => {
    setIsSubmitting(true);
    
    try {
      // 1. Create ticket object
      const ticket: SupportTicket = {
        id: generateTicketId(),
        user_id: user?.uid,
        subject: formData.subject,
        category: formData.category,
        email: formData.email,
        description: formData.description,
        priority: formData.priority || 'medium',
        status: 'open',
        created_at: new Date().toISOString(),
      };

      // 2. Save to localStorage (ALWAYS works)
      saveTicket(ticket);
      
      // 3. Try send Telegram notification (optional)
      try {
        await TelegramBot.sendTicketNotification({
          ticketId: ticket.id,
          subject: ticket.subject,
          category: ticket.category,
          email: ticket.email,
          description: ticket.description,
          timestamp: new Date(ticket.created_at).toLocaleString('id-ID'),
        });
        console.log('[useSupport] Telegram notification sent');
      } catch (telegramError) {
        console.log('[useSupport] Telegram notification failed (optional):', telegramError);
        // Tidak throw error - ini optional
      }

      // 4. Try send Email notification (optional)
      try {
        const ownerEmail = import.meta.env.VITE_OWNER_EMAIL || 'admin@example.com';
        await EmailService.sendNotificationEmail(
          ownerEmail,
          'Admin',
          `🎫 Tiket Baru: ${ticket.subject}`,
          `Tiket dukungan baru telah dibuat:

📋 ID: #${ticket.id}
📌 Subjek: ${ticket.subject}
🏷️ Kategori: ${ticket.category}
📧 Email Pengirim: ${ticket.email}
🕐 Waktu: ${new Date(ticket.created_at).toLocaleString('id-ID')}

📝 Deskripsi:
${ticket.description}

Silakan segera ditindaklanjuti.`
        );
        console.log('[useSupport] Email notification sent');
      } catch (emailError) {
        console.log('[useSupport] Email notification failed (optional):', emailError);
        // Tidak throw error - ini optional
      }

      // 5. Update local state
      setTickets(prev => [ticket, ...prev]);
      
      console.log('[useSupport] Ticket created:', ticket.id);
      return ticket;
      
    } catch (error: any) {
      console.error('[useSupport] Error submitting ticket:', error);
      throw new Error('Gagal membuat tiket. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  }, [user?.uid]);

  /**
   * Get user's tickets
   */
  const fetchUserTickets = useCallback(async () => {
    try {
      const allTickets = getStoredTickets();
      
      if (user?.uid) {
        // Filter by user_id jika logged in
        const userTickets = allTickets.filter(t => t.user_id === user.uid);
        setTickets(userTickets);
      } else {
        // Guest user - get tickets by email (optional)
        setTickets([]);
      }
    } catch (error) {
      console.error('[useSupport] Error fetching tickets:', error);
      setTickets([]);
    }
  }, [user?.uid]);

  /**
   * Get all tickets (admin only)
   */
  const fetchAllTickets = useCallback(async () => {
    try {
      const allTickets = getStoredTickets();
      setTickets(allTickets);
    } catch (error) {
      console.error('[useSupport] Error fetching all tickets:', error);
      setTickets([]);
    }
  }, []);

  /**
   * Update ticket status
   */
  const updateTicketStatus = useCallback(async (ticketId: string, status: SupportTicket['status']) => {
    try {
      const allTickets = getStoredTickets();
      const updated = allTickets.map(t => 
        t.id === ticketId 
          ? { ...t, status, updated_at: new Date().toISOString() }
          : t
      );
      localStorage.setItem(TICKETS_STORAGE_KEY, JSON.stringify(updated));
      
      // Update local state
      setTickets(prev => 
        prev.map(t => 
          t.id === ticketId 
            ? { ...t, status, updated_at: new Date().toISOString() }
            : t
        )
      );
      
      toast.success('Status tiket diperbarui');
    } catch (error) {
      console.error('[useSupport] Error updating ticket:', error);
      toast.error('Gagal memperbarui status tiket');
    }
  }, []);

  return {
    tickets,
    isSubmitting,
    submitTicket,
    fetchUserTickets,
    fetchAllTickets,
    updateTicketStatus,
  };
};

export default useSupport;
