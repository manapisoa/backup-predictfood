import React, { useState } from 'react';
import Layout from '../../components/Layout';
import Card, { StatCard } from '../../components/Card';
import Button from '../../components/Button';
import Modal, { ConfirmModal, FormModal } from '../../components/Modal';
import Table from '../../components/Table';
import Tabs, { TabPanel } from '../../components/Tabs';
import { Input, Select, FormGroup, FormRow } from '../../components/FormComponents';
import { AlertBanner } from '../../components/Alert';

const AdminPage = () => {
  const [activeModule, setActiveModule] = useState('reports');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);

  // Données simulées
  const reportStats = {
    financial: { ca: '12,450€', marge: '68.5%', costs: '3,925€' },
    inventory: { value: '2,450€', items: 247, rotation: '15 jours' },
    recipes: { active: 28, topPerformer: 'Pizza Margherita', margin: '71.2%' },
    haccp: { controls: 45, nonCompliance: 2, compliance: '95.6%' }
  };

  const usersData = [
    {
      id: 1,
      name: 'Benjamin Gasque',
      email: 'benjamin@brasserie-claouey.fr',
      role: 'Admin',
      status: 'Actif',
      lastLogin: 'Aujourd\'hui 09:15'
    },
    {
      id: 2,
      name: 'Marie Dupont',
      email: 'marie.dupont@brasserie-claouey.fr',
      role: 'Chef',
      status: 'Actif',
      lastLogin: 'Hier 18:30'
    },
    {
      id: 3,
      name: 'Pierre Martin',
      email: 'pierre.martin@brasserie-claouey.fr',
      role: 'Serveur',
      status: 'Inactif',
      lastLogin: 'Il y a 3 jours'
    }
  ];

  const backupHistory = [
    { date: '01/12/2024 03:00', type: 'Automatique', size: '45.1 MB', status: 'Réussie' },
    { date: '30/11/2024 03:00', type: 'Automatique', size: '44.8 MB', status: 'Réussie' },
    { date: '29/11/2024 14:30', type: 'Manuelle', size: '45.3 MB', status: 'Réussie' }
  ];

  const systemLogs = [
    '[2024-12-01 09:15:32] INFO - Backend API started successfully on port 8120',
    '[2024-12-01 09:15:45] INFO - IA Core connection established (llama2:latest)',
    '[2024-12-01 09:16:12] INFO - User login: benjamin@brasserie-claouey.fr',
    '[2024-12-01 09:16:58] WARNING - Redis cache usage: 85% (threshold: 80%)',
    '[2024-12-01 09:17:23] INFO - Recipe created: Pizza Margherita (ID: 550e8400-e29b-41d4)',
    '[2024-12-01 09:18:45] ERROR - OCR service timeout after 30s (reception_id: abc123)',
    '[2024-12-01 09:19:02] WARNING - Stock low alert: Tomates cerises (quantity: 2kg, min: 5kg)',
    '[2024-12-01 09:20:15] INFO - Hiboutik sync completed: 45 sales processed',
    '[2024-12-01 09:21:33] INFO - Daily backup completed successfully (size: 45.1MB)',
    '[2024-12-01 09:22:07] WARNING - DLC alert: Mozzarella expires in 24h'
  ];

  const generateReport = (type) => {
    alert(`Génération du rapport ${type} en cours...`);
  };

  const confirmRestore = () => {
    setShowRestoreModal(true);
  };

  const handleRestore = () => {
    alert('Restauration de la sauvegarde en cours...');
    setShowRestoreModal(false);
  };

  // Composant pour les statistiques rapides
  const QuickStats = ({ stats, title, icon, color }) => (
    <StatCard
      title={title}
      icon={icon}
      color={color}
      className="mb-6"
    >
      <div className="space-y-3">
        {Object.entries(stats).map(([key, value]) => (
          <div key={key} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
            <span className="text-sm font-medium text-gray-600 capitalize">
              {key.replace(/([A-Z])/g, ' $1').trim()}
            </span>
            <span className="text-sm font-bold text-gray-800">{value}</span>
          </div>
        ))}
      </div>
    </StatCard>
  );

  // Page Rapports
  const ReportsPage = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card 
          title="Rapports Financiers" 
          icon="chart-line"
          className="hover:shadow-xl transition-shadow"
        >
          <div className="space-y-3 mb-6">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">CA du mois</span>
              <span className="font-bold">{reportStats.financial.ca}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Marge brute</span>
              <span className="font-bold">{reportStats.financial.marge}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Coûts matières</span>
              <span className="font-bold">{reportStats.financial.costs}</span>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button variant="primary" size="small" onClick={() => generateReport('financial')}>
              <i className="fas fa-download mr-1"></i>
              Générer PDF
            </Button>
            <Button variant="secondary" size="small">
              <i className="fas fa-eye mr-1"></i>
              Détail
            </Button>
          </div>
        </Card>

        <Card 
          title="Rapports Stock" 
          icon="warehouse"
          className="hover:shadow-xl transition-shadow"
        >
          <div className="space-y-3 mb-6">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Valeur stock</span>
              <span className="font-bold">{reportStats.inventory.value}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Articles actifs</span>
              <span className="font-bold">{reportStats.inventory.items}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Rotation moyenne</span>
              <span className="font-bold">{reportStats.inventory.rotation}</span>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button variant="primary" size="small" onClick={() => generateReport('inventory')}>
              <i className="fas fa-download mr-1"></i>
              Export Excel
            </Button>
            <Button variant="secondary" size="small">
              <i className="fas fa-chart-bar mr-1"></i>
              Analytics
            </Button>
          </div>
        </Card>

        <Card 
          title="Performance Recettes" 
          icon="utensils"
          className="hover:shadow-xl transition-shadow"
        >
          <div className="space-y-3 mb-6">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Recettes actives</span>
              <span className="font-bold">{reportStats.recipes.active}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Top performer</span>
              <span className="font-bold">{reportStats.recipes.topPerformer}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Marge moyenne</span>
              <span className="font-bold">{reportStats.recipes.margin}</span>
            </div>
          </div>
          <Button variant="primary" size="small" onClick={() => generateReport('recipes')}>
            <i className="fas fa-download mr-1"></i>
            Rapport PDF
          </Button>
        </Card>

        <Card 
          title="Rapport HACCP" 
          icon="shield-alt"
          className="hover:shadow-xl transition-shadow"
        >
          <div className="space-y-3 mb-6">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Contrôles ce mois</span>
              <span className="font-bold">{reportStats.haccp.controls}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Non-conformités</span>
              <span className="font-bold">{reportStats.haccp.nonCompliance}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Taux conformité</span>
              <span className="font-bold">{reportStats.haccp.compliance}</span>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button variant="success" size="small" onClick={() => generateReport('haccp')}>
              <i className="fas fa-file-pdf mr-1"></i>
              Certificat
            </Button>
            <Button variant="warning" size="small">
              <i className="fas fa-exclamation mr-1"></i>
              Alertes
            </Button>
          </div>
        </Card>
      </div>

      <Card title="Historique des Rapports" icon="history">
        <Table
          data={[
            { type: 'Rapport Financier', period: 'Novembre 2024', generated: '01/12/2024 09:30', size: '2.3 MB' },
            { type: 'Stock Mensuel', period: 'Octobre 2024', generated: '01/11/2024 08:15', size: '1.8 MB' },
            { type: 'HACCP Trimestriel', period: 'Q3 2024', generated: '01/10/2024 14:20', size: '3.1 MB' }
          ]}
          columns={[
            { key: 'type', title: 'Type' },
            { key: 'period', title: 'Période' },
            { key: 'generated', title: 'Généré le' },
            { key: 'size', title: 'Taille' },
            {
              key: 'actions',
              title: 'Actions',
              render: () => (
                <div className="flex space-x-2">
                  <Button variant="primary" size="small">Télécharger</Button>
                  <Button variant="danger" size="small">Supprimer</Button>
                </div>
              )
            }
          ]}
        />
      </Card>
    </div>
  );

  // Page Paramètres
  const SettingsPage = () => {
    const settingsTabs = [
      {
        label: 'Général',
        icon: 'cog',
        content: (
          <TabPanel title="Paramètres Généraux">
            <div className="space-y-8">
              <FormGroup title="Informations Restaurant" description="Configuration de base du restaurant">
                <FormRow columns={2}>
                  <Input label="Nom du restaurant" value="Brasserie Claouey" />
                  <Input label="Adresse" value="123 Avenue de la Plage, Claouey" />
                </FormRow>
                <FormRow columns={2}>
                  <Input label="Téléphone" type="tel" value="+33 5 56 60 00 00" />
                  <Input label="Email" type="email" value="contact@brasserie-claouey.fr" />
                </FormRow>
                <Button variant="primary">
                  <i className="fas fa-save mr-2"></i>
                  Sauvegarder
                </Button>
              </FormGroup>

              <FormGroup title="Paramètres Financiers" description="Configuration des prix et marges">
                <FormRow columns={2}>
                  <Input label="TVA par défaut (%)" type="number" value="10" step="0.1" />
                  <Input label="Marge cible (%)" type="number" value="70" />
                </FormRow>
                <FormRow columns={2}>
                  <Select 
                    label="Devise" 
                    value="EUR" 
                    options={[
                      { value: 'EUR', label: 'EUR - Euro' },
                      { value: 'USD', label: 'USD - Dollar' }
                    ]} 
                  />
                  <Input label="Seuil stock bas" type="number" value="5" min="1" />
                </FormRow>
                <Button variant="primary">
                  <i className="fas fa-save mr-2"></i>
                  Sauvegarder
                </Button>
              </FormGroup>
            </div>
          </TabPanel>
        )
      },
      {
        label: 'Intelligence IA',
        icon: 'brain',
        content: (
          <TabPanel title="Configuration IA">
            <div className="space-y-6">
              <AlertBanner
                type="success"
                title="IA Core connectée"
                message="IA Core connectée et opérationnelle (Ollama llama2:latest)"
              />
              
              <FormGroup title="Paramètres IA">
                <FormRow columns={2}>
                  <Input label="URL IA-Core" value="http://predictfood-ai-core:8889" disabled />
                  <Select
                    label="Modèle LLM"
                    value="llama2:latest"
                    options={[
                      { value: 'llama2:latest', label: 'Llama2 Latest (7B)' },
                      { value: 'llama2:13b', label: 'Llama2 13B (Plus précis)' }
                    ]}
                  />
                </FormRow>
                
                <div className="space-y-4">
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" defaultChecked />
                    Suggestions anti-gaspillage automatiques
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" defaultChecked />
                    Optimisation menu basée sur stock
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    Génération recettes automatique
                  </label>
                </div>

                <div className="flex space-x-3">
                  <Button variant="primary">
                    <i className="fas fa-sync mr-2"></i>
                    Tester Connexion
                  </Button>
                  <Button variant="secondary">
                    <i className="fas fa-save mr-2"></i>
                    Sauvegarder
                  </Button>
                </div>
              </FormGroup>

              <Card title="Performance IA" icon="chart-pie">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Précision prédictions</span>
                    <span className="font-bold">87.3%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '87.3%' }}></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex justify-between">
                      <span>Requêtes aujourd'hui</span>
                      <span className="font-bold">156</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Temps réponse moyen</span>
                      <span className="font-bold">1.2s</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </TabPanel>
        )
      }
    ];

    return <Tabs tabs={settingsTabs} />;
  };

  // Page Utilisateurs
  const UsersPage = () => {
    const userColumns = [
      { key: 'name', title: 'Nom' },
      { key: 'email', title: 'Email' },
      { 
        key: 'role', 
        title: 'Rôle',
        render: (value) => (
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
            value === 'Admin' ? 'bg-green-100 text-green-800' : 
            value === 'Chef' ? 'bg-blue-100 text-blue-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {value}
          </span>
        )
      },
      {
        key: 'status',
        title: 'Statut',
        render: (value) => (
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
            value === 'Actif' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {value}
          </span>
        )
      },
      { key: 'lastLogin', title: 'Dernière Connexion' },
      {
        key: 'actions',
        title: 'Actions',
        render: (value, row) => (
          <div className="flex space-x-2">
            <Button variant="secondary" size="small">Modifier</Button>
            <Button 
              variant={row.status === 'Actif' ? 'danger' : 'success'} 
              size="small"
            >
              {row.status === 'Actif' ? 'Désactiver' : 'Activer'}
            </Button>
          </div>
        )
      }
    ];

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">Utilisateurs Actifs</h2>
          <Button variant="primary" onClick={() => setShowAddUserModal(true)}>
            <i className="fas fa-plus mr-2"></i>
            Nouvel Utilisateur
          </Button>
        </div>

        <Card>
          <Table
            data={usersData}
            columns={userColumns}
            searchable={true}
            sortable={true}
            pagination={true}
            pageSize={10}
          />
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card title="Permissions par Rôle" icon="shield-alt">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Admin</span>
                <span className="text-sm font-bold">Tous droits</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Chef</span>
                <span className="text-sm font-bold">Production + Stock</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Serveur</span>
                <span className="text-sm font-bold">Ventes seulement</span>
              </div>
            </div>
            <Button variant="secondary" className="mt-4" fullWidth>
              <i className="fas fa-edit mr-2"></i>
              Configurer Rôles
            </Button>
          </Card>

          <Card title="Activité Récente" icon="history">
            <div className="space-y-4">
              <div className="text-sm">
                <strong>Benjamin Gasque</strong> - Connexion<br />
                <small className="text-gray-600">Aujourd'hui 09:15</small>
              </div>
              <div className="text-sm">
                <strong>Marie Dupont</strong> - Création recette<br />
                <small className="text-gray-600">Hier 18:30</small>
              </div>
              <div className="text-sm">
                <strong>Pierre Martin</strong> - Vente enregistrée<br />
                <small className="text-gray-600">Il y a 3 jours</small>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  };

  // Page Sauvegardes
  const BackupPage = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Sauvegarde Automatique" icon="clock">
          <AlertBanner
            type="success"
            message="Dernière sauvegarde: Aujourd'hui 03:00"
          />
          <div className="space-y-3 my-4">
            <div className="flex justify-between">
              <span className="text-sm">Fréquence</span>
              <span className="font-bold">Quotidienne</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Rétention</span>
              <span className="font-bold">30 jours</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Taille moyenne</span>
              <span className="font-bold">45.2 MB</span>
            </div>
          </div>
          <Button variant="primary" fullWidth>
            <i className="fas fa-play mr-2"></i>
            Sauvegarder Maintenant
          </Button>
        </Card>

        <Card title="Restauration" icon="upload">
          <AlertBanner
            type="warning"
            message="La restauration remplacera toutes les données actuelles"
          />
          <div className="my-4">
            <Select
              label="Sélectionner une sauvegarde"
              options={[
                { value: '2024-12-01', label: '2024-12-01 03:00 (45.1 MB)' },
                { value: '2024-11-30', label: '2024-11-30 03:00 (44.8 MB)' },
                { value: '2024-11-29', label: '2024-11-29 03:00 (45.3 MB)' }
              ]}
            />
          </div>
          <Button variant="danger" fullWidth onClick={confirmRestore}>
            <i className="fas fa-undo mr-2"></i>
            Restaurer
          </Button>
        </Card>
      </div>

      <Card title="Historique des Sauvegardes" icon="list">
        <Table
          data={backupHistory}
          columns={[
            { key: 'date', title: 'Date' },
            { key: 'type', title: 'Type' },
            { key: 'size', title: 'Taille' },
            { 
              key: 'status', 
              title: 'Statut',
              render: (value) => (
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                  {value}
                </span>
              )
            },
            {
              key: 'actions',
              title: 'Actions',
              render: () => (
                <div className="flex space-x-2">
                  <Button variant="primary" size="small">Télécharger</Button>
                  <Button variant="danger" size="small">Restaurer</Button>
                </div>
              )
            }
          ]}
          searchable={true}
          sortable={true}
        />
      </Card>
    </div>
  );

  // Page Logs
  const LogsPage = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Statut Système" icon="server">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span>Backend API</span>
              <span className="text-green-500 font-bold">● En ligne</span>
            </div>
            <div className="flex justify-between items-center">
              <span>IA Core</span>
              <span className="text-green-500 font-bold">● Connectée</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Base de données</span>
              <span className="text-green-500 font-bold">● Opérationnelle</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Redis Cache</span>
              <span className="text-yellow-500 font-bold">⚠ Utilisation élevée</span>
            </div>
          </div>
        </Card>

        <Card title="Erreurs Récentes" icon="exclamation-triangle">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Dernières 24h</span>
              <span className="font-bold">3 erreurs</span>
            </div>
            <div className="flex justify-between">
              <span>Cette semaine</span>
              <span className="font-bold">12 erreurs</span>
            </div>
            <div className="flex justify-between">
              <span>Type principal</span>
              <span className="font-bold">Timeout API</span>
            </div>
          </div>
          <Button variant="warning" fullWidth className="mt-4">
            <i className="fas fa-eye mr-2"></i>
            Voir Détails
          </Button>
        </Card>
      </div>

      <Card title="Filtrer les Logs" icon="filter">
        <FormRow columns={3}>
          <Select
            label="Niveau"
            options={[
              { value: 'all', label: 'Tous' },
              { value: 'debug', label: 'DEBUG' },
              { value: 'info', label: 'INFO' },
              { value: 'warning', label: 'WARNING' },
              { value: 'error', label: 'ERROR' },
              { value: 'critical', label: 'CRITICAL' }
            ]}
            value="warning"
          />
          <Select
            label="Service"
            options={[
              { value: 'all', label: 'Tous' },
              { value: 'backend', label: 'Backend API' },
              { value: 'ia-core', label: 'IA Core' },
              { value: 'workers', label: 'Workers Celery' },
              { value: 'database', label: 'Database' }
            ]}
          />
          <Select
            label="Période"
            options={[
              { value: '24h', label: 'Dernières 24h' },
              { value: 'week', label: 'Cette semaine' },
              { value: 'month', label: 'Ce mois' },
              { value: 'custom', label: 'Personnalisé' }
            ]}
            value="24h"
          />
        </FormRow>
        <div className="flex space-x-3 mt-4">
          <Button variant="primary">
            <i className="fas fa-search mr-2"></i>
            Filtrer
          </Button>
          <Button variant="secondary">
            <i className="fas fa-download mr-2"></i>
            Exporter
          </Button>
        </div>
      </Card>

      <Card title="Logs Récents" icon="terminal">
        <div className="bg-gray-900 text-green-400 p-4 rounded-xl font-mono text-sm h-96 overflow-y-auto">
          {systemLogs.map((log, index) => (
            <div key={index} className="mb-1 leading-relaxed">
              {log}
            </div>
          ))}
          <div className="text-yellow-400">[2024-12-01 09:23:41] CURRENT - System monitoring active...</div>
        </div>
      </Card>
    </div>
  );

  // Page Sécurité
  const SecurityPage = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card title="Authentification" icon="lock">
          <div className="space-y-3 mb-4">
            <div className="flex justify-between">
              <span className="text-sm">Politique mot de passe</span>
              <span className="font-bold">Forte</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Session timeout</span>
              <span className="font-bold">24 heures</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Tentatives échouées</span>
              <span className="font-bold">0 aujourd'hui</span>
            </div>
          </div>
          <Button variant="primary" fullWidth>
            <i className="fas fa-cog mr-2"></i>
            Configurer
          </Button>
        </Card>

        <Card title="Protection Données" icon="database">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Chiffrement DB</span>
              <span className="text-green-500 font-bold">● Activé</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">HTTPS</span>
              <span className="text-green-500 font-bold">● Forcé</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Audit trail</span>
              <span className="text-green-500 font-bold">● Activé</span>
            </div>
          </div>
        </Card>

        <Card title="Conformité RGPD" icon="balance-scale">
          <div className="space-y-3 mb-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">Politique confidentialité</span>
              <span className="text-green-500 font-bold">● À jour</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Consentements</span>
              <span className="font-bold">100%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Demandes suppression</span>
              <span className="font-bold">0 en attente</span>
            </div>
          </div>
          <Button variant="secondary" fullWidth>
            <i className="fas fa-download mr-2"></i>
            Rapport RGPD
          </Button>
        </Card>
      </div>

      <Card title="Événements Sécurité" icon="history">
        <Table
          data={[
            {
              datetime: '01/12/2024 09:15',
              event: 'Connexion réussie',
              user: 'benjamin@brasserie-claouey.fr',
              ip: '192.168.1.100',
              status: 'OK'
            },
            {
              datetime: '30/11/2024 18:30',
              event: 'Tentative connexion échouée',
              user: 'unknown@fake.com',
              ip: '45.123.45.67',
              status: 'Bloqué'
            },
            {
              datetime: '30/11/2024 15:22',
              event: 'Modification paramètres',
              user: 'marie.dupont@brasserie-claouey.fr',
              ip: '192.168.1.101',
              status: 'OK'
            }
          ]}
          columns={[
            { key: 'datetime', title: 'Date/Heure' },
            { key: 'event', title: 'Événement' },
            { key: 'user', title: 'Utilisateur' },
            { key: 'ip', title: 'IP' },
            {
              key: 'status',
              title: 'Statut',
              render: (value) => (
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  value === 'OK' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {value}
                </span>
              )
            }
          ]}
          searchable={true}
          sortable={true}
        />
      </Card>
    </div>
  );

  const renderCurrentPage = () => {
    switch (activeModule) {
      case 'reports':
        return <ReportsPage />;
      case 'settings':
        return <SettingsPage />;
      case 'users':
        return <UsersPage />;
      case 'backup':
        return <BackupPage />;
      case 'logs':
        return <LogsPage />;
      case 'security':
        return <SecurityPage />;
      default:
        return <ReportsPage />;
    }
  };

  const alerts = {
    reports: 3,
    users: 2,
    backup: 0,
    logs: 5,
    security: 1
  };

  return (
    <Layout
      currentModule={activeModule}
      onModuleChange={setActiveModule}
      showHeader={true}
      headerTitle="Administration PredictFood"
      headerSubtitle="Gestion et configuration de l'application"
      restaurantInfo={{
        name: "Brasserie Claouey",
        aiStatus: "Connectée"
      }}
      alerts={alerts}
      className="min-h-screen"
    >
      {renderCurrentPage()}

      {/* Modal Ajout Utilisateur */}
      <FormModal
        isOpen={showAddUserModal}
        onClose={() => setShowAddUserModal(false)}
        onSubmit={(e) => {
          e.preventDefault();
          alert('Utilisateur créé avec succès !');
          setShowAddUserModal(false);
        }}
        title="Nouvel Utilisateur"
        subtitle="Créer un nouveau compte utilisateur"
        submitText="Créer Utilisateur"
      >
        <div className="space-y-4">
          <Input
            label="Nom complet"
            placeholder="Jean Dupont"
            required
          />
          <Input
            label="Adresse email"
            type="email"
            placeholder="jean.dupont@brasserie-claouey.fr"
            required
          />
          <FormRow columns={2}>
            <Select
              label="Rôle"
              options={[
                { value: 'admin', label: 'Admin' },
                { value: 'chef', label: 'Chef' },
                { value: 'serveur', label: 'Serveur' }
              ]}
              value="chef"
            />
            <Select
              label="Statut"
              options={[
                { value: 'actif', label: 'Actif' },
                { value: 'inactif', label: 'Inactif' }
              ]}
              value="actif"
            />
          </FormRow>
          <div>
            <Input
              label="Mot de passe temporaire"
              type="password"
              value="TempPass123!"
              disabled
            />
            <p className="text-sm text-gray-600 mt-1">
              L'utilisateur devra changer ce mot de passe à sa première connexion
            </p>
          </div>
        </div>
      </FormModal>

      {/* Modal Confirmation Restauration */}
      <ConfirmModal
        isOpen={showRestoreModal}
        onClose={() => setShowRestoreModal(false)}
        onConfirm={handleRestore}
        title="Confirmer la Restauration"
        message="Êtes-vous sûr de vouloir restaurer cette sauvegarde ? Cette action remplacera toutes les données actuelles et ne peut pas être annulée."
        confirmText="Restaurer"
        cancelText="Annuler"
        variant="danger"
      />
    </Layout>
  );
};

export default AdminPage;