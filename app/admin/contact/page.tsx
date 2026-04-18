'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { dataService, ContactMessage } from '@/lib/data';
import { Mail, Trash2, Check, Clock, ExternalLink, Inbox, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ContactPage() {
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
    if (confirm('Êtes-vous sûr de vouloir supprimer ce message ?')) {
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

  // Trier les messages par date (le plus récent en premier)
  const sortedMessages = [...messages].sort((a, b) => {
    const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
    const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
    return dateB - dateA;
  });

  return (
    <div className="space-y-8 h-[calc(100vh-100px)] flex flex-col">
      <div>
        <motion.h1 
          {...{ initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0 } } as any}
          className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent"
        >
          Boîte de réception
        </motion.h1>
        <motion.p 
          {...{ initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0 }, transition: { delay: 0.1 } } as any}
          className="mt-2 text-sm text-muted-foreground"
        >
          Gérez les messages envoyés depuis votre formulaire de contact
        </motion.p>
      </div>

      {messages.length === 0 ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex-1">
          <Card className="glass-card border-dashed border-2 border-border/50 bg-secondary/20 h-full flex items-center justify-center">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="p-4 bg-primary/10 rounded-full mb-4">
                <Inbox className="h-12 w-12 text-primary/60" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Boîte de réception vide</h3>
              <p className="text-muted-foreground mb-6 max-w-sm">Vous n'avez pas encore reçu de messages.</p>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0"
        >
          {/* Liste des messages */}
          <Card className="lg:col-span-1 glass-card overflow-hidden flex flex-col h-full border-border/40">
            <div className="px-4 py-3 border-b border-border/30 bg-secondary/10 flex items-center justify-between shadow-sm z-10">
              <h3 className="font-semibold text-sm text-foreground">Tous les messages</h3>
              <Badge variant="outline" className="bg-background">{messages.length}</Badge>
            </div>
            <div className="overflow-y-auto flex-1 p-2 space-y-2 custom-scrollbar">
              <AnimatePresence>
                {sortedMessages.map((message) => (
                  <motion.div
                    key={message.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
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
                          {message.name}
                        </p>
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap pt-0.5">
                          {new Date(message.date).toLocaleDateString('fr-FR', {
                            day: 'numeric', month: 'short'
                          })}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate mb-2">{message.subject}</p>
                      <div className="flex items-center justify-between mt-2">
                        {message.status === 'new' ? (
                          <Badge className="bg-primary hover:bg-primary text-primary-foreground text-[10px] px-1.5 py-0">
                            Nouveau
                          </Badge>
                        ) : (
                          <span className="text-[10px] text-muted-foreground border border-border/50 rounded px-1.5 py-0.5">Lu</span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </Card>

          {/* Visualisation du message */}
          <div className="lg:col-span-2 h-full flex flex-col">
            <AnimatePresence mode="wait">
              {selectedMessage ? (
                <motion.div
                  key={selectedMessage.id}
                  initial={{ opacity: 0, y: 10 }}
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
                          <CardTitle className="text-xl mb-1">{selectedMessage.subject}</CardTitle>
                          <div className="flex items-center gap-2 text-sm text-foreground/80">
                            <span className="font-semibold">{selectedMessage.name}</span>
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
                              Marquer lu
                            </Button>
                          )}
                          <Button
                            variant="secondary"
                            size="sm"
                            asChild
                          >
                            <a href={`mailto:${selectedMessage.email}`}>
                              <ExternalLink className="h-4 w-4 sm:mr-2" />
                              <span className="hidden sm:inline">Répondre</span>
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
                          {new Date(selectedMessage.date).toLocaleDateString('fr-FR', {
                            day: 'numeric', month: 'long', year: 'numeric',
                            hour: '2-digit', minute: '2-digit'
                          })}
                        </div>
                      </div>
                      
                      <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none">
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
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full"
                >
                  <Card className="h-full flex flex-col items-center justify-center p-8 glass-card border-dashed border-2 border-border/50 bg-secondary/10">
                    <div className="p-5 bg-background rounded-full shadow-inner mb-4">
                      <MessageSquare className="h-10 w-10 text-muted-foreground/50" />
                    </div>
                    <h3 className="text-lg font-medium text-foreground mb-2">Sélectionnez un message</h3>
                    <p className="text-muted-foreground text-center max-w-xs">Choisissez un message dans la liste à gauche pour voir son contenu et y répondre.</p>
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