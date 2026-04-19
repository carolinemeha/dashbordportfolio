'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { dataService, ContactMessage } from '@/lib/data';
import { Mail, Trash2, Check, Clock, ExternalLink, Inbox, MessageSquare, Phone, User, Briefcase, Wallet, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAdminI18n } from '@/components/admin/AdminI18nProvider';
import { contactServiceLabel } from '@/lib/admin-ui-labels';

function contactDisplayName(m: ContactMessage) {
  const combined = [m.firstName, m.lastName].filter(Boolean).join(' ').trim();
  return combined || m.name;
}

function budgetLabel(raw: string | undefined, t: (k: string) => string) {
  if (raw == null || raw === '' || raw === 'undefined') return t('pages.contact.budgetUnspecified');
  return raw;
}

export default function ContactPage() {
  const { t, dateLocale } = useAdminI18n();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const data = await dataService.getContactMessages();
      setMessages(data || []);
    };
    fetchData();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm(t('confirm.deleteMessage'))) {
      const success = await dataService.deleteContactMessage(id);
      if (success) {
        const refreshedData = await dataService.getContactMessages();
        setMessages(refreshedData);
        if (selectedMessage?.id === id) {
          setSelectedMessage(null);
        }
      }
    }
  };

  const handleMarkAsRead = async (id: string) => {
    const updated = await dataService.updateContactMessage(id, { status: 'read' });
    if (updated) {
      const refreshedData = await dataService.getContactMessages();
      setMessages(refreshedData);
      if (selectedMessage?.id === id) {
        setSelectedMessage(updated);
      }
    }
  };

  const sortedMessages = useMemo(
    () =>
      [...messages].sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      }),
    [messages]
  );

  const localeLabel = (loc: string | undefined) => {
    if (loc === 'en') return t('pages.contact.localeEn');
    if (loc === 'fr') return t('pages.contact.localeFr');
    return loc || '—';
  };

  return (
    <div className="space-y-6 min-h-[calc(100dvh-12rem)] flex flex-col">
      {messages.length === 0 ? (
        <motion.div initial={false} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28 }} className="flex-1">
          <Card className="glass-card border-dashed border-2 border-border/50 bg-secondary/20 h-full flex items-center justify-center">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="p-4 bg-primary/10 rounded-full mb-4">
                <Inbox className="h-12 w-12 text-primary/60" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">{t('pages.contact.emptyTitle')}</h3>
              <p className="text-muted-foreground mb-6 max-w-sm">{t('pages.contact.emptyDesc')}</p>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <motion.div
          initial={false}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.28 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0"
        >
          <Card className="lg:col-span-1 glass-card overflow-hidden flex flex-col h-full border-border/40">
            <div className="px-4 py-3 border-b border-border/30 bg-secondary/10 flex items-center justify-between shadow-sm z-10">
              <h3 className="font-semibold text-sm text-foreground">{t('pages.contact.allMessages')}</h3>
              <Badge variant="outline" className="bg-background">{messages.length}</Badge>
            </div>
            <div className="overflow-y-auto flex-1 p-2 space-y-2 custom-scrollbar">
              <AnimatePresence>
                {sortedMessages.map((message) => (
                  <motion.div
                    key={message.id}
                    layout
                    initial={{ opacity: 1, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div
                      className={`cursor-pointer transition-all duration-200 rounded-lg p-3 border ${
                        selectedMessage?.id === message.id
                          ? 'bg-primary/10 border-primary/30 shadow-md ring-1 ring-primary/20'
                          : message.status === 'new'
                            ? 'bg-background hover:bg-secondary/50 border-border/50 shadow-sm'
                            : 'bg-secondary/20 hover:bg-secondary/50 border-transparent'
                      }`}
                      onClick={() => setSelectedMessage(message)}
                    >
                      <div className="flex items-start justify-between mb-1">
                        <p className={`font-semibold text-sm truncate pr-2 ${message.status === 'new' ? 'text-foreground' : 'text-foreground/80'}`}>
                          {contactDisplayName(message)}
                        </p>
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap pt-0.5">
                          {new Date(message.createdAt).toLocaleDateString(dateLocale, {
                            day: 'numeric', month: 'short'
                          })}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate mb-2">
                        {message.subject?.trim() || contactServiceLabel(message.service, t)}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        {message.status === 'new' ? (
                          <Badge className="bg-primary hover:bg-primary text-primary-foreground text-[10px] px-1.5 py-0">
                            {t('pages.contact.new')}
                          </Badge>
                        ) : (
                          <span className="text-[10px] text-muted-foreground border border-border/50 rounded px-1.5 py-0.5">{t('pages.contact.read')}</span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </Card>

          <div className="lg:col-span-2 h-full flex flex-col">
            <AnimatePresence mode="wait">
              {selectedMessage ? (
                <motion.div
                  key={selectedMessage.id}
                  initial={false}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  className="h-full"
                >
                  <Card className="h-full flex flex-col glass-card border-border/40 shadow-xl overflow-hidden relative">
                    {selectedMessage.status === 'new' && (
                      <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                    )}
                    <CardHeader className="border-b border-border/30 bg-secondary/5 relative z-10">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <CardTitle className="text-xl mb-1">
                            {selectedMessage.subject?.trim() || contactServiceLabel(selectedMessage.service, t)}
                          </CardTitle>
                          <div className="flex items-center gap-2 text-sm text-foreground/80">
                            <span className="font-semibold">{contactDisplayName(selectedMessage)}</span>
                            <span className="text-muted-foreground">&lt;{selectedMessage.email}&gt;</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {selectedMessage.status === 'new' && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-primary/20 hover:bg-primary/10 text-primary"
                              onClick={() => handleMarkAsRead(selectedMessage.id)}
                            >
                              <Check className="h-4 w-4 mr-2" />
                              {t('pages.contact.markRead')}
                            </Button>
                          )}
                          <Button
                            variant="secondary"
                            size="sm"
                            asChild
                          >
                            <a href={`mailto:${selectedMessage.email}`}>
                              <ExternalLink className="h-4 w-4 sm:mr-2" />
                              <span className="hidden sm:inline">{t('pages.contact.reply')}</span>
                            </a>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleDelete(selectedMessage.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-y-auto p-6 space-y-6">
                      <div className="flex items-center justify-between text-xs text-muted-foreground pb-4 border-b border-border/30">
                        <div className="flex items-center border border-border/50 rounded-md px-2 py-1 bg-secondary/20">
                          <Clock className="h-3.5 w-3.5 mr-1.5" />
                          {new Date(selectedMessage.createdAt).toLocaleDateString(dateLocale, {
                            day: 'numeric', month: 'long', year: 'numeric',
                            hour: '2-digit', minute: '2-digit'
                          })}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                        <div className="flex items-start gap-2 rounded-lg border border-border/40 bg-secondary/20 p-3">
                          <User className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                          <div>
                            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{t('pages.contact.firstName')}</p>
                            <p className="font-medium">{selectedMessage.firstName || '—'}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2 rounded-lg border border-border/40 bg-secondary/20 p-3">
                          <User className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                          <div>
                            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{t('pages.contact.lastName')}</p>
                            <p className="font-medium">{selectedMessage.lastName || '—'}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2 rounded-lg border border-border/40 bg-secondary/20 p-3 sm:col-span-2">
                          <Phone className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                          <div>
                            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{t('pages.contact.phone')}</p>
                            <p className="font-medium">{selectedMessage.phone || '—'}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2 rounded-lg border border-border/40 bg-secondary/20 p-3">
                          <Briefcase className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                          <div>
                            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{t('pages.contact.service')}</p>
                            <p className="font-medium">{contactServiceLabel(selectedMessage.service, t)}</p>
                            {selectedMessage.service && (
                              <p className="text-xs text-muted-foreground mt-0.5">{t('pages.contact.serviceKey')} {selectedMessage.service}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-start gap-2 rounded-lg border border-border/40 bg-secondary/20 p-3">
                          <Wallet className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                          <div>
                            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{t('pages.contact.budgetRaw')}</p>
                            <p className="font-medium">{budgetLabel(selectedMessage.budget, t)}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2 rounded-lg border border-border/40 bg-secondary/20 p-3 sm:col-span-2">
                          <Globe className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                          <div>
                            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{t('pages.contact.formLocale')}</p>
                            <p className="font-medium">{localeLabel(selectedMessage.locale)}</p>
                          </div>
                        </div>
                      </div>

                      <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none">
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">{t('pages.contact.message')}</p>
                        <p className="whitespace-pre-wrap leading-relaxed text-foreground/90">
                          {selectedMessage.message}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : (
                <motion.div
                  key="empty-state"
                  initial={false}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full"
                >
                  <Card className="h-full flex flex-col items-center justify-center p-8 glass-card border-dashed border-2 border-border/50 bg-secondary/10">
                    <div className="p-5 bg-background rounded-full shadow-inner mb-4">
                      <MessageSquare className="h-10 w-10 text-muted-foreground/50" />
                    </div>
                    <h3 className="text-lg font-medium text-foreground mb-2">{t('pages.contact.selectMessage')}</h3>
                    <p className="text-muted-foreground text-center max-w-xs">{t('pages.contact.selectMessageDesc')}</p>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </div>
  );
}
