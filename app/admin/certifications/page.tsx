'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { dataService, Certification } from '@/lib/data';
import { Plus, Edit, Trash2, Award, Calendar, Building, LinkIcon } from 'lucide-react';
import CertificationForm from '@/components/admin/CertificationForm';
import { motion, AnimatePresence } from 'framer-motion';
import { AdminPageToolbar } from '@/components/admin/AdminPageToolbar';
import { adminStaggerContainer, adminStaggerItemExit } from '@/lib/admin-motion';
import { useAdminI18n } from '@/components/admin/AdminI18nProvider';

export default function CertificationsPage() {
  const { t } = useAdminI18n();
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCert, setEditingCert] = useState<Certification | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const data = await dataService.getCertifications();
      setCertifications(data);
    };
    fetchData();
  }, []);

  const handleCreate = async (cert: Omit<Certification, 'id'>) => {
    const newCert = await dataService.createCertification(cert);
    if (newCert) {
      setCertifications([...certifications, newCert]);
      setIsFormOpen(false);
    }
  };

  const handleUpdate = async (cert: Omit<Certification, 'id'>) => {
    if (editingCert) {
      const updated = await dataService.updateCertification(editingCert.id, cert);
      if (updated) {
        setCertifications(certifications.map(c => c.id === editingCert.id ? updated : c));
      }
      setEditingCert(null);
      setIsFormOpen(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm(t('confirm.deleteCertification'))) {
      const success = await dataService.deleteCertification(id);
      if (success) {
        setCertifications(certifications.filter(c => c.id !== id));
      }
    }
  };

  const openEditForm = (cert: Certification) => {
    setEditingCert(cert);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingCert(null);
  };

  return (
    <div className="space-y-8">
      <AdminPageToolbar>
        <Button
          onClick={() => setIsFormOpen(true)}
          className="rounded-xl shadow-md hover:shadow-primary/20 transition-all"
        >
          <Plus className="h-4 w-4 mr-2" />
          {t('pages.certifications.add')}
        </Button>
      </AdminPageToolbar>

      <AnimatePresence mode="popLayout">
        <motion.div
          variants={adminStaggerContainer}
          initial={false}
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {certifications.map((cert) => (
            <motion.div
              key={cert.id}
              variants={adminStaggerItemExit}
              layout
              exit="exit"
            >
              <Card className="glass-card group hover:border-primary/30 transition-all duration-300 h-full flex flex-col">
                <CardHeader className="pb-3 flex-row items-start justify-between space-y-0">
                  <div className="flex-1 pr-4">
                    <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors line-clamp-2">
                      {cert.title}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-1.5 mt-2 font-medium text-foreground/70">
                      <Building className="h-3.5 w-3.5" />
                      {cert.issuer}
                    </CardDescription>
                  </div>
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Award className="h-6 w-6 text-primary" />
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col pt-0 pb-6">
                  <div className="flex items-center gap-4 mt-auto pt-4 border-t border-border/40">
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground font-medium">
                      <Calendar className="h-4 w-4" />
                      {cert.date}
                    </div>
                    {cert.credential && (
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground truncate italic">
                        <LinkIcon className="h-3.5 w-3.5" />
                        {cert.credential}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-end gap-2 mt-6">
                    <Button variant="ghost" size="sm" onClick={() => openEditForm(cert)} className="h-8 w-8 p-0">
                      <Edit className="h-4 w-4 text-muted-foreground hover:text-primary" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(cert.id)} className="h-8 w-8 p-0">
                      <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      {certifications.length === 0 && (
        <motion.div
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="p-6 bg-secondary/20 rounded-full mb-4">
            <Award className="h-12 w-12 text-muted-foreground opacity-30" />
          </div>
          <h3 className="text-xl font-semibold opacity-50">{t('pages.certifications.emptyTitle')}</h3>
          <p className="text-muted-foreground mt-2 max-w-sm">{t('pages.certifications.emptyDesc')}</p>
        </motion.div>
      )}

      {isFormOpen && (
        <CertificationForm
          certification={editingCert}
          onSave={editingCert ? handleUpdate : handleCreate}
          onCancel={closeForm}
        />
      )}
    </div>
  );
}
