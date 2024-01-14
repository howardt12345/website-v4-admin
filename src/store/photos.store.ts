import { PhotoCategory, PhotoItem } from '@/types/photos';
import exifr from 'exifr';

interface PhotoUpload {
  files: File[];
  category: string;
  tags: string[];
  width: number;
  height: number;
}

export const usePhotosStore = defineStore('photos', () => {
  const photos = ref<PhotoItem[]>([]);
  const categories = ref<PhotoCategory[]>([]);

  const getPhotos = async () => {
    const { data: photosData } = await useSupabaseClient()
      .from('photos')
      .select()
      .order('date', {
        ascending: false,
      });
    const { data: categoriesData } = await useSupabaseClient()
      .from('categories')
      .select()
      .order('category', {
        ascending: true,
      });
    photos.value = <PhotoItem[]>photosData;
    categories.value = <PhotoCategory[]>categoriesData;

    photos.value.forEach((photo) => {
      photo.tags = photo.tags.map((tag) => tag.toLowerCase());
    });
  };

  const getDimensions = async (file: File): { width: number, height: number } => {
    const image = new Image();
    image.src = URL.createObjectURL(file);
    await image.decode();
    return {
      width: image.width,
      height: image.height,
    };
  }

  const uploadPhoto = async ({
    files,
    category,
    tags,
  }: PhotoUpload) => {
    console.log(files, category, tags);

    await Promise.all(
      files.map(async (file: File) => {
        const { width, height } = await getDimensions(file);
  
        const { data, error } = await useSupabaseClient()
          .storage.from('photos')
          .upload(`${file.name}`, file);
        if (error) {
          throw error;
        }
  
        const { data: urlData } = useSupabaseClient()
          .storage.from('photos')
          .getPublicUrl(`${file.name}`);
  
        const newPhoto = {
          name: file.name,
          date: await getDate(file),
          url: urlData.publicUrl,
          category,
          tags,
          width,
          height,
        };
  
        const { data: photo } = await useSupabaseClient()
          .from('photos')
          .insert(newPhoto)
          .select();
        if (!photo) {
          throw new Error('Error uploading photo');
        }
      }));

    return true;
  };

  const deletePhoto = async (photo: PhotoItem) => {
    const { data: storageData, error } = await useSupabaseClient()
      .storage.from('photos')
      .remove([photo.name]);
    console.log(storageData, error);
    if (error) {
      throw error;
    }

    const { data } = await useSupabaseClient()
      .from('photos')
      .delete()
      .eq('id', photo.id)
      .select();

    if (!data) {
      throw new Error('Error deleting photo');
    }
  };

  const updatePhotoData = async (photo: PhotoItem) => {
    const { data: updatedPhoto } = await useSupabaseClient()
      .from('photos')
      .update(photo)
      .eq('id', photo.id)
      .select();
    if (!updatedPhoto) {
      throw new Error('Error updating photo');
    }
  };

  const getDate = async (file: File): Date => {
    const exifData = await exifr.parse(file);
    const date = exifData?.DateTimeOriginal;
    if (!date) {
      return null;
    }
    return new Date(date);
  };

  return {
    photos,
    categories,
    getPhotos,
    uploadPhoto,
    updatePhotoData,
    deletePhoto,
  };
});
