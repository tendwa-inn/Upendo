import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Title, 
  Table, 
  TableHead, 
  TableRow, 
  TableHeaderCell, 
  TableBody, 
  TableCell, 
  Button,
  Tab,
  TabList,
  TabGroup,
  TabPanel,
  TabPanels,
  Badge,
  Text,
  Dialog,
  DialogPanel,
  Select,
  SelectItem,
  TextInput,
  NumberInput
} from '@tremor/react';
import { promoService } from '../services/promoService';
import { PromoCode } from '../types/admin';
import { PlusCircleIcon, CheckCircleIcon, XCircleIcon, InformationCircleIcon } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';
import Portal from '../components/Portal';
import Tooltip from '../components/Tooltip';

const AdminPromosPage: React.FC = () => {
  const [activePromos, setActivePromos] = useState<PromoCode[]>([]);
  const [expiredPromos, setExpiredPromos] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newPromo, setNewPromo] = useState<Partial<PromoCode>>({
    type: 'message_requests',
    max_uses: 100,
    duration_days: 30,
    effect: {},
  });

  useEffect(() => {
    loadPromos();
  }, []);

  const loadPromos = async () => {
    try {
      setLoading(true);
      const { active, expired } = await promoService.getPromoCodes();
      setActivePromos(active);
      setExpiredPromos(expired);
    } catch (error) {
      toast.error('Failed to load promo codes');
      console.error('Error loading promos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePromo = async () => {
    try {
      if (!newPromo.code) {
        newPromo.code = generateRandomCode();
      }
      const promoToCreate = { ...newPromo };
      if (promoToCreate.duration_days) {
        const expires_at = new Date();
        expires_at.setDate(expires_at.getDate() + promoToCreate.duration_days);
        promoToCreate.expires_at = expires_at.toISOString();
      }

      await promoService.createPromoCode(promoToCreate);
      toast.success('Promo code created successfully');
      setIsDialogOpen(false);
      setNewPromo({ type: 'message_requests', max_uses: 100, duration_days: 30, effect: {} });
      loadPromos();
    } catch (error) {
      toast.error('Failed to create promo code');
      console.error('Error creating promo:', error);
    }
  };

  const generateRandomCode = () => {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
  };

  const handleInputChange = (key: keyof PromoCode, value: any) => {
    setNewPromo(prev => ({ ...prev, [key]: value }));
  };

  const handleEffectChange = (key: string, value: any) => {
    setNewPromo(prev => ({ ...prev, effect: { ...prev.effect, [key]: value } }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#2b0f16] to-[#120508] text-white p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Promo Code Management</h1>
        <Button icon={PlusCircleIcon} onClick={() => setIsDialogOpen(true)}>Add Promo Code</Button>
      </div>
      
      <TabGroup>
        <TabList>
          <Tab>Active Promos ({activePromos.length})</Tab>
          <Tab>Expired Promos ({expiredPromos.length})</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <Card className="mt-6">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeaderCell>Code</TableHeaderCell>
                    <TableHeaderCell>Type</TableHeaderCell>
                    <TableHeaderCell>Uses (Used/Max)</TableHeaderCell>
                    <TableHeaderCell>Expires At</TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {activePromos.map(promo => (
                    <TableRow key={promo.id}>
                      <TableCell><Badge color="blue">{promo.code}</Badge></TableCell>
                      <TableCell>{promo.type.replace('_', ' ')}</TableCell>
                      <TableCell>{promo.times_used} / {promo.max_uses ?? '∞'}</TableCell>
                      <TableCell>{new Date(promo.expires_at).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabPanel>
          <TabPanel>
            <Card className="mt-6">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeaderCell>Code</TableHeaderCell>
                    <TableHeaderCell>Type</TableHeaderCell>
                    <TableHeaderCell>Uses (Used/Max)</TableHeaderCell>
                    <TableHeaderCell>Expired At</TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {expiredPromos.map(promo => (
                    <TableRow key={promo.id}>
                      <TableCell><Badge>{promo.code}</Badge></TableCell>
                      <TableCell>{promo.type.replace('_', ' ')}</TableCell>
                      <TableCell>{promo.times_used} / {promo.max_uses ?? '∞'}</TableCell>
                      <TableCell>{new Date(promo.expires_at).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabPanel>
        </TabPanels>
      </TabGroup>

      {isDialogOpen && (
        <Portal>
          <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)} static={true}>
            <DialogPanel className="bg-[#3a1a22] p-6 rounded-lg shadow-xl z-50 text-white">
              <Title className="mb-4 text-white">Add New Promo Code</Title>
              <div className="space-y-4">
                <TextInput 
                  placeholder="Promo Code Name"
                  onValueChange={(value) => handleInputChange('name', value)}
                />
                <TextInput 
                  placeholder="Description"
                  onValueChange={(value) => handleInputChange('description', value)}
                />
                <div className="flex items-center space-x-2">
                  <TextInput 
                    placeholder="Enter code or leave blank to generate"
                    value={newPromo.code || ''}
                    onValueChange={(value) => handleInputChange('code', value)}
                  />
                  <Button onClick={() => handleInputChange('code', generateRandomCode())}>Generate</Button>
                </div>
                <div className="relative">
                  <select 
                    className="w-full appearance-none bg-[#3a1a22] border border-white/20 rounded-md py-2 px-3 text-white leading-tight focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                    value={newPromo.type}
                    onChange={(e) => handleInputChange('type', e.target.value)}
                  >
                    <option value="message_requests">Message Requests</option>
                    <option value="popularity_boost">Popularity Boost</option>
                    <option value="pro_account">Pro Account</option>
                    <option value="vip_account">VIP Account</option>
                    <option value="unlimited_swipes">Unlimited Swipes</option>
                    <option value="profile_views">Profile Views</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                  </div>
                </div>
                {newPromo.type === 'message_requests' && (
                  <div className="flex items-center space-x-2">
                    <NumberInput 
                      placeholder="Number of requests"
                      onValueChange={(value) => handleEffectChange('count', value)}
                    />
                    <Tooltip content="The total number of message requests this promo code will grant.">
                  <InformationCircleIcon className="h-5 w-5 text-white/60" />
                </Tooltip>
                  </div>
                )}
                {newPromo.type === 'profile_views' && (
                  <div className="flex items-center space-x-2">
                    <NumberInput 
                      placeholder="Number of views"
                      onValueChange={(value) => handleEffectChange('count', value)}
                    />
                    <Tooltip content="The number of additional profile views this promo will grant.">
                  <InformationCircleIcon className="h-5 w-5 text-white/60" />
                </Tooltip>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <NumberInput 
                    placeholder="Max uses (optional)"
                    value={newPromo.max_uses || ''}
                    onValueChange={(value) => handleInputChange('max_uses', value)}
                  />
                  <Tooltip content="The maximum number of times this promo code can be used by all users. Leave blank for unlimited uses.">
                  <InformationCircleIcon className="h-5 w-5 text-white/60" />
                </Tooltip>
                </div>
                <div className="flex items-center space-x-2">
                  <NumberInput 
                    placeholder="Duration in days"
                    value={newPromo.duration_days || ''}
                    onValueChange={(value) => handleInputChange('duration_days', value)}
                  />
                  <Tooltip content="The number of days the promo code's effect will last after a user applies it.">
                  <InformationCircleIcon className="h-5 w-5 text-white/60" />
                </Tooltip>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-2">
                <Button icon={XCircleIcon} variant="secondary" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button icon={CheckCircleIcon} onClick={handleCreatePromo}>Create Promo Code</Button>
              </div>
            </DialogPanel>
          </Dialog>
        </Portal>
      )}
    </div>
  );
};

export default AdminPromosPage;
