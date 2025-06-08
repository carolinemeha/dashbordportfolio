'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { dataService, ContactMessage } from '@/lib/data';
import { Mail, Trash2, Check, Clock, ExternalLink } from 'lucide-react';

export default function ContactPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);

  useEffect(() => {
    setMessages(dataService.getContactMessages());
  }, []);

  const handleDelete = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce message ?')) {
      dataService.deleteContactMessage(id);
      setMessages(dataService.getContactMessages());
      if (selectedMessage?.id === id) {
        setSelectedMessage(null);
      }
    }
  };

  const handleMarkAsRead = (id: string) => {
    dataService.updateContactMessage(id, { status: 'read' });
    setMessages(dataService.getContactMessages());
    if (selectedMessage?.id === id) {
      setSelectedMessage({ ...selectedMessage, status: 'read' });
    }
  };

  // Trier les messages par date (le plus récent en premier)
  const sortedMessages = [...messages].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Messages</h1>
        <p className="mt-2 text-sm text-gray-700">
          Gérez vos messages de contact
        </p>
      </div>

      {messages.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Mail className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun message</h3>
            <p className="text-gray-500">Vous n'avez pas encore reçu de messages</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-4">
            {sortedMessages.map((message) => (
              <Card
                key={message.id}
                className={`cursor-pointer transition-colors ${
                  selectedMessage?.id === message.id
                    ? 'border-blue-500'
                    : 'hover:border-gray-300'
                }`}
                onClick={() => setSelectedMessage(message)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="font-medium">{message.name}</p>
                      <p className="text-sm text-gray-500 truncate">{message.email}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(message.date).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {message.status === 'new' && (
                        <Badge className="bg-blue-100 text-blue-800">
                          Nouveau
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="lg:col-span-2">
            {selectedMessage ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{selectedMessage.name}</CardTitle>
                      <CardDescription>{selectedMessage.email}</CardDescription>
                    </div>
                    <div className="flex space-x-2">
                      {selectedMessage.status === 'new' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleMarkAsRead(selectedMessage.id)}
                        >
                          <Check className="h-4 w-4 mr-2" />
                          Marquer comme lu
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                      >
                        <a href={`mailto:${selectedMessage.email}`}>
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Répondre
                        </a>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(selectedMessage.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="h-4 w-4 mr-2" />
                    {new Date(selectedMessage.date).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">Sujet</h4>
                    <p className="text-gray-700">{selectedMessage.subject}</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">Message</h4>
                    <p className="text-gray-700 whitespace-pre-wrap">{selectedMessage.message}</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Mail className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Sélectionnez un message</h3>
                  <p className="text-gray-500">Choisissez un message dans la liste pour voir son contenu</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}