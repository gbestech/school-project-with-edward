import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Save, 
  X, 
  Upload, 
  Image as ImageIcon,
  GripVertical,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause
} from 'lucide-react';
import { toast } from 'react-toastify';

interface CarouselItem {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  image_url: string;
  button_text: string;
  button_link: string;
  order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface CarouselFormData {
  title: string;
  subtitle: string;
  description: string;
  image_url: string;
  button_text: string;
  button_link: string;
  is_active: boolean;
}

const DefaultCarouselManager: React.FC = () => {
  const [carouselItems, setCarouselItems] = useState<CarouselItem[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedItem, setSelectedItem] = useState<CarouselItem | null>(null);
  const [formData, setFormData] = useState<CarouselFormData>({
    title: '',
    subtitle: '',
    description: '',
    image_url: '',
    button_text: '',
    button_link: '',
    is_active: true
  });
  const [loading, setLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0);

  // Mock data for demonstration - replace with actual API calls
  const mockCarouselItems: CarouselItem[] = [
    {
      id: 1,
      title: "Welcome to Our School",
      subtitle: "Excellence in Education",
      description: "Discover a world of learning opportunities and academic excellence.",
      image_url: "/images/carousel/slide1.jpg",
      button_text: "Learn More",
      button_link: "/about",
      order: 1,
      is_active: true,
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z"
    },
    {
      id: 2,
      title: "Modern Facilities",
      subtitle: "State-of-the-Art Learning",
      description: "Experience cutting-edge technology and modern learning environments.",
      image_url: "/images/carousel/slide2.jpg",
      button_text: "View Facilities",
      button_link: "/facilities",
      order: 2,
      is_active: true,
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z"
    }
  ];

  useEffect(() => {
    // Simulate API call
    setCarouselItems(mockCarouselItems);
  }, []);

  const handleCreate = () => {
    setModalMode('create');
    setSelectedItem(null);
    setFormData({
      title: '',
      subtitle: '',
      description: '',
      image_url: '',
      button_text: '',
      button_link: '',
      is_active: true
    });
    setShowModal(true);
  };

  const handleEdit = (item: CarouselItem) => {
    setModalMode('edit');
    setSelectedItem(item);
    setFormData({
      title: item.title,
      subtitle: item.subtitle,
      description: item.description,
      image_url: item.image_url,
      button_text: item.button_text,
      button_link: item.button_link,
      is_active: item.is_active
    });
    setShowModal(true);
  };

  const handleView = (item: CarouselItem) => {
    setModalMode('view');
    setSelectedItem(item);
    setFormData({
      title: item.title,
      subtitle: item.subtitle,
      description: item.description,
      image_url: item.image_url,
      button_text: item.button_text,
      button_link: item.button_link,
      is_active: item.is_active
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this carousel item?')) {
      try {
        // Simulate API call
        setCarouselItems(prev => prev.filter(item => item.id !== id));
        toast.success('Carousel item deleted successfully');
      } catch (error) {
        toast.error('Failed to delete carousel item');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (modalMode === 'create') {
        // Simulate API call
        const newItem: CarouselItem = {
          id: Date.now(),
          ...formData,
          order: carouselItems.length + 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        setCarouselItems(prev => [...prev, newItem]);
        toast.success('Carousel item created successfully');
      } else if (modalMode === 'edit' && selectedItem) {
        // Simulate API call
        setCarouselItems(prev => prev.map(item => 
          item.id === selectedItem.id 
            ? { ...item, ...formData, updated_at: new Date().toISOString() }
            : item
        ));
        toast.success('Carousel item updated successfully');
      }

      setShowModal(false);
    } catch (error) {
      toast.error('Failed to save carousel item');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Simulate image upload
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData(prev => ({
          ...prev,
          image_url: event.target?.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleActive = (id: number) => {
    setCarouselItems(prev => prev.map(item => 
      item.id === id ? { ...item, is_active: !item.is_active } : item
    ));
  };

  const moveItem = (id: number, direction: 'up' | 'down') => {
    setCarouselItems(prev => {
      const items = [...prev];
      const index = items.findIndex(item => item.id === id);
      if (direction === 'up' && index > 0) {
        [items[index], items[index - 1]] = [items[index - 1], items[index]];
      } else if (direction === 'down' && index < items.length - 1) {
        [items[index], items[index + 1]] = [items[index + 1], items[index]];
      }
      return items.map((item, idx) => ({ ...item, order: idx + 1 }));
    });
  };

  const startPreview = () => {
    setPreviewMode(true);
    setCurrentPreviewIndex(0);
  };

  const stopPreview = () => {
    setPreviewMode(false);
  };

  const nextPreview = () => {
    setCurrentPreviewIndex(prev => 
      prev < carouselItems.length - 1 ? prev + 1 : 0
    );
  };

  const prevPreview = () => {
    setCurrentPreviewIndex(prev => 
      prev > 0 ? prev - 1 : carouselItems.length - 1
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Default Carousel Management</h2>
          <p className="text-gray-600 mt-1">Manage the main carousel slides for your website</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={startPreview}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <Play className="w-4 h-4" />
            Preview
          </button>
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Slide
          </button>
        </div>
      </div>

      {/* Preview Mode */}
      {previewMode && (
        <div className="relative bg-gray-900 rounded-xl overflow-hidden h-96">
          <div className="absolute inset-0 flex items-center justify-center">
            {carouselItems.length > 0 ? (
              <div className="text-center text-white">
                <h3 className="text-3xl font-bold mb-2">{carouselItems[currentPreviewIndex].title}</h3>
                <p className="text-xl mb-4">{carouselItems[currentPreviewIndex].subtitle}</p>
                <p className="text-lg mb-6">{carouselItems[currentPreviewIndex].description}</p>
                <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  {carouselItems[currentPreviewIndex].button_text}
                </button>
              </div>
            ) : (
              <div className="text-center text-white">
                <p className="text-xl">No carousel items to preview</p>
              </div>
            )}
          </div>
          
          {/* Navigation */}
          <button
            onClick={prevPreview}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={nextPreview}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
          
          {/* Close Preview */}
          <button
            onClick={stopPreview}
            className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
          >
            <X className="w-6 h-6" />
          </button>
          
          {/* Indicators */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
            {carouselItems.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentPreviewIndex(index)}
                className={`w-3 h-3 rounded-full ${
                  index === currentPreviewIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Carousel Items List */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {carouselItems.map((item, index) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <GripVertical className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-900">{item.order}</span>
                      <div className="flex flex-col">
                        <button
                          onClick={() => moveItem(item.id, 'up')}
                          disabled={index === 0}
                          className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
                        >
                          ↑
                        </button>
                        <button
                          onClick={() => moveItem(item.id, 'down')}
                          disabled={index === carouselItems.length - 1}
                          className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
                        >
                          ↓
                        </button>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="w-16 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                      <ImageIcon className="w-6 h-6 text-gray-400" />
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{item.title}</div>
                      <div className="text-sm text-gray-500">{item.subtitle}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      item.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {item.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleView(item)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-yellow-600 hover:text-yellow-900"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => toggleActive(item.id)}
                        className={`${item.is_active ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
                      >
                        {item.is_active ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {modalMode === 'create' ? 'Add New Carousel Item' : 
                 modalMode === 'edit' ? 'Edit Carousel Item' : 'View Carousel Item'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            {modalMode === 'view' ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                    <p className="text-gray-900">{formData.title}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Subtitle</label>
                    <p className="text-gray-900">{formData.subtitle}</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <p className="text-gray-900">{formData.description}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Button Text</label>
                    <p className="text-gray-900">{formData.button_text}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Button Link</label>
                    <p className="text-gray-900">{formData.button_link}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      formData.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {formData.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subtitle
                    </label>
                    <input
                      type="text"
                      name="subtitle"
                      value={formData.subtitle}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Button Text
                    </label>
                    <input
                      type="text"
                      name="button_text"
                      value={formData.button_text}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Button Link
                    </label>
                    <input
                      type="text"
                      name="button_link"
                      value={formData.button_link}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Image
                    </label>
                    <div className="flex items-center gap-4">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="flex-1"
                      />
                      {formData.image_url && (
                        <div className="w-20 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                          <ImageIcon className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="is_active"
                        checked={formData.is_active}
                        onChange={handleInputChange}
                        className="mr-2"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Active
                      </span>
                    </label>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : modalMode === 'create' ? 'Create Item' : 'Save Changes'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DefaultCarouselManager;
