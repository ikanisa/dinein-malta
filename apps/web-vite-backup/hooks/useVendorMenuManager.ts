import { useCallback, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { MenuItem, Venue } from '../types';
import { updateVenueMenu, getVenueById, createMenuItem } from '../services/databaseService';
import { useGemini } from './useGemini';

interface UseVendorMenuManagerArgs {
  venue: Venue | null;
  setVenue: React.Dispatch<React.SetStateAction<Venue | null>>;
}

export const useVendorMenuManager = ({ venue, setVenue }: UseVendorMenuManagerArgs) => {
  const [menuModalOpen, setMenuModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<MenuItem>>({});

  const { generateImage, loading: aiLoading } = useGemini();
  const [aiImagePrompt, setAiImagePrompt] = useState('');

  const [menuSearch, setMenuSearch] = useState('');
  const [menuFilterCategory, setMenuFilterCategory] = useState('All');
  const [menuFilterStatus, setMenuFilterStatus] = useState<'all' | 'active' | 'hidden'>('all');
  const [menuFilterTag, setMenuFilterTag] = useState('All');

  const [isProcessingMenu, setIsProcessingMenu] = useState(false);
  const [parsedItems, setParsedItems] = useState<MenuItem[] | null>(null);
  const [generatingImages, setGeneratingImages] = useState(false);

  const filteredMenuItems = useMemo(() => {
    if (!venue) return [];

    return venue.menu.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(menuSearch.toLowerCase());
      const matchesCategory = menuFilterCategory === 'All' || item.category === menuFilterCategory;
      const matchesStatus =
        menuFilterStatus === 'all' ? true : menuFilterStatus === 'active' ? item.available : !item.available;
      const matchesTag =
        menuFilterTag === 'All' || (item.tags && item.tags.includes(menuFilterTag));

      return matchesSearch && matchesCategory && matchesStatus && matchesTag;
    });
  }, [menuFilterCategory, menuFilterStatus, menuFilterTag, menuSearch, venue]);

  const menuCategories = useMemo(() => {
    if (!venue) return ['All'];
    const categories = venue.menu.map((item) => item.category || 'Other');
    return ['All', ...Array.from(new Set(categories))];
  }, [venue]);

  const menuTags = useMemo(() => {
    if (!venue) return ['All'];
    const tags = venue.menu.flatMap((item) => item.tags || []);
    return ['All', ...Array.from(new Set(tags))];
  }, [venue]);

  const openNewItem = useCallback(() => {
    setEditingItem({ id: `new-${Date.now()}`, available: true, options: [], tags: [] });
    setMenuModalOpen(true);
  }, []);

  const openEditItem = useCallback((item: MenuItem) => {
    setEditingItem(item);
    setMenuModalOpen(true);
  }, []);

  const closeMenuModal = useCallback(() => {
    setMenuModalOpen(false);
  }, []);

  const saveMenuItem = useCallback(async () => {
    if (!venue || !editingItem.name) return;

    const itemWithImage = { ...editingItem };
    const newItem = {
      ...itemWithImage,
      price: itemWithImage.price || 0,
      category: itemWithImage.category || 'Mains',
      available: itemWithImage.available ?? true,
      options: itemWithImage.options || [],
      tags: itemWithImage.tags || [],
    } as MenuItem;

    const newMenu = editingItem.id?.startsWith('new')
      ? [...venue.menu, newItem]
      : venue.menu.map((i) => (i.id === newItem.id ? newItem : i));

    await updateVenueMenu(venue.id, newMenu);

    const updatedVenue = await getVenueById(venue.id);
    if (updatedVenue) {
      setVenue(updatedVenue);
    } else {
      setVenue({ ...venue, menu: newMenu });
    }

    setMenuModalOpen(false);
    toast.success(`Menu item saved${!itemWithImage.imageUrl ? ' (generating image...)' : ''}`);
  }, [editingItem, setVenue, venue]);

  const toggleItemAvailability = useCallback(
    async (event: React.MouseEvent, item: MenuItem) => {
      event.stopPropagation();
      if (!venue) return;

      const updatedMenu = venue.menu.map((i) =>
        i.id === item.id ? { ...i, available: !i.available } : i
      );

      setVenue({ ...venue, menu: updatedMenu });

      try {
        await updateVenueMenu(venue.id, updatedMenu);
        toast.success(`${item.name} is now ${!item.available ? 'Active' : 'Hidden'}`);
      } catch (err) {
        toast.error('Failed to update status');
      }
    },
    [setVenue, venue]
  );

  const handleAiImageAction = useCallback(async () => {
    if (!aiImagePrompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }

    const imageUrl = await generateImage(aiImagePrompt, 'fast'); // Use 'fast' model for menu items

    if (imageUrl) {
      setEditingItem(prev => ({ ...prev, imageUrl }));
      toast.success('Image generated!');
    }
  }, [aiImagePrompt, generateImage]);

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      toast.error('Please upload an image or PDF file.');
      return;
    }

    // Gemini AI removed from client - menu parsing disabled
    toast.error('Menu parsing from images is no longer available in the client. Please use admin tools or enter menu items manually.');
    setIsProcessingMenu(false);
    if (event.currentTarget) {
      event.currentTarget.value = '';
    }
  }, []);

  const generateImagesForImport = useCallback(async () => {
    // Gemini AI removed from client - image generation disabled
    toast.error('AI image generation is no longer available in the client. Please upload images manually.');
    setGeneratingImages(false);
  }, []);

  const [isImporting, setIsImporting] = useState(false);

  const confirmImport = useCallback(async () => {
    if (!venue || !parsedItems || parsedItems.length === 0) return;
    setIsImporting(true);

    try {
      for (const item of parsedItems) {
        const payload = {
          name: item.name || 'New Menu Item',
          description: item.description || '',
          price: item.price || 0,
          category: item.category || 'Mains',
          available: item.available ?? true,
          options: item.options || [],
          tags: item.tags || [],
          imageUrl: item.imageUrl,
        };

        await createMenuItem(venue.id, payload);
      }

      const refreshedVenue = await getVenueById(venue.id);
      if (refreshedVenue) {
        setVenue(refreshedVenue);
      }

      setParsedItems(null);
      toast.success('Imported items saved to menu');
    } catch (error) {
      console.error('Import failed', error);
      toast.error('Failed to import menu items');
    } finally {
      setIsImporting(false);
    }
  }, [parsedItems, setVenue, venue]);

  return {
    menuModalOpen,
    editingItem,
    setEditingItem,
    openNewItem,
    openEditItem,
    closeMenuModal,
    saveMenuItem,
    toggleItemAvailability,
    filteredMenuItems,
    isProcessingMenu,
    handleFileUpload,
    aiImageLoading: aiLoading,
    handleAiImageAction,
    aiImagePrompt,
    setAiImagePrompt,
    menuSearch,
    setMenuSearch,
    menuFilterCategory,
    setMenuFilterCategory,
    menuFilterStatus,
    setMenuFilterStatus,
    menuFilterTag,
    setMenuFilterTag,
    menuCategories,
    menuTags,
    parsedItems,
    generatingImages,
    generateImagesForImport,
    confirmImport,
    isImporting,
  };
};
